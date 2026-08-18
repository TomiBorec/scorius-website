/* ============================================================
   Basketball — its own clocked engine.

   Port of Shared/BasketballRules.swift. Scoring is continuous
   accumulation: each action adds 1, 2 or 3 points. There are no
   won-units like games or sets — periods are timed segments. So the
   "engine" is period gating and completion detection; the transitions
   that make tennis interesting simply do not exist here.
   ============================================================ */

import { clamp } from './types';
import { newPeriodClock, type PeriodClock } from './clock';

export interface BasketballScore extends PeriodClock {
  playerPoints: number;
  opponentPoints: number;
}

export interface BasketballRules {
  /** Regulation periods (4 quarters, 2 halves). Range 1...6. */
  periodCount: number;
  /** Seconds per period. Default 12 minutes. */
  periodDuration: number;
  /** If false the match may end in a draw. */
  allowsOvertime: boolean;
  /** Seconds per overtime period. Default 5 minutes. */
  overtimeDuration: number;
}

export const basketballDefault: BasketballRules = {
  periodCount: 4, periodDuration: 12 * 60, allowsOvertime: true, overtimeDuration: 5 * 60,
};

export function newBasketballScore(rules: BasketballRules): BasketballScore {
  return { ...newPeriodClock(rules.periodDuration), playerPoints: 0, opponentPoints: 0 };
}

export function normaliseBasketball(rules: BasketballRules): BasketballRules {
  return {
    ...rules,
    periodCount: clamp(rules.periodCount, 1, 6),
    // Durations are stored in seconds but edited in whole minutes, so clamp the
    // minute value and multiply back — as Swift does.
    periodDuration: clamp(Math.trunc(rules.periodDuration / 60), 1, 20) * 60,
    overtimeDuration: clamp(Math.trunc(rules.overtimeDuration / 60), 1, 20) * 60,
  };
}

/** Duration for a given 1-indexed period; overtime periods use the OT duration. */
export function basketballPeriodDuration(rules: BasketballRules, period: number): number {
  return period <= rules.periodCount ? rules.periodDuration : rules.overtimeDuration;
}

/**
 * True iff the user may advance to the next period. Overtime is only offered when
 * it is enabled AND the score is level.
 */
export function canAdvanceBasketballPeriod(rules: BasketballRules, s: BasketballScore): boolean {
  if (s.periodScores.length >= rules.periodCount) {
    return rules.allowsOvertime && s.playerPoints === s.opponentPoints;
  }
  return true;
}

/**
 * True iff the match has run its course: regulation played AND (someone is ahead
 * OR overtime is disabled). Surfaces the "End match" suggestion — the user still
 * confirms.
 */
export function isBasketballMatchComplete(rules: BasketballRules, s: BasketballScore): boolean {
  if (s.periodScores.length < rules.periodCount) return false;
  if (s.playerPoints !== s.opponentPoints) return true;
  return !rules.allowsOvertime;
}
