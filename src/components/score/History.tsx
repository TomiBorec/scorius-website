'use client';

/* ============================================================
   Saved matches, plus the export that makes them portable.

   Export is prominent on purpose. Matches live in this browser only —
   Safari evicts storage for a site not visited in seven days, and there
   is no account to fall back on. A backup the user never noticed is the
   same as no backup.
   ============================================================ */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { SavedMatch } from '@/engine/finish';
import { exportArchive, exportFilename, importArchive, ImportError } from '@/lib/archive';
import { deleteMatch, listMatches } from '@/lib/history';
import { MatchDetail } from './MatchDetail';

const SPORT_LABEL: Record<string, string> = {
  badminton: 'Badminton', volleyball: 'Volleyball', tableTennis: 'Table Tennis', squash: 'Squash',
  tennis: 'Tennis', padel: 'Padel', pickleball: 'Pickleball', basketball: 'Basketball',
  football: 'Football', floorball: 'Floorball', golf: 'Golf', discGolf: 'Disc Golf',
};

export function History({ reloadKey }: { reloadKey: number }) {
  const [matches, setMatches] = useState<SavedMatch[] | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [open, setOpen] = useState<SavedMatch | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const reload = useCallback(() => { void listMatches().then(setMatches); }, []);
  useEffect(reload, [reload, reloadKey]);

  async function download() {
    const blob = await exportArchive();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = exportFilename();
    link.click();
    URL.revokeObjectURL(url);
  }

  async function upload(file: File) {
    try {
      const { added, skipped } = await importArchive(await file.text());
      setNotice(added === 0
        ? 'Already had every match in that file.'
        : `Added ${added} match${added === 1 ? '' : 'es'}${skipped ? `, skipped ${skipped} already here` : ''}.`);
      reload();
    } catch (error) {
      setNotice(error instanceof ImportError ? error.message : 'Could not read that file.');
    }
  }

  if (matches === null) return null;

  return (
    <section className="sc-history">
      <div className="sc-history-head">
        <h2 className="sc-h2">Saved matches</h2>
        {matches.length > 0 ? <span className="sp-note">{matches.length}</span> : null}
      </div>

      {matches.length === 0 ? (
        <p className="sp-note">
          Nothing saved yet. Matches you finish are kept in this browser — and only here, so
          export them if they matter.
        </p>
      ) : (
        <ul className="sc-list">
          {matches.map((match) => (
            <li key={match.id} className="sc-row">
              <button className="sc-row-main sc-row-open" onClick={() => setOpen(match)}>
                <span className="sc-row-title">{sides(match)}</span>
                <span className="sc-row-sub">
                  {SPORT_LABEL[match.sport] ?? match.sport} · {new Date(match.date).toLocaleDateString()}
                </span>
              </button>
              <span className="sc-row-score">{scoreLine(match)}</span>
              <button className="sc-row-del" aria-label="Delete match"
                      onClick={() => void deleteMatch(match.id).then(reload)}>✕</button>
            </li>
          ))}
        </ul>
      )}

      <div className="sc-foot">
        <button className="sc-ghost" onClick={() => void download()} disabled={matches.length === 0}>
          Export
        </button>
        <button className="sc-ghost" onClick={() => fileInput.current?.click()}>Import</button>
        <input
          ref={fileInput} type="file" accept="application/json,.json" hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            // Reset first, so picking the same file twice still fires a change.
            event.target.value = '';
            if (file) void upload(file);
          }}
        />
      </div>

      {notice ? <p className="sp-note" role="status">{notice}</p> : null}

      {open ? (
        <MatchDetail
          match={open}
          onClose={() => setOpen(null)}
          onDelete={() => { void deleteMatch(open.id).then(reload); setOpen(null); }}
        />
      ) : null}

      <p className="sp-foot">
        The export is the app’s own backup format — open it in Scorius on iPhone and the
        matches land in your history there.
      </p>
    </section>
  );
}

function sides(match: SavedMatch): string {
  const one = match.side1Name?.trim() || 'Side 1';
  const two = match.side2Name?.trim();
  return two ? `${one} vs ${two}` : one;
}

/** Games for the sports that have them, which is every sport the web scores today. */
function scoreLine(match: SavedMatch): string {
  return `${match.playerGames} – ${match.opponentGames}`;
}
