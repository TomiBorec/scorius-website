/* ============================================================
   Period-clock core — basketball and football/floorball.

   Port of Shared/PeriodClockCarrying.swift. The two clocked scores are
   structurally identical: a countdown anchored to wall-clock time (so it
   survives a locked phone or a backgrounded tab) plus per-period splits
   derived from running totals.

   `Date` becomes epoch milliseconds here. `now` is always a parameter,
   never read from the ambient clock, so the fixtures can pin behaviour.
   ============================================================ */

import { gameScore, sum, type GameScore } from './types';

export interface PeriodClock {
  periodScores: GameScore[];
  /** 1-indexed. Goes above the regulation count for overtime / extra time. */
  currentPeriod: number;
  /**
   * Seconds left in the current period. While the clock RUNS this is the value
   * captured at the last start; the live value is this minus the elapsed time
   * since `clockStartedAt`. While paused it is exact.
   */
  timeRemaining: number;
  isClockRunning: boolean;
  /** Epoch ms the clock was last started; null when paused. */
  clockStartedAt: number | null;
}

export function newPeriodClock(duration: number): PeriodClock {
  return {
    periodScores: [], currentPeriod: 1,
    timeRemaining: duration, isClockRunning: false, clockStartedAt: null,
  };
}

/**
 * Live remaining time as of `now`. Never negative.
 *
 * This derivation is the whole point of anchoring to wall-clock: a browser tab
 * throttles its timers in the background, so a clock that counted down by
 * decrementing on a tick would silently run slow. Reading it from two timestamps
 * cannot drift.
 */
export function liveTimeRemaining(c: PeriodClock, now: number): number {
  if (!c.isClockRunning || c.clockStartedAt === null) return c.timeRemaining;
  return Math.max(0, c.timeRemaining - (now - c.clockStartedAt) / 1000);
}

/** Scored in the in-progress period: running total minus the closed-period sums. */
export function currentPeriodPlayer(c: PeriodClock, totalPlayer: number): number {
  return totalPlayer - sum(c.periodScores.map((p) => p.player));
}

export function currentPeriodOpponent(c: PeriodClock, totalOpponent: number): number {
  return totalOpponent - sum(c.periodScores.map((p) => p.opponent));
}

/**
 * Toggles running / paused. Starting anchors to `now`; pausing folds the elapsed
 * time back into `timeRemaining` and drops the anchor.
 */
export function toggleClock<T extends PeriodClock>(c: T, now: number): T {
  if (c.isClockRunning) {
    return { ...c, timeRemaining: liveTimeRemaining(c, now), isClockRunning: false, clockStartedAt: null };
  }
  return { ...c, clockStartedAt: now, isClockRunning: true };
}

/**
 * If the running clock has reached zero, freezes it there and pauses.
 * Returns whether this call was the transition, so the caller can fire the
 * period-end alert exactly once. Safe to call at any cadence.
 */
export function expireClockIfNeeded<T extends PeriodClock>(c: T, now: number): { clock: T; expired: boolean } {
  if (!c.isClockRunning || liveTimeRemaining(c, now) > 0) return { clock: c, expired: false };
  return { clock: { ...c, timeRemaining: 0, isClockRunning: false, clockStartedAt: null }, expired: true };
}

/**
 * Manual clock correction, clamped to [0, cap]. A running clock is re-anchored to
 * `now` so the countdown resumes from the new value.
 */
export function setClock<T extends PeriodClock>(c: T, remaining: number, cap: number, now: number): T {
  const timeRemaining = Math.min(Math.max(0, remaining), cap);
  return { ...c, timeRemaining, clockStartedAt: c.isClockRunning ? now : c.clockStartedAt };
}

/**
 * Closes the in-progress period: appends its split, bumps the period, and resets
 * the clock — paused — to `nextDuration`.
 */
export function closePeriod<T extends PeriodClock>(
  c: T, totalPlayer: number, totalOpponent: number, nextDuration: number,
): T {
  return {
    ...c,
    periodScores: [
      ...c.periodScores,
      gameScore(currentPeriodPlayer(c, totalPlayer), currentPeriodOpponent(c, totalOpponent)),
    ],
    currentPeriod: c.currentPeriod + 1,
    timeRemaining: nextDuration,
    isClockRunning: false,
    clockStartedAt: null,
  };
}
