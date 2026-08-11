/**
 * Spring physics in Apple's parameterisation (damping ratio + response), plus
 * the momentum-projection and rubber-band functions from *Designing Fluid
 * Interfaces*. Dependency-free on purpose — the site ships three runtime
 * packages and this is ~100 lines.
 *
 * A spring rather than a fixed-duration curve because a spring is inherently
 * interruptible: re-targeting mid-flight keeps the current value *and* the
 * current velocity, so a grabbed animation follows the finger instead of
 * jumping or finishing first.
 */

export type SpringOptions = {
  /** Damping ratio. 1 = critically damped (no overshoot); < 1 overshoots. */
  damping?: number;
  /** Seconds to reach the target. Not a duration — settle time emerges. */
  response?: number;
};

/** Apple's shipped values, from the WWDC 2018 talk. */
export const SPRING_MOVE: SpringOptions = { damping: 1.0, response: 0.4 };
export const SPRING_SHEET: SpringOptions = { damping: 0.8, response: 0.3 };

const SETTLE_VALUE = 0.05;
const SETTLE_VELOCITY = 0.05;
/** Fixed sub-step keeps integration stable when frames are long. */
const SUB_STEP = 1 / 240;
/** Never integrate more than this per frame (tab was backgrounded). */
const MAX_FRAME = 0.064;

export class Spring {
  value: number;
  velocity = 0;
  target: number;
  damping: number;
  response: number;

  constructor(initial: number, options: SpringOptions = {}) {
    this.value = initial;
    this.target = initial;
    this.damping = options.damping ?? 1;
    this.response = options.response ?? 0.4;
  }

  /**
   * Re-target while preserving value and velocity. This is the interruption
   * path: the motion stays continuous across a reversal instead of hitting the
   * "brick wall" a hard animation swap produces.
   */
  setTarget(target: number, options?: SpringOptions) {
    this.target = target;
    if (options?.damping !== undefined) this.damping = options.damping;
    if (options?.response !== undefined) this.response = options.response;
  }

  /** Hand the gesture's release velocity to the spring (px/s). */
  setVelocity(velocity: number) {
    this.velocity = velocity;
  }

  /** Jump to a value, killing motion. Use for resize/layout re-sync, not for animation. */
  jumpTo(value: number) {
    this.value = value;
    this.target = value;
    this.velocity = 0;
  }

  get settled() {
    return (
      Math.abs(this.velocity) < SETTLE_VELOCITY &&
      Math.abs(this.target - this.value) < SETTLE_VALUE
    );
  }

  /** Integrate by `dt` seconds. Returns the new value. */
  advance(dt: number) {
    const omega = (2 * Math.PI) / this.response;
    const k = omega * omega;
    const c = 2 * this.damping * omega;

    let remaining = Math.min(dt, MAX_FRAME);
    while (remaining > 0) {
      const h = Math.min(remaining, SUB_STEP);
      // Semi-implicit Euler: velocity first, then position from the new velocity.
      const accel = -k * (this.value - this.target) - c * this.velocity;
      this.velocity += accel * h;
      this.value += this.velocity * h;
      remaining -= h;
    }

    if (this.settled) {
      this.value = this.target;
      this.velocity = 0;
    }
    return this.value;
  }
}

/**
 * requestAnimationFrame driver. `step(dt)` returns true to keep going.
 * `kick()` is idempotent — safe to call on every gesture event.
 */
export function springLoop(step: (dt: number) => boolean) {
  let raf = 0;
  let last = 0;

  const frame = (now: number) => {
    const dt = last ? (now - last) / 1000 : 1 / 60;
    last = now;
    if (step(dt)) {
      raf = requestAnimationFrame(frame);
    } else {
      raf = 0;
      last = 0;
    }
  };

  return {
    kick() {
      if (!raf) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    },
    stop() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
    },
  };
}

/**
 * Where a flick would come to rest, so we can snap to the target nearest the
 * *projection* rather than the nearest to the release point. This is the
 * exponential-decay form Apple ships, not the v²/2a textbook one.
 */
export function project(initialVelocity: number, decelerationRate = 0.998) {
  return ((initialVelocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/** Progressive resistance past a boundary — real things slow before they stop. */
export function rubberband(overshoot: number, dimension: number, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

/** Tracks the last few pointer samples so release velocity is a trend, not one frame. */
export class VelocityTracker {
  private samples: { v: number; t: number }[] = [];

  add(value: number, time: number) {
    this.samples.push({ v: value, t: time });
    if (this.samples.length > 6) this.samples.shift();
  }

  reset() {
    this.samples = [];
  }

  /** px per second, measured over the most recent ~100ms of travel. */
  get velocity() {
    const s = this.samples;
    if (s.length < 2) return 0;
    const last = s[s.length - 1];
    let first = s[0];
    for (let i = s.length - 1; i >= 0; i--) {
      if (last.t - s[i].t > 100) break;
      first = s[i];
    }
    const dt = last.t - first.t;
    if (dt <= 0) return 0;
    return ((last.v - first.v) / dt) * 1000;
  }
}

export function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
