'use client';

import { useCallback, useEffect, useRef, type KeyboardEvent } from 'react';
import { SPORTS, useAppState } from './state';
import { SportIcon } from './icons';
import { useI18n } from '@/i18n';

/**
 * Segmented sport picker.
 *
 * Colour is not set here — each button carries `data-sport`, which resolves
 * --accent / --accent-on from globals.css for the active theme, so the palette
 * lives in exactly one place and every pill is contrast-safe in light and dark.
 *
 * ARIA: a radiogroup (one of N, no owned panels) rather than a tablist —
 * with roving tabindex and arrow-key navigation, which is what the role
 * promises. Selection follows focus, per the radiogroup pattern.
 */
export function SportSwitch() {
  const { sport, setSport } = useAppState();
  const { t } = useI18n();
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  // Flag which edges have content off-screen, so the CSS can fade only those.
  const syncEdges = useCallback(() => {
    const track = trackRef.current;
    const wrap = wrapRef.current;
    if (!track || !wrap) return;
    const max = track.scrollWidth - track.clientWidth;
    const flags = [];
    if (track.scrollLeft > 2) flags.push('start');
    if (track.scrollLeft < max - 2) flags.push('end');
    wrap.dataset.scroll = flags.join(' ');
  }, []);

  useEffect(() => {
    syncEdges();
    const track = trackRef.current;
    track?.addEventListener('scroll', syncEdges, { passive: true });
    window.addEventListener('resize', syncEdges);
    return () => {
      track?.removeEventListener('scroll', syncEdges);
      window.removeEventListener('resize', syncEdges);
    };
  }, [syncEdges]);

  // Keep the selected pill in view when the selection changes from elsewhere
  // (deep link, persisted choice) or when the track is too narrow to show all.
  useEffect(() => {
    const el = trackRef.current?.querySelector<HTMLElement>('.sport-pill.active');
    el?.scrollIntoView({ inline: 'nearest', block: 'nearest' });
    syncEdges();
  }, [sport, syncEdges]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = SPORTS.indexOf(sport);
    let next = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % SPORTS.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + SPORTS.length) % SPORTS.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = SPORTS.length - 1;
    if (next < 0) return;
    e.preventDefault();
    setSport(SPORTS[next]);
    // Focus follows selection so the roving tabindex stays coherent.
    requestAnimationFrame(() => {
      trackRef.current?.querySelector<HTMLElement>('.sport-pill.active')?.focus();
    });
  };

  return (
    <div className="sport-switch-wrap" ref={wrapRef}>
      <div
        className="sport-switch"
        ref={trackRef}
        role="radiogroup"
        aria-label={t.switchStrip.hint}
        onKeyDown={onKeyDown}
      >
        {SPORTS.map((s) => {
          const active = sport === s;
          return (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={active ? 0 : -1}
              data-sport={s}
              className={`sport-pill${active ? ' active' : ''}`}
              onClick={() => setSport(s)}
            >
              <SportIcon sport={s} className="si" />
              {t.sports[s]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
