'use client';

/* ============================================================
   The tennis scorer — tennis and padel.

   Same engine, different preset: padel plays a golden point (no
   advantage). The layout follows the app's: sets in the header, games
   in the big slot, and the point — 0/15/30/40/AD — underneath, because
   "40" alone says nothing without the games beside it.

   Serve is *derived* here rather than stored. It alternates every game,
   so the only serve state worth keeping is who opened; deriving it from
   that keeps it right after an undo, which is exactly where a stored
   flag drifts.
   ============================================================ */

import { useCallback } from 'react';
import {
  recordTennisPoint, toggleTennisFirstServer, undoTennisPoint, type ActiveMatch,
} from '@/engine/active';
import {
  isTennisMatchComplete, isTennisMatchPoint, pointDisplay, servingSide, setDisplayText,
} from '@/engine/tennis';
import type { Side } from '@/engine/types';
import { ScoreButton } from './ScoreButton';

export function TennisScorer({ match, onChange, onEnd }: {
  match: ActiveMatch;
  onChange: (updater: (m: ActiveMatch) => ActiveMatch) => void;
  onEnd: () => void;
}) {
  const score = useCallback((side: Side) => {
    onChange((m) => recordTennisPoint(m, side));
  }, [onChange]);

  if (match.runtimeState?.kind !== 'tennis' || match.settings.kind !== 'tennis') return null;
  const state = match.runtimeState.score;
  const rules = match.settings.rules;

  const complete = isTennisMatchComplete(rules, state);
  const serving = servingSide(state);
  const caption = complete
    ? `${name(match, state.playerSets > state.opponentSets ? 'player' : 'opponent')} won the match`
    : isTennisMatchPoint(rules, state) ? 'Match point'
    : state.inTiebreak ? 'Tiebreak'
    : '';

  return (
    <div className="sc-wrap">
      <header className="sc-head">
        <span className="sc-tally">
          Sets {state.playerSets} – {state.opponentSets}
          {state.completedSets.length > 0
            ? ` · ${state.completedSets.map(setDisplayText).join('  ')}`
            : ''}
        </span>
        {caption ? <span className="sc-caption">{caption}</span> : null}
      </header>

      <div className="sc-zones">
        <ScoreButton
          name={name(match, 'player')}
          score={state.currentGames.player}
          sub={pointDisplay(state, 'player')}
          serving={serving === 'player'}
          disabled={complete}
          onScore={() => score('player')}
        />
        <ScoreButton
          name={name(match, 'opponent')}
          score={state.currentGames.opponent}
          sub={pointDisplay(state, 'opponent')}
          serving={serving === 'opponent'}
          disabled={complete}
          onScore={() => score('opponent')}
        />
      </div>

      <footer className="sc-foot">
        <button className="sc-ghost" onClick={() => onChange(undoTennisPoint)}
                disabled={match.tennisUndoStack.length === 0}>
          Undo
        </button>
        {/* Only before the first point: after that the serve order is history, and
            flipping it would rewrite who served games already played. */}
        {state.playerSets === 0 && state.opponentSets === 0
          && state.currentGames.player === 0 && state.currentGames.opponent === 0
          && state.playerPoints === 0 && state.opponentPoints === 0 ? (
          <button className="sc-ghost" onClick={() => onChange(toggleTennisFirstServer)}>
            Switch serve
          </button>
        ) : null}
        <button className="sc-ghost danger" onClick={onEnd}>End match</button>
      </footer>
    </div>
  );
}

function name(match: ActiveMatch, side: Side): string {
  if (side === 'player') return match.side1Name?.trim() || 'Side 1';
  return match.side2Name?.trim() || 'Side 2';
}
