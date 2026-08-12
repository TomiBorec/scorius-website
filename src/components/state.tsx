'use client';

import { createContext, useCallback, useContext, useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';
export type Sport =
  | 'badminton'
  | 'tennis'
  | 'padel'
  | 'pickleball'
  | 'squash'
  | 'tableTennis'
  | 'volleyball'
  | 'basketball'
  | 'football'
  | 'floorball'
  | 'golf';
export type Lang = 'cs' | 'en';

export const SPORTS: Sport[] = [
  'badminton',
  'tennis',
  'padel',
  'pickleball',
  'squash',
  'tableTennis',
  'volleyball',
  // todo: add cricket 🏏
  'basketball',
  'football',
  'floorball',
  'golf',
];
export const LANGS: Lang[] = ['cs', 'en'];

export const THEME_STORAGE_KEY = 'scorius-theme';
export const SPORT_STORAGE_KEY = 'scorius-sport';
export const LANG_STORAGE_KEY = 'scorius-lang';

type AppState = {
  /** Flips <html data-theme>; nothing renders from theme in React (see below). */
  toggleTheme: () => void;
  sport: Sport;
  setSport: (s: Sport) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
};

const AppContext = createContext<AppState | null>(null);

/* ---- Attribute store ----
   <html data-sport> and <html lang> are the source of truth: the pre-paint
   bootstrap script writes them from localStorage before anything renders, and
   the CSS accent system already keys off them. React subscribes to those
   attributes instead of keeping a second copy in state — the old version
   rendered the defaults first and corrected itself in an effect, which cost a
   cascading render on every mount. */
const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};
const emit = () => listeners.forEach((l) => l());

const readSport = (): Sport => {
  const s = document.documentElement.dataset.sport as Sport | undefined;
  return s && SPORTS.includes(s) ? s : 'badminton';
};
const readLang = (): Lang => {
  const l = document.documentElement.lang as Lang;
  return l === 'cs' || l === 'en' ? l : 'en';
};
/* Static export has no per-request language, so the server snapshot is the
   same default the prerendered HTML contains. */
const serverSport = (): Sport => 'badminton';
const serverLang = (): Lang => 'en';

/**
 * Single source of truth for theme, sport and language — all three live on the
 * <html> element and in localStorage, so the CSS token / accent system and
 * React always agree, and the first painted frame is already correct.
 */
export function AppProvider({ children }: { children: React.ReactNode }) {
  const sport = useSyncExternalStore(subscribe, readSport, serverSport);
  const lang = useSyncExternalStore(subscribe, readLang, serverLang);

  /**
   * The theme deliberately has no React state. Everything theme-dependent —
   * colours, the App Store badge, the toggle's own icon and label — is styled
   * off <html data-theme>, which the pre-paint bootstrap script sets. Mirroring
   * it into state meant React rendered 'light' first and corrected itself after
   * hydration, which flashed the wrong badge and icon on every dark load.
   */
  const toggleTheme = useCallback(() => {
    const root = document.documentElement;
    const next: Theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {}
  }, []);

  const setSport = useCallback((s: Sport) => {
    document.documentElement.dataset.sport = s;
    try {
      localStorage.setItem(SPORT_STORAGE_KEY, s);
    } catch {}
    emit();
  }, []);

  const setLang = useCallback((l: Lang) => {
    document.documentElement.lang = l;
    try {
      localStorage.setItem(LANG_STORAGE_KEY, l);
    } catch {}
    emit();
  }, []);

  return (
    <AppContext.Provider value={{ toggleTheme, sport, setSport, lang, setLang }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used inside AppProvider');
  return ctx;
}
