/* ============================================================
   Tennis engine — tennis and padel.

   Port of Shared/TennisRules.swift. Padel scores exactly like tennis;
   its preset differs in one rule (golden point at deuce → noAd).

   Point representation, as in Swift: in a regular game `playerPoints`
   ranges over 0...3 (displayed 0/15/30/40), 3-3 is deuce, and 4-3 / 3-4
   is advantage. In a tiebreak they are raw integers.
   ============================================================ */

import { clamp, gameScore, other, sum, type GameScore, type Side } from './types';

export interface SetScore {
  /** Final game count, including the tiebreak game itself — 7-6 stores 7 and 6. */
  player: number;
  opponent: number;
  /** Tiebreak point counts, if the set ended in one. */
  tiebreak?: GameScore;
}

export interface TennisScore {
  playerSets: number;
  opponentSets: number;
  completedSets: SetScore[];
  currentGames: GameScore;
  playerPoints: number;
  opponentPoints: number;
  inTiebreak: boolean;
  /**
   * Side that served the match's first game. Serve alternates every game, so the
   * live server is *derived* (see `servingSide`); this is the only stored serve
   * state. Side-level — in doubles it identifies the serving team.
   */
  firstServer: Side;
}

export function newTennisScore(firstServer: Side = 'player'): TennisScore {
  return {
    playerSets: 0, opponentSets: 0, completedSets: [],
    currentGames: gameScore(0, 0),
    playerPoints: 0, opponentPoints: 0, inTiebreak: false, firstServer,
  };
}

export interface TennisRules {
  /** 2 = best of 3, 3 = best of 5. Range 1...3. */
  setsToWin: number;
  /** Games to win a regular set. Range 1...10. Standard 6. */
  gamesPerSet: number;
  /** Game count at which both sides force a tiebreak. Range 1...10. */
  tiebreakAt: number;
  /** Points to win the tiebreak. Range 5...20. Standard 7, super-tiebreak 10. */
  tiebreakPoints: number;
  /** If false, the deciding set is an advantage set — play on until 2 games up. */
  finalSetTiebreak: boolean;
  /** If true, the next point after deuce wins the game outright. */
  noAd: boolean;
}

export const tennisDefault: TennisRules = {
  setsToWin: 2, gamesPerSet: 6, tiebreakAt: 6, tiebreakPoints: 7,
  finalSetTiebreak: true, noAd: false,
};

/** Padel (FIP): identical to tennis but for the golden point at deuce. */
export const padelDefault: TennisRules = { ...tennisDefault, noAd: true };

export function normaliseTennis(rules: TennisRules): TennisRules {
  return {
    ...rules,
    setsToWin: clamp(rules.setsToWin, 1, 3),
    gamesPerSet: clamp(rules.gamesPerSet, 1, 10),
    tiebreakAt: clamp(rules.tiebreakAt, 1, 10),
    tiebreakPoints: clamp(rules.tiebreakPoints, 5, 20),
  };
}

export function isTennisMatchComplete(rules: TennisRules, s: TennisScore): boolean {
  return s.playerSets >= rules.setsToWin || s.opponentSets >= rules.setsToWin;
}

/** True iff the next point would close out the match for either side. */
export function isTennisMatchPoint(rules: TennisRules, s: TennisScore): boolean {
  if (isTennisMatchComplete(rules, s)) return false;
  return (
    isTennisMatchComplete(rules, tennisPointScored(rules, 'player', s)) ||
    isTennisMatchComplete(rules, tennisPointScored(rules, 'opponent', s))
  );
}

/**
 * Apply one rally won by `side`. A no-op once the match is complete — the caller
 * should stop offering scoring controls in that state, but this guards double-taps.
 */
export function tennisPointScored(rules: TennisRules, side: Side, current: TennisScore): TennisScore {
  if (isTennisMatchComplete(rules, current)) return current;
  const s: TennisScore = { ...current, completedSets: [...current.completedSets] };
  return s.inTiebreak ? applyTiebreakPoint(rules, side, s) : applyRegularPoint(rules, side, s);
}

function applyRegularPoint(rules: TennisRules, side: Side, s: TennisScore): TennisScore {
  // Snapshot before the increment — no-ad needs to know we *were* at deuce.
  const wasDeuce = s.playerPoints === 3 && s.opponentPoints === 3;

  if (side === 'player') s.playerPoints += 1;
  else s.opponentPoints += 1;

  if (rules.noAd && wasDeuce) return awardGame(rules, side, s);

  // Normalise "4-4" (or higher equal) back to deuce, which happens when the side
  // at advantage loses the next point. Without this, advantage state compounds.
  if (s.playerPoints >= 4 && s.opponentPoints >= 4 && s.playerPoints === s.opponentPoints) {
    s.playerPoints = 3;
    s.opponentPoints = 3;
  }

  const winner = regularGameWinner(s.playerPoints, s.opponentPoints);
  return winner ? awardGame(rules, winner, s) : s;
}

function regularGameWinner(p: number, o: number): Side | null {
  if (!(Math.max(p, o) >= 4 && Math.abs(p - o) >= 2)) return null;
  return p > o ? 'player' : 'opponent';
}

function awardGame(rules: TennisRules, side: Side, s: TennisScore): TennisScore {
  s.playerPoints = 0;
  s.opponentPoints = 0;
  s.currentGames = side === 'player'
    ? gameScore(s.currentGames.player + 1, s.currentGames.opponent)
    : gameScore(s.currentGames.player, s.currentGames.opponent + 1);

  // "Final set" = the set being played is the decider (both already at setsToWin - 1).
  const final = isFinalSet(rules, s);
  const setWinner = regularSetWinner(rules, s.currentGames, final);
  if (setWinner) return closeRegularSet(setWinner, s);
  if (shouldEnterTiebreak(rules, s.currentGames, final)) s.inTiebreak = true;
  return s;
}

function applyTiebreakPoint(rules: TennisRules, side: Side, s: TennisScore): TennisScore {
  if (side === 'player') s.playerPoints += 1;
  else s.opponentPoints += 1;
  if (Math.max(s.playerPoints, s.opponentPoints) >= rules.tiebreakPoints
      && Math.abs(s.playerPoints - s.opponentPoints) >= 2) {
    const tiebreak = gameScore(s.playerPoints, s.opponentPoints);
    const winner: Side = s.playerPoints > s.opponentPoints ? 'player' : 'opponent';
    return closeTiebreakSet(winner, tiebreak, s);
  }
  return s;
}

function regularSetWinner(rules: TennisRules, g: GameScore, final: boolean): Side | null {
  const maxG = Math.max(g.player, g.opponent);
  const diff = Math.abs(g.player - g.opponent);
  // Where a tiebreak would apply, never declare a regular winner at tiebreakAt-all.
  const tiebreakApplies = final ? rules.finalSetTiebreak : true;
  if (tiebreakApplies && g.player === rules.tiebreakAt && g.opponent === rules.tiebreakAt) return null;
  if (maxG >= rules.gamesPerSet && diff >= 2) return g.player > g.opponent ? 'player' : 'opponent';
  return null;
}

function shouldEnterTiebreak(rules: TennisRules, g: GameScore, final: boolean): boolean {
  const tiebreakApplies = final ? rules.finalSetTiebreak : true;
  return tiebreakApplies && g.player === rules.tiebreakAt && g.opponent === rules.tiebreakAt;
}

function closeRegularSet(winner: Side, s: TennisScore): TennisScore {
  s.completedSets.push({ player: s.currentGames.player, opponent: s.currentGames.opponent });
  if (winner === 'player') s.playerSets += 1;
  else s.opponentSets += 1;
  s.currentGames = gameScore(0, 0);
  s.playerPoints = 0;
  s.opponentPoints = 0;
  return s;
}

function closeTiebreakSet(winner: Side, tiebreak: GameScore, s: TennisScore): TennisScore {
  // The tiebreak winner takes the set at (gamesPerSet + 1) vs gamesPerSet — 7-6.
  let playerGames: number;
  let opponentGames: number;
  if (winner === 'player') {
    playerGames = s.currentGames.player + 1;
    opponentGames = s.currentGames.opponent;
    s.playerSets += 1;
  } else {
    playerGames = s.currentGames.player;
    opponentGames = s.currentGames.opponent + 1;
    s.opponentSets += 1;
  }
  s.completedSets.push({ player: playerGames, opponent: opponentGames, tiebreak });
  s.currentGames = gameScore(0, 0);
  s.playerPoints = 0;
  s.opponentPoints = 0;
  s.inTiebreak = false;
  return s;
}

function isFinalSet(rules: TennisRules, s: TennisScore): boolean {
  return s.playerSets === rules.setsToWin - 1 && s.opponentSets === rules.setsToWin - 1;
}

/* ---------- display ---------- */

/** "0"/"15"/"30"/"40"/"AD" outside a tiebreak; the raw integer inside one. */
export function pointDisplay(s: TennisScore, side: Side): string {
  const mine = side === 'player' ? s.playerPoints : s.opponentPoints;
  const theirs = side === 'player' ? s.opponentPoints : s.playerPoints;
  if (s.inTiebreak) return String(mine);
  if (mine >= 4 && theirs === 3) return 'AD';
  switch (mine) {
    case 0: return '0';
    case 1: return '15';
    case 2: return '30';
    case 3: return '40';
    default: return 'AD';   // defensive fallback, as in Swift
  }
}

export function isDeuce(s: TennisScore): boolean {
  return !s.inTiebreak && s.playerPoints === 3 && s.opponentPoints === 3;
}

export function advantageSide(s: TennisScore): Side | null {
  if (s.inTiebreak) return null;
  if (s.playerPoints === 4 && s.opponentPoints === 3) return 'player';
  if (s.opponentPoints === 4 && s.playerPoints === 3) return 'opponent';
  return null;
}

/**
 * Side serving the current game — or the current point in a tiebreak — derived
 * from the score and `firstServer`. Serve alternates every game; in a tiebreak
 * the starter serves one point, then it alternates every two (S, O, O, S, S, …).
 */
export function servingSide(s: TennisScore): Side {
  const completedGames = sum(s.completedSets.map((set) => set.player + set.opponent));
  const gamesSoFar = completedGames + s.currentGames.player + s.currentGames.opponent;
  const gameStarter: Side = gamesSoFar % 2 === 0 ? s.firstServer : other(s.firstServer);
  if (!s.inTiebreak) return gameStarter;
  const pointsPlayed = s.playerPoints + s.opponentPoints;
  const flips = Math.trunc((pointsPlayed + 1) / 2);
  return flips % 2 === 0 ? gameStarter : other(gameStarter);
}

/** "6-4", or "7-6 (3)" when a tiebreak decided it — the bracket is the loser's points. */
export function setDisplayText(set: SetScore): string {
  if (set.tiebreak) {
    return `${set.player}-${set.opponent} (${Math.min(set.tiebreak.player, set.tiebreak.opponent)})`;
  }
  return `${set.player}-${set.opponent}`;
}
