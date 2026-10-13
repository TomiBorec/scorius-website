/* Behaviour the app changed in builds 408 / 413 that the Swift fixtures
   don't happen to exercise: skipped golf holes, the rally-mode pickleball
   opener and closing a led overtime. */

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { golfDefault, playedPar, type GolfScore } from './golf';
import { newPickleballScore, pickleballDefault, pickleballRallyWon } from './pickleball';
import { basketballDefault, canAdvanceBasketballPeriod, newBasketballScore } from './basketball';
import { normaliseCode } from '../lib/spectate';

test('golf: a skipped hole adds neither strokes nor par', () => {
  const rules = { ...golfDefault, holeCount: 3, pars: [4, 3, 5] };
  const score = { playerStrokes: [[4, null, 5]], currentHole: 3 } as GolfScore;
  assert.equal(playedPar(rules, score), 9);
});

test('pickleball rally mode: the opening serve alternates game by game', () => {
  const rules = { ...pickleballDefault, scoringMode: 'rally' as const };
  const s = { ...newPickleballScore(false), playerPoints: 10, servingSide: 'player' as const };
  const after = pickleballRallyWon(rules, 'player', s);
  assert.equal(after.playerGames, 1);
  assert.equal(after.servingSide, 'opponent');
});

test('basketball: an overtime one side leads can be closed', () => {
  const s = {
    ...newBasketballScore(basketballDefault),
    periodScores: Array.from({ length: 4 }, () => ({ player: 20, opponent: 20 })),
    playerPoints: 85, opponentPoints: 82,
  };
  assert.equal(canAdvanceBasketballPeriod(basketballDefault, s), true);
});

test('spectate: a query or fragment never hides the code', () => {
  assert.equal(normaliseCode('https://scorius.app/w/4KTM9P?utm_source=x'), '4KTM9P');
  assert.equal(normaliseCode('scorius.app/w/4ktm9p#live'), '4KTM9P');
  assert.equal(normaliseCode('https://scorius.app/w/?x=4KTM9P'), null);
});
