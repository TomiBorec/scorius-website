/* ============================================================
   Shared model for the scoring engines.

   A faithful port of Shared/Sport.swift + the pure parts of
   Shared/Match.swift from the iOS app. Twelve sports, six engines —
   routing is decided by the flags below, never by string branching,
   exactly as it is in Swift.

   Two implementations of the same rules now exist. They must agree, or
   a match scored in the browser reads differently in the app. The
   contract is the fixture suite in src/engine/__fixtures__, generated
   from the Swift test suite — not this comment.

   Porting conventions:
   - Swift `mutating func` on a struct becomes a pure function returning
     new state. Swift structs are values, so the engines were already
     effectively pure; this just makes it explicit and React-friendly.
   - `TimeInterval` (seconds) stays a number of seconds.
   - `Date` becomes epoch milliseconds. ISO-8601 conversion happens at
     the persistence and export boundary, never in here.
   ============================================================ */

export const SPORTS = [
  'badminton', 'tennis', 'padel', 'pickleball', 'squash', 'tableTennis',
  'volleyball', 'basketball', 'football', 'floorball', 'golf', 'discGolf',
] as const;

export type Sport = (typeof SPORTS)[number];

export type Side = 'player' | 'opponent';

export function other(side: Side): Side {
  return side === 'player' ? 'opponent' : 'player';
}

/** Singles / doubles. Only meaningful for the six racket sports. */
export type MatchType = 'singles' | 'doubles';

/**
 * One finished game / set / period. Reused across engines, as in Swift.
 *
 * `pointSequence` is rally-engine only: who won each rally, in order, behind
 * the momentum chart. Tennis-family points are game/set-nested, so a cumulative
 * point difference is meaningless there — do not "helpfully" extend it to them.
 */
export interface GameScore {
  player: number;
  opponent: number;
  pointSequence?: Side[];
}

export function gameScore(player: number, opponent: number): GameScore {
  return { player, opponent };
}

/* ---------- engine routing (mirrors Shared/Sport.swift) ---------- */

const RALLY: ReadonlySet<Sport> = new Set(['badminton', 'volleyball', 'tableTennis', 'squash']);
const TENNIS: ReadonlySet<Sport> = new Set(['tennis', 'padel']);
const FOOTBALL: ReadonlySet<Sport> = new Set(['football', 'floorball']);
const GOLF: ReadonlySet<Sport> = new Set(['golf', 'discGolf']);
const MATCH_TYPE: ReadonlySet<Sport> = new Set([
  'badminton', 'tennis', 'padel', 'pickleball', 'squash', 'tableTennis',
]);

export const usesRallyEngine = (s: Sport) => RALLY.has(s);
export const usesTennisEngine = (s: Sport) => TENNIS.has(s);
export const usesFootballEngine = (s: Sport) => FOOTBALL.has(s);
export const isGolfLike = (s: Sport) => GOLF.has(s);

/**
 * Whether the singles / doubles distinction means anything. Only the racket
 * sports use it — team sports carry a variable team size and golf is a flight,
 * so both store `singles` as an inert default. Anything that buckets matches by
 * format must gate on this, or team-sport matches get miscounted as Singles.
 */
export const usesMatchType = (s: Sport) => MATCH_TYPE.has(s);

/** Largest side for a sport. Golf is a flight of up to 4 on one card. */
export function maxTeamSize(sport: Sport): number {
  if (isGolfLike(sport)) return 4;
  if (usesMatchType(sport)) return 2;
  return 11;
}

/* ---------- helpers ---------- */

/** Swift's `Comparable.clamped(to:)`. */
export function clamp(value: number, lower: number, upper: number): number {
  return Math.min(Math.max(value, lower), upper);
}

export function sum(values: readonly number[]): number {
  return values.reduce((a, b) => a + b, 0);
}
