'use client';

/* ============================================================
   The clocked scorer — football, floorball and basketball.

   Two engines, one screen: both count a period clock down and both
   score into a running total, so the difference is the increment
   (football scores in ones, basketball in 1/2/3) and the period noun.

   The clock is the reason this screen exists at all. It ticks locally
   against an anchored instant rather than a decrementing counter, so a
   backgrounded tab that gets throttled catches up instead of drifting —
   the same reason the spectate board anchors to `periodEndsAt`.
   ============================================================ */

import { useCallback, useEffect, useState } from 'react';
import {
  basketballAdvancePeriod, expireMatchClock, footballAdvancePeriod, recordBasketballPoints,
  recordFootballGoal, setMatchClock, toggleMatchClock, undoBasketballPoints, undoFootballGoal,
  type ActiveMatch,
} from '@/engine/active';
import { basketballPeriodLabel, footballPeriodLabel } from '@/engine/periods';
import { canAdvanceBasketballPeriod, isBasketballMatchComplete } from '@/engine/basketball';
import { canAdvanceFootballPeriod, isFootballMatchComplete } from '@/engine/football';
import { liveTimeRemaining } from '@/engine/clock';
import type { Side } from '@/engine/types';

const BASKETBALL_VALUES = [1, 2, 3];

export function ClockedScorer({ match, onChange, onEnd }: {
  match: ActiveMatch;
  onChange: (updater: (m: ActiveMatch) => ActiveMatch) => void;
  onEnd: () => void;
}) {
  const isBasketball = match.runtimeState?.kind === 'basketball';

  // Re-render while the clock runs. The value itself is recomputed from the
  // anchor on every paint, so a throttled tab catches up rather than drifting.
  const [, tick] = useState(0);
  const running = match.runtimeState?.kind === 'basketball' || match.runtimeState?.kind === 'football'
    ? match.runtimeState.score.isClockRunning
    : false;
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => tick((n) => n + 1), 250);
    return () => clearInterval(id);
  }, [running]);

  // A clock that hits zero stops itself; the engine reports the transition so
  // this doesn't have to guess when to stop asking.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      onChange((m) => expireMatchClock(m, Date.now()).match);
    }, 500);
    return () => clearInterval(id);
  }, [running, onChange]);

  const score = useCallback((side: Side, value: number) => {
    onChange((m) => (m.runtimeState?.kind === 'basketball'
      ? recordBasketballPoints(m, side, value)
      : recordFootballGoal(m, side, { now: Date.now(), id: crypto.randomUUID() })));
  }, [onChange]);

  if (match.runtimeState?.kind !== 'basketball' && match.runtimeState?.kind !== 'football') return null;
  if (match.settings.kind !== 'basketball' && match.settings.kind !== 'football') return null;

  const state = match.runtimeState.score;
  const remaining = liveTimeRemaining(state, Date.now());

  const label = match.settings.kind === 'basketball'
    ? basketballPeriodLabel(match.settings.rules, state.currentPeriod)
    : footballPeriodLabel(match.settings.rules, state.currentPeriod, match.sport === 'floorball');

  const complete = match.settings.kind === 'basketball' && match.runtimeState.kind === 'basketball'
    ? isBasketballMatchComplete(match.settings.rules, match.runtimeState.score)
    : match.settings.kind === 'football' && match.runtimeState.kind === 'football'
      ? isFootballMatchComplete(match.settings.rules, match.runtimeState.score)
      : false;

  const canAdvance = match.settings.kind === 'basketball' && match.runtimeState.kind === 'basketball'
    ? canAdvanceBasketballPeriod(match.settings.rules, match.runtimeState.score)
    : match.settings.kind === 'football' && match.runtimeState.kind === 'football'
      ? canAdvanceFootballPeriod(match.settings.rules, match.runtimeState.score)
      : false;

  return (
    <div className="sc-wrap">
      <header className="sc-head">
        <span className="sc-tally">{label}</span>
        {complete ? <span className="sc-caption">Full time</span> : null}
      </header>

      <button className={`sc-clock${state.isClockRunning ? ' running' : ''}`}
              onClick={() => onChange((m) => toggleMatchClock(m, Date.now()))}
              aria-label={state.isClockRunning ? 'Pause the clock' : 'Start the clock'}>
        <span className="sc-clock-time">{formatClock(remaining)}</span>
        <span className="sc-clock-hint">{state.isClockRunning ? 'Tap to pause' : 'Tap to start'}</span>
      </button>

      <div className="sc-zones">
        <TeamColumn
          name={name(match, 'player')} total={match.playerGames} period={match.playerScore}
          isBasketball={isBasketball} disabled={complete}
          onScore={(v) => score('player', v)}
        />
        <TeamColumn
          name={name(match, 'opponent')} total={match.opponentGames} period={match.opponentScore}
          isBasketball={isBasketball} disabled={complete}
          onScore={(v) => score('opponent', v)}
        />
      </div>

      <div className="sc-foot">
        <button className="sc-ghost" onClick={() => onChange(isBasketball ? undoBasketballPoints : undoFootballGoal)}
                disabled={(isBasketball ? match.basketballUndoStack : match.footballUndoStack).length === 0}>
          Undo
        </button>
        {canAdvance ? (
          <button className="sc-ghost" onClick={() => onChange(isBasketball ? basketballAdvancePeriod : footballAdvancePeriod)}>
            Next period
          </button>
        ) : null}
      </div>

      <ClockEditor match={match} onChange={onChange} />

      <div className="sc-foot">
        <button className="sc-ghost danger" onClick={onEnd}>End match</button>
      </div>
    </div>
  );
}

/** One side: its running total, what it has scored this period, and the buttons. */
function TeamColumn({ name, total, period, isBasketball, disabled, onScore }: {
  name: string; total: number; period: number; isBasketball: boolean;
  disabled: boolean; onScore: (value: number) => void;
}) {
  return (
    <div className="sc-team">
      <span className="sc-zone-name">{name}</span>
      <span className="sc-zone-score">{total}</span>
      <span className="sc-zone-sub">{period} this period</span>
      <div className="sc-team-buttons">
        {isBasketball
          ? BASKETBALL_VALUES.map((value) => (
              <button key={value} className="sc-inc" disabled={disabled} onClick={() => onScore(value)}>
                +{value}
              </button>
            ))
          : (
            <button className="sc-inc wide" disabled={disabled} onClick={() => onScore(1)}>Goal</button>
          )}
      </div>
    </div>
  );
}

/**
 * Manual clock correction.
 *
 * A referee's clock and a phone's clock always end up apart, and without this the
 * only fix is restarting the match. Applied on Set rather than while typing, so a
 * half-entered number never lands on the running clock.
 */
function ClockEditor({ match, onChange }: {
  match: ActiveMatch;
  onChange: (updater: (m: ActiveMatch) => ActiveMatch) => void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  if (match.runtimeState?.kind !== 'basketball' && match.runtimeState?.kind !== 'football') return null;

  function apply() {
    const [minutes, seconds] = value.split(':');
    const total = Number(minutes) * 60 + Number(seconds ?? 0);
    if (!Number.isFinite(total) || total < 0) return;
    onChange((m) => setMatchClock(m, total, Date.now()));
    setOpen(false);
    setValue('');
  }

  if (!open) {
    return (
      <button className="sc-link" onClick={() => setOpen(true)}>Correct the clock</button>
    );
  }
  return (
    <div className="sc-clock-edit">
      <label className="sp-label" htmlFor="clock-value">Time remaining (m:ss)</label>
      <input id="clock-value" className="sc-input" value={value} placeholder="12:00"
             inputMode="numeric" onChange={(e) => setValue(e.target.value)} />
      <div className="sc-foot">
        <button className="sc-ghost" onClick={() => { setOpen(false); setValue(''); }}>Cancel</button>
        <button className="sc-ghost" onClick={apply}>Set</button>
      </div>
    </div>
  );
}

function formatClock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function name(match: ActiveMatch, side: Side): string {
  if (side === 'player') return match.side1Name?.trim() || 'Side 1';
  return match.side2Name?.trim() || 'Side 2';
}
