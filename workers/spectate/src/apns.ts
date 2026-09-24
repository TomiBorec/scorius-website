// Live Activity push for in-app spectators (app build 383).
//
// A spectator following a code in the Scorius app has its own Live Activity.
// While the app runs it updates the card itself from the SSE stream; the moment
// iOS suspends the app that stream dies, and without this file the card (and
// its mirror in the Watch Smart Stack) would freeze on the last point. So the
// app hands the relay its activity's push token, and every frame the scorer
// publishes is also sent to APNs as a `liveactivity` push.
//
// How a token arrives: as request *headers* on the ordinary SSE subscription
// (`x-scorius-push-token` + friends, see `parsePushTarget`). The Worker already
// forwards the stream request's headers to this object untouched, so no new
// route was needed.
//
// Secrets (wrangler secret put …): APNS_KEY (the .p8 file's contents),
// APNS_KEY_ID, APNS_TEAM_ID. With any of them missing, push is simply off and
// the relay behaves exactly as before.
//
// ⚠️ APNs only speaks HTTP/2. Production Workers' `fetch` negotiates it;
// `wrangler dev` on macOS does not (workerd issue #4841), so push can only be
// verified against the deployed Worker.

import type { Frame } from './protocol';

export interface PushEnv {
  APNS_KEY?: string;
  APNS_KEY_ID?: string;
  APNS_TEAM_ID?: string;
}

/** Debug builds of the app register sandbox tokens; TestFlight / App Store production. */
export type PushEnvironment = 'sandbox' | 'production';

export interface PushTarget {
  token: string;
  environment: PushEnvironment;
  /** Side names in the *spectator's* language for a frame that carries none.
   *  The widget's own fallback is "You" / "Opponent", which on a spectator's
   *  Lock Screen names the wrong person — the app substitutes these locally,
   *  and a push has to do the same or the card flips wording mid-match. */
  fallback1?: string;
  fallback2?: string;
}

/** The app's bundle id; the topic is `<bundle>.push-type.liveactivity`. */
export const APNS_TOPIC = 'tk.BB3.push-type.liveactivity';

/** Tokens kept per session. A code shown on a hall screen could gather many
 *  followers; this bounds the fan-out per frame. */
export const MAX_PUSH_TARGETS = 100;

/** A finished match stays on the spectator's Lock Screen this long — the same
 *  15 minutes the app uses when it ends the card itself. */
export const DISMISS_AFTER_S = 15 * 60;

/** Seconds between 1970-01-01 and 2001-01-01. ActivityKit decodes a push's
 *  `content-state` with a default `JSONDecoder`, which reads a `Date` as
 *  seconds since 2001 — not the ISO-8601 string the app publishes for the
 *  browser. */
const REFERENCE_DATE_OFFSET_S = 978_307_200;

const GOLF_LIKE = new Set(['golf', 'discGolf']);

/** Reads a spectator's push registration off the stream request, or null. */
export function parsePushTarget(headers: Headers): PushTarget | null {
  const token = (headers.get('x-scorius-push-token') ?? '').trim().toLowerCase();
  if (!/^[0-9a-f]{32,512}$/.test(token)) return null;
  const environment: PushEnvironment =
    headers.get('x-scorius-push-env') === 'sandbox' ? 'sandbox' : 'production';
  return {
    token,
    environment,
    fallback1: decodeName(headers.get('x-scorius-fallback-1')),
    fallback2: decodeName(headers.get('x-scorius-fallback-2')),
  };
}

/** Headers are ASCII, so the app percent-encodes the names. */
function decodeName(raw: string | null): string | undefined {
  if (!raw) return undefined;
  try {
    const name = decodeURIComponent(raw).trim();
    return name.length > 0 && name.length <= 60 ? name : undefined;
  } catch {
    return undefined;
  }
}

/** The frame reshaped for ActivityKit: dates as seconds since 2001, missing
 *  side names filled in the spectator's language. Everything else passes
 *  through untouched (the relay is not a schema gatekeeper — see protocol.ts). */
export function contentStateForPush(frame: Frame, target: PushTarget): Record<string, unknown> {
  const state: Record<string, unknown> = { ...frame };

  if (typeof state.periodEndsAt === 'string') {
    const ms = Date.parse(state.periodEndsAt);
    if (Number.isNaN(ms)) delete state.periodEndsAt;
    else state.periodEndsAt = ms / 1000 - REFERENCE_DATE_OFFSET_S;
  }

  if (state.team1Name == null && target.fallback1) state.team1Name = target.fallback1;
  const golfLike = typeof state.sport === 'string' && GOLF_LIKE.has(state.sport);
  if (state.team2Name == null && target.fallback2 && !golfLike) state.team2Name = target.fallback2;

  return state;
}

/** The APNs body for one frame. A finished match ends the activity. */
export function buildPushBody(frame: Frame, target: PushTarget, nowMs: number): unknown {
  const now = Math.floor(nowMs / 1000);
  const complete = frame.isMatchComplete === true;
  const aps: Record<string, unknown> = {
    timestamp: now,
    event: complete ? 'end' : 'update',
    'content-state': contentStateForPush(frame, target),
  };
  if (complete) aps['dismissal-date'] = now + DISMISS_AFTER_S;
  return { aps };
}

/** What a send told us about the token. */
export type PushResult = 'ok' | 'gone' | 'error';

/**
 * Minimal APNs client: an ES256 provider token (WebCrypto, no dependency),
 * reused for 50 minutes — Apple rejects tokens older than an hour and
 * throttles ones refreshed more often than every 20 minutes.
 */
export class ApnsClient {
  private jwt: { value: string; issuedAt: number } | null = null;
  private key: Promise<CryptoKey> | null = null;

  constructor(private env: PushEnv) {}

  get isConfigured(): boolean {
    return Boolean(this.env.APNS_KEY && this.env.APNS_KEY_ID && this.env.APNS_TEAM_ID);
  }

  async send(target: PushTarget, body: unknown, complete: boolean): Promise<PushResult> {
    if (!this.isConfigured) return 'error';
    const host =
      target.environment === 'sandbox' ? 'api.sandbox.push.apple.com' : 'api.push.apple.com';
    try {
      const response = await fetch(`https://${host}/3/device/${target.token}`, {
        method: 'POST',
        headers: {
          authorization: `bearer ${await this.providerToken()}`,
          'apns-topic': APNS_TOPIC,
          'apns-push-type': 'liveactivity',
          // A score change is exactly what the user is looking at the card for.
          // The app declares NSSupportsLiveActivitiesFrequentUpdates, which
          // raises the budget for these.
          'apns-priority': '10',
          'apns-expiration': String(Math.floor(Date.now() / 1000) + (complete ? 3600 : 60)),
          'content-type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (response.ok) return 'ok';
      // 410 Unregistered; 400 BadDeviceToken / DeviceTokenNotForTopic — the
      // activity ended or the token was never ours. Either way, stop sending.
      if (response.status === 410) return 'gone';
      if (response.status === 400) {
        const reason = ((await response.json().catch(() => ({}))) as { reason?: string }).reason;
        if (reason === 'BadDeviceToken' || reason === 'DeviceTokenNotForTopic') return 'gone';
      }
      if (response.status === 403) this.jwt = null; // expired / rejected provider token
      return 'error';
    } catch {
      return 'error';
    }
  }

  private async providerToken(): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    if (this.jwt && now - this.jwt.issuedAt < 50 * 60) return this.jwt.value;
    const header = base64url(JSON.stringify({ alg: 'ES256', kid: this.env.APNS_KEY_ID }));
    const claims = base64url(JSON.stringify({ iss: this.env.APNS_TEAM_ID, iat: now }));
    const input = `${header}.${claims}`;
    this.key ??= importP8(this.env.APNS_KEY ?? '');
    // WebCrypto's ECDSA signature is already raw r‖s (IEEE P1363) — the form
    // JWS ES256 wants — so no DER unwrapping.
    const signature = await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      await this.key,
      new TextEncoder().encode(input),
    );
    const value = `${input}.${base64url(new Uint8Array(signature))}`;
    this.jwt = { value, issuedAt: now };
    return value;
  }
}

/** The .p8 is a PEM-wrapped PKCS#8 P-256 private key. */
export async function importP8(pem: string): Promise<CryptoKey> {
  const der = Uint8Array.from(
    atob(pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '')),
    (c) => c.charCodeAt(0),
  );
  return crypto.subtle.importKey('pkcs8', der, { name: 'ECDSA', namedCurve: 'P-256' }, false, [
    'sign',
  ]);
}

export function base64url(input: string | Uint8Array): string {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
