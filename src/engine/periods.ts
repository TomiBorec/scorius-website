/* ============================================================
   Period labels — one source, as in the app.

   Port of Shared/PeriodFormatting.swift. The comment there is worth
   carrying over: these used to be derived independently at about nine
   call sites and the copies had drifted, so both engines own their
   label and every screen asks.

   "Q{n}" / "P{n}" / "OT{n}" / "ET{n}" are scoreboard notation and stay
   as they are in every language; only the halves are words.
   ============================================================ */

import type { BasketballRules } from './basketball';
import type { FootballRules } from './football';

/** "Q3" during regulation, "OT2" beyond — respects the configured period count. */
export function basketballPeriodLabel(rules: BasketballRules, period: number): string {
  return period <= rules.periodCount ? `Q${period}` : `OT${period - rules.periodCount}`;
}

/**
 * "1st Half" / "2nd Half" for the standard two-half configuration, "P{n}" for
 * floorball thirds and any non-standard count, "ET{n}" past regulation.
 */
export function footballPeriodLabel(
  rules: FootballRules, period: number, isFloorball = false,
): string {
  if (period > rules.periodCount) return `ET${period - rules.periodCount}`;
  if (isFloorball) return `P${period}`;
  if (rules.periodCount === 2 && period === 1) return '1st Half';
  if (rules.periodCount === 2 && period === 2) return '2nd Half';
  return `P${period}`;
}
