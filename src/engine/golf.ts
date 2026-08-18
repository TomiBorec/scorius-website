/* ============================================================
   Golf engine — golf and disc golf.

   Port of Shared/GolfRules.swift. Per-hole stroke entry for a flight of
   1 to 4 on one card; disc golf reuses the whole engine and differs only
   in its preset (18 holes, par 3 everywhere).

   `null` in a hole slot means "not played", which is distinct from a
   stroke total of 0 — never a legal golf result.
   ============================================================ */

import { clamp, sum } from './types';

export type GolfScoringFormat = 'strokePlay' | 'stableford' | 'matchPlay';

export interface GolfScore {
  /** Per-player per-hole strokes. Outer = flight size (1...4), inner = holeCount. */
  playerStrokes: (number | null)[][];
  /** 1-indexed. */
  currentHole: number;
}

export function newGolfScore(playerCount: number, holeCount: number): GolfScore {
  return {
    playerStrokes: Array.from({ length: playerCount }, () => Array<number | null>(holeCount).fill(null)),
    currentHole: 1,
  };
}

export interface GolfRules {
  /** 9 or 18 in normal use; 1...18 allowed so a partial round needs no engine churn. */
  holeCount: number;
  /** Par per hole; length === holeCount. */
  pars: number[];
  scoringFormat: GolfScoringFormat;
}

export const golfDefault: GolfRules = {
  holeCount: 18, pars: Array(18).fill(4), scoringFormat: 'strokePlay',
};

/** Disc golf: 18 holes, par 3 everywhere, stroke play. */
export const discGolfDefault: GolfRules = {
  holeCount: 18, pars: Array(18).fill(3), scoringFormat: 'strokePlay',
};

/** Clamps ranges and forces `pars.length === holeCount` (truncate, or pad with par 4). */
export function normaliseGolf(rules: GolfRules): GolfRules {
  const holeCount = clamp(rules.holeCount, 1, 18);
  let pars = rules.pars;
  if (pars.length > holeCount) pars = pars.slice(0, holeCount);
  else if (pars.length < holeCount) pars = [...pars, ...Array(holeCount - pars.length).fill(4)];
  return { ...rules, holeCount, pars: pars.map((p) => clamp(p, 3, 6)) };
}

export const playerCount = (s: GolfScore) => s.playerStrokes.length;

/** Total strokes for a flight slot, skipping unplayed holes. */
export function totalStrokes(s: GolfScore, idx: number): number {
  if (idx < 0 || idx >= s.playerStrokes.length) return 0;
  return sum(s.playerStrokes[idx].filter((v): v is number => v !== null));
}

/** Holes this slot has logged a stroke total on. */
export function holesPlayed(s: GolfScore, idx: number): number {
  if (idx < 0 || idx >= s.playerStrokes.length) return 0;
  return s.playerStrokes[idx].filter((v) => v !== null).length;
}

/** Strokes logged on a 1-indexed hole; 0 when unplayed. */
export function strokes(s: GolfScore, idx: number, hole: number): number {
  if (idx < 0 || idx >= s.playerStrokes.length) return 0;
  const h = hole - 1;
  if (h < 0 || h >= s.playerStrokes[idx].length) return 0;
  return s.playerStrokes[idx][h] ?? 0;
}

export function played(s: GolfScore, idx: number, hole: number): boolean {
  if (idx < 0 || idx >= s.playerStrokes.length) return false;
  const h = hole - 1;
  if (h < 0 || h >= s.playerStrokes[idx].length) return false;
  return s.playerStrokes[idx][h] !== null;
}

/** Slot 0 is the owner / card holder — their round is the source of truth. */
export const ownerTotalStrokes = (s: GolfScore) => totalStrokes(s, 0);
export const ownerHolesPlayed = (s: GolfScore) => holesPlayed(s, 0);

export const totalPar = (rules: GolfRules) => sum(rules.pars);

/** Cumulative par through the first n holes, clamped. */
export function playedPar(rules: GolfRules, holes: number): number {
  return sum(rules.pars.slice(0, Math.max(0, Math.min(holes, rules.pars.length))));
}

/**
 * True iff the round was played to the end — the owner reached the final hole.
 *
 * Deliberately does NOT require a stroke on every hole: someone who picks up in
 * Stableford still finished the round and should not read as Partial. Ending
 * early leaves `currentHole` short, which correctly reads as Partial.
 */
export function isGolfMatchComplete(rules: GolfRules, s: GolfScore): boolean {
  return s.currentHole >= rules.holeCount || played(s, 0, rules.holeCount);
}

/** Stricter: the owner has logged a score on every hole. Drives the celebration. */
export function allHolesLogged(rules: GolfRules, s: GolfScore): boolean {
  return ownerHolesPlayed(s) >= rules.holeCount;
}

export const canAdvanceHole = (rules: GolfRules, s: GolfScore) => s.currentHole < rules.holeCount;
export const canRetreatHole = (s: GolfScore) => s.currentHole > 1;

/* ---------- Stableford ---------- */

/** 2 + (par − strokes), floored at 0. Bogey 1 · par 2 · birdie 3 · eagle 4. */
export function stablefordPoints(strokesTaken: number, par: number): number {
  return Math.max(0, 2 + (par - strokesTaken));
}

export function stablefordTotal(rules: GolfRules, s: GolfScore, idx: number): number {
  if (idx < 0 || idx >= s.playerStrokes.length) return 0;
  let total = 0;
  s.playerStrokes[idx].forEach((entry, i) => {
    if (entry === null || i >= rules.pars.length) return;
    total += stablefordPoints(entry, rules.pars[i]);
  });
  return total;
}

/* ---------- match play (a flight of exactly 2) ---------- */

/**
 * Running match-play status between slots 0 and 1, counting only holes BOTH have
 * scored. `lead` is positive when slot 0 is up. Null unless the flight is 2.
 */
export function matchPlayStatus(rules: GolfRules, s: GolfScore): { lead: number; thru: number } | null {
  if (playerCount(s) !== 2) return null;
  let lead = 0;
  let thru = 0;
  for (let hole = 1; hole <= rules.holeCount; hole++) {
    if (!played(s, 0, hole) || !played(s, 1, hole)) continue;
    thru += 1;
    const a = strokes(s, 0, hole);
    const b = strokes(s, 1, hole);
    if (a < b) lead += 1;
    else if (b < a) lead -= 1;
  }
  return { lead, thru };
}

/** True iff the result is mathematically decided — the lead exceeds holes remaining. */
export function matchPlayDecided(rules: GolfRules, s: GolfScore): boolean {
  const status = matchPlayStatus(rules, s);
  if (!status) return false;
  return Math.abs(status.lead) > rules.holeCount - status.thru;
}

/** "AS" all square, "2 UP" mid-round, "3&2" once decided with holes to spare. */
export function matchPlayStatusText(rules: GolfRules, s: GolfScore): string | null {
  const status = matchPlayStatus(rules, s);
  if (!status) return null;
  const { lead, thru } = status;
  if (lead === 0) return 'AS';
  const remaining = rules.holeCount - thru;
  if (Math.abs(lead) > remaining) {
    return remaining > 0 ? `${Math.abs(lead)}&${remaining}` : `${Math.abs(lead)} UP`;
  }
  return `${Math.abs(lead)} UP`;
}

/** Score to par as golfers read it: "E", "+3", "-1". The one implementation. */
export function toParText(value: number): string {
  if (value === 0) return 'E';
  return value > 0 ? `+${value}` : `${value}`;
}
