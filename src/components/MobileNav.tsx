'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { APPSTORE_URL } from './constants';
import { useI18n } from '@/i18n';
import {
  Spring,
  SPRING_SHEET,
  VelocityTracker,
  prefersReducedMotion,
  project,
  rubberband,
  springLoop,
} from '@/lib/spring';

/** Past this fraction of the sheet's height, a slow release still dismisses. */
const DISMISS_FRACTION = 0.4;
/** Below this movement the gesture is still a tap, not a drag. */
const DRAG_THRESHOLD = 8;
/** Cross-fade length used only under prefers-reduced-motion. */
const REDUCED_FADE_MS = 200;

/**
 * Navigation for viewports where the inline links don't fit.
 *
 * A bottom sheet rather than a dropdown: it arrives and leaves along the same
 * path, tracks the finger 1:1 while dragging, resists past its open position,
 * and on release projects the flick's momentum to decide dismiss vs. settle —
 * so a sheet caught mid-close follows the finger instead of finishing first.
 */
export function MobileNav() {
  const { t } = useI18n();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);

  const y = useRef<Spring | null>(null);
  const height = useRef(0);
  const loop = useRef<ReturnType<typeof springLoop> | null>(null);
  const tracker = useRef(new VelocityTracker());
  const drag = useRef<{ id: number; startY: number; grabValue: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const paint = useCallback(() => {
    const sheet = sheetRef.current;
    const scrim = scrimRef.current;
    const s = y.current;
    if (!sheet || !s) return;
    sheet.style.transform = `translate3d(0,${s.value}px,0)`;
    if (scrim) {
      const h = height.current || 1;
      scrim.style.opacity = String(Math.max(0, Math.min(1, 1 - s.value / h)));
    }
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    const s = y.current;
    if (!s || prefersReducedMotion()) {
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
      fadeTimer.current = setTimeout(() => setMounted(false), prefersReducedMotion() ? REDUCED_FADE_MS : 0);
      return;
    }
    // Same path out as in — the sheet leaves through the edge it came from.
    s.setTarget(height.current);
    loop.current?.kick();
  }, []);

  // rAF driver. Unmounts once a close settles.
  useEffect(() => {
    if (!mounted) return;
    loop.current = springLoop((dt) => {
      const s = y.current;
      if (!s) return false;
      s.advance(dt);
      paint();
      if (!s.settled) return true;
      if (s.target > 0) setMounted(false);
      return false;
    });
    return () => loop.current?.stop();
  }, [mounted, paint]);

  // Measure, park the sheet below the fold, then spring it up.
  useEffect(() => {
    if (!mounted) return;
    const sheet = sheetRef.current;
    if (!sheet) return;
    height.current = sheet.offsetHeight;
    if (prefersReducedMotion()) {
      y.current = new Spring(0, SPRING_SHEET);
      paint();
      return;
    }
    y.current = new Spring(height.current, SPRING_SHEET);
    paint();
    // Next frame, so the parked position is painted before the spring starts.
    const raf = requestAnimationFrame(() => {
      y.current?.setTarget(0);
      loop.current?.kick();
    });
    return () => cancelAnimationFrame(raf);
  }, [mounted, paint]);

  // Lock the page behind the sheet.
  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  // Move focus in on open, hand it back to the trigger on close.
  useEffect(() => {
    if (!open) return;
    const first = sheetRef.current?.querySelector<HTMLElement>('a[href], button:not([disabled])');
    first?.focus();
    return () => triggerRef.current?.focus();
  }, [open]);

  // A route change means the sheet did its job. In-sheet links close it
  // themselves; this covers browser back/forward while it is open. Deferred a
  // frame so the close doesn't cascade off the navigation render.
  useEffect(() => {
    if (!mounted) return;
    const raf = requestAnimationFrame(close);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Widening past the breakpoint brings the inline links back; the sheet would
  // otherwise stay mounted (and keep the page scroll locked) behind them.
  useEffect(() => {
    if (!mounted) return;
    const mq = window.matchMedia('(min-width: 861px)');
    const onChange = () => {
      if (mq.matches) {
        setOpen(false);
        setMounted(false);
      }
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [mounted]);

  useEffect(
    () => () => {
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
    },
    [],
  );

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const s = y.current;
    if (!s || e.button !== 0 || prefersReducedMotion()) return;
    loop.current?.stop();
    tracker.current.reset();
    tracker.current.add(e.clientY, e.timeStamp);
    // Start from the presentation value so grabbing a moving sheet doesn't jump.
    drag.current = { id: e.pointerId, startY: e.clientY, grabValue: s.value, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const s = y.current;
    if (!d || d.id !== e.pointerId || !s) return;

    const delta = e.clientY - d.startY;
    if (!d.moved && Math.abs(delta) < DRAG_THRESHOLD) return;
    d.moved = true;

    let next = d.grabValue + delta;
    // Dragging up past open resists rather than stopping dead.
    if (next < 0) next = -rubberband(-next, height.current || 1);
    s.value = next;
    s.velocity = 0;
    paint();
    tracker.current.add(e.clientY, e.timeStamp);
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const s = y.current;
    if (!d || d.id !== e.pointerId || !s) return;
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (!d.moved) return;

    suppressClick.current = true;
    const velocity = tracker.current.velocity;
    const projected = s.value + project(velocity);
    const dismiss = projected > (height.current || 1) * DISMISS_FRACTION;

    s.setVelocity(velocity);
    if (dismiss) {
      close();
    } else {
      s.setTarget(0);
      loop.current?.kick();
    }
  };

  // A drag that ends over a link must not also follow it.
  const onClickCapture = (e: React.MouseEvent) => {
    if (!suppressClick.current) return;
    suppressClick.current = false;
    e.preventDefault();
    e.stopPropagation();
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    if (e.key !== 'Tab') return;
    const items = sheetRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
    if (!items || items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const links: [string, string][] = [
    ['/features', t.nav.features],
    ['/#sports', t.nav.sports],
    ['/support', t.nav.support],
    ['/privacy', t.nav.privacy],
    ['/accessibility', t.nav.accessibility],
  ];

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="nav-menu-btn"
        aria-label={t.nav.openMenu}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => {
          setMounted(true);
          setOpen(true);
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {mounted && (
        <div className={`sheet-root${open ? ' open' : ''}`}>
          <div className="sheet-scrim" ref={scrimRef} onClick={close} aria-hidden="true" />
          <div
            className="sheet"
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label={t.nav.menuTitle}
            onKeyDown={onKeyDown}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onClickCapture={onClickCapture}
          >
            <div className="sheet-grab" aria-hidden="true" />
            <div className="sheet-links">
              {links.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className={`sheet-link${pathname === href ? ' active' : ''}`}
                  onClick={close}
                >
                  {label}
                </Link>
              ))}
            </div>
            <div className="sheet-foot">
              <a className="btn btn-primary" href={APPSTORE_URL} target="_blank" rel="noopener noreferrer">
                {t.nav.download}
              </a>
              <button type="button" className="btn btn-ghost" onClick={close}>
                {t.nav.closeMenu}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
