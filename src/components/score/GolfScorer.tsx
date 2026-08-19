'use client';

/* ============================================================
   The golf scorer — golf and disc golf.

   Per-hole rather than per-point, and the only screen here where the
   scoring subject is a *flight* rather than two sides. Everyone plays
   their own ball, so every row carries its own strokes and its own
   score to par — the same rule the Live Activity and the spectate board
   follow, and the one this app got wrong until build 367.

   Nothing about the layout treats slot 0 as special beyond the "You"
   label: a shared figure over several names would be a fiction.
   ============================================================ */

import { useCallback, useState } from 'react';
import { adjustGolfStroke, golfSetHole, undoGolfStroke, type ActiveMatch } from '@/engine/active';
import {
  canAdvanceHole, canRetreatHole, holesPlayed, isGolfMatchComplete, playedPar,
  strokes, toParText, totalStrokes,
} from '@/engine/golf';

export function GolfScorer({ match, onChange, onEnd }: {
  match: ActiveMatch;
  onChange: (updater: (m: ActiveMatch) => ActiveMatch) => void;
  onEnd: () => void;
}) {
  const [names] = useState<string[]>(() => flightNames(match));

  // Delta, not a finished value: several taps in one React batch must each see
  // the stroke the last one added, or a fast tapper loses shots.
  const bump = useCallback((slot: number, hole: number, delta: number) => {
    onChange((m) => adjustGolfStroke(m, slot, hole, delta));
  }, [onChange]);

  if (match.runtimeState?.kind !== 'golf' || match.settings.kind !== 'golf') return null;
  const state = match.runtimeState.score;
  const rules = match.settings.rules;
  const hole = state.currentHole;
  const par = rules.pars[hole - 1] ?? 4;
  const complete = isGolfMatchComplete(rules, state);

  return (
    <div className="sc-wrap">
      <header className="sc-head">
        <span className="sc-tally">Hole {hole} of {rules.holeCount}</span>
        <span className="sc-caption">Par {par}</span>
      </header>

      <ul className="sc-flightlist">
        {state.playerStrokes.map((row, slot) => {
          const onThisHole = strokes(state, slot, hole);
          const total = totalStrokes(state, slot);
          const toPar = total - playedPar(rules, holesPlayed(state, slot));
          return (
            <li key={slot} className="sc-flightrow">
              <div className="sc-flightrow-name">
                <span>{names[slot]}</span>
                {slot === 0 ? <span className="sc-you">You</span> : null}
              </div>
              <div className="sc-stepper">
                <button className="sc-step" aria-label={`One less stroke for ${names[slot]}`}
                        disabled={onThisHole === 0}
                        onClick={() => bump(slot, hole, -1)}>−</button>
                <span className="sc-step-value">{onThisHole}</span>
                <button className="sc-step" aria-label={`One more stroke for ${names[slot]}`}
                        onClick={() => bump(slot, hole, +1)}>+</button>
              </div>
              <div className="sc-flightrow-total">
                <span className="sc-flightrow-strokes">{total}</span>
                <span className={`sc-flightrow-topar ${tone(toPar)}`}>{toParText(toPar)}</span>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="sc-foot">
        <button className="sc-ghost" disabled={!canRetreatHole(state)}
                onClick={() => onChange((m) => golfSetHole(m, hole - 1))}>
          Previous hole
        </button>
        <button className="sc-primary sc-inline" disabled={!canAdvanceHole(rules, state)}
                onClick={() => onChange((m) => golfSetHole(m, hole + 1))}>
          Next hole
        </button>
      </div>

      {complete ? <p className="sc-caption sc-hint">Round complete</p> : null}

      <div className="sc-foot">
        <button className="sc-ghost" onClick={() => onChange(undoGolfStroke)}
                disabled={match.golfUndoStack.length === 0}>
          Undo
        </button>
        <button className="sc-ghost danger" onClick={onEnd}>End round</button>
      </div>
    </div>
  );
}

function tone(toPar: number): 'under' | 'even' | 'over' {
  return toPar < 0 ? 'under' : toPar > 0 ? 'over' : 'even';
}

/**
 * Names for the flight.
 *
 * Slot 0 is whoever set the round up; the rest are unnamed unless the setup
 * screen collected them. Numbered rather than left blank, so a row is always
 * identifiable — an anonymous row in a four-ball is unusable.
 */
function flightNames(match: ActiveMatch): string[] {
  const count = match.runtimeState?.kind === 'golf' ? match.runtimeState.score.playerStrokes.length : 1;
  const given = [match.side1Name?.trim(), match.side2Name?.trim()];
  return Array.from({ length: count }, (_, i) => given[i] || `Player ${i + 1}`);
}
