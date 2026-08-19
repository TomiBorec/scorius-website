'use client';

/* ============================================================
   Per-hole par.

   A real course is 4-4-3-5-4-…, not one number repeated. The app edits
   this as eighteen stepper rows; on a phone that is a scroll, so this
   is a grid instead — one chip per hole, tapped to cycle its par.

   Tap cycles rather than steps because par has four legal values
   (3...6) and a cycle needs one target instead of two. The value is
   read from current state inside the updater, never from the painted
   chip: the same reason every stepper here reports a direction.
   ============================================================ */

const PAR_MIN = 3;
const PAR_MAX = 6;

export function ParGrid({ pars, onCycle, onSetAll }: {
  pars: number[];
  /** Advance one hole's par to the next legal value. */
  onCycle: (hole: number) => void;
  onSetAll: (par: number) => void;
}) {
  const total = pars.reduce((a, p) => a + p, 0);

  return (
    <div className="rc-row rc-pars">
      <div className="rc-label">
        <span>Par per hole</span>
        <span className="rc-hint">Tap a hole to change its par. Total {total}.</span>
      </div>

      <div className="par-grid">
        {pars.map((par, index) => (
          <button key={index} className={`par-cell p${par}`}
                  onClick={() => onCycle(index)}
                  aria-label={`Hole ${index + 1}, par ${par}. Tap to change.`}>
            <span className="par-hole">{index + 1}</span>
            <span className="par-value">{par}</span>
          </button>
        ))}
      </div>

      <div className="par-presets">
        <span className="rc-hint">Set every hole:</span>
        {[3, 4, 5].map((par) => (
          <button key={par} className="rc-segment" onClick={() => onSetAll(par)}>Par {par}</button>
        ))}
      </div>
    </div>
  );
}

/** The next legal par, wrapping 6 back to 3. */
export function nextPar(current: number): number {
  return current >= PAR_MAX ? PAR_MIN : Math.max(PAR_MIN, current + 1);
}
