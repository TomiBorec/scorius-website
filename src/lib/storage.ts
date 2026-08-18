'use client';

/* ============================================================
   Local storage for the web scorer.

   Two different things with two different lifetimes:

   - The **in-progress match** is a single small object that must
     survive a reload, a backgrounded tab and a phone locking mid-game.
     It lives in localStorage: synchronous, so a point is durable before
     the tap animation finishes, and there is never a moment where the
     score on screen is ahead of the score on disk.

   - **History** is a growing list that will outlive the session and be
     exported. That belongs in IndexedDB, and is not built yet.

   Mirrors the app, where an in-progress match is deliberately
   device-local and never synced, while finished matches are the thing
   worth keeping.
   ============================================================ */

import type { ActiveMatch } from '@/engine/active';

const ACTIVE_KEY = 'scorius-active-match';
const SCHEMA_KEY = 'scorius-schema';
const SCHEMA_VERSION = 1;

/**
 * Asks the browser to keep this data. Chrome grants it silently to an installed
 * or well-used site; Safari's ITP evicts storage for a site not visited in seven
 * days regardless, which is why export exists and is prominent.
 */
export async function requestPersistence(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.storage?.persist) return false;
  try {
    if (await navigator.storage.persisted?.()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}

export function saveActiveMatch(match: ActiveMatch | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (!match) {
      window.localStorage.removeItem(ACTIVE_KEY);
      return;
    }
    window.localStorage.setItem(SCHEMA_KEY, String(SCHEMA_VERSION));
    window.localStorage.setItem(ACTIVE_KEY, JSON.stringify(match));
  } catch {
    // A full or disabled store must never cost the user the point they just
    // scored. The match stays in memory and the screen keeps working.
  }
}

/**
 * Reads back the in-progress match.
 *
 * Refuses anything written by a newer schema rather than guessing at it — the
 * failure mode of a half-understood match is a wrong score, which is worse than
 * starting again.
 */
export function loadActiveMatch(): ActiveMatch | null {
  if (typeof window === 'undefined') return null;
  try {
    const version = Number(window.localStorage.getItem(SCHEMA_KEY) ?? '1');
    if (version > SCHEMA_VERSION) return null;
    const raw = window.localStorage.getItem(ACTIVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ActiveMatch;
    // Cheap shape check: enough to reject corruption without pretending to validate.
    if (typeof parsed?.sport !== 'string' || typeof parsed?.playerScore !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}
