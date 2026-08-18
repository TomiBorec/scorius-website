'use client';

/* ============================================================
   The scoring control.

   A whole half of the screen, not a button in a row of buttons: you tap
   this while holding a racket, without looking. Everything else on the
   scorer is smaller than this on purpose.
   ============================================================ */

export function ScoreButton({ name, score, serving, disabled, onScore, sub }: {
  name: string;
  score: number;
  serving?: boolean;
  disabled?: boolean;
  sub?: string;
  onScore: () => void;
}) {
  return (
    <button className="sc-zone" onClick={onScore} disabled={disabled}
            aria-label={`Point to ${name}`}>
      <span className="sc-zone-name">
        {serving ? <span className="sc-serve" aria-label="Serving" /> : null}
        {name}
      </span>
      <span className="sc-zone-score">{score}</span>
      {sub ? <span className="sc-zone-sub">{sub}</span> : null}
    </button>
  );
}
