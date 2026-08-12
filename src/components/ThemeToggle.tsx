'use client';

import { useAppState } from './state';
import { MoonIcon, SunIcon } from './icons';
import { useI18n } from '@/i18n';

/**
 * Icon and label are both theme-conditional in CSS rather than in React state,
 * so the button is correct on the first painted frame. The accessible name
 * comes from whichever label is displayed — `display:none` keeps the other one
 * out of the accessibility tree.
 */
export function ThemeToggle() {
  const { toggleTheme } = useAppState();
  const { t } = useI18n();
  return (
    <button type="button" className="theme-btn" onClick={toggleTheme}>
      <span data-theme-only="light">
        <SunIcon />
      </span>
      <span data-theme-only="dark">
        <MoonIcon />
      </span>
      <span className="sr-only" data-theme-only="light">
        {t.themeToggle.toDark}
      </span>
      <span className="sr-only" data-theme-only="dark">
        {t.themeToggle.toLight}
      </span>
    </button>
  );
}
