'use client';

import { useEffect, useState } from 'react';
import type { SpectateFrame } from '@/lib/spectate';

/* ============================================================
   The score itself — one flat frame in, one board out.

   Four layouts across twelve sports, which is the same split the app's
   own scorers use: rally-style (a big number each side), tennis-style
   (sets · games · point), clocked (score + period + clock) and golf
   (to par, by hole). Every field is optional in the payload, so each
   layout degrades to the rally board rather than throwing.
   ============================================================ */

const SPORT_LABEL: Record<string, string> = {
  badminton: 'Badminton', tennis: 'Tennis', padel: 'Padel', pickleball: 'Pickleball',
  squash: 'Squash', tableTennis: 'Table Tennis', volleyball: 'Volleyball',
  basketball: 'Basketball', football: 'Football', floorball: 'Floorball',
  golf: 'Golf', discGolf: 'Disc Golf',
};

const TENNIS = new Set(['tennis', 'padel']);
const CLOCKED = new Set(['football', 'floorball', 'basketball']);
const GOLF = new Set(['golf', 'discGolf']);

export function ScoreBoard({ frame }: { frame: SpectateFrame }) {
  const sport = frame.sport ?? 'badminton';
  if (GOLF.has(sport)) return <GolfBoard frame={frame} />;
  if (TENNIS.has(sport)) return <TennisBoard frame={frame} />;
  if (CLOCKED.has(sport)) return <ClockedBoard frame={frame} />;
  return <RallyBoard frame={frame} />;
}

/**
 * The board shell, tinted to the sport being watched.
 *
 * `[data-sport]` re-tints the `--accent*` tokens, and the site already carries a
 * palette for each. Setting it here rather than on `<html>` is deliberate: the
 * root attribute is the visitor's own sport preference, persisted from the
 * homepage switcher, and a page they opened to watch someone else's badminton
 * has no business rewriting it.
 *
 * Disc golf borrows golf's palette — the site's switcher predates it.
 */
function Board({ frame, children }: { frame: SpectateFrame; children: React.ReactNode }) {
  const sport = frame.sport ?? 'badminton';
  return (
    <div className="sp-board" data-sport={sport === 'discGolf' ? 'golf' : sport}>
      {children}
    </div>
  );
}

/* ---------- shared chrome ---------- */

function Header({ frame, extra }: { frame: SpectateFrame; extra?: string }) {
  const sport = frame.sport ?? 'badminton';
  return (
    <div className="sp-header">
      <span className="sp-sport">{SPORT_LABEL[sport] ?? sport}</span>
      {extra ? <span className="sp-tier">{extra}</span> : null}
    </div>
  );
}

function SideName({ name, fallback, serving }: { name?: string; fallback: string; serving: boolean }) {
  return (
    <div className="sp-side-name">
      {serving ? <span className="sp-serve" aria-label="Serving" /> : null}
      <span>{name || fallback}</span>
    </div>
  );
}

function Caption({ frame }: { frame: SpectateFrame }) {
  if (!frame.gameMessage) return null;
  return <p className={`sp-caption${frame.isMatchComplete ? ' done' : ''}`}>{frame.gameMessage}</p>;
}

/* ---------- rally: badminton, volleyball, table tennis, squash, pickleball ---------- */

function RallyBoard({ frame }: { frame: SpectateFrame }) {
  const showGames = frame.playerGames + frame.opponentGames > 0;
  return (
    <Board frame={frame}>
      <Header frame={frame} extra={showGames ? `${frame.playerGames} – ${frame.opponentGames}` : undefined} />
      <div className="sp-two">
        <div className="sp-half">
          <SideName name={frame.team1Name} fallback="Side 1" serving={frame.servingSide === 'player'} />
          <div className="sp-score">{frame.playerScore}</div>
        </div>
        <div className="sp-half">
          <SideName name={frame.team2Name} fallback="Side 2" serving={frame.servingSide === 'opponent'} />
          <div className="sp-score">{frame.opponentScore}</div>
        </div>
      </div>
      <Caption frame={frame} />
    </Board>
  );
}

/* ---------- tennis + padel: sets in the header, games big, point as the chip ---------- */

function TennisBoard({ frame }: { frame: SpectateFrame }) {
  const games1 = frame.tennisGamesPlayer ?? 0;
  const games2 = frame.tennisGamesOpponent ?? 0;
  return (
    <Board frame={frame}>
      <Header frame={frame} extra={`Sets ${frame.playerGames} – ${frame.opponentGames}`} />
      <div className="sp-two">
        <div className="sp-half">
          <SideName name={frame.team1Name} fallback="Side 1" serving={frame.servingSide === 'player'} />
          <div className="sp-score">{games1}</div>
          {frame.tennisPointPlayer ? <div className="sp-point">{frame.tennisPointPlayer}</div> : null}
        </div>
        <div className="sp-half">
          <SideName name={frame.team2Name} fallback="Side 2" serving={frame.servingSide === 'opponent'} />
          <div className="sp-score">{games2}</div>
          {frame.tennisPointOpponent ? <div className="sp-point">{frame.tennisPointOpponent}</div> : null}
        </div>
      </div>
      <Caption frame={frame} />
    </Board>
  );
}

/* ---------- football, floorball, basketball ---------- */

function ClockedBoard({ frame }: { frame: SpectateFrame }) {
  const clock = useMatchClock(frame);
  return (
    <Board frame={frame}>
      <Header frame={frame} extra={frame.periodLabel} />
      {clock ? <div className="sp-clock" role="timer">{clock}</div> : null}
      <div className="sp-two">
        <div className="sp-half">
          <SideName name={frame.team1Name} fallback="Home" serving={false} />
          <div className="sp-score">{frame.playerScore}</div>
        </div>
        <div className="sp-half">
          <SideName name={frame.team2Name} fallback="Away" serving={false} />
          <div className="sp-score">{frame.opponentScore}</div>
        </div>
      </div>
      <Caption frame={frame} />
    </Board>
  );
}

/**
 * The match clock, counted down in the browser.
 *
 * This is why a running football clock costs zero frames: the app stamps
 * `periodEndsAt` once and every spectator ticks against it locally. A paused
 * clock has no instant to run against, so it sends a static remainder instead —
 * and a paused clock that quietly kept ticking here would be a visible lie.
 */
function useMatchClock(frame: SpectateFrame): string | null {
  const [, force] = useState(0);
  const running = Boolean(frame.periodEndsAt);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => force((n) => n + 1), 250);
    return () => clearInterval(id);
  }, [running, frame.periodEndsAt]);

  if (frame.periodEndsAt) {
    const remaining = Math.max(0, new Date(frame.periodEndsAt).getTime() - Date.now());
    return formatClock(remaining / 1000);
  }
  if (typeof frame.periodRemainingSeconds === 'number') {
    return formatClock(frame.periodRemainingSeconds);
  }
  return null;
}

function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/* ---------- golf + disc golf: one player, to-par is the hero ---------- */

function GolfBoard({ frame }: { frame: SpectateFrame }) {
  const toPar = frame.golfToPar ?? 0;
  const label = toPar === 0 ? 'E' : toPar > 0 ? `+${toPar}` : `${toPar}`;
  const tone = toPar < 0 ? 'under' : toPar > 0 ? 'over' : 'even';
  const hole = frame.golfHole;
  const holes = frame.golfHoleCount;

  return (
    <Board frame={frame}>
      <Header
        frame={frame}
        extra={hole && holes ? `Hole ${hole} of ${holes}${frame.golfPar ? ` · Par ${frame.golfPar}` : ''}` : undefined}
      />
      <div className="sp-solo">
        <SideName name={frame.team1Name} fallback="Player" serving={false} />
        <div className={`sp-score sp-topar ${tone}`}>{label}</div>
        <div className="sp-strokes">
          {/* Total strokes ride in playerGames; the current hole's in playerScore. */}
          {frame.playerGames} strokes
          {frame.playerScore > 0 ? ` · ${frame.playerScore} on this hole` : ''}
        </div>
      </div>
      <Caption frame={frame} />
    </Board>
  );
}
