/* ============================================================
   Invariants of the in-progress match state machine.

   These are NOT Swift-pinned the way engine.fixtures.test.ts is — there
   is no exported fixture for ActiveMatchData yet, so these assert the
   properties the port is supposed to hold rather than byte-agreement
   with the app. The engines underneath them are pinned; this layer's
   pinning is listed as follow-up work in docs/LIVE-SPECTATE.md.

   What they do cover is the class of bug that layer can produce: an undo
   that doesn't fully restore, a flat-field mirror that drifts from the
   runtime state on one path but not another, and a point log that
   silently disagrees with the score it would be saved beside.
   ============================================================ */

import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  MAX_UNDO_ENTRIES, basketballAdvancePeriod, finishRallyGame, hasAnyScore,
  recordBasketballPoints, recordFootballGoal, recordGolfStroke, recordPickleballRally,
  adjustGolfStroke, recordRallyPoint, recordTennisPoint, startMatch, toggleMatchClock,
  toggleRallyFirstServer, undoBasketballPoints, undoGolfStroke, undoPickleballRally,
  undoRallyPoint, undoTennisPoint, validatedGamePointLog,
  type ActiveMatch,
} from './active';
import { badmintonDefault, volleyballDefault, tableTennisDefault } from './rally';
import { tennisDefault } from './tennis';
import { pickleballDefault } from './pickleball';
import { basketballDefault } from './basketball';
import { footballDefault } from './football';
import { golfDefault } from './golf';
import type { Side } from './types';

const NOW = 1_700_000_000_000;

function rallyMatch(sport: 'badminton' | 'volleyball' | 'tableTennis' = 'badminton') {
  const rules = sport === 'volleyball' ? volleyballDefault
              : sport === 'tableTennis' ? tableTennisDefault : badmintonDefault;
  return startMatch({ sport, settings: { kind: 'rally', rules }, now: NOW });
}

test('rally: a point increments the score, logs the rally and moves the serve', () => {
  let m = rallyMatch();
  assert.equal(m.rallyCurrentServer, 'player');
  m = recordRallyPoint(m, 'opponent');
  assert.equal(m.playerScore, 0);
  assert.equal(m.opponentScore, 1);
  assert.deepEqual(m.currentGamePointLog, ['opponent']);
  assert.equal(m.rallyCurrentServer, 'opponent', 'the rally winner serves next');
});

test('rally: undo restores every field, including serve and the log', () => {
  let m = rallyMatch();
  for (const side of ['player', 'player', 'opponent'] as Side[]) m = recordRallyPoint(m, side);
  const before = structuredClone(m);
  m = recordRallyPoint(m, 'opponent');
  assert.notDeepEqual(m.currentGamePointLog, before.currentGamePointLog);
  m = undoRallyPoint(m);
  // Undo must restore the state, not merely the score. The undo stack itself
  // legitimately differs (the entry was consumed), so compare everything else.
  const { rallyUndoStack: _a, ...restored } = m;
  const { rallyUndoStack: _b, ...expected } = before;
  assert.deepEqual(restored, expected);
});

test('rally: the point log is only handed over when it adds up', () => {
  let m = rallyMatch();
  for (let i = 0; i < 5; i++) m = recordRallyPoint(m, 'player');
  assert.deepEqual(validatedGamePointLog(m)?.length, 5);
  // A score written without going through the recorder — what the scoreboard
  // paths do — must invalidate the log rather than produce a wrong chart.
  const tampered: ActiveMatch = { ...m, playerScore: 9 };
  assert.equal(validatedGamePointLog(tampered), undefined);
});

test('rally: badminton hands the next game to the winner, volleyball alternates', () => {
  let bad = rallyMatch('badminton');
  for (let i = 0; i < 21; i++) bad = recordRallyPoint(bad, 'opponent');
  bad = finishRallyGame(bad);
  assert.equal(bad.opponentGames, 1);
  assert.equal(bad.rallyGameFirstServer, 'opponent', 'badminton: winner opens');
  assert.equal(bad.playerScore, 0, 'scores reset for the next game');
  assert.deepEqual(bad.gameScores[0].pointSequence?.length, 21, 'the closed game keeps its log');

  let vol = rallyMatch('volleyball');
  for (let i = 0; i < 25; i++) vol = recordRallyPoint(vol, 'opponent');
  vol = finishRallyGame(vol);
  assert.equal(vol.rallyGameFirstServer, 'opponent',
    'volleyball alternates from player, which lands on opponent for game 2');
});

test('rally: closing the last game completes and locks the match', () => {
  let m = rallyMatch();
  for (let g = 0; g < 2; g++) {
    for (let i = 0; i < 21; i++) m = recordRallyPoint(m, 'player');
    m = finishRallyGame(m);
  }
  assert.equal(m.playerGames, 2);
  assert.ok(m.isMatchComplete);
  assert.ok(m.isScoringLocked);
});

test('rally: table tennis derives the serve rather than handing it to the winner', () => {
  let m = rallyMatch('tableTennis');
  // Two points to the same side: a derived serve changes after the pair, a
  // winner-takes-serve rule would have stayed put.
  m = recordRallyPoint(m, 'player');
  assert.equal(m.rallyCurrentServer, 'player', '1-0 is still the first server');
  m = recordRallyPoint(m, 'player');
  assert.equal(m.rallyCurrentServer, 'opponent', '2-0 flips on the pair boundary');
});

test('rally: flipping the first server flips all three serve fields', () => {
  const m = toggleRallyFirstServer(rallyMatch());
  assert.equal(m.rallyFirstServer, 'opponent');
  assert.equal(m.rallyGameFirstServer, 'opponent');
  assert.equal(m.rallyCurrentServer, 'opponent');
});

test('tennis: the flat mirror tracks games-in-set and sets', () => {
  let m = startMatch({ sport: 'tennis', settings: { kind: 'tennis', rules: tennisDefault }, now: NOW });
  for (let i = 0; i < 4; i++) m = recordTennisPoint(m, 'player');   // one game
  assert.equal(m.playerScore, 1, 'a won game shows as 1 in the flat score');
  assert.equal(m.playerGames, 0, 'sets are still 0');
  const before = structuredClone(m);
  m = recordTennisPoint(m, 'opponent');
  m = undoTennisPoint(m);
  assert.deepEqual(m.runtimeState, before.runtimeState);
  assert.equal(m.playerScore, before.playerScore);
});

test('pickleball: a doubles game opens on server 2 and undo restores serve state', () => {
  let m = startMatch({
    sport: 'pickleball', matchType: 'doubles',
    settings: { kind: 'pickleball', rules: pickleballDefault }, now: NOW,
  });
  assert.equal(m.runtimeState?.kind, 'pickleball');
  if (m.runtimeState?.kind !== 'pickleball') return;
  assert.equal(m.runtimeState.score.serverNumber, 2, 'first-server exception');

  const before = structuredClone(m);
  m = recordPickleballRally(m, 'opponent');   // receiving side wins → side out
  if (m.runtimeState?.kind !== 'pickleball') return;
  assert.equal(m.runtimeState.score.servingSide, 'opponent');
  assert.equal(m.runtimeState.score.serverNumber, 1);
  m = undoPickleballRally(m);
  assert.deepEqual(m.runtimeState, before.runtimeState);
});

test('clocked: the mirror splits current-period from running total across an advance', () => {
  let m = startMatch({ sport: 'basketball', settings: { kind: 'basketball', rules: basketballDefault }, now: NOW });
  m = recordBasketballPoints(m, 'player', 3);
  m = recordBasketballPoints(m, 'opponent', 2);
  assert.equal(m.playerScore, 3, 'current period');
  assert.equal(m.playerGames, 3, 'running total');

  m = basketballAdvancePeriod(m);
  assert.equal(m.playerScore, 0, 'new period starts at nothing');
  assert.equal(m.playerGames, 3, 'the running total survives the period');
  m = recordBasketballPoints(m, 'player', 2);
  assert.equal(m.playerScore, 2);
  assert.equal(m.playerGames, 5);

  const before = structuredClone(m);
  m = recordBasketballPoints(m, 'player', 3);
  m = undoBasketballPoints(m);
  assert.equal(m.playerScore, before.playerScore);
  assert.equal(m.playerGames, before.playerGames);
});

test('football: a goal records the minute it fell from the running clock', () => {
  let m = startMatch({ sport: 'football', settings: { kind: 'football', rules: footballDefault }, now: NOW });
  m = toggleMatchClock(m, NOW);
  // Ten minutes later.
  m = recordFootballGoal(m, 'player', { now: NOW + 10 * 60 * 1000, id: 'g1' });
  if (m.runtimeState?.kind !== 'football') return assert.fail('expected football state');
  const goal = m.runtimeState.score.goals[0];
  assert.equal(goal.side, 'player');
  assert.equal(goal.period, 1);
  assert.equal(Math.round(goal.elapsedInPeriod), 600, 'ten minutes into the half');
  assert.equal(m.playerGames, 1);
});

test('football: a goal with the clock never started reads as 0 elapsed', () => {
  let m = startMatch({ sport: 'football', settings: { kind: 'football', rules: footballDefault }, now: NOW });
  m = recordFootballGoal(m, 'opponent', { now: NOW + 5000, id: 'g1' });
  if (m.runtimeState?.kind !== 'football') return assert.fail('expected football state');
  assert.equal(m.runtimeState.score.goals[0].elapsedInPeriod, 0);
});

test('golf: a stroke mirrors current hole and total, and undo restores', () => {
  let m = startMatch({
    sport: 'golf', settings: { kind: 'golf', rules: golfDefault }, playerCount: 2, now: NOW,
  });
  assert.equal(hasAnyScore(m), false, 'an untouched card is not worth saving');
  m = recordGolfStroke(m, 0, 1, 5);
  assert.equal(m.playerScore, 5, 'strokes on this hole');
  assert.equal(m.playerGames, 5, 'running total');
  assert.equal(hasAnyScore(m), true);

  const before = structuredClone(m);
  m = recordGolfStroke(m, 0, 1, 7);
  assert.equal(m.playerGames, 7);
  m = undoGolfStroke(m);
  assert.deepEqual(m.runtimeState, before.runtimeState);
  assert.equal(m.playerGames, before.playerGames);
});

test('golf: a stroke outside the round is rejected rather than growing the card', () => {
  let m = startMatch({ sport: 'golf', settings: { kind: 'golf', rules: golfDefault }, now: NOW });
  const untouched = structuredClone(m);
  m = recordGolfStroke(m, 0, 19, 4);      // beyond 18 holes
  assert.deepEqual(m, untouched);
  m = recordGolfStroke(m, 3, 1, 4);       // slot outside a 1-player flight
  assert.deepEqual(m, untouched);
});

test('golf strokes accumulate one tap at a time', () => {
  let m = startMatch({
    sport: 'golf', settings: { kind: 'golf', rules: golfDefault }, playerCount: 2, now: NOW,
  });
  // Five taps must be five strokes. Computing the next value from a rendered
  // number instead of from state made all five land on 1 — the same stale-snapshot
  // trap the tap handlers hit, caught here so a delta mutator stays the contract.
  for (let i = 0; i < 5; i++) m = adjustGolfStroke(m, 0, 1, +1);
  for (let i = 0; i < 3; i++) m = adjustGolfStroke(m, 1, 1, +1);
  if (m.runtimeState?.kind !== 'golf') return assert.fail('expected golf state');
  assert.equal(m.runtimeState.score.playerStrokes[0][0], 5);
  assert.equal(m.runtimeState.score.playerStrokes[1][0], 3);

  // And it can't go below zero, however many times you tap minus.
  for (let i = 0; i < 9; i++) m = adjustGolfStroke(m, 1, 1, -1);
  if (m.runtimeState?.kind !== 'golf') return assert.fail('expected golf state');
  assert.equal(m.runtimeState.score.playerStrokes[1][0], null,
    'zero strokes clears the hole rather than recording a 0');
});

test('undo stacks are capped', () => {
  let m = rallyMatch();
  for (let i = 0; i < MAX_UNDO_ENTRIES + 20; i++) m = recordRallyPoint(m, 'player');
  assert.equal(m.rallyUndoStack.length, MAX_UNDO_ENTRIES);
  // The cap trims the oldest, so the newest undo must still be exact.
  const score = m.playerScore;
  m = undoRallyPoint(m);
  assert.equal(m.playerScore, score - 1);
});
