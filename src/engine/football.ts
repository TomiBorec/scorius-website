/* ============================================================
   Football engine — football and floorball.

   Port of Shared/FootballRules.swift. Like basketball, scoring is
   integer increments; the engine is period gating and completion.
   The real difference from basketball's overtime: extra time here is a
   *fixed number of periods*, not "first to untie" — which is why
   `canAdvancePeriod` and `isMatchComplete` read differently.
   ============================================================ */

import { clamp, type Side } from './types';
import { newPeriodClock, type PeriodClock } from './clock';

/**
 * One goal, captured as it is scored so the timeline survives into history.
 * `scorerId` is filled in *later*, in match detail — live scoring stays one tap.
 */
export interface GoalEvent {
  id: string;
  side: Side;
  /** 1-indexed period (regulation or extra time). */
  period: number;
  /** Seconds into `period` when it fell; 0 if the clock had never been started. */
  elapsedInPeriod: number;
  scorerId?: string;
}

export interface FootballScore extends PeriodClock {
  playerGoals: number;
  opponentGoals: number;
  /** Goal-by-goal timeline, in scoring order. */
  goals: GoalEvent[];
}

export interface FootballRules {
  /** Regulation periods, typically 2 halves. Range 1...4. */
  periodCount: number;
  /** Seconds per regulation period. Default 45 minutes. */
  periodDuration: number;
  allowsExtraTime: boolean;
  /** Seconds per extra-time period. Default 15 minutes. */
  extraTimeDuration: number;
  /**
   * Extra-time periods. Default 2. Penalty shootouts are not modelled — a match
   * still level after all ET periods ends as a draw.
   */
  extraTimePeriodCount: number;
}

export const footballDefault: FootballRules = {
  periodCount: 2, periodDuration: 45 * 60, allowsExtraTime: false,
  extraTimeDuration: 15 * 60, extraTimePeriodCount: 2,
};

/** Standard floorball: 3 × 20-minute periods, draws allowed. */
export const floorballDefault: FootballRules = {
  ...footballDefault, periodCount: 3, periodDuration: 20 * 60,
};

export function newFootballScore(rules: FootballRules): FootballScore {
  return { ...newPeriodClock(rules.periodDuration), playerGoals: 0, opponentGoals: 0, goals: [] };
}

export function normaliseFootball(rules: FootballRules): FootballRules {
  return {
    ...rules,
    periodCount: clamp(rules.periodCount, 1, 4),
    periodDuration: clamp(Math.trunc(rules.periodDuration / 60), 1, 60) * 60,
    extraTimeDuration: clamp(Math.trunc(rules.extraTimeDuration / 60), 1, 30) * 60,
    extraTimePeriodCount: clamp(rules.extraTimePeriodCount, 1, 4),
  };
}

export function footballPeriodDuration(rules: FootballRules, period: number): number {
  return period <= rules.periodCount ? rules.periodDuration : rules.extraTimeDuration;
}

export function isExtraTime(rules: FootballRules, s: FootballScore): boolean {
  return s.currentPeriod > rules.periodCount;
}

/**
 * Football-style match minute, 1-indexed: a goal in the first 60 seconds reads as
 * 1', one at 44:30 of the first half reads as 45'. Sums the durations of every
 * period before the goal's, so it reads as cumulative match time.
 */
export function matchMinute(rules: FootballRules, goal: GoalEvent): number {
  let before = 0;
  for (let p = 1; p < Math.max(1, goal.period); p++) before += footballPeriodDuration(rules, p);
  return Math.trunc((before + Math.max(0, goal.elapsedInPeriod)) / 60) + 1;
}

/**
 * True iff the user may advance to the next period.
 * - During regulation: always.
 * - At the end of regulation: only with extra time enabled AND the score level.
 * - During extra time: until all ET periods have been played.
 */
export function canAdvanceFootballPeriod(rules: FootballRules, s: FootballScore): boolean {
  const played = s.periodScores.length;
  if (played < rules.periodCount) return true;                                  // still in regulation
  if (played >= rules.periodCount + rules.extraTimePeriodCount) return false;   // ET exhausted
  if (!rules.allowsExtraTime) return false;
  // Extra time only starts from a level score. Once it has started, allow playing
  // out the remaining ET periods even if the score has since gone one way — the
  // UI lets them end the match instead.
  if (played === rules.periodCount) return s.playerGoals === s.opponentGoals;
  return true;   // mid-ET
}

/**
 * True iff the match has run its course: all regulation played AND someone is
 * ahead, or level with ET disabled, or every ET period played (draws allowed).
 */
export function isFootballMatchComplete(rules: FootballRules, s: FootballScore): boolean {
  const played = s.periodScores.length;
  if (played < rules.periodCount) return false;
  if (s.playerGoals !== s.opponentGoals) return true;
  if (!rules.allowsExtraTime) return true;
  return played >= rules.periodCount + rules.extraTimePeriodCount;
}
