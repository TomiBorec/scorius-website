'use client';

/* ============================================================
   Export / import — the app's backup envelope.

   `MatchesArchive` in BB3/MatchExportImport.swift:23. `tournaments` and
   `leagues` are optional there, so a web export omits them entirely and
   the app's importer takes the file unchanged — no app-side work, which
   is the whole reason this format was chosen over anything of our own.
   ============================================================ */

import type { SavedMatch } from '@/engine/finish';
import { listMatches, mergeMatches } from './history';

/** The app hard-rejects a file claiming a version newer than it knows. */
const ARCHIVE_VERSION = 1;

interface MatchesArchive {
  version: number;
  exportedAt: string;
  matches: SavedMatch[];
}

export async function exportArchive(): Promise<Blob> {
  const archive: MatchesArchive = {
    version: ARCHIVE_VERSION,
    exportedAt: new Date().toISOString(),
    matches: await listMatches(),
  };
  return new Blob([JSON.stringify(archive, null, 2)], { type: 'application/json' });
}

/** `Scorius-2026-05-14.json`, matching the app's own naming. */
export function exportFilename(now = new Date()): string {
  return `Scorius-${now.toISOString().slice(0, 10)}.json`;
}

export class ImportError extends Error {}

/**
 * Reads a backup written by either side.
 *
 * Accepts the envelope and, like the app, a bare array — very old exports were
 * written that way and refusing them would strand real files.
 */
export async function importArchive(text: string): Promise<{ added: number; skipped: number }> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new ImportError('That file isn’t valid JSON.');
  }

  let matches: SavedMatch[];
  if (Array.isArray(parsed)) {
    matches = parsed as SavedMatch[];
  } else if (parsed && typeof parsed === 'object' && Array.isArray((parsed as MatchesArchive).matches)) {
    const archive = parsed as MatchesArchive;
    if (typeof archive.version === 'number' && archive.version > ARCHIVE_VERSION) {
      throw new ImportError('This backup was written by a newer version. Update and try again.');
    }
    matches = archive.matches;
  } else {
    throw new ImportError('That doesn’t look like a Scorius backup.');
  }

  // Anything without an id can't be merged safely — it would either overwrite a
  // random record or duplicate on every import.
  const usable = matches.filter((m) => m && typeof m.id === 'string' && typeof m.date === 'string');
  if (usable.length === 0) throw new ImportError('No matches found in that file.');
  return mergeMatches(usable);
}
