/* ============================================================
   Replays the fixtures generated from the Swift engines.

   This file is the whole reason the TypeScript port can be trusted. It
   asserts nothing about what the rules *ought* to be — only that this
   implementation answers exactly what the shipped iOS engines answer.
   Hand-written expectations would pin the author's understanding; these
   pin the app.

   Regenerate the fixture with BB3Tests/EngineFixtureExport.swift (see its
   header) whenever an engine changes on either side.

     node --test src/engine/engine.fixtures.test.ts
   ============================================================ */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { canEndGame, isGameEndingPoint, isMatchEndingPoint, isRallyMatchComplete,
         tableTennisServer, targetPoints, type RallyRules } from './rally';
import { advantageSide, isTennisMatchComplete, isTennisMatchPoint, newTennisScore,
         pointDisplay, servingSide, tennisPointScored,
         type TennisRules, type TennisScore } from './tennis';
import { isPickleballGamePoint, isPickleballMatchPoint, newPickleballScore,
         pickleballRallyWon, scoreCall, type PickleballRules } from './pickleball';
import { basketballPeriodDuration, canAdvanceBasketballPeriod, isBasketballMatchComplete,
         newBasketballScore, type BasketballRules } from './basketball';
import { canAdvanceFootballPeriod, footballPeriodDuration, isExtraTime,
         isFootballMatchComplete, matchMinute, newFootballScore,
         type FootballRules } from './football';
import { allHolesLogged, canAdvanceHole, canRetreatHole, isGolfMatchComplete,
         matchPlayDecided, matchPlayStatusText, ownerHolesPlayed, ownerTotalStrokes,
         playedPar, stablefordTotal, toParText, totalPar,
         type GolfRules, type GolfScore } from './golf';
import { gameScore, type Side } from './types';

const fixtures = JSON.parse(
  readFileSync(new URL('./__fixtures__/engine-fixtures.json', import.meta.url), 'utf8'),
) as Record<string, any>;

/** Fails loudly if a section is missing: an empty section would pass silently. */
function section(name: string): any[] {
  const list = fixtures[name];
  assert.ok(Array.isArray(list) && list.length > 0, `fixture section '${name}' missing or empty`);
  return list;
}

test('rally engine matches Swift', () => {
  let checked = 0;
  for (const c of section('rally')) {
    if (c.preset === 'tableTennisServe') {
      const got = tableTennisServer(
        c.gameFirstServer as Side, c.playerScore, c.opponentScore, c.target);
      assert.equal(got, c.expect.server,
        `serve: target=${c.target} first=${c.gameFirstServer} ${c.playerScore}-${c.opponentScore}`);
      checked++;
      continue;
    }
    const rules = c.rules as RallyRules;
    const where = `${c.preset} ${c.playerScore}-${c.opponentScore} games ${c.playerGames}-${c.opponentGames}`;
    assert.equal(targetPoints(rules, c.playerGames, c.opponentGames), c.expect.targetPoints, `targetPoints ${where}`);
    assert.equal(canEndGame(rules, c.playerScore, c.opponentScore, c.playerGames, c.opponentGames),
                 c.expect.canEndGame, `canEndGame ${where}`);
    assert.equal(isGameEndingPoint(rules, c.playerScore, c.opponentScore, c.playerGames, c.opponentGames),
                 c.expect.isGameEndingPoint, `isGameEndingPoint ${where}`);
    assert.equal(isMatchEndingPoint(rules, c.playerScore, c.opponentScore, c.playerGames, c.opponentGames),
                 c.expect.isMatchEndingPoint, `isMatchEndingPoint ${where}`);
    assert.equal(isRallyMatchComplete(rules, c.playerGames, c.opponentGames),
                 c.expect.isMatchComplete, `isMatchComplete ${where}`);
    checked++;
  }
  assert.ok(checked > 1000, `only ${checked} rally cases replayed`);
});

test('tennis engine matches Swift point by point', () => {
  let steps = 0;
  for (const c of section('tennis')) {
    const rules = c.rules as TennisRules;
    let score: TennisScore = newTennisScore('player');
    for (const [i, step] of (c.steps as any[]).entries()) {
      const where = `${c.preset}/${c.seed} step ${i}`;
      assert.equal(isTennisMatchPoint(rules, score), step.matchPointBefore, `matchPoint ${where}`);
      score = tennisPointScored(rules, step.side as Side, score);
      assert.deepEqual(normalise(score), normalise(step.state), `state ${where}`);
      assert.equal(servingSide(score), step.servingSide, `servingSide ${where}`);
      assert.equal(pointDisplay(score, 'player'), step.playerPointDisplay, `playerPoint ${where}`);
      assert.equal(pointDisplay(score, 'opponent'), step.opponentPointDisplay, `opponentPoint ${where}`);
      assert.equal(advantageSide(score), step.advantageSide, `advantage ${where}`);
      steps++;
    }
    assert.equal(isTennisMatchComplete(rules, score), c.finalComplete, `final ${c.preset}/${c.seed}`);
  }
  assert.ok(steps > 500, `only ${steps} tennis points replayed`);
});

test('pickleball engine matches Swift rally by rally', () => {
  let steps = 0;
  for (const c of section('pickleball')) {
    const rules = c.rules as PickleballRules;
    let score = newPickleballScore(c.doubles);
    for (const [i, step] of (c.steps as any[]).entries()) {
      const where = `${c.preset}/${c.doubles ? 'doubles' : 'singles'}/${c.seed} step ${i}`;
      assert.equal(isPickleballGamePoint(rules, score), step.gamePointBefore, `gamePoint ${where}`);
      assert.equal(isPickleballMatchPoint(rules, score), step.matchPointBefore, `matchPoint ${where}`);
      score = pickleballRallyWon(rules, step.side as Side, score);
      assert.deepEqual(normalise(score), normalise(step.state), `state ${where}`);
      assert.equal(scoreCall(score), step.scoreCall, `scoreCall ${where}`);
      steps++;
    }
  }
  assert.ok(steps > 300, `only ${steps} pickleball rallies replayed`);
});

test('basketball period gating matches Swift', () => {
  for (const c of section('basketball')) {
    const rules = c.rules as BasketballRules;
    const score = {
      ...newBasketballScore(rules),
      playerPoints: c.playerPoints,
      opponentPoints: c.opponentPoints,
      periodScores: Array.from({ length: c.periodsPlayed }, () => gameScore(0, 0)),
      currentPeriod: c.periodsPlayed + 1,
    };
    const where = `${c.preset} ${c.playerPoints}-${c.opponentPoints} after ${c.periodsPlayed}`;
    assert.equal(canAdvanceBasketballPeriod(rules, score), c.expect.canAdvancePeriod, `advance ${where}`);
    assert.equal(isBasketballMatchComplete(rules, score), c.expect.isMatchComplete, `complete ${where}`);
    assert.equal(basketballPeriodDuration(rules, c.periodsPlayed + 1),
                 c.expect.durationForNextPeriod, `duration ${where}`);
  }
});

test('football period gating and match minute match Swift', () => {
  for (const c of section('football')) {
    const rules = c.rules as FootballRules;
    if (String(c.preset).endsWith('/minute')) {
      assert.equal(
        matchMinute(rules, { id: 'x', side: 'player', period: c.goalPeriod, elapsedInPeriod: c.goalElapsed }),
        c.expect.matchMinute,
        `minute ${c.preset} p${c.goalPeriod} +${c.goalElapsed}`);
      continue;
    }
    const score = {
      ...newFootballScore(rules),
      playerGoals: c.playerGoals,
      opponentGoals: c.opponentGoals,
      periodScores: Array.from({ length: c.periodsPlayed }, () => gameScore(0, 0)),
      currentPeriod: c.periodsPlayed + 1,
    };
    const where = `${c.preset} ${c.playerGoals}-${c.opponentGoals} after ${c.periodsPlayed}`;
    assert.equal(canAdvanceFootballPeriod(rules, score), c.expect.canAdvancePeriod, `advance ${where}`);
    assert.equal(isFootballMatchComplete(rules, score), c.expect.isMatchComplete, `complete ${where}`);
    assert.equal(isExtraTime(rules, score), c.expect.isExtraTime, `extraTime ${where}`);
    assert.equal(footballPeriodDuration(rules, c.periodsPlayed + 1),
                 c.expect.durationForNextPeriod, `duration ${where}`);
  }
});

test('golf engine matches Swift hole by hole', () => {
  let steps = 0;
  for (const c of section('golf')) {
    if (c.preset === 'toParText') {
      assert.equal(toParText(c.value), c.expect.text, `toParText ${c.value}`);
      continue;
    }
    const rules = c.rules as GolfRules;
    assert.equal(totalPar(rules), c.totalPar, `totalPar ${c.preset}`);
    for (const step of c.steps as any[]) {
      const score: GolfScore = { playerStrokes: step.strokes, currentHole: step.hole };
      const where = `${c.preset}/flight${c.flight}/${c.seed} hole ${step.hole}`;
      assert.equal(isGolfMatchComplete(rules, score), step.expect.isMatchComplete, `complete ${where}`);
      assert.equal(allHolesLogged(rules, score), step.expect.allHolesLogged, `allLogged ${where}`);
      assert.equal(canAdvanceHole(rules, score), step.expect.canAdvanceHole, `advance ${where}`);
      assert.equal(canRetreatHole(score), step.expect.canRetreatHole, `retreat ${where}`);
      assert.equal(ownerTotalStrokes(score), step.expect.ownerTotalStrokes, `total ${where}`);
      assert.equal(ownerHolesPlayed(score), step.expect.ownerHolesPlayed, `played ${where}`);
      assert.equal(playedPar(rules, ownerHolesPlayed(score)), step.expect.playedPar, `playedPar ${where}`);
      assert.equal(stablefordTotal(rules, score, 0), step.expect.stablefordTotal, `stableford ${where}`);
      assert.equal(matchPlayStatusText(rules, score), step.expect.matchPlayStatusText, `matchPlay ${where}`);
      assert.equal(matchPlayDecided(rules, score), step.expect.matchPlayDecided, `decided ${where}`);
      steps++;
    }
  }
  assert.ok(steps > 200, `only ${steps} golf holes replayed`);
});

/**
 * Drops keys that are absent on one side rather than the other.
 *
 * Swift omits nil Optionals from its JSON; TypeScript carries them as
 * `undefined`. `deepEqual` treats a missing key and an explicit `undefined` as
 * different, which would fail on a difference that does not exist. Anything with
 * a real value is compared normally.
 */
function normalise(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalise);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      if (v === undefined || v === null) continue;
      out[k] = normalise(v);
    }
    return out;
  }
  return value;
}
