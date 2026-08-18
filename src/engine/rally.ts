/* ============================================================
   Rally engine — badminton, volleyball, table tennis, squash.

   Port of Shared/BadmintonRules.swift. Named for badminton because that
   is where it started; the other three ship as presets over the same
   rules. Every check is game-context-aware, because the points target
   can differ in the deciding game (volleyball's 15-point final set), so
   callers pass the current games tally.
   ============================================================ */

import { clamp, other, type Side } from './types';

export interface RallyRules {
  /** First side to this many games wins. 1...10. */
  gamesToWin: number;
  /** Game-winning score. 3...100. */
  maxPoints: number;
  /** Must a side win by 2? */
  winByTwo: boolean;
  /** Absolute score at which a 1-point lead is enough. >= maxPoints + 5, <= 200. */
  suddenDeathCap: number;
  /**
   * Whether the cap applies at all. Badminton caps at 30; volleyball, table
   * tennis and squash play win-by-2 uncapped, so their presets turn this off.
   * Only meaningful when `winByTwo`.
   */
  capEnabled: boolean;
  /**
   * Points target for the *deciding* game when it differs from `maxPoints` —
   * volleyball's 15-point tie-break set. Undefined = play to `maxPoints`.
   */
  decidingGamePoints?: number;
}

export const badmintonDefault: RallyRules = {
  gamesToWin: 2, maxPoints: 21, winByTwo: true, suddenDeathCap: 30, capEnabled: true,
};

/** Indoor volleyball: best of 5 sets to 25 (win by 2, uncapped), deciding set to 15. */
export const volleyballDefault: RallyRules = {
  gamesToWin: 3, maxPoints: 25, winByTwo: true, suddenDeathCap: 30,
  capEnabled: false, decidingGamePoints: 15,
};

/** Table tennis (ITTF): best of 5 games to 11, win by 2, uncapped. */
export const tableTennisDefault: RallyRules = {
  gamesToWin: 3, maxPoints: 11, winByTwo: true, suddenDeathCap: 16, capEnabled: false,
};

/** Squash (PAR-11, world standard since 2009): best of 5 to 11, win by 2, uncapped. */
export const squashDefault: RallyRules = {
  gamesToWin: 3, maxPoints: 11, winByTwo: true, suddenDeathCap: 16, capEnabled: false,
};

export const RALLY_LIMITS = {
  gamesToWin: [1, 10] as const,
  maxPoints: [3, 100] as const,
  suddenDeathCapAbsoluteMax: 200,
  suddenDeathCapMinOffset: 5,
  decidingGamePoints: [3, 100] as const,
};

export function suddenDeathCapRange(rules: RallyRules): readonly [number, number] {
  const lower = rules.maxPoints + RALLY_LIMITS.suddenDeathCapMinOffset;
  return [lower, Math.max(lower, RALLY_LIMITS.suddenDeathCapAbsoluteMax)];
}

/** Clamp configuration to allowed ranges. Use after stepper edits or a settings load. */
export function normaliseRally(rules: RallyRules): RallyRules {
  const maxPoints = clamp(rules.maxPoints, ...RALLY_LIMITS.maxPoints);
  const withPoints = { ...rules, maxPoints };
  const [capLo, capHi] = suddenDeathCapRange(withPoints);
  return {
    ...withPoints,
    gamesToWin: clamp(rules.gamesToWin, ...RALLY_LIMITS.gamesToWin),
    suddenDeathCap: clamp(rules.suddenDeathCap, capLo, capHi),
    decidingGamePoints:
      rules.decidingGamePoints === undefined
        ? undefined
        : clamp(rules.decidingGamePoints, ...RALLY_LIMITS.decidingGamePoints),
  };
}

/**
 * Points target for the game being played: `decidingGamePoints` when both sides
 * are one game from victory, else `maxPoints`.
 *
 * The `gamesToWin > 1` guard matters: with `gamesToWin === 1` the only game
 * opens at 0-0 = `gamesToWin - 1` each, which would otherwise apply the shorter
 * deciding-game target to the whole match — a 1-set volleyball match playing to
 * 15 instead of 25. A deciding game only exists in a best-of-three or longer.
 */
export function targetPoints(rules: RallyRules, playerGames: number, opponentGames: number): number {
  if (
    rules.decidingGamePoints !== undefined &&
    rules.gamesToWin > 1 &&
    playerGames === rules.gamesToWin - 1 &&
    opponentGames === rules.gamesToWin - 1
  ) {
    return rules.decidingGamePoints;
  }
  return rules.maxPoints;
}

/** True iff the current game can be ended at this score. */
export function canEndGame(
  rules: RallyRules,
  playerScore: number, opponentScore: number,
  playerGames: number, opponentGames: number,
): boolean {
  const target = targetPoints(rules, playerGames, opponentGames);
  const mx = Math.max(playerScore, opponentScore);
  const diff = Math.abs(playerScore - opponentScore);
  if (!rules.winByTwo) return mx >= target;
  if (rules.capEnabled && mx >= rules.suddenDeathCap) return true;
  return mx >= target && diff >= 2;
}

/** True iff the next rally for `mine` would end the game in their favour. */
export function wouldWinGame(
  rules: RallyRules,
  mine: number, theirs: number,
  playerGames: number, opponentGames: number,
): boolean {
  const next = mine + 1;
  return canEndGame(rules, next, theirs, playerGames, opponentGames) && next > theirs;
}

/** True iff either side is one rally from winning the current game. */
export function isGameEndingPoint(
  rules: RallyRules,
  playerScore: number, opponentScore: number,
  playerGames: number, opponentGames: number,
): boolean {
  return (
    wouldWinGame(rules, playerScore, opponentScore, playerGames, opponentGames) ||
    wouldWinGame(rules, opponentScore, playerScore, playerGames, opponentGames)
  );
}

/** True iff the next rally for `mine` would win the whole match. */
export function wouldWinMatch(
  rules: RallyRules,
  mine: number, theirs: number,
  myGames: number, theirGames: number,
): boolean {
  return wouldWinGame(rules, mine, theirs, myGames, theirGames) && myGames + 1 >= rules.gamesToWin;
}

/** True iff either side would win the match by taking the next rally. */
export function isMatchEndingPoint(
  rules: RallyRules,
  playerScore: number, opponentScore: number,
  playerGames: number, opponentGames: number,
): boolean {
  return (
    wouldWinMatch(rules, playerScore, opponentScore, playerGames, opponentGames) ||
    wouldWinMatch(rules, opponentScore, playerScore, opponentGames, playerGames)
  );
}

/** True iff one side has won enough games. */
export function isRallyMatchComplete(rules: RallyRules, playerGames: number, opponentGames: number): boolean {
  return playerGames >= rules.gamesToWin || opponentGames >= rules.gamesToWin;
}

/* ---------- serve ---------- */

/**
 * Table tennis *derives* its server from the game's opening server, the points
 * played and the match's own target — never a hardcoded 11, because the target
 * is user-editable and a deciding game can differ.
 *
 * Serve changes every 2 points, then every point once both sides reach
 * `target - 1` (ITTF).
 */
export function tableTennisServer(
  gameFirstServer: Side, playerScore: number, opponentScore: number, target: number,
): Side {
  const deucePoint = target - 1;
  const inDeuce = playerScore >= deucePoint && opponentScore >= deucePoint;
  const total = playerScore + opponentScore;
  // Before deuce: one change per completed pair of points. From deuce on: the
  // pairs already played, plus one change for every point since.
  const changes = inDeuce
    ? deucePoint + (total - 2 * deucePoint)
    : Math.trunc(total / 2);
  return changes % 2 === 0 ? gameFirstServer : other(gameFirstServer);
}

/**
 * Badminton, volleyball and squash hand the serve to the rally winner; table
 * tennis derives it (above). Game transitions differ too: badminton and squash
 * give the next game's serve to the winner, volleyball and table tennis alternate.
 */
export function nextGameFirstServer(sport: RallyServeSport, gameWinner: Side, previousFirst: Side): Side {
  switch (sport) {
    case 'badminton':
    case 'squash':
      return gameWinner;
    case 'volleyball':
    case 'tableTennis':
      return other(previousFirst);
  }
}

export type RallyServeSport = 'badminton' | 'squash' | 'volleyball' | 'tableTennis';
