'use client';

import { useEffect, useRef, useState } from 'react';
import type { SpectateFrame } from '@/lib/spectate';
import { toParLabel, toParTone } from './ScoreBoard';

/* ============================================================
   Courtside mode — the score, as large as the screen allows.

   Mirrors what the app's own CourtsideScoreboardView does: the big
   numbers are the score you read from across a court, and a sub-score
   tier carries what the big number cannot say on its own (games inside
   a set, the period and clock, the hole and par). Tennis' "40" is
   meaningless without the games beside it, which is why the tier is
   structural rather than decorative.

   Two mechanisms, deliberately:

   - A fixed overlay does the actual work. It fills the viewport on every
     browser, including iPhone Safari, where the Fullscreen API does not
     exist for arbitrary elements — only for video. An implementation
     that relied on the API alone would silently do nothing on the most
     likely phone at a court.
   - `requestFullscreen()` is then attempted on top, purely to hide the
     browser's own chrome where it is supported. Its failure is ignored.

   Wake Lock is requested while the board is up: a scoreboard that sleeps
   after thirty seconds is not a scoreboard.
   ============================================================ */

const SPORT_LABEL: Record<string, string> = {
  badminton: 'Badminton', tennis: 'Tennis', padel: 'Padel', pickleball: 'Pickleball',
  squash: 'Squash', tableTennis: 'Table Tennis', volleyball: 'Volleyball',
  basketball: 'Basketball', football: 'Football', floorball: 'Floorball',
  golf: 'Golf', discGolf: 'Disc Golf',
};

const SET_SPORTS = new Set(['volleyball', 'tennis', 'padel']);
const TENNIS = new Set(['tennis', 'padel']);
const CLOCKED = new Set(['football', 'floorball', 'basketball']);
const GOLF = new Set(['golf', 'discGolf']);

export function FullscreenBoard({ frame, code, onExit }: {
  frame: SpectateFrame | null;
  code: string;
  onExit: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);

  // `onExit` must not be an effect dependency, and this is not a tidiness point.
  //
  // The caller passes an inline arrow, so its identity changes on every render —
  // and this component re-renders on every incoming frame. Depending on it made
  // the fullscreen effect tear down and re-run per frame: the cleanup called
  // exitFullscreen(), that fired `fullscreenchange`, and the handler called
  // onExit(). A golfer moving to the next hole, or a goal going in, dropped the
  // viewer straight out of courtside mode. Re-requesting was hopeless too —
  // requestFullscreen() needs a user gesture and a frame arriving is not one.
  //
  // Holding it in a ref lets the effects mount once and still call the latest
  // callback.
  const exitRef = useRef(onExit);
  // Updated after commit rather than during render: the callback is only ever
  // invoked from an event handler or a listener, both of which run post-commit,
  // and writing a ref mid-render is the thing concurrent React asks you not to do.
  useEffect(() => { exitRef.current = onExit; });

  useNativeFullscreen(host, exitRef);
  useWakeLock();

  // Escape leaves the board even where the Fullscreen API never engaged, so the
  // overlay can't trap someone on a browser that ignored the request.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') exitRef.current(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const sport = frame?.sport ?? 'badminton';

  return (
    <div className="fsb" ref={host} data-sport={sport === 'discGolf' ? 'golf' : sport}>
      <button className="fsb-exit" onClick={onExit} aria-label="Leave courtside mode">✕</button>

      {!frame ? (
        <p className="fsb-wait">Waiting for the match…</p>
      ) : GOLF.has(sport) ? (
        <GolfLayout frame={frame} />
      ) : (
        <TwoSidedLayout frame={frame} />
      )}

      <div className="fsb-foot">
        <span>{SPORT_LABEL[sport] ?? sport}</span>
        <span className="fsb-code">{code}</span>
      </div>
    </div>
  );
}

/* ---------- layouts ---------- */

function TwoSidedLayout({ frame }: { frame: SpectateFrame }) {
  const sport = frame.sport ?? 'badminton';
  const isTennis = TENNIS.has(sport);

  // Tennis puts games-in-set in the big slot and the point underneath; every
  // other two-sided sport puts its running points there.
  const bigLeft = isTennis ? (frame.tennisGamesPlayer ?? 0) : frame.playerScore;
  const bigRight = isTennis ? (frame.tennisGamesOpponent ?? 0) : frame.opponentScore;

  return (
    <>
      <SubScore frame={frame} />
      <div className="fsb-grid">
        <Half
          name={frame.team1Name || 'Side 1'}
          serving={frame.servingSide === 'player'}
          big={bigLeft}
          point={isTennis ? frame.tennisPointPlayer : undefined}
        />
        <Half
          name={frame.team2Name || 'Side 2'}
          serving={frame.servingSide === 'opponent'}
          big={bigRight}
          point={isTennis ? frame.tennisPointOpponent : undefined}
        />
      </div>
      <Caption frame={frame} />
    </>
  );
}

function Half({ name, serving, big, point }: {
  name: string; serving: boolean; big: number; point?: string;
}) {
  return (
    <div className="fsb-half">
      <div className="fsb-name">
        {serving ? <span className="fsb-serve" aria-label="Serving" /> : null}
        <span>{name}</span>
      </div>
      <div className="fsb-big">{big}</div>
      {point ? <div className="fsb-point">{point}</div> : null}
    </div>
  );
}

function GolfLayout({ frame }: { frame: SpectateFrame }) {
  // A flight plays for its own numbers, so courtside shows a line each rather
  // than one hero figure that belongs to whoever happens to be slot 0.
  if (frame.golfPlayers && frame.golfPlayers.length > 1) {
    return (
      <>
        <SubScore frame={frame} />
        <ul className="fsb-flight">
          {frame.golfPlayers.map((p, i) => (
            <li key={i} className="fsb-flight-row">
              <span className="fsb-flight-name">{p.name || `Player ${i + 1}`}</span>
              <span className="fsb-flight-strokes">{p.strokes}</span>
              <span className={`fsb-flight-topar ${toParTone(p.toPar)}`}>{toParLabel(p.toPar)}</span>
            </li>
          ))}
        </ul>
        <Caption frame={frame} />
      </>
    );
  }

  const toPar = frame.golfToPar ?? 0;
  return (
    <>
      <SubScore frame={frame} />
      <div className="fsb-solo">
        <div className="fsb-name"><span>{frame.team1Name || 'Player'}</span></div>
        <div className={`fsb-big ${toParTone(toPar)}`}>{toParLabel(toPar)}</div>
        <div className="fsb-point">{frame.playerGames} strokes</div>
      </div>
      <Caption frame={frame} />
    </>
  );
}

/**
 * The sub-score tier — what the big number cannot say alone.
 *
 * Structural, not decoration: tennis' "40" is unreadable without the games, and a
 * clocked sport's score means nothing without knowing which period it is.
 */
function SubScore({ frame }: { frame: SpectateFrame }) {
  const sport = frame.sport ?? 'badminton';
  const parts: string[] = [];

  if (TENNIS.has(sport)) {
    parts.push(`Sets ${frame.playerGames} – ${frame.opponentGames}`);
    if (frame.tennisGamesPlayer !== undefined) {
      parts.push(`Games ${frame.tennisGamesPlayer} – ${frame.tennisGamesOpponent ?? 0}`);
    }
  } else if (CLOCKED.has(sport)) {
    if (frame.periodLabel) parts.push(frame.periodLabel);
  } else if (GOLF.has(sport)) {
    if (frame.golfHole && frame.golfHoleCount) {
      parts.push(`Hole ${frame.golfHole} of ${frame.golfHoleCount}`);
    }
    if (frame.golfPar) parts.push(`Par ${frame.golfPar}`);
  } else if (frame.playerGames + frame.opponentGames > 0 || true) {
    const noun = SET_SPORTS.has(sport) ? 'Sets' : 'Games';
    parts.push(`${noun} ${frame.playerGames} – ${frame.opponentGames}`);
  }

  return (
    <div className="fsb-sub">
      {parts.length ? <span>{parts.join('  ·  ')}</span> : null}
      {CLOCKED.has(sport) ? <MatchClock frame={frame} /> : null}
    </div>
  );
}

/** Counted down locally from `periodEndsAt`, exactly as the compact board does. */
function MatchClock({ frame }: { frame: SpectateFrame }) {
  const [, force] = useState(0);
  const running = Boolean(frame.periodEndsAt);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => force((n) => n + 1), 250);
    return () => clearInterval(id);
  }, [running, frame.periodEndsAt]);

  let seconds: number | null = null;
  if (frame.periodEndsAt) {
    seconds = Math.max(0, (new Date(frame.periodEndsAt).getTime() - Date.now()) / 1000);
  } else if (typeof frame.periodRemainingSeconds === 'number') {
    seconds = frame.periodRemainingSeconds;
  }
  if (seconds === null) return null;
  const s = Math.floor(seconds);
  return <span className="fsb-clock">{Math.floor(s / 60)}:{String(s % 60).padStart(2, '0')}</span>;
}

function Caption({ frame }: { frame: SpectateFrame }) {
  const name = (side: 'player' | 'opponent') =>
    side === 'player' ? frame.team1Name || 'Side 1' : frame.team2Name || 'Side 2';
  let text: string | null = null;
  switch (frame.captionKey) {
    case 'wonGame': text = frame.captionSide ? `${name(frame.captionSide)} has won the game.` : null; break;
    case 'wonSet': text = frame.captionSide ? `${name(frame.captionSide)} has won the set.` : null; break;
    case 'wonMatch':
      text = frame.captionSide ? `${name(frame.captionSide)} has won the match.` : 'Match drawn.';
      break;
    case 'gamePoint': text = frame.captionSide ? `Game point — ${name(frame.captionSide)}` : 'Game point'; break;
    case 'setPoint': text = frame.captionSide ? `Set point — ${name(frame.captionSide)}` : 'Set point'; break;
    case 'matchPoint': text = frame.captionSide ? `Match point — ${name(frame.captionSide)}` : 'Match point'; break;
    default: text = null;
  }
  if (!text) return null;
  return <p className="fsb-caption">{text}</p>;
}

/* ---------- platform plumbing ---------- */

/**
 * Asks for real fullscreen on top of the overlay, to hide the browser's chrome.
 * Best-effort by design: iPhone Safari has no element fullscreen, and a rejected
 * request must not break the board — the overlay is already doing the work.
 */
function useNativeFullscreen(
  ref: React.RefObject<HTMLDivElement | null>,
  exitRef: React.RefObject<() => void>,
) {
  // Empty deps on purpose: this must run exactly once for the life of the board.
  // See the note at the call site — re-running it per frame is what kicked
  // viewers out of fullscreen whenever the score changed.
  useEffect(() => {
    const el = ref.current;
    if (!el?.requestFullscreen) return;
    void el.requestFullscreen().catch(() => {});

    // Leaving fullscreen by the browser's own affordance must leave the board too,
    // or the user ends up in an overlay they did not ask to stay in.
    const onChange = () => { if (!document.fullscreenElement) exitRef.current(); };
    document.addEventListener('fullscreenchange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/** Keeps the screen awake. A scoreboard that sleeps is not a scoreboard. */
function useWakeLock() {
  useEffect(() => {
    let sentinel: { release: () => Promise<void> } | null = null;
    let cancelled = false;
    const nav = navigator as Navigator & {
      wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> };
    };
    void nav.wakeLock?.request('screen').then((s) => {
      if (cancelled) { void s.release(); return; }
      sentinel = s;
    }).catch(() => {});
    return () => { cancelled = true; void sentinel?.release().catch(() => {}); };
  }, []);
}
