'use client';

/* ============================================================
   Match history — IndexedDB.

   Records are stored in the app's own `Match` shape (see
   engine/finish.ts), so export is a straight dump rather than a
   conversion. A conversion layer is a place for the two formats to
   drift apart quietly, and the whole point of the export is that the
   app can read it.

   Separate from the in-progress match, which lives in localStorage:
   that one is a single small object needing synchronous durability on
   every tap, this one is a growing list that outlives the session.
   ============================================================ */

import type { SavedMatch } from '@/engine/finish';

const DB_NAME = 'scorius';
const DB_VERSION = 1;
const STORE = 'matches';

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' });
        // Sorted reads without loading everything: history is always newest first.
        store.createIndex('date', 'date');
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then((db) => new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(STORE, mode);
    const request = run(transaction.objectStore(STORE));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
  }));
}

export async function saveMatch(match: SavedMatch): Promise<void> {
  await tx('readwrite', (store) => store.put(match));
}

/** Newest first, the order every history screen wants. */
export async function listMatches(): Promise<SavedMatch[]> {
  const all = await tx<SavedMatch[]>('readonly', (store) => store.getAll());
  return all.sort((a, b) => b.date.localeCompare(a.date));
}

export async function deleteMatch(id: string): Promise<void> {
  await tx('readwrite', (store) => store.delete(id));
}

export async function deleteAllMatches(): Promise<void> {
  await tx('readwrite', (store) => store.clear());
}

/**
 * Adds imported matches, keeping any that are already here.
 *
 * Merge-by-id, never overwrite — the same rule the app's
 * `mergeImportedMatches` follows, so importing the same file twice is a no-op
 * rather than a way to lose an edit.
 */
export async function mergeMatches(incoming: SavedMatch[]): Promise<{ added: number; skipped: number }> {
  const existing = new Set((await listMatches()).map((m) => m.id));
  const fresh = incoming.filter((m) => m?.id && !existing.has(m.id));
  for (const match of fresh) await saveMatch(match);
  return { added: fresh.length, skipped: incoming.length - fresh.length };
}
