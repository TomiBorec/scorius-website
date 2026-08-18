// One Durable Object per spectate code.
//
// Holds the last frame and the open SSE connections, and expires itself.
// Nothing here is persisted beyond the session: the storage writes exist so an
// eviction between points doesn't lose the score, and the alarm deletes them.
// There is no history, no log of frame contents, no backup.

import {
  KEEPALIVE_MS,
  MAX_FRAME_BYTES,
  PROTOCOL_VERSION,
  TTL_ACTIVE_MS,
  TTL_COMPLETE_MS,
  safeEqual,
  type Frame,
  type FrameEnvelope,
} from './protocol';

const encoder = new TextEncoder();

interface Subscriber {
  writer: WritableStreamDefaultWriter<Uint8Array>;
}

export class SpectateSession implements DurableObject {
  private subscribers = new Set<Subscriber>();
  private keepalive: ReturnType<typeof setInterval> | null = null;

  private token: string | null = null;
  private lastEnvelope: FrameEnvelope | null = null;

  constructor(private state: DurableObjectState) {
    // Rehydrate before serving anything — a DO can be evicted between points
    // when nobody is watching, and coming back without the token would lock
    // the scoring device out of its own session.
    this.state.blockConcurrencyWhile(async () => {
      this.token = (await this.state.storage.get<string>('token')) ?? null;
      this.lastEnvelope =
        (await this.state.storage.get<FrameEnvelope>('lastEnvelope')) ?? null;
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    switch (url.pathname) {
      case '/init':
        return this.handleInit(request);
      case '/publish':
        return this.handlePublish(request);
      case '/stream':
        return this.handleStream(request);
      case '/stop':
        return this.handleStop(request);
      default:
        return json({ error: 'not_found' }, 404);
    }
  }

  /** Claims this code. Fails if already claimed, which is how the Worker
   *  detects a code collision and retries with a fresh one. */
  private async handleInit(request: Request): Promise<Response> {
    if (this.token !== null) return json({ error: 'code_taken' }, 409);

    const { token } = (await request.json()) as { token: string };
    this.token = token;
    await this.state.storage.put('token', token);
    // Claim expires on its own even if the device never sends a single frame —
    // an abandoned start must not park a code forever.
    await this.state.storage.setAlarm(Date.now() + TTL_ACTIVE_MS);
    return json({ ok: true });
  }

  /** Accepts one frame from the scoring device and fans it out. */
  private async handlePublish(request: Request): Promise<Response> {
    if (this.token === null) return json({ error: 'session_expired' }, 410);

    const presented = request.headers.get('x-scorius-token') ?? '';
    if (!safeEqual(presented, this.token)) return json({ error: 'forbidden' }, 403);

    const body = await request.text();
    if (body.length > MAX_FRAME_BYTES) return json({ error: 'frame_too_large' }, 413);

    let state: Frame;
    try {
      const parsed = JSON.parse(body);
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        return json({ error: 'bad_frame' }, 400);
      }
      state = parsed as Frame;
    } catch {
      return json({ error: 'bad_frame' }, 400);
    }

    const envelope: FrameEnvelope = {
      v: PROTOCOL_VERSION,
      state,
      at: Date.now(),
    };
    this.lastEnvelope = envelope;
    await this.state.storage.put('lastEnvelope', envelope);

    // A finished match keeps its screen alive briefly so spectators can read
    // the result, then the session goes. Anything else gets the full window.
    const ttl = state.isMatchComplete === true ? TTL_COMPLETE_MS : TTL_ACTIVE_MS;
    await this.state.storage.setAlarm(Date.now() + ttl);

    this.broadcast(sse('frame', envelope));
    return json({ viewers: this.subscribers.size });
  }

  /** Subscribes one spectator. Read-only: nothing a spectator sends is read. */
  private async handleStream(request: Request): Promise<Response> {
    if (this.token === null) return json({ error: 'session_expired' }, 410);

    const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
    const writer = writable.getWriter();
    const sub: Subscriber = { writer };
    this.subscribers.add(sub);

    // Send the current frame immediately rather than waiting for the next
    // point. Without this, joining a 0-0 golf round or a paused clock means
    // staring at an empty screen for minutes.
    if (this.lastEnvelope) {
      void this.send(sub, sse('frame', this.lastEnvelope));
    } else {
      void this.send(sub, sse('waiting', { at: Date.now() }));
    }

    this.startKeepalive();

    // Prompt cleanup so the viewer count the scoring device sees is honest;
    // a dead writer would otherwise linger until the next keepalive.
    request.signal?.addEventListener('abort', () => this.drop(sub));

    return new Response(readable, {
      headers: {
        'content-type': 'text/event-stream; charset=utf-8',
        'cache-control': 'no-cache, no-store, no-transform',
        // Spectate responses must never be indexed - player names are in here.
        'x-robots-tag': 'noindex, nofollow',
      },
    });
  }

  /** Ends the session deliberately (the scorer tapped stop). */
  private async handleStop(request: Request): Promise<Response> {
    if (this.token === null) return json({ ok: true });
    const presented = request.headers.get('x-scorius-token') ?? '';
    if (!safeEqual(presented, this.token)) return json({ error: 'forbidden' }, 403);
    await this.expire('ended');
    return json({ ok: true });
  }

  /** TTL fired. */
  async alarm(): Promise<void> {
    await this.expire('expired');
  }

  private async expire(reason: 'ended' | 'expired'): Promise<void> {
    this.broadcast(sse('closed', { reason }));
    for (const sub of [...this.subscribers]) {
      this.subscribers.delete(sub);
      void sub.writer.close().catch(() => {});
    }
    this.stopKeepalive();
    this.token = null;
    this.lastEnvelope = null;
    await this.state.storage.deleteAll();
    await this.state.storage.deleteAlarm();
  }

  private startKeepalive(): void {
    if (this.keepalive !== null) return;
    this.keepalive = setInterval(() => {
      if (this.subscribers.size === 0) {
        this.stopKeepalive();
        return;
      }
      // An SSE comment. Invisible to EventSource, but it keeps intermediary
      // proxies from treating the connection as idle and closing it.
      this.broadcast(': ka\n\n');
    }, KEEPALIVE_MS);
  }

  private stopKeepalive(): void {
    if (this.keepalive === null) return;
    clearInterval(this.keepalive);
    this.keepalive = null;
  }

  private broadcast(chunk: string): void {
    for (const sub of [...this.subscribers]) void this.send(sub, chunk);
  }

  private async send(sub: Subscriber, chunk: string): Promise<void> {
    try {
      await sub.writer.write(encoder.encode(chunk));
    } catch {
      // The spectator closed the tab or lost the network. EventSource will
      // reconnect on its own if they come back.
      this.drop(sub);
    }
  }

  private drop(sub: Subscriber): void {
    if (!this.subscribers.delete(sub)) return;
    void sub.writer.close().catch(() => {});
    if (this.subscribers.size === 0) this.stopKeepalive();
  }
}

function sse(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
