'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { SPORTS, useAppState, type Sport } from './state';
import { SportIcon } from './icons';
import { useI18n } from '@/i18n';
import {
  Spring,
  SPRING_MOVE,
  VelocityTracker,
  prefersReducedMotion,
  project,
  rubberband,
  springLoop,
} from '@/lib/spring';

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Segmented sport picker.
 *
 * The selection is a single sliding thumb rather than eleven independently
 * recolouring pills: it moves on a spring, can be grabbed and dragged, and on
 * release projects its momentum to decide which segment it lands on. Colour
 * lives entirely in CSS tokens (`--s-<sport>`) so light and dark each get a
 * swatch that clears contrast — the pill label sits on the neutral thumb, not
 * on a saturated fill.
 *
 * When the track overflows (narrow viewports) the horizontal gesture belongs to
 * the scroller, so thumb-dragging is disabled there and the active segment is
 * scrolled into view instead.
 */
export function SportSwitch() {
  const { sport, setSport } = useAppState();
  const { t } = useI18n();

  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLSpanElement>(null);
  const pillRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const activeIndex = Math.max(0, SPORTS.indexOf(sport));
  const [candidate, setCandidate] = useState<number | null>(null);
  /** Drives the scroll edge fade — only meaningful when the track actually scrolls. */
  const [overflowing, setOverflowing] = useState(false);

  const xSpring = useRef<Spring | null>(null);
  const wSpring = useRef<Spring | null>(null);
  const loop = useRef<ReturnType<typeof springLoop> | null>(null);
  const tracker = useRef(new VelocityTracker());
  const drag = useRef<{ id: number; grabOffset: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const mounted = useRef(false);

  /** Push the spring values to the DOM. Never goes through React — this runs per frame. */
  const write = useCallback(() => {
    const thumb = thumbRef.current;
    const x = xSpring.current;
    const w = wSpring.current;
    if (!thumb || !x || !w) return;
    thumb.style.transform = `translate3d(${x.value}px,0,0)`;
    thumb.style.width = `${w.value}px`;
  }, []);

  const ensureSprings = useCallback(() => {
    if (xSpring.current && wSpring.current) return true;
    const pill = pillRefs.current[activeIndex];
    if (!pill) return false;
    xSpring.current = new Spring(pill.offsetLeft, SPRING_MOVE);
    wSpring.current = new Spring(pill.offsetWidth, SPRING_MOVE);
    return true;
  }, [activeIndex]);

  /** Move the thumb to segment `index`, on a spring or instantly. */
  const applyTo = useCallback(
    (index: number, animate: boolean) => {
      const pill = pillRefs.current[index];
      const thumb = thumbRef.current;
      if (!pill || !thumb || !ensureSprings()) return;
      const x = xSpring.current!;
      const w = wSpring.current!;

      if (animate && !prefersReducedMotion()) {
        // setTarget keeps value + velocity, so an in-flight thumb is redirected
        // rather than restarted.
        x.setTarget(pill.offsetLeft);
        w.setTarget(pill.offsetWidth);
        loop.current?.kick();
      } else {
        x.jumpTo(pill.offsetLeft);
        w.jumpTo(pill.offsetWidth);
        write();
      }
      thumb.style.opacity = '1';
    },
    [ensureSprings, write],
  );

  /** Keep the selected segment visible when the track scrolls horizontally. */
  const revealActive = useCallback(
    (index: number, animate: boolean) => {
      const track = trackRef.current;
      const pill = pillRefs.current[index];
      if (!track || !pill) return;
      if (track.scrollWidth <= track.clientWidth + 1) return;
      const left = pill.offsetLeft - (track.clientWidth - pill.offsetWidth) / 2;
      track.scrollTo({
        left: Math.max(0, left),
        behavior: animate && !prefersReducedMotion() ? 'smooth' : 'auto',
      });
    },
    [],
  );

  // rAF driver
  useEffect(() => {
    loop.current = springLoop((dt) => {
      const x = xSpring.current;
      const w = wSpring.current;
      if (!x || !w) return false;
      x.advance(dt);
      w.advance(dt);
      write();
      return !(x.settled && w.settled);
    });
    return () => loop.current?.stop();
  }, [write]);

  // Position on mount, then animate on every later selection change.
  useIsoLayoutEffect(() => {
    applyTo(activeIndex, mounted.current);
    revealActive(activeIndex, mounted.current);
    mounted.current = true;
  }, [activeIndex, applyTo, revealActive]);

  // Re-measure when the track resizes or webfonts land and change pill widths.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const resync = () => {
      setOverflowing(track.scrollWidth > track.clientWidth + 1);
      if (drag.current) return;
      applyTo(activeIndex, false);
    };
    const ro = new ResizeObserver(resync);
    ro.observe(track);
    for (const p of pillRefs.current) if (p) ro.observe(p);
    document.fonts?.ready.then(resync).catch(() => {});
    return () => ro.disconnect();
  }, [activeIndex, applyTo]);

  /** Segment whose centre is nearest `centre` (in track content coordinates). */
  const nearestIndex = useCallback((centre: number) => {
    let best = 0;
    let bestDist = Infinity;
    pillRefs.current.forEach((p, i) => {
      if (!p) return;
      const d = Math.abs(p.offsetLeft + p.offsetWidth / 2 - centre);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    return best;
  }, []);

  const contentX = (clientX: number) => {
    const track = trackRef.current!;
    const rect = track.getBoundingClientRect();
    return clientX - rect.left - track.clientLeft + track.scrollLeft;
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLButtonElement>, index: number) => {
    const track = trackRef.current;
    if (!track || index !== activeIndex || e.button !== 0) return;
    // A scrollable track owns the horizontal gesture; don't compete with it.
    if (track.scrollWidth > track.clientWidth + 1) return;
    if (!ensureSprings()) return;

    loop.current?.stop();
    tracker.current.reset();
    tracker.current.add(e.clientX, e.timeStamp);
    drag.current = {
      id: e.pointerId,
      grabOffset: contentX(e.clientX) - xSpring.current!.value,
      moved: false,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    const track = trackRef.current;
    if (!d || d.id !== e.pointerId || !track) return;

    const x = xSpring.current!;
    const w = wSpring.current!;
    let next = contentX(e.clientX) - d.grabOffset;

    const first = pillRefs.current[0];
    const last = pillRefs.current[SPORTS.length - 1];
    if (first && last) {
      const min = first.offsetLeft;
      const max = last.offsetLeft + last.offsetWidth - w.value;
      // Resist progressively past the ends instead of stopping dead.
      if (next < min) next = min - rubberband(min - next, track.clientWidth);
      else if (next > max) next = max + rubberband(next - max, track.clientWidth);
    }

    if (!d.moved && Math.abs(next - x.value) > 2) d.moved = true;
    x.value = next;
    write();
    tracker.current.add(e.clientX, e.timeStamp);

    const idx = nearestIndex(next + w.value / 2);
    setCandidate((prev) => (prev === idx ? prev : idx));
  };

  const endDrag = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    setCandidate(null);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (!d.moved) return;

    suppressClick.current = true;
    const x = xSpring.current!;
    const w = wSpring.current!;
    const velocity = tracker.current.velocity;
    // Land where the flick was heading, not where the finger left off.
    const index = nearestIndex(x.value + project(velocity) + w.value / 2);

    x.setVelocity(velocity);
    applyTo(index, true);
    if (SPORTS[index] !== sport) setSport(SPORTS[index]);
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const last = SPORTS.length - 1;
    let next: number | null = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = activeIndex === last ? 0 : activeIndex + 1;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = activeIndex === 0 ? last : activeIndex - 1;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = last;
    if (next === null) return;
    e.preventDefault();
    setSport(SPORTS[next]);
    pillRefs.current[next]?.focus();
  };

  const select = (s: Sport) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    setSport(s);
  };

  return (
    <div
      className="sport-switch"
      ref={trackRef}
      data-overflow={overflowing}
      role="radiogroup"
      aria-label={t.switchStrip.hint}
      onKeyDown={onKeyDown}
    >
      <span className="sport-thumb" ref={thumbRef} aria-hidden="true" />
      {SPORTS.map((s, i) => {
        const active = i === activeIndex;
        return (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            ref={(el) => {
              pillRefs.current[i] = el;
            }}
            className={`sport-pill${active ? ' active' : ''}${candidate === i ? ' candidate' : ''}`}
            style={{ ['--pill-accent' as string]: `var(--s-${s})` }}
            onPointerDown={(e) => onPointerDown(e, i)}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onClick={() => select(s)}
          >
            <SportIcon sport={s} className="si" />
            {t.sports[s]}
          </button>
        );
      })}
    </div>
  );
}
