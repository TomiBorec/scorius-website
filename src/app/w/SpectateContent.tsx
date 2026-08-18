'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FullscreenBoard } from '@/components/spectate/FullscreenBoard';
import { ScoreBoard } from '@/components/spectate/ScoreBoard';
import { DEMO_CODE, normaliseCode, useSpectate } from '@/lib/spectate';

/**
 * The spectator screen at /w/<CODE>.
 *
 * The site is a static export, so there is no dynamic route to bind the code
 * to. A `_redirects` rewrite serves this one page for every /w/* path and the
 * code is read from the URL here — which keeps the link pretty (the code IS the
 * path segment) without giving up the static build.
 */
export function SpectateContent() {
  const [code, setCode] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    setCode(normaliseCode(window.location.pathname));
  }, []);

  if (code === undefined) return <Shell><p className="sp-note">Loading…</p></Shell>;
  if (code === null) return <BadCode />;
  return <Spectator code={code} />;
}

function Spectator({ code }: { code: string }) {
  const { status, frame } = useSpectate(code);
  const isDemo = code === DEMO_CODE;
  const [courtside, setCourtside] = useState(false);

  if (status === 'notfound') return <BadCode expired />;

  // Courtside mode replaces the page rather than layering over it — the marketing
  // nav and footer are exactly what you do not want on a board across a room.
  if (courtside) {
    return <FullscreenBoard frame={frame} code={code} onExit={() => setCourtside(false)} />;
  }

  return (
    <Shell>
      {/* Say plainly that this is not a real match. A demo that presents itself
          as live would be the one dishonest screen in the whole feature. */}
      {isDemo ? (
        <p className="sp-note">
          <strong>This is a demonstration.</strong> A recorded match plays on a loop so you can see
          what watching looks like. A real code comes from someone scoring in the Scorius app.
        </p>
      ) : null}
      <StatusLine status={status} code={code} isDemo={isDemo} />
      {/* Announce score changes to screen readers — a silent DOM swap tells a
          non-sighted spectator nothing, and following the score is the point. */}
      <div aria-live="polite" aria-atomic="true">
        {frame ? <ScoreBoard frame={frame} /> : <Waiting status={status} />}
      </div>
      {frame ? (
        <button className="sp-cta ghost" onClick={() => setCourtside(true)}>
          Courtside mode — fill the screen
        </button>
      ) : null}
      <Footnote />
    </Shell>
  );
}

function StatusLine({ status, code, isDemo }: { status: string; code: string; isDemo?: boolean }) {
  const text: Record<string, string> = {
    connecting: 'Connecting…',
    waiting: 'Connected — waiting for the first point',
    live: 'Live',
    stale: 'No update for a while — the scoring device may be asleep',
    complete: 'Final score',
    ended: 'The scorer stopped sharing',
    offline: 'Reconnecting…',
  };
  return (
    <div className={`sp-status ${status}`}>
      <span className="sp-dot" aria-hidden="true" />
      <span>{isDemo && status === 'live' ? 'Demo — replaying a recorded match' : text[status] ?? status}</span>
      <code className="sp-code">{code}</code>
    </div>
  );
}

function Waiting({ status }: { status: string }) {
  return (
    <div className="sp-board">
      <p className="sp-note">
        {status === 'offline'
          ? 'Trying to reach the match…'
          : 'The match will appear here as soon as the next point is scored.'}
      </p>
    </div>
  );
}

function BadCode({ expired = false }: { expired?: boolean }) {
  return (
    <Shell>
      <div className="sp-board">
        <h1 className="sp-title">{expired ? 'That match has finished' : 'That code doesn’t look right'}</h1>
        <p className="sp-note">
          {expired
            ? 'Live Spectate sessions are held only while the match is being played, and for a short while after it ends.'
            : 'A code is six characters, like 4KTM9P. Check it and try again.'}
        </p>
        <Link className="sp-cta" href="/watch">Enter a code</Link>
      </div>
    </Shell>
  );
}

function Footnote() {
  return (
    <p className="sp-foot">
      Watching is read-only — only the scoring device can change this. Nothing here is
      stored: the score is held while the match is played and then discarded.{' '}
      <Link href="/">What is Scorius?</Link>
    </p>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="sp-wrap">{children}</main>;
}
