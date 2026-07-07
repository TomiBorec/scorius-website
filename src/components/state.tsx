'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

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
  theme: Theme;
  toggleTheme: () => void;
  sport: Sport;
  setSport: (s: Sport) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
};

const AppContext = createContext<AppState | null>(null);

/**
 * Single source of truth for theme + sport. Both are mirrored onto
 * <html data-theme data-sport> (so the CSS token / accent system reacts) and
 * persisted to localStorage. Initial values are read from the attributes the
 * inline bootstrap script already applied, mirroring the prototype's behaviour.
 */
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [sport, setSportState] = useState<Sport>('badminton');
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    const root = document.documentElement;
    const t = root.dataset.theme;
    if (t === 'light' || t === 'dark') setTheme(t);
    const s = root.dataset.sport as Sport | undefined;
    if (s && SPORTS.includes(s)) setSportState(s);
    const l = root.lang as Lang;
    if (l === 'cs' || l === 'en') setLangState(l);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {}
      return next;
    });
  }, []);

  const setSport = useCallback((s: Sport) => {
    setSportState(s);
    document.documentElement.dataset.sport = s;
    try {
      localStorage.setItem(SPORT_STORAGE_KEY, s);
    } catch {}
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    document.documentElement.lang = l;
    try {
      localStorage.setItem(LANG_STORAGE_KEY, l);
    } catch {}
  }, []);

  return (
    <AppContext.Provider value={{ theme, toggleTheme, sport, setSport, lang, setLang }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used inside AppProvider');
  return ctx;
}
