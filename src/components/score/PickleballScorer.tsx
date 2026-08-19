'use client';

/* ============================================================
   The pickleball scorer.

   Side-out scoring, which is why this can't reuse the rally screen: a
   rally won by the receiving side is a *side out*, not a point, and the
   server number matters. The score call — "6-4-2" — is not decoration:
   in side-out doubles it is the only thing that says who serves next,
   and it exists nowhere else on the screen.
   ============================================================ */

import { useCallback } from 'react';
import {
  recordPickleballRally, undoPickleballRally, type ActiveMatch,
} from '@/engine/active';
import {
  isPickleballGamePoint, isPickleballMatchComplete, isPickleballMatchPoint, scoreCall,
} from '@/engine/pickleball';
import type { Side } from '@/engine/types';
import { ScoreButton } from './ScoreButton';

export function PickleballScorer({ match, onChange, onEnd }: {
  match: ActiveMatch;
  onChange: (updater: (m: ActiveMatch) => ActiveMatch) => void;
  onEnd: () => void;
}) {
  const rally = useCallback((side: Side) => {
    onChange((m) => recordPickleballRally(m, side));
  }, [onChange]);

  if (match.runtimeState?.kind !== 'pickleball' || match.settings.kind !== 'pickleball') return null;
  const state = match.runtimeState.score;
  const rules = match.settings.rules;

  const complete = isPickleballMatchComplete(rules, state);
  const caption = complete
    ? `${name(match, state.playerGames > state.opponentGames ? 'player' : 'opponent')} won the match`
    : isPickleballMatchPoint(rules, state) ? 'Match point'
    : isPickleballGamePoint(rules, state) ? 'Game point'
    : '';

  return (
    <div className="sc-wrap">
      <header className="sc-head">
        <span className="sc-tally">
          Games {state.playerGames} – {state.opponentGames} · {scoreCall(state)}
        </span>
        {caption ? <span className="sc-caption">{caption}</span> : null}
      </header>

      {/* Both sides stay tappable: in side-out scoring a rally won by the
          receiving side is what ends the serve, so the receiver's button is not a
          scoring button — it is how a side out gets recorded. */}
      <div className="sc-zones">
        <ScoreButton
          name={name(match, 'player')}
          score={state.playerPoints}
          serving={state.servingSide === 'player'}
          disabled={complete}
          onScore={() => rally('player')}
        />
        <ScoreButton
          name={name(match, 'opponent')}
          score={state.opponentPoints}
          serving={state.servingSide === 'opponent'}
          disabled={complete}
          onScore={() => rally('opponent')}
        />
      </div>

      <p className="sp-note sc-hint">Tap whoever won the rally — a rally won by the receiving side is a side out.</p>

      <footer className="sc-foot">
        <button className="sc-ghost" onClick={() => onChange(undoPickleballRally)}
                disabled={match.pickleballUndoStack.length === 0}>
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
