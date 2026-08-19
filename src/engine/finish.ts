/* ============================================================
   Finishing a match — the web's `makeFinishedMatch`.

   Port of Shared/ActiveMatchData+Finish.swift, and like it the ONE
   place a running match turns into a saved record. Everything that
   saves goes through here, so the sport tagging can't drift between
   callers.

   The record it produces IS the app's `Match` JSON, field for field.
   That is deliberate: storing anything else would mean a conversion
   layer at export time, and a conversion layer is a place for the two
   formats to disagree quietly. Export becomes a straight dump instead.

   ⚠️ The sport tag on `score` is load-bearing. The app reads an
   untagged record back as badminton via `effectiveScore`, so a golf
   round that forgets its tag silently becomes a badminton match.
   ============================================================ */

import type { ActiveMatch, MatchSettings } from './active';
import { validatedGamePointLog } from './active';
import { isGolfLike, usesRallyEngine, usesTennisEngine, type GameScore, type Sport } from './types';

/** One finished match, in the app's persisted shape. */
export interface SavedMatch {
  id: string;
  /** ISO-8601, as the app's JSONDecoder expects. */
  date: string;
  playerGames: number;
  opponentGames: number;
  gameScores: GameScore[];
  /** Seconds. */
  duration: number;
  calories: number;
  averageHeartRate: number;
  settings: unknown;
  matchType: string;
  sport: Sport;
  score: unknown;
  side1Name?: string;
  side2Name?: string;
  note?: string;
  /**
   * Deliberately absent, not empty.
   *
   * The app resolves these UUIDs against its own roster, which the web has no
   * share of; inventing ids would import as a history of matches between
   * "Unknown" and "Unknown". `side1Name` / `side2Name` are display overrides that
   * win over the roster lookup, so the names carry across intact. The trade is
   * written down in docs/LIVE-SPECTATE.md: web matches don't feed the app's
   * per-player stats.
   */
  playerSide?: undefined;
  opponentSide?: undefined;
}

/** The per-sport key the app's sum types use — `{ sport, <key>: payload }`. */
function sportKey(sport: Sport): string {
  return sport;
}

/** Wraps a payload the way the app's hand-written Codable does. */
function tagged(sport: Sport, payload: unknown): Record<string, unknown> {
  return { sport, [sportKey(sport)]: payload };
}

export interface FinishOptions {
  /** Epoch ms. Injected so a save is deterministic in tests. */
  now: number;
  /** UUID for the record. Injected for the same reason. */
  id: string;
}

/**
 * Converts a running match into a saved record.
 *
 * Returns null when nothing was scored — an untouched match is not history, and
 * the app's own finish path drops those too.
 */
export function finishMatch(match: ActiveMatch, o: FinishOptions): SavedMatch | null {
  const base: SavedMatch = {
    id: o.id,
    date: new Date(o.now).toISOString(),
    playerGames: match.playerGames,
    opponentGames: match.opponentGames,
    gameScores: [...match.gameScores],
    duration: Math.max(0, Math.round((o.now - match.startTime) / 1000)),
    // The web has no HealthKit. Zero rather than absent, mirroring what the app
    // saves for a match recorded without a Watch.
    calories: 0,
    averageHeartRate: 0,
    settings: settingsPayload(match.sport, match.settings),
    matchType: match.matchType,
    sport: match.sport,
    score: null,
    side1Name: match.side1Name?.trim() || undefined,
    side2Name: match.side2Name?.trim() || undefined,
  };

  if (usesRallyEngine(match.sport) && match.settings.kind === 'rally') {
    // Fold the game in progress into the record, with its log if it adds up —
    // an abandoned match keeps the partial game rather than losing it.
    const games = [...match.gameScores];
    if (match.playerScore > 0 || match.opponentScore > 0) {
      games.push({
        player: match.playerScore,
        opponent: match.opponentScore,
        pointSequence: validatedGamePointLog(match),
      });
    }
    if (games.length === 0) return null;
    base.gameScores = games;
    base.score = tagged(match.sport, {
      playerGames: match.playerGames,
      opponentGames: match.opponentGames,
      gameScores: games,
    });
    return base;
  }

  if (usesTennisEngine(match.sport) && match.runtimeState?.kind === 'tennis') {
    const s = match.runtimeState.score;
    if (s.playerSets === 0 && s.opponentSets === 0
        && s.currentGames.player === 0 && s.currentGames.opponent === 0) return null;
    base.score = tagged(match.sport, s);
    return base;
  }

  if (match.sport === 'pickleball' && match.runtimeState?.kind === 'pickleball') {
    const s = match.runtimeState.score;
    if (s.playerPoints === 0 && s.opponentPoints === 0
        && s.playerGames === 0 && s.opponentGames === 0) return null;
    base.score = tagged(match.sport, s);
    return base;
  }

  if (match.sport === 'basketball' && match.runtimeState?.kind === 'basketball') {
    const s = match.runtimeState.score;
    if (s.playerPoints === 0 && s.opponentPoints === 0) return null;
    base.score = tagged(match.sport, s);
    return base;
  }

  if (match.runtimeState?.kind === 'football') {
    const s = match.runtimeState.score;
    if (s.playerGoals === 0 && s.opponentGoals === 0) return null;
    base.score = tagged(match.sport, s);
    return base;
  }

  if (isGolfLike(match.sport) && match.runtimeState?.kind === 'golf') {
    const s = match.runtimeState.score;
    if (!s.playerStrokes.some((row) => row.some((v) => v !== null))) return null;
    base.score = tagged(match.sport, s);
    return base;
  }

  return null;
}

/** The rules payload, tagged the same way the score is. */
function settingsPayload(sport: Sport, settings: MatchSettings): unknown {
  return tagged(sport, settings.rules);
}
