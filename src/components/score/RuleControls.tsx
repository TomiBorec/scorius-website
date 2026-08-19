'use client';

/* ============================================================
   The rule editing controls.

   Pure and binding-driven, like `BB3/SportRulesSections.swift`: one
   implementation the setup screen drives, so there is a single place a
   rule's range and wording live. Every value routes through its
   engine's `normalise*` before it is used, so a number typed here can
   be out of range without producing an impossible match.
   ============================================================ */

/**
 * A stepper that can only report a **direction**, never a finished number.
 *
 * That restriction is the whole design. Three separate controls in this app have
 * shipped the same bug: compute `value + 1` from the rendered value, and several
 * taps landing in one React batch all read the same snapshot, so ten taps move
 * the number by one. Handing back `-1` / `+1` and applying it against current
 * state makes that mistake unavailable rather than merely fixed — there is no
 * `next` for a caller to compute wrongly.
 *
 * `min` and `max` are still passed so the buttons can disable at the ends; the
 * real clamping belongs to whoever owns the value.
 */
export function Stepper({ label, hint, value, min, max, step = 1, onStep, format }: {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onStep: (delta: number) => void;
  format?: (value: number) => string;
}) {
  return (
    <div className="rc-row">
      <div className="rc-label">
        <span>{label}</span>
        {hint ? <span className="rc-hint">{hint}</span> : null}
      </div>
      <div className="rc-stepper">
        <button className="rc-step" aria-label={`Decrease ${label}`} disabled={value <= min}
                onClick={() => onStep(-step)}>−</button>
        <span className="rc-value">{format ? format(value) : value}</span>
        <button className="rc-step" aria-label={`Increase ${label}`} disabled={value >= max}
                onClick={() => onStep(step)}>+</button>
      </div>
    </div>
  );
}

export function Switch({ label, hint, value, onChange }: {
  label: string; hint?: string; value: boolean; onChange: (next: boolean) => void;
}) {
  return (
    <label className="rc-row rc-switch">
      <div className="rc-label">
        <span>{label}</span>
        {hint ? <span className="rc-hint">{hint}</span> : null}
      </div>
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
      <span className="rc-track" aria-hidden="true" />
    </label>
  );
}

export function Segmented<T extends string>({ label, value, options, onChange }: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (next: T) => void;
}) {
  return (
    <div className="rc-row rc-segmented-row">
      <div className="rc-label"><span>{label}</span></div>
      <div className="rc-segmented" role="radiogroup" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.value}
            className={`rc-segment${option.value === value ? ' on' : ''}`}
            role="radio" aria-checked={option.value === value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Minutes, for the clocked sports' durations, which are stored in seconds. */
export const minutes = (seconds: number) => `${Math.round(seconds / 60)} min`;
