'use client';

/* ============================================================
   One saved match, opened from the history list.

   Reads the record's sport-tagged payload rather than the flat
   mirrors, because that is where the detail lives: game scores for a
   rally match, sets for tennis, per-hole strokes for golf. The flat
   fields are a summary — good for a row, not for a detail screen.
   ============================================================ */

import type { SavedMatch } from '@/engine/finish';
import { toParText } from '@/engine/golf';

const SPORT_LABEL: Record<string, string> = {
  badminton: 'Badminton', volleyball: 'Volleyball', tableTennis: 'Table Tennis', squash: 'Squash',
  tennis: 'Tennis', padel: 'Padel', pickleball: 'Pickleball', basketball: 'Basketball',
  football: 'Football', floorball: 'Floorball', golf: 'Golf', discGolf: 'Disc Golf',
};

interface GameLine { player: number; opponent: number; pointSequence?: string[] }

export function MatchDetail({ match, onClose, onDelete }: {
  match: SavedMatch;
  onClose: () => void;
  onDelete: () => void;
}) {
  const payload = tagPayload(match);
  const one = match.side1Name?.trim() || 'Side 1';
  const two = match.side2Name?.trim() || 'Side 2';
  const isGolf = match.sport === 'golf' || match.sport === 'discGolf';

  return (
    <div className="sc-detail" role="dialog" aria-modal="true" aria-label="Match detail">
      <div className="sc-detail-card">
        <header className="sc-detail-head">
          <div>
            <h2 className="sc-h2">{isGolf ? one : `${one} vs ${two}`}</h2>
            <p className="sp-note">
              {SPORT_LABEL[match.sport] ?? match.sport} ·{' '}
              {new Date(match.date).toLocaleString()} · {formatDuration(match.duration)}
            </p>
          </div>
          <button className="sc-row-del" aria-label="Close" onClick={onClose}>✕</button>
        </header>

        {isGolf
          ? <GolfDetail match={match} payload={payload} />
          : <SidedDetail match={match} payload={payload} one={one} two={two} />}

        <div className="sc-foot">
          <button className="sc-ghost danger" onClick={onDelete}>Delete</button>
          <button className="sc-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function SidedDetail({ match, payload, one, two }: {
  match: SavedMatch; payload: Record<string, unknown> | null; one: string; two: string;
}) {
  // Rally sports keep their games on the record itself; tennis and pickleball
  // keep theirs inside the tagged payload under their own names.
  const games: GameLine[] =
    (match.gameScores as GameLine[] | undefined)?.length
      ? (match.gameScores as GameLine[])
      : ((payload?.completedSets ?? payload?.completedGames ?? []) as GameLine[]);

  return (
    <>
      <div className="sc-detail-score">
        <span>{one}</span>
        <strong>{match.playerGames} – {match.opponentGames}</strong>
        <span>{two}</span>
      </div>

      {games.length > 0 ? (
        <ol className="sc-segments">
          {games.map((game, index) => (
            <li key={index} className={game.player === game.opponent ? '' : game.player > game.opponent ? 'won' : 'lost'}>
              <span className="sc-segment-n">{index + 1}</span>
              <span>{game.player} – {game.opponent}</span>
              {/* The rally log is the one thing a saved match carries that a score
                  line can't show: how the game actually went. */}
              {game.pointSequence?.length ? <Momentum sequence={game.pointSequence} /> : null}
            </li>
          ))}
        </ol>
      ) : null}
    </>
  );
}

/**
 * The running lead through a game, drawn as bars above and below a centre line.
 *
 * Only for games that kept a log — the app's rule is that a chart may never
 * contradict the score beside it, so a game whose log didn't add up simply has
 * no chart rather than a wrong one.
 */
function Momentum({ sequence }: { sequence: string[] }) {
  let lead = 0;
  const points = sequence.map((winner) => {
    lead += winner === 'player' ? 1 : -1;
    return lead;
  });
  const peak = Math.max(1, ...points.map(Math.abs));
  return (
    <span className="sc-momentum" aria-hidden="true">
      {points.map((value, index) => (
        <span
          key={index}
          className={`sc-momentum-bar ${value >= 0 ? 'up' : 'down'}`}
          style={{ height: `${(Math.abs(value) / peak) * 100}%` }}
        />
      ))}
    </span>
  );
}

function GolfDetail({ match, payload }: { match: SavedMatch; payload: Record<string, unknown> | null }) {
  const strokes = (payload?.playerStrokes ?? []) as (number | null)[][];
  const pars = ((settingsPayload(match)?.pars ?? []) as number[]);
  const names = [match.side1Name?.trim() || 'Player 1', match.side2Name?.trim() || 'Player 2'];

  return (
    <>
      {strokes.map((row, slot) => {
        const played = row.filter((v) => v !== null).length;
        const total = row.reduce<number>((a, v) => a + (v ?? 0), 0);
        const toPar = total - pars.slice(0, played).reduce((a, p) => a + p, 0);
        return (
          <div key={slot} className="sc-detail-score">
            <span>{names[slot] ?? `Player ${slot + 1}`}</span>
            <strong>{total}</strong>
            <span className={toPar < 0 ? 'under' : toPar > 0 ? 'over' : ''}>{toParText(toPar)}</span>
          </div>
        );
      })}
      <p className="sp-note">{strokes[0]?.filter((v) => v !== null).length ?? 0} holes played</p>
    </>
  );
}

/** The score payload for this match's sport — `{ sport, <sport>: … }`. */
function tagPayload(match: SavedMatch): Record<string, unknown> | null {
  const score = match.score as Record<string, unknown> | null;
  if (!score) return null;
  return (score[match.sport] as Record<string, unknown>) ?? null;
}

function settingsPayload(match: SavedMatch): Record<string, unknown> | null {
  const settings = match.settings as Record<string, unknown> | null;
  if (!settings) return null;
  return (settings[match.sport] as Record<string, unknown>) ?? null;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}
