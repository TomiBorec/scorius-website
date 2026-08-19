'use client';

import { useEffect, useRef, useState } from 'react';

/* ============================================================
   Live Spectate client.

   One flat frame per update, mirroring MatchAttributes.ContentState
   in the app — the same payload that drives the Live Activity and
   SharePlay. Every field added after 2.0 is optional there, so every
   field is optional here; an older app publishes fewer of them and
   the renderer must cope rather than crash.
   ============================================================ */

export const SPECTATE_API = '/api/spectate';

/** Matches Sport.rawValue in Shared/Sport.swift. */
export type SpectateSport =
  | 'badminton' | 'tennis' | 'padel' | 'pickleball' | 'squash' | 'tableTennis'
  | 'volleyball' | 'basketball' | 'football' | 'floorball' | 'golf' | 'discGolf';

export interface SpectateFrame {
  playerScore: number;
  opponentScore: number;
  playerGames: number;
  opponentGames: number;
  isMatchComplete: boolean;
  gameMessage: string;
  sport?: SpectateSport;
  periodLabel?: string;
  /** ISO-8601. Present only while a period clock is RUNNING — the browser
   *  counts down to it locally, which is why a running clock costs no frames. */
  periodEndsAt?: string;
  /** Static remainder, used while the clock is PAUSED (no instant to run against). */
  periodRemainingSeconds?: number;
  tennisGamesPlayer?: number;
  tennisGamesOpponent?: number;
  tennisPointPlayer?: string;
  tennisPointOpponent?: string;
  golfHole?: number;
  golfHoleCount?: number;
  golfPar?: number;
  golfToPar?: number;
  /**
   * One line per player in a golf flight, present only when more than one ball is
   * in play. A flight is not a team — everyone plays their own — so the single
   * `golfToPar` above is the owner's alone and must not be shown beside a joined
   * list of names.
   */
  golfPlayers?: { name?: string; strokes: number; toPar: number; holesPlayed: number }[];
  team1Name?: string;
  team2Name?: string;
  servingSide?: 'player' | 'opponent';
  /**
   * Language-neutral caption identity, plus the side it is about.
   *
   * `gameMessage` is deliberately NOT used by this page. It is pre-formatted in
   * the app from the scorer's perspective and in the scorer's language — "You won
   * the game!" names the wrong person for a viewer, and arrives in a language the
   * viewer may not read. Reaching an Android phone in another country is the whole
   * point of this feature, so the caption is composed here instead, from these two
   * fields and the side names.
   */
  captionKey?: 'gamePoint' | 'setPoint' | 'matchPoint' | 'wonGame' | 'wonSet' | 'wonMatch';
  captionSide?: 'player' | 'opponent';
}

export type SpectateStatus =
  | 'connecting'   // opening the stream
  | 'waiting'      // connected, but the device hasn't sent a first frame yet
  | 'live'         // frames arriving
  | 'stale'        // connected, but nothing for STALE_AFTER_MS — the phone may be asleep
  | 'complete'     // the match finished
  | 'ended'        // the scorer stopped sharing
  | 'notfound'     // no such code, or it expired
  | 'offline';     // we can't reach the relay

/** How long without a frame before we stop calling a score "live".
 *  Deliberately generous: a football half or a paused golf round can legitimately
 *  go minutes without a change, and crying wolf is worse than a late warning. */
const STALE_AFTER_MS = 120_000;

/** Codes are 6 chars from an alphabet with no 0/O/1/I/L. */
const CODE_RE = /^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/;

/**
 * The one reserved pseudo-code. `/w/demo` streams a canned match on a loop and
 * never expires.
 *
 * It exists because App Review cannot test this feature otherwise: a real
 * session is past its TTL long before a reviewer opens the code in the review
 * notes, which reads as a broken feature. It also lets anyone see what
 * spectating looks like before they own the app.
 *
 * `DEMO` is 4 characters, so it would fail CODE_RE — hence the special case
 * rather than a code that happens to be reserved.
 */
export const DEMO_CODE = 'DEMO';

/**
 * Pulls a code out of whatever the user typed or pasted — a bare code, a full
 * URL, lowercase, stray dashes or spaces. Returns null when it isn't one.
 * Courtside typing is sloppy; rejecting `scorius.app/w/4ktm-9p` would be
 * needless friction.
 */
export function normaliseCode(input: string): string | null {
  const tail = input.trim().split(/[/?#]/).filter(Boolean).pop() ?? '';
  const cleaned = tail.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (cleaned === DEMO_CODE) return DEMO_CODE;
  return CODE_RE.test(cleaned) ? cleaned : null;
}

export interface SpectateState {
  status: SpectateStatus;
  frame: SpectateFrame | null;
  /** Browsers watching, including this one. Unknown until the relay says. */
  viewers: number | null;
}

/**
 * Subscribes to one code.
 *
 * `EventSource` reconnects on its own, which is most of why SSE was chosen over
 * a WebSocket for a one-way feed. The one thing it cannot do is tell us *why* a
 * connection failed — `onerror` fires identically for "no such code" and "the
 * train went into a tunnel" — so on error we probe the endpoint once with
 * `fetch` and read the real status code.
 */
export function useSpectate(code: string | null): SpectateState {
  const [state, setState] = useState<SpectateState>({
    status: 'connecting',
    frame: null,
    viewers: null,
  });
  const lastFrameAt = useRef<number>(Date.now());

  useEffect(() => {
    if (!code) return;

    let closed = false;
    const isDemo = code === DEMO_CODE;
    // The demo has its own sessionless endpoint; lowercase because the relay
    // matches the literal path segment before any code normalisation.
    const url = isDemo
      ? `${SPECTATE_API}/demo/stream`
      : `${SPECTATE_API}/${code}/stream`;
    const source = new EventSource(url);

    const onFrame = (event: MessageEvent) => {
      try {
        const envelope = JSON.parse(event.data) as { state: SpectateFrame };
        lastFrameAt.current = Date.now();
        setState((prev) => ({
          ...prev,
          frame: envelope.state,
          status: !isDemo && envelope.state.isMatchComplete ? 'complete' : 'live',
        }));
      } catch {
        /* A frame we can't parse is a frame we ignore — the next one supersedes it. */
      }
    };

    const onWaiting = () => {
      lastFrameAt.current = Date.now();
      setState((prev) => ({ ...prev, status: 'waiting' }));
    };

    const onClosed = () => {
      closed = true;
      source.close();
      setState((prev) => ({ ...prev, status: 'ended' }));
    };

    const onError = async () => {
      if (closed) return;
      // Distinguish "gone" from "flaky network": only the former is permanent.
      try {
        const controller = new AbortController();
        const probe = await fetch(url, { signal: controller.signal });
        controller.abort();
        if (probe.status === 410 || probe.status === 400) {
          closed = true;
          source.close();
          setState((prev) => ({ ...prev, status: 'notfound' }));
          return;
        }
      } catch {
        /* Probe failed too — treat as offline and let EventSource keep retrying. */
      }
      setState((prev) =>
        prev.status === 'complete' ? prev : { ...prev, status: 'offline' },
      );
    };

    source.addEventListener('frame', onFrame);
    source.addEventListener('waiting', onWaiting);
    source.addEventListener('closed', onClosed);
    source.onerror = onError;

    // Staleness is a clock-side judgement, not something the relay reports:
    // a sleeping phone stops publishing without anyone disconnecting.
    const tick = setInterval(() => {
      setState((prev) => {
        if (prev.status !== 'live') return prev;
        if (Date.now() - lastFrameAt.current < STALE_AFTER_MS) return prev;
        return { ...prev, status: 'stale' };
      });
    }, 5000);

    return () => {
      closed = true;
      clearInterval(tick);
      source.close();
    };
  }, [code]);

  return state;
}
