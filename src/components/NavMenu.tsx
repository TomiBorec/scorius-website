'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { APPSTORE_URL } from './constants';
import { useI18n } from '@/i18n';

export type NavItem = { href: string; label: string };

function MenuGlyph({ open }: { open: boolean }) {
  // Two bars that rotate into an ✕ — the same two strokes travel both ways,
  // so opening and closing run the identical path in reverse.
  return (
    <svg className="menu-glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d={open ? 'M6 6l12 12' : 'M4 8h16'} />
      <path d={open ? 'M18 6L6 18' : 'M4 16h16'} />
    </svg>
  );
}

/**
 * Below 860px the inline nav links are hidden, so they live here instead.
 *
 * The panel is anchored to its trigger (transform-origin top right) and
 * materialises — blur and scale together, not a bare opacity fade — then
 * dismisses back along the same path. Escape returns focus to the trigger.
 */
export function NavMenu({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // The menu remembers which route it was opened on, so navigating anywhere
  // closes it as a plain render-time derivation — no effect, no extra render.
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const open = openedAt === pathname;
  const setOpen = (next: boolean) => setOpenedAt(next ? pathname : null);

  useEffect(() => {
    if (!open) return;
    // setOpenedAt is a stable setter, so the effect never needs to re-subscribe.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenedAt(null);
        btnRef.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!panelRef.current?.contains(target) && !btnRef.current?.contains(target)) setOpenedAt(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className="menu-btn"
        aria-expanded={open}
        aria-controls="nav-menu-panel"
        aria-label={open ? t.navMenu.close : t.navMenu.open}
        onClick={() => setOpen(!open)}
      >
        <MenuGlyph open={open} />
      </button>

      <div
        id="nav-menu-panel"
        ref={panelRef}
        className={`nav-menu${open ? ' open' : ''}`}
        // Keeps the links out of the tab order and the a11y tree while closed.
        inert={!open}
      >
        <nav aria-label={t.navMenu.label}>
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className={`nav-menu-link${pathname === it.href ? ' active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {it.label}
            </Link>
          ))}
          {/* The nav CTA is dropped on narrow screens where the row cannot fit
              brand + language + theme + button + trigger, so it lives here. */}
          <a
            className="nav-menu-link nav-menu-cta"
            href={APPSTORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
          >
            {t.nav.download}
          </a>
        </nav>
      </div>
    </>
  );
}
