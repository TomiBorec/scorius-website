// A canned match on an endless loop, served at /api/spectate/demo/stream.
//
// This exists for App Review. A real session dies at its TTL, so a code written
// into the review notes is guaranteed to be dead by the time a reviewer opens
// it — which reads as a broken feature and is a routine rejection. The demo
// route needs no session, no device and no token, and never expires.
//
// It is also the honest way to let anyone see what spectating looks like
// before they own the app.

import { PROTOCOL_VERSION, type FrameEnvelope, type Frame } from './protocol';

const DEMO_INTERVAL_MS = 2500;

/** One badminton game, rallying to 21. Side names are obviously fictional. */
const SCRIPT: Frame[] = buildBadmintonScript();

function buildBadmintonScript(): Frame[] {
  // A plausible rally sequence rather than a straight run to 21 — a demo that
  // only ever increments one side looks like a stuck counter.
  const rallies: (1 | 2)[] = [
    1, 1, 2, 1, 2, 2, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1,
    1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1,
  ];
  const frames: Frame[] = [];
  let player = 0;
  let opponent = 0;
  let serving: 'player' | 'opponent' = 'player';

  frames.push(frame(0, 0, 'player', ''));
  for (const winner of rallies) {
    if (winner === 1) player++;
    else opponent++;
    serving = winner === 1 ? 'player' : 'opponent';

    let message = '';
    if (player >= 20 && player > opponent) message = 'Game point';
    else if (opponent >= 20 && opponent > player) message = 'Game point';

    const complete = (player >= 21 || opponent >= 21) && Math.abs(player - opponent) >= 2;
    if (complete) message = player > opponent ? 'Aneta wins' : 'Marek wins';

    frames.push(frame(player, opponent, serving, message, complete));
    if (complete) break;
  }
  return frames;
}

function frame(
  playerScore: number,
  opponentScore: number,
  serving: 'player' | 'opponent',
  gameMessage: string,
  isMatchComplete = false,
): Frame {
  return {
    playerScore,
    opponentScore,
    playerGames: 0,
    opponentGames: 0,
    isMatchComplete,
    gameMessage,
    sport: 'badminton',
    team1Name: 'Aneta',
    team2Name: 'Marek',
    servingSide: serving,
  };
}

/** Streams the script on a loop, restarting a few seconds after it finishes. */
export function demoStream(ctx: ExecutionContext): Response {
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  const pump = async () => {
    try {
      for (;;) {
        for (const state of SCRIPT) {
          const envelope: FrameEnvelope = { v: PROTOCOL_VERSION, state, at: Date.now() };
          await writer.write(
            encoder.encode(`event: frame\ndata: ${JSON.stringify(envelope)}\n\n`),
          );
          await sleep(state.isMatchComplete ? DEMO_INTERVAL_MS * 3 : DEMO_INTERVAL_MS);
        }
      }
    } catch {
      // Spectator closed the tab. Nothing to clean up beyond the writer.
    } finally {
      await writer.close().catch(() => {});
    }
  };

  ctx.waitUntil(pump());

  return new Response(readable, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-store, no-transform',
      'x-robots-tag': 'noindex, nofollow',
    },
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
