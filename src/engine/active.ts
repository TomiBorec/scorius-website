/* ============================================================
   The in-progress match — state machine and undo.

   Port of Shared/ActiveMatchData.swift (+ its BadmintonGame extension).
   The engines in the sibling files are pure rules; this is the thing that
   holds a running match and mutates it.

   Two structural decisions carried over from Swift because they earn
   their keep, and one that deliberately is not:

   CARRIED: **flat-field mirrors.** `playerScore` / `opponentScore` and
   `playerGames` / `opponentGames` are maintained alongside the per-sport
   runtime state, so sport-agnostic surfaces (a history row, the spectate
   payload) render "85-79" without knowing what sport it is. One mirror
   helper per sport, used by record *and* undo *and* advance, so the
   mirror cannot diverge between paths.

   CARRIED: **snapshot-based undo, not inverse operations.** Serve
   possession, a doubles server number, a period advance, a clock anchor
   — none of these can be inverted from a flat score field. Every record
   path pushes a snapshot first and undo replays it.

   NOT CARRIED: Swift's `Codable` shape. The app's on-disk JSON is a
   hand-written sum-type encoding; matching it here would contort the
   state for no gain. The export boundary converts (see Phase E in
   docs/LIVE-SPECTATE.md) — being *able* to emit the app's format is the
   requirement, not being shaped like it.
   ============================================================ */

import {
  gameScore, isGolfLike, other, usesRallyEngine, usesTennisEngine,
  type GameScore, type MatchType, type Side, type Sport,
} from './types';
import {
  canEndGame, isRallyMatchComplete, nextGameFirstServer, tableTennisServer, targetPoints,
  type RallyRules, type RallyServeSport,
} from './rally';
import { tennisPointScored, newTennisScore, type TennisRules, type TennisScore } from './tennis';
import {
  newPickleballScore, pickleballRallyWon, type PickleballRules, type PickleballScore,
} from './pickleball';
import { closePeriod, expireClockIfNeeded, setClock, toggleClock } from './clock';
import {
  basketballPeriodDuration, newBasketballScore, type BasketballRules, type BasketballScore,
} from './basketball';
import {
  footballPeriodDuration, newFootballScore, type FootballRules, type FootballScore, type GoalEvent,
} from './football';
import { newGolfScore, type GolfRules, type GolfScore } from './golf';

/** Cap on every per-sport undo stack, as in Swift. */
export const MAX_UNDO_ENTRIES = 50;

/** Cap on the per-game point log — a corruption guard, not a real limit. */
export const MAX_POINT_LOG_ENTRIES = 200;

/** Rules for one match, tagged by sport. Baked in at start and never re-read. */
export type MatchSettings =
  | { kind: 'rally'; rules: RallyRules }
  | { kind: 'tennis'; rules: TennisRules }
  | { kind: 'pickleball'; rules: PickleballRules }
  | { kind: 'basketball'; rules: BasketballRules }
  | { kind: 'football'; rules: FootballRules }
  | { kind: 'golf'; rules: GolfRules };

export type SportRuntimeState =
  | { kind: 'tennis'; score: TennisScore }
  | { kind: 'pickleball'; score: PickleballScore }
  | { kind: 'basketball'; score: BasketballScore }
  | { kind: 'football'; score: FootballScore }
  | { kind: 'golf'; score: GolfScore };

/** Pre-rally snapshot for the rally engine's undo. */
export interface RallySnapshot {
  playerScore: number;
  opponentScore: number;
  playerGames: number;
  opponentGames: number;
  gameScores: GameScore[];
  gameMessage: string;
  isMatchComplete: boolean;
  isScoringLocked: boolean;
  rallyFirstServer?: Side;
  rallyGameFirstServer?: Side;
  rallyCurrentServer?: Side;
  currentGamePointLog?: Side[];
}

export interface ActiveMatch {
  sport: Sport;
  settings: MatchSettings;
  matchType: MatchType;
  /** Epoch ms. */
  startTime: number;

  /** Flat mirrors — see the header. */
  playerScore: number;
  opponentScore: number;
  playerGames: number;
  opponentGames: number;
  gameScores: GameScore[];

  gameMessage: string;
  isMatchComplete: boolean;
  isScoringLocked: boolean;

  /** Per-match display names. Undefined falls back to "Side 1" / "Side 2". */
  side1Name?: string;
  side2Name?: string;

  runtimeState?: SportRuntimeState;

  /**
   * Rally serve state. Three fields because table tennis *derives* its server
   * from the game's opening server rather than stepping it.
   *
   * Undefined means "this match does not track serve", which is how a rally match
   * started before the feature existed behaves in the app. Kept so the exported
   * shape can be nil-preserving.
   */
  rallyFirstServer?: Side;
  rallyGameFirstServer?: Side;
  rallyCurrentServer?: Side;

  /** Who won each rally of the current game — rally engine only. */
  currentGamePointLog?: Side[];

  rallyUndoStack: RallySnapshot[];
  tennisUndoStack: TennisScore[];
  pickleballUndoStack: PickleballScore[];
  basketballUndoStack: BasketballScore[];
  footballUndoStack: FootballScore[];
  golfUndoStack: GolfScore[];
}

/* ---------- construction ---------- */

export interface StartMatchOptions {
  sport: Sport;
  settings: MatchSettings;
  matchType?: MatchType;
  side1Name?: string;
  side2Name?: string;
  /** Flight size for golf (1...4). Ignored for other sports. */
  playerCount?: number;
  /** Epoch ms; injected so tests and fixtures are deterministic. */
  now: number;
}

export function startMatch(o: StartMatchOptions): ActiveMatch {
  const base: ActiveMatch = {
    sport: o.sport,
    settings: o.settings,
    matchType: o.matchType ?? 'singles',
    startTime: o.now,
    playerScore: 0, opponentScore: 0, playerGames: 0, opponentGames: 0,
    gameScores: [],
    gameMessage: '', isMatchComplete: false, isScoringLocked: false,
    side1Name: o.side1Name, side2Name: o.side2Name,
    rallyUndoStack: [], tennisUndoStack: [], pickleballUndoStack: [],
    basketballUndoStack: [], footballUndoStack: [], golfUndoStack: [],
  };

  if (usesRallyEngine(o.sport)) {
    // A new match always tracks serve; Side 1 opens unless the scorer flips it.
    return { ...base, rallyFirstServer: 'player', rallyGameFirstServer: 'player',
             rallyCurrentServer: 'player', currentGamePointLog: [] };
  }
  if (usesTennisEngine(o.sport) && o.settings.kind === 'tennis') {
    return { ...base, runtimeState: { kind: 'tennis', score: newTennisScore('player') } };
  }
  if (o.sport === 'pickleball' && o.settings.kind === 'pickleball') {
    return { ...base,
             runtimeState: { kind: 'pickleball',
                             score: newPickleballScore(base.matchType === 'doubles') } };
  }
  if (o.sport === 'basketball' && o.settings.kind === 'basketball') {
    return { ...base, runtimeState: { kind: 'basketball', score: newBasketballScore(o.settings.rules) } };
  }
  if (o.settings.kind === 'football') {
    return { ...base, runtimeState: { kind: 'football', score: newFootballScore(o.settings.rules) } };
  }
  if (isGolfLike(o.sport) && o.settings.kind === 'golf') {
    const flight = Math.min(Math.max(1, o.playerCount ?? 1), 4);
    return { ...base,
             runtimeState: { kind: 'golf', score: newGolfScore(flight, o.settings.rules.holeCount) } };
  }
  return base;
}

/* ---------- undo plumbing ---------- */

function pushUndo<T>(stack: T[], snapshot: T): T[] {
  const next = [...stack, snapshot];
  return next.length > MAX_UNDO_ENTRIES ? next.slice(next.length - MAX_UNDO_ENTRIES) : next;
}

/* ---------- rally: badminton, volleyball, table tennis, squash ---------- */

function rallySnapshot(m: ActiveMatch): RallySnapshot {
  return {
    playerScore: m.playerScore, opponentScore: m.opponentScore,
    playerGames: m.playerGames, opponentGames: m.opponentGames,
    gameScores: [...m.gameScores],
    gameMessage: m.gameMessage,
    isMatchComplete: m.isMatchComplete, isScoringLocked: m.isScoringLocked,
    rallyFirstServer: m.rallyFirstServer,
    rallyGameFirstServer: m.rallyGameFirstServer,
    rallyCurrentServer: m.rallyCurrentServer,
    currentGamePointLog: m.currentGamePointLog ? [...m.currentGamePointLog] : undefined,
  };
}

/** Records one rally: snapshot, increment, log it, move the serve. */
export function recordRallyPoint(m: ActiveMatch, side: Side): ActiveMatch {
  if (!usesRallyEngine(m.sport) || m.settings.kind !== 'rally') return m;
  const next: ActiveMatch = {
    ...m,
    rallyUndoStack: pushUndo(m.rallyUndoStack, rallySnapshot(m)),
    playerScore: side === 'player' ? m.playerScore + 1 : m.playerScore,
    opponentScore: side === 'opponent' ? m.opponentScore + 1 : m.opponentScore,
  };
  next.currentGamePointLog = appendToPointLog(m.currentGamePointLog, side);
  next.rallyCurrentServer = advanceRallyServer(next, side);
  return next;
}

/** Silent no-op while the log is undefined — that is the "legacy match" contract. */
function appendToPointLog(log: Side[] | undefined, side: Side): Side[] | undefined {
  if (!log) return undefined;
  if (log.length >= MAX_POINT_LOG_ENTRIES) return log;
  return [...log, side];
}

function advanceRallyServer(m: ActiveMatch, rallyWonBy: Side): Side | undefined {
  if (m.rallyCurrentServer === undefined) return undefined;
  if (m.sport === 'tableTennis') {
    // Derived, not stepped: table tennis rotates on a fixed cadence, so deriving
    // keeps the answer right after an undo or a manual correction.
    if (m.rallyGameFirstServer === undefined || m.settings.kind !== 'rally') return m.rallyCurrentServer;
    const target = targetPoints(m.settings.rules, m.playerGames, m.opponentGames);
    return tableTennisServer(m.rallyGameFirstServer, m.playerScore, m.opponentScore, target);
  }
  // Badminton, volleyball, squash: the rally winner serves next.
  return rallyWonBy;
}

/**
 * The running log, but only when it adds up to the score it would be saved beside.
 *
 * The one gate between the log and history, which makes the chart's contract
 * checkable rather than assumed. It catches a score written without going through
 * `recordRallyPoint`, a game past the cap, and any future mutator that forgets the
 * log. Every miss fails the same way: no chart for that game, never a wrong one.
 */
export function validatedGamePointLog(m: ActiveMatch): Side[] | undefined {
  const log = m.currentGamePointLog;
  if (!log) return undefined;
  if (log.filter((s) => s === 'player').length !== m.playerScore) return undefined;
  if (log.filter((s) => s === 'opponent').length !== m.opponentScore) return undefined;
  return log;
}

export function canEndRallyGame(m: ActiveMatch): boolean {
  if (m.settings.kind !== 'rally') return false;
  return canEndGame(m.settings.rules, m.playerScore, m.opponentScore, m.playerGames, m.opponentGames);
}

/**
 * Closes the current game: records it (with its log, if it adds up), bumps the
 * game tally, then either completes the match or resets for the next game.
 */
export function finishRallyGame(m: ActiveMatch): ActiveMatch {
  if (!usesRallyEngine(m.sport) || m.settings.kind !== 'rally') return m;

  // Does this match log rallies at all? Read *before* the append, which is what
  // puts the closed game's log on record. A match that never logged must not
  // start mid-way; a game whose log a correction invalidated must not cost the
  // rest of the match its charts.
  const matchLogsRallies =
    m.currentGamePointLog !== undefined || m.gameScores.some((g) => g.pointSequence !== undefined);

  const closed: GameScore = {
    player: m.playerScore, opponent: m.opponentScore, pointSequence: validatedGamePointLog(m),
  };
  const rules = m.settings.rules;
  const playerGames = m.playerScore > m.opponentScore ? m.playerGames + 1 : m.playerGames;
  const opponentGames = m.opponentScore > m.playerScore ? m.opponentGames + 1 : m.opponentGames;

  const next: ActiveMatch = {
    ...m,
    gameScores: [...m.gameScores, closed],
    playerGames, opponentGames,
    currentGamePointLog: matchLogsRallies ? [] : undefined,
  };

  if (isRallyMatchComplete(rules, playerGames, opponentGames)) {
    return { ...next, isMatchComplete: true, isScoringLocked: true };
  }

  // Who opens the next game, decided from the score before it is zeroed.
  if (m.rallyCurrentServer !== undefined) {
    const winner: Side = m.playerScore > m.opponentScore ? 'player' : 'opponent';
    const first = nextGameFirstServer(
      m.sport as RallyServeSport, winner, m.rallyGameFirstServer ?? 'player');
    next.rallyGameFirstServer = first;
    next.rallyCurrentServer = first;
  }
  next.playerScore = 0;
  next.opponentScore = 0;
  next.gameMessage = '';
  return next;
}

export function undoRallyPoint(m: ActiveMatch): ActiveMatch {
  const snap = m.rallyUndoStack.at(-1);
  if (!snap) return m;
  return {
    ...m,
    rallyUndoStack: m.rallyUndoStack.slice(0, -1),
    playerScore: snap.playerScore, opponentScore: snap.opponentScore,
    playerGames: snap.playerGames, opponentGames: snap.opponentGames,
    gameScores: [...snap.gameScores],
    gameMessage: snap.gameMessage,
    isMatchComplete: snap.isMatchComplete, isScoringLocked: snap.isScoringLocked,
    rallyFirstServer: snap.rallyFirstServer,
    rallyGameFirstServer: snap.rallyGameFirstServer,
    rallyCurrentServer: snap.rallyCurrentServer,
    currentGamePointLog: snap.currentGamePointLog ? [...snap.currentGamePointLog] : undefined,
  };
}

/** Flips who served first — the correction for a match that didn't open on Side 1. */
export function toggleRallyFirstServer(m: ActiveMatch): ActiveMatch {
  if (m.rallyFirstServer === undefined) return m;
  const first = other(m.rallyFirstServer);
  return {
    ...m,
    rallyFirstServer: first,
    rallyGameFirstServer: m.rallyGameFirstServer ? other(m.rallyGameFirstServer) : undefined,
    rallyCurrentServer: m.rallyCurrentServer ? other(m.rallyCurrentServer) : undefined,
  };
}

/* ---------- tennis / padel ---------- */

export function recordTennisPoint(m: ActiveMatch, side: Side): ActiveMatch {
  if (m.runtimeState?.kind !== 'tennis' || m.settings.kind !== 'tennis') return m;
  const before = m.runtimeState.score;
  const score = tennisPointScored(m.settings.rules, side, before);
  return {
    ...m,
    tennisUndoStack: pushUndo(m.tennisUndoStack, before),
    runtimeState: { kind: 'tennis', score },
    // Mirror: games in the current set, sets as the "games" tally.
    playerScore: score.currentGames.player,
    opponentScore: score.currentGames.opponent,
    playerGames: score.playerSets,
    opponentGames: score.opponentSets,
    isMatchComplete: score.playerSets >= m.settings.rules.setsToWin
                  || score.opponentSets >= m.settings.rules.setsToWin,
  };
}

export function undoTennisPoint(m: ActiveMatch): ActiveMatch {
  const prev = m.tennisUndoStack.at(-1);
  if (!prev || m.settings.kind !== 'tennis') return m;
  return {
    ...m,
    tennisUndoStack: m.tennisUndoStack.slice(0, -1),
    runtimeState: { kind: 'tennis', score: prev },
    playerScore: prev.currentGames.player,
    opponentScore: prev.currentGames.opponent,
    playerGames: prev.playerSets,
    opponentGames: prev.opponentSets,
    isMatchComplete: false,
    isScoringLocked: false,
  };
}

export function toggleTennisFirstServer(m: ActiveMatch): ActiveMatch {
  if (m.runtimeState?.kind !== 'tennis') return m;
  const score = m.runtimeState.score;
  return { ...m, runtimeState: { kind: 'tennis', score: { ...score, firstServer: other(score.firstServer) } } };
}

/* ---------- pickleball ---------- */

export function recordPickleballRally(m: ActiveMatch, side: Side): ActiveMatch {
  if (m.runtimeState?.kind !== 'pickleball' || m.settings.kind !== 'pickleball') return m;
  const before = m.runtimeState.score;
  const score = pickleballRallyWon(m.settings.rules, side, before);
  return {
    ...m,
    pickleballUndoStack: pushUndo(m.pickleballUndoStack, before),
    runtimeState: { kind: 'pickleball', score },
    playerScore: score.playerPoints, opponentScore: score.opponentPoints,
    playerGames: score.playerGames, opponentGames: score.opponentGames,
    isMatchComplete: score.playerGames >= m.settings.rules.gamesToWin
                  || score.opponentGames >= m.settings.rules.gamesToWin,
  };
}

export function undoPickleballRally(m: ActiveMatch): ActiveMatch {
  const prev = m.pickleballUndoStack.at(-1);
  if (!prev) return m;
  return {
    ...m,
    pickleballUndoStack: m.pickleballUndoStack.slice(0, -1),
    runtimeState: { kind: 'pickleball', score: prev },
    playerScore: prev.playerPoints, opponentScore: prev.opponentPoints,
    playerGames: prev.playerGames, opponentGames: prev.opponentGames,
    isMatchComplete: false, isScoringLocked: false,
  };
}

/* ---------- basketball ---------- */

/**
 * Mirror: the flat score carries the current-period delta, "games" the running
 * total. Used by record *and* undo *and* advance for both clocked sports, so the
 * mirror cannot drift between paths.
 */
function mirrorClocked(
  totalPlayer: number, totalOpponent: number, periodScores: readonly GameScore[],
): Pick<ActiveMatch, 'playerScore' | 'opponentScore' | 'playerGames' | 'opponentGames'> {
  let closedPlayer = 0;
  let closedOpponent = 0;
  for (const p of periodScores) {
    closedPlayer += p.player;
    closedOpponent += p.opponent;
  }
  return {
    playerScore: totalPlayer - closedPlayer,
    opponentScore: totalOpponent - closedOpponent,
    playerGames: totalPlayer,
    opponentGames: totalOpponent,
  };
}

export function recordBasketballPoints(m: ActiveMatch, side: Side, value: number): ActiveMatch {
  if (m.runtimeState?.kind !== 'basketball') return m;
  const before = m.runtimeState.score;
  const score: BasketballScore = {
    ...before,
    playerPoints: side === 'player' ? before.playerPoints + value : before.playerPoints,
    opponentPoints: side === 'opponent' ? before.opponentPoints + value : before.opponentPoints,
  };
  return {
    ...m,
    basketballUndoStack: pushUndo(m.basketballUndoStack, before),
    runtimeState: { kind: 'basketball', score },
    ...mirrorClocked(score.playerPoints, score.opponentPoints, score.periodScores),
  };
}

export function undoBasketballPoints(m: ActiveMatch): ActiveMatch {
  const prev = m.basketballUndoStack.at(-1);
  if (!prev) return m;
  return {
    ...m,
    basketballUndoStack: m.basketballUndoStack.slice(0, -1),
    runtimeState: { kind: 'basketball', score: prev },
    ...mirrorClocked(prev.playerPoints, prev.opponentPoints, prev.periodScores),
    isMatchComplete: false, isScoringLocked: false,
  };
}

export function basketballAdvancePeriod(m: ActiveMatch): ActiveMatch {
  if (m.runtimeState?.kind !== 'basketball' || m.settings.kind !== 'basketball') return m;
  const before = m.runtimeState.score;
  const nextDuration = basketballPeriodDuration(m.settings.rules, before.currentPeriod + 1);
  const score = closePeriod(before, before.playerPoints, before.opponentPoints, nextDuration);
  return {
    ...m,
    basketballUndoStack: pushUndo(m.basketballUndoStack, before),
    runtimeState: { kind: 'basketball', score },
    ...mirrorClocked(score.playerPoints, score.opponentPoints, score.periodScores),
  };
}

/* ---------- football / floorball ---------- */

export interface RecordGoalOptions {
  /** Epoch ms, so the goal's minute is derived rather than read from the ambient clock. */
  now: number;
  /** Stable id for the goal. Injected so callers control determinism. */
  id: string;
}

export function recordFootballGoal(m: ActiveMatch, side: Side, o: RecordGoalOptions): ActiveMatch {
  if (m.runtimeState?.kind !== 'football' || m.settings.kind !== 'football') return m;
  const before = m.runtimeState.score;
  const duration = footballPeriodDuration(m.settings.rules, before.currentPeriod);
  const remaining = before.isClockRunning && before.clockStartedAt !== null
    ? Math.max(0, before.timeRemaining - (o.now - before.clockStartedAt) / 1000)
    : before.timeRemaining;
  const goal: GoalEvent = {
    id: o.id, side, period: before.currentPeriod,
    // Elapsed into the period, derived from the countdown. 0 if never started.
    elapsedInPeriod: Math.max(0, duration - remaining),
  };
  const score: FootballScore = {
    ...before,
    playerGoals: side === 'player' ? before.playerGoals + 1 : before.playerGoals,
    opponentGoals: side === 'opponent' ? before.opponentGoals + 1 : before.opponentGoals,
    goals: [...before.goals, goal],
  };
  return {
    ...m,
    footballUndoStack: pushUndo(m.footballUndoStack, before),
    runtimeState: { kind: 'football', score },
    ...mirrorClocked(score.playerGoals, score.opponentGoals, score.periodScores),
  };
}

export function undoFootballGoal(m: ActiveMatch): ActiveMatch {
  const prev = m.footballUndoStack.at(-1);
  if (!prev) return m;
  return {
    ...m,
    footballUndoStack: m.footballUndoStack.slice(0, -1),
    runtimeState: { kind: 'football', score: prev },
    ...mirrorClocked(prev.playerGoals, prev.opponentGoals, prev.periodScores),
    isMatchComplete: false, isScoringLocked: false,
  };
}

export function footballAdvancePeriod(m: ActiveMatch): ActiveMatch {
  if (m.runtimeState?.kind !== 'football' || m.settings.kind !== 'football') return m;
  const before = m.runtimeState.score;
  const nextDuration = footballPeriodDuration(m.settings.rules, before.currentPeriod + 1);
  const score = closePeriod(before, before.playerGoals, before.opponentGoals, nextDuration);
  return {
    ...m,
    footballUndoStack: pushUndo(m.footballUndoStack, before),
    runtimeState: { kind: 'football', score },
    ...mirrorClocked(score.playerGoals, score.opponentGoals, score.periodScores),
  };
}

/* ---------- the shared clock controls ---------- */

export function toggleMatchClock(m: ActiveMatch, now: number): ActiveMatch {
  if (m.runtimeState?.kind === 'basketball') {
    return { ...m, runtimeState: { kind: 'basketball', score: toggleClock(m.runtimeState.score, now) } };
  }
  if (m.runtimeState?.kind === 'football') {
    return { ...m, runtimeState: { kind: 'football', score: toggleClock(m.runtimeState.score, now) } };
  }
  return m;
}

/** Returns the match plus whether this call was the transition to zero. */
export function expireMatchClock(m: ActiveMatch, now: number): { match: ActiveMatch; expired: boolean } {
  if (m.runtimeState?.kind === 'basketball') {
    const { clock, expired } = expireClockIfNeeded(m.runtimeState.score, now);
    return { match: { ...m, runtimeState: { kind: 'basketball', score: clock } }, expired };
  }
  if (m.runtimeState?.kind === 'football') {
    const { clock, expired } = expireClockIfNeeded(m.runtimeState.score, now);
    return { match: { ...m, runtimeState: { kind: 'football', score: clock } }, expired };
  }
  return { match: m, expired: false };
}

/** Manual clock correction, capped at the current period's full duration. */
export function setMatchClock(m: ActiveMatch, remaining: number, now: number): ActiveMatch {
  if (m.runtimeState?.kind === 'basketball' && m.settings.kind === 'basketball') {
    const cap = basketballPeriodDuration(m.settings.rules, m.runtimeState.score.currentPeriod);
    return { ...m, runtimeState: { kind: 'basketball', score: setClock(m.runtimeState.score, remaining, cap, now) } };
  }
  if (m.runtimeState?.kind === 'football' && m.settings.kind === 'football') {
    const cap = footballPeriodDuration(m.settings.rules, m.runtimeState.score.currentPeriod);
    return { ...m, runtimeState: { kind: 'football', score: setClock(m.runtimeState.score, remaining, cap, now) } };
  }
  return m;
}

/* ---------- golf / disc golf ---------- */

export function recordGolfStroke(
  m: ActiveMatch, playerIndex: number, hole: number, value: number,
): ActiveMatch {
  if (m.runtimeState?.kind !== 'golf' || m.settings.kind !== 'golf') return m;
  const before = m.runtimeState.score;
  // Narrowed into a local because TypeScript drops union narrowing inside the
  // callback below.
  const holeCount = m.settings.rules.holeCount;
  if (playerIndex < 0 || playerIndex >= before.playerStrokes.length) return m;
  const holeIdx = hole - 1;
  if (holeIdx < 0 || holeIdx >= holeCount) return m;

  const playerStrokes = before.playerStrokes.map((row, i) => {
    // Keep every row exactly holeCount long — the rules' hole count can change
    // between a rematch and its source, and a short row silently drops strokes.
    const padded: (number | null)[] = [...row];
    while (padded.length < holeCount) padded.push(null);
    if (i === playerIndex) padded[holeIdx] = value > 0 ? value : null;
    return padded.slice(0, holeCount);
  });
  const score: GolfScore = { ...before, playerStrokes };
  return {
    ...m,
    golfUndoStack: pushUndo(m.golfUndoStack, before),
    runtimeState: { kind: 'golf', score },
    // Mirror: current-hole strokes as the flat score, running total as "games" —
    // the same slots the spectate payload reads for golf.
    playerScore: score.playerStrokes[0]?.[holeIdx] ?? 0,
    playerGames: score.playerStrokes[0]?.reduce<number>((a, v) => a + (v ?? 0), 0) ?? 0,
    opponentScore: 0, opponentGames: 0,
  };
}

export function undoGolfStroke(m: ActiveMatch): ActiveMatch {
  const prev = m.golfUndoStack.at(-1);
  if (!prev) return m;
  const holeIdx = prev.currentHole - 1;
  return {
    ...m,
    golfUndoStack: m.golfUndoStack.slice(0, -1),
    runtimeState: { kind: 'golf', score: prev },
    playerScore: prev.playerStrokes[0]?.[holeIdx] ?? 0,
    playerGames: prev.playerStrokes[0]?.reduce<number>((a, v) => a + (v ?? 0), 0) ?? 0,
    isMatchComplete: false, isScoringLocked: false,
  };
}

export function golfSetHole(m: ActiveMatch, hole: number): ActiveMatch {
  if (m.runtimeState?.kind !== 'golf' || m.settings.kind !== 'golf') return m;
  const clamped = Math.min(Math.max(1, hole), m.settings.rules.holeCount);
  return { ...m, runtimeState: { kind: 'golf', score: { ...m.runtimeState.score, currentHole: clamped } } };
}

/* ---------- ending ---------- */

/** Whether anything at all was scored — an untouched match is not worth saving. */
export function hasAnyScore(m: ActiveMatch): boolean {
  if (m.runtimeState?.kind === 'golf') {
    return m.runtimeState.score.playerStrokes.some((row) => row.some((v) => v !== null));
  }
  return m.playerScore > 0 || m.opponentScore > 0 || m.playerGames > 0
      || m.opponentGames > 0 || m.gameScores.length > 0;
}
