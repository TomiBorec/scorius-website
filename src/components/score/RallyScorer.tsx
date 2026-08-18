'use client';

/* ============================================================
   The rally scorer — badminton, volleyball, table tennis, squash.

   One of the five two-sided scorers; the engine beneath it is shared, so
   the four sports differ only in their rules preset and their nouns.

   The shape follows the app: two huge tap zones, a compact header for
   the things you check rather than read (games, serve), and a game-end
   banner that asks before it closes a game rather than closing it under
   the user. Undo is always one tap away because a mis-tap during a rally
   is the single most common thing that goes wrong.
   ============================================================ */

import { useCallback } from 'react';
import {
  canEndRallyGame, finishRallyGame, recordRallyPoint, undoRallyPoint,
  type ActiveMatch,
} from '@/engine/active';
import { isGameEndingPoint, isMatchEndingPoint } from '@/engine/rally';
import type { Side } from '@/engine/types';
import { ScoreButton } from './ScoreButton';

const SET_SPORTS = new Set(['volleyball']);

export function RallyScorer({ match, onChange, onEnd }: {
  match: ActiveMatch;
  /** Takes an updater, so two taps in one React batch cannot overwrite each other. */
  onChange: (updater: (m: ActiveMatch) => ActiveMatch) => void;
  onEnd: () => void;
}) {
  const noun = SET_SPORTS.has(match.sport) ? 'set' : 'game';
  const rules = match.settings.kind === 'rally' ? match.settings.rules : null;

  const score = useCallback((side: Side) => {
    onChange((m) => recordRallyPoint(m, side));
  }, [onChange]);

  if (!rules) return null;

  const gameOver = canEndRallyGame(match);
  const matchPoint = isMatchEndingPoint(
    rules, match.playerScore, match.opponentScore, match.playerGames, match.opponentGames);
  const gamePoint = isGameEndingPoint(
    rules, match.playerScore, match.opponentScore, match.playerGames, match.opponentGames);

  const caption = match.isMatchComplete
    ? `${match.playerGames > match.opponentGames ? name(match, 'player') : name(match, 'opponent')} won the match`
    : gameOver
      ? `${match.playerScore > match.opponentScore ? name(match, 'player') : name(match, 'opponent')} won the ${noun}`
      : matchPoint ? 'Match point'
      : gamePoint ? (noun === 'set' ? 'Set point' : 'Game point')
      : '';

  return (
    <div className="sc-wrap">
      <header className="sc-head">
        <span className="sc-tally">
          {noun === 'set' ? 'Sets' : 'Games'} {match.playerGames} – {match.opponentGames}
        </span>
        {caption ? <span className="sc-caption">{caption}</span> : null}
      </header>

      <div className="sc-zones">
        <ScoreButton
          name={name(match, 'player')}
          score={match.playerScore}
          serving={match.rallyCurrentServer === 'player'}
          disabled={match.isScoringLocked || gameOver}
          onScore={() => score('player')}
        />
        <ScoreButton
          name={name(match, 'opponent')}
          score={match.opponentScore}
          serving={match.rallyCurrentServer === 'opponent'}
          disabled={match.isScoringLocked || gameOver}
          onScore={() => score('opponent')}
        />
      </div>

      {/* The game does not close under the user. `finishRallyGame` runs only when
          they confirm, which is also what lets undo reach back past a game close. */}
      {gameOver && !match.isMatchComplete ? (
        <div className="sc-banner">
          <p>{caption}</p>
          <button className="sc-primary" onClick={() => onChange(finishRallyGame)}>
            Start the next {noun}
          </button>
        </div>
      ) : null}

      <footer className="sc-foot">
        <button className="sc-ghost" onClick={() => onChange(undoRallyPoint)}
                disabled={match.rallyUndoStack.length === 0}>
          Undo
        </button>
        <button className="sc-ghost danger" onClick={onEnd}>End match</button>
      </footer>
    </div>
  );
}

function name(match: ActiveMatch, side: Side): string {
  if (side === 'player') return match.side1Name?.trim() || 'Side 1';
  return match.side2Name?.trim() || 'Side 2';
}
