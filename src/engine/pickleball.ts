/* ============================================================
   Pickleball engine — its own, because of the serve.

   Port of Shared/PickleballRules.swift. In traditional side-out scoring
   only the serving side can score, and a doubles team serves twice
   (server 1, then server 2) before the serve passes. The engine owns
   that chain: a rally won by the receiving side never scores.
   ============================================================ */

import { clamp, gameScore, other, type GameScore, type Side } from './types';

export type PickleballScoringMode = 'sideOut' | 'rally';

export interface PickleballScore {
  playerPoints: number;
  opponentPoints: number;
  playerGames: number;
  opponentGames: number;
  completedGames: GameScore[];
  servingSide: Side;
  /** 1 or 2 — the doubles server number for side-out scoring. Always 1 in singles. */
  serverNumber: number;
  isDoubles: boolean;
  /** Who served first in the current game. The opening serve alternates each game. */
  gameStartingServer: Side;
}

export function newPickleballScore(isDoubles = false): PickleballScore {
  return {
    playerPoints: 0, opponentPoints: 0, playerGames: 0, opponentGames: 0,
    completedGames: [], servingSide: 'player',
    // First-server exception: a doubles game opens at "0-0-2" — the starting team
    // gets only one server before the first side out.
    serverNumber: isDoubles ? 2 : 1,
    isDoubles, gameStartingServer: 'player',
  };
}

export interface PickleballRules {
  /** First side to this many games wins. 2 = best of 3. Range 1...10. */
  gamesToWin: number;
  /** Game-winning score. Range 5...50. Default 11 (official). */
  pointsPerGame: number;
  winByTwo: boolean;
  scoringMode: PickleballScoringMode;
}

export const pickleballDefault: PickleballRules = {
  gamesToWin: 2, pointsPerGame: 11, winByTwo: true, scoringMode: 'sideOut',
};

export function normalisePickleball(rules: PickleballRules): PickleballRules {
  return {
    ...rules,
    gamesToWin: clamp(rules.gamesToWin, 1, 10),
    pointsPerGame: clamp(rules.pointsPerGame, 5, 50),
  };
}

export function isPickleballMatchComplete(rules: PickleballRules, s: PickleballScore): boolean {
  return s.playerGames >= rules.gamesToWin || s.opponentGames >= rules.gamesToWin;
}

function isGameWon(rules: PickleballRules, points: number, theirPoints: number): boolean {
  if (points < rules.pointsPerGame) return false;
  return rules.winByTwo ? points - theirPoints >= 2 : points > theirPoints;
}

/** True iff the next rally could close out the match for either side. */
export function isPickleballMatchPoint(rules: PickleballRules, s: PickleballScore): boolean {
  if (isPickleballMatchComplete(rules, s)) return false;
  return (
    isPickleballMatchComplete(rules, pickleballRallyWon(rules, 'player', s)) ||
    isPickleballMatchComplete(rules, pickleballRallyWon(rules, 'opponent', s))
  );
}

/** True iff the next rally could close the current game for either side. */
export function isPickleballGamePoint(rules: PickleballRules, s: PickleballScore): boolean {
  if (isPickleballMatchComplete(rules, s)) return false;
  const games = s.playerGames + s.opponentGames;
  const afterPlayer = pickleballRallyWon(rules, 'player', s);
  const afterOpponent = pickleballRallyWon(rules, 'opponent', s);
  return (
    afterPlayer.playerGames + afterPlayer.opponentGames > games ||
    afterOpponent.playerGames + afterOpponent.opponentGames > games
  );
}

/** Apply one rally won by `side`. A no-op once the match is complete. */
export function pickleballRallyWon(
  rules: PickleballRules, side: Side, current: PickleballScore,
): PickleballScore {
  if (isPickleballMatchComplete(rules, current)) return current;
  const s: PickleballScore = { ...current, completedGames: [...current.completedGames] };

  if (rules.scoringMode === 'rally') {
    // Every rally scores. The serve passes when the receiving side wins.
    award(rules, side, s);
    if (s.servingSide !== side) s.servingSide = side;
    return s;
  }

  // Side-out.
  if (side === s.servingSide) {
    award(rules, side, s);
  } else if (s.isDoubles && s.serverNumber === 1) {
    // The serving team keeps the serve; the second server steps in.
    s.serverNumber = 2;
  } else {
    // Side out: the serve passes, and the new team starts at server 1 — the
    // first-server exception applies only to a game's opening serve.
    s.servingSide = side;
    s.serverNumber = 1;
  }
  return s;
}

function award(rules: PickleballRules, side: Side, s: PickleballScore): void {
  if (side === 'player') s.playerPoints += 1;
  else s.opponentPoints += 1;
  const mine = side === 'player' ? s.playerPoints : s.opponentPoints;
  const theirs = side === 'player' ? s.opponentPoints : s.playerPoints;
  if (isGameWon(rules, mine, theirs)) closeGame(rules, side, s);
}

function closeGame(rules: PickleballRules, winner: Side, s: PickleballScore): void {
  s.completedGames.push(gameScore(s.playerPoints, s.opponentPoints));
  if (winner === 'player') s.playerGames += 1;
  else s.opponentGames += 1;
  s.playerPoints = 0;
  s.opponentPoints = 0;
  if (isPickleballMatchComplete(rules, s)) return;
  s.gameStartingServer = other(s.gameStartingServer);
  s.servingSide = s.gameStartingServer;
  s.serverNumber = s.isDoubles ? 2 : 1;
}

/** The traditional score call, serving side first: "3-2" singles, "3-2-1" doubles. */
export function scoreCall(s: PickleballScore): string {
  const mine = s.servingSide === 'player' ? s.playerPoints : s.opponentPoints;
  const theirs = s.servingSide === 'player' ? s.opponentPoints : s.playerPoints;
  return s.isDoubles ? `${mine}-${theirs}-${s.serverNumber}` : `${mine}-${theirs}`;
}
