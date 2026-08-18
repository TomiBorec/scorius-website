// Scorius Live Spectate — the API surface.
//
//   POST   /api/spectate/start          -> { code, token }   (scoring device)
//   PUT    /api/spectate/:code          -> { viewers }       (scoring device, token)
//   POST   /api/spectate/:code/stop     -> { ok }            (scoring device, token)
//   GET    /api/spectate/:code/stream   -> SSE               (spectators, public)
//   GET    /api/spectate/demo/stream    -> SSE               (App Review, public)
//
// The code is the only thing a spectator needs and the only thing they can do
// anything with: it reads, it never writes. Writing needs the token, which
// only the device that started the session ever holds.

import { demoStream } from './demo';
import { makeCode, makeToken, normaliseCode } from './protocol';
import { SpectateSession } from './session';

export { SpectateSession };

interface Env {
  SPECTATE: DurableObjectNamespace;
}

/** How many fresh codes to try before giving up. Collisions are vanishingly
 *  rare at 31^6 with only live sessions occupying the space; this is a guard
 *  against a pathological case, not an expected path. */
const CODE_ATTEMPTS = 5;

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/api\/spectate\/?/, '');
    const segments = path.split('/').filter(Boolean);

    if (request.method === 'OPTIONS') return preflight();

    // POST /start
    if (segments.length === 1 && segments[0] === 'start') {
      if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
      return withCors(await startSession(env));
    }

    // GET /demo/stream — no session, never expires. See demo.ts.
    if (segments.length === 2 && segments[0] === 'demo' && segments[1] === 'stream') {
      if (request.method !== 'GET') return json({ error: 'method_not_allowed' }, 405);
      return withCors(demoStream(ctx));
    }

    if (segments.length === 0 || segments.length > 2) {
      return withCors(json({ error: 'not_found' }, 404));
    }

    const code = normaliseCode(segments[0]);
    if (code === null) return withCors(json({ error: 'bad_code' }, 400));
    const stub = env.SPECTATE.get(env.SPECTATE.idFromName(code));

    // GET /:code/stream
    if (segments.length === 2 && segments[1] === 'stream') {
      if (request.method !== 'GET') return json({ error: 'method_not_allowed' }, 405);
      return withCors(
        await stub.fetch(new Request('https://do/stream', { headers: request.headers })),
      );
    }

    // POST /:code/stop
    if (segments.length === 2 && segments[1] === 'stop') {
      if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
      return withCors(
        await stub.fetch(new Request('https://do/stop', {
          method: 'POST',
          headers: request.headers,
        })),
      );
    }

    // PUT /:code
    if (segments.length === 1) {
      if (request.method !== 'PUT') return json({ error: 'method_not_allowed' }, 405);
      return withCors(
        await stub.fetch(new Request('https://do/publish', {
          method: 'POST',
          headers: request.headers,
          body: await request.text(),
        })),
      );
    }

    return withCors(json({ error: 'not_found' }, 404));
  },
} satisfies ExportedHandler<Env>;

/**
 * Allocates an unclaimed code.
 *
 * NOTE: rate limiting on this endpoint is a Cloudflare dashboard rule, not
 * code — see docs/LIVE-SPECTATE.md §8. An unlimited public allocate endpoint
 * would let anyone park codes; the short TTL bounds the damage but does not
 * prevent it.
 */
async function startSession(env: Env): Promise<Response> {
  for (let attempt = 0; attempt < CODE_ATTEMPTS; attempt++) {
    const code = makeCode();
    const token = makeToken();
    const stub = env.SPECTATE.get(env.SPECTATE.idFromName(code));
    const claimed = await stub.fetch(
      new Request('https://do/init', {
        method: 'POST',
        body: JSON.stringify({ token }),
      }),
    );
    if (claimed.ok) return json({ code, token });
    if (claimed.status !== 409) return json({ error: 'start_failed' }, 502);
    // 409 = that code is live. Try another.
  }
  return json({ error: 'no_code_available' }, 503);
}

function json(body: unknown, status = 200): Response {
  return withCors(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    }),
  );
}

/**
 * Permissive CORS. Safe here, and deliberate: the read side is public by
 * design (that is the entire feature), and the write side is protected by the
 * token rather than by origin — an attacker who can forge an origin header
 * still cannot publish without it. Being permissive is what lets the site work
 * from localhost during development.
 */
function withCors(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set('access-control-allow-origin', '*');
  headers.set('access-control-expose-headers', 'content-type');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function preflight(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, PUT, OPTIONS',
      'access-control-allow-headers': 'content-type, x-scorius-token',
      'access-control-max-age': '86400',
    },
  });
}
