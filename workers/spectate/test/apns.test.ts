// Pure parts of the Live Activity push (src/apns.ts). Run from the repo root:
//   node --import tsx --test workers/spectate/test/apns.test.ts
// Outside src/ on purpose: the Worker's tsconfig types src/ against
// workers-types only, and these use node:test.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  base64url,
  buildPushBody,
  contentStateForPush,
  importP8,
  parsePushTarget,
  type PushTarget,
} from '../src/apns';

const target: PushTarget = { token: 'ab'.repeat(40), environment: 'production' };

test('parses a push registration from the stream headers', () => {
  const t = parsePushTarget(
    new Headers({
      'x-scorius-push-token': 'AB'.repeat(40),
      'x-scorius-push-env': 'sandbox',
      'x-scorius-fallback-1': encodeURIComponent('Hráč 1'),
      'x-scorius-fallback-2': encodeURIComponent('Hráč 2'),
    }),
  );
  assert.deepEqual(t, {
    token: 'ab'.repeat(40),
    environment: 'sandbox',
    fallback1: 'Hráč 1',
    fallback2: 'Hráč 2',
  });
});

test('no token, or a malformed one, registers nothing', () => {
  assert.equal(parsePushTarget(new Headers()), null);
  assert.equal(parsePushTarget(new Headers({ 'x-scorius-push-token': 'not-hex' })), null);
  assert.equal(parsePushTarget(new Headers({ 'x-scorius-push-token': 'abcd' })), null);
});

test('anything but "sandbox" is production; broken names are dropped', () => {
  const t = parsePushTarget(
    new Headers({ 'x-scorius-push-token': 'cd'.repeat(40), 'x-scorius-fallback-1': '%E0%A4%A' }),
  );
  assert.equal(t?.environment, 'production');
  assert.equal(t?.fallback1, undefined);
});

test('periodEndsAt becomes seconds since 2001 (ActivityKit default decoding)', () => {
  const state = contentStateForPush({ periodEndsAt: '2001-01-01T00:01:40Z' }, target);
  assert.equal(state.periodEndsAt, 100);
  assert.equal('periodEndsAt' in contentStateForPush({ periodEndsAt: 'garbage' }, target), false);
});

test('missing names take the spectator fallback, real names win, golf stays solo', () => {
  const t = { ...target, fallback1: 'Player 1', fallback2: 'Player 2' };
  assert.deepEqual(
    [contentStateForPush({ sport: 'badminton' }, t).team1Name, contentStateForPush({ sport: 'badminton' }, t).team2Name],
    ['Player 1', 'Player 2'],
  );
  assert.equal(contentStateForPush({ team1Name: 'Aneta' }, t).team1Name, 'Aneta');
  assert.equal(contentStateForPush({ sport: 'discGolf' }, t).team2Name, undefined);
  // Unknown fields pass through untouched.
  assert.equal(contentStateForPush({ someFutureField: 7 }, t).someFutureField, 7);
});

test('update vs. end body', () => {
  const update = buildPushBody({ isMatchComplete: false }, target, 1_000_000) as { aps: Record<string, unknown> };
  assert.equal(update.aps.event, 'update');
  assert.equal(update.aps.timestamp, 1000);
  assert.equal('dismissal-date' in update.aps, false);
  const end = buildPushBody({ isMatchComplete: true }, target, 1_000_000) as { aps: Record<string, unknown> };
  assert.equal(end.aps.event, 'end');
  assert.equal(end.aps['dismissal-date'], 1000 + 15 * 60);
});

test('imports a PKCS#8 .p8 and signs a verifiable ES256 signature', async () => {
  const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const pkcs8 = new Uint8Array(await crypto.subtle.exportKey('pkcs8', pair.privateKey));
  const b64 = Buffer.from(pkcs8).toString('base64').replace(/(.{64})/g, '$1\n');
  const pem = `-----BEGIN PRIVATE KEY-----\n${b64}\n-----END PRIVATE KEY-----\n`;
  const key = await importP8(pem);
  const data = new TextEncoder().encode('header.claims');
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, data);
  assert.equal(sig.byteLength, 64); // raw r‖s, the JWS ES256 form
  assert.ok(await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, pair.publicKey, sig, data));
});

test('base64url has no padding or +/', () => {
  assert.equal(base64url(new Uint8Array([251, 255])), '-_8');
});
