'use client';

import { useEffect } from 'react';

/**
 * Keeps the screen awake while a match is being scored.
 *
 * A scorer that sleeps between rallies means unlocking the phone for every
 * point, which is the difference between using this on a court and not.
 *
 * Re-acquired on visibility change: the lock is dropped whenever the tab is
 * hidden, so coming back from the lock screen without this leaves it off —
 * silently, which is the worst way for it to fail.
 */
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const nav = navigator as Navigator & {
      wakeLock?: { request: (type: 'screen') => Promise<{ release: () => Promise<void> }> };
    };
    if (!nav.wakeLock) return;

    let sentinel: { release: () => Promise<void> } | null = null;
    let cancelled = false;

    const acquire = () => {
      if (cancelled || document.visibilityState !== 'visible') return;
      void nav.wakeLock!.request('screen').then((s) => {
        if (cancelled) { void s.release(); return; }
        sentinel = s;
      }).catch(() => {});
    };

    acquire();
    document.addEventListener('visibilitychange', acquire);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', acquire);
      void sentinel?.release().catch(() => {});
    };
  }, [active]);
}
