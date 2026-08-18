// Wire protocol for Live Spectate.
//
// Design rule that matters more than it looks: **the relay is not a schema
// gatekeeper.** It validates size and that a frame is a JSON object, and
// nothing else. `MatchAttributes.ContentState` gains optional fields with
// almost every app release (see the field history in the Swift file), and the
// relay must pass an unknown field through untouched — otherwise shipping an
// app update would require a Worker deploy to match, and old clients would
// break the moment they didn't.

/** Envelope version. Bump only on a breaking change to the envelope itself. */
export const PROTOCOL_VERSION = 1;

/**
 * Code alphabet — Crockford-style, minus every glyph that gets misread when
 * someone reads a code out across a court: no `0`/`O`, no `1`/`I`/`L`.
 * 31 symbols ^ 6 places ≈ 887M combinations.
 */
export const CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
export const CODE_LENGTH = 6;

/** Hard cap on a single frame. A real ContentState is ~400 B; 8 KB is generous. */
export const MAX_FRAME_BYTES = 8 * 1024;

/** Session dies this long after the last frame of a match still in progress. */
export const TTL_ACTIVE_MS = 4 * 60 * 60 * 1000;

/** Session dies this long after the final `isMatchComplete` frame. */
export const TTL_COMPLETE_MS = 30 * 60 * 1000;

/** SSE keepalive interval — proxies drop idle connections well before 60 s. */
export const KEEPALIVE_MS = 25 * 1000;

/**
 * One live-score frame, as the app sends it. Deliberately `unknown`-valued:
 * see the note at the top of this file. The two fields the relay itself reads
 * are broken out because they drive TTL and nothing else.
 */
export interface Frame extends Record<string, unknown> {
  isMatchComplete?: boolean;
}

/** What a spectator receives over SSE. */
export interface FrameEnvelope {
  v: number;
  state: Frame;
  /** Server time the frame was received, ms since epoch. Lets the browser show
   *  "no update for a while" without trusting the phone's clock. */
  at: number;
}

/** Generates a random spectate code from the unambiguous alphabet. */
export function makeCode(): string {
  const bytes = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return out;
}

/** Generates the write token. Only the scoring device ever sees this. */
export function makeToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Normalises whatever the user typed or pasted into a bare code.
 * Accepts a full URL, spaces, dashes, lowercase — courtside typing is sloppy
 * and rejecting `scorius.app/w/4ktm-9p` would be needless friction.
 * Returns null when the result isn't a well-formed code.
 */
export function normaliseCode(input: string): string | null {
  const tail = input.trim().split(/[/?#]/).filter(Boolean).pop() ?? '';
  const cleaned = tail.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (cleaned.length !== CODE_LENGTH) return null;
  for (const ch of cleaned) if (!CODE_ALPHABET.includes(ch)) return null;
  return cleaned;
}

/** Constant-time string compare, so a token can't be probed byte by byte. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
