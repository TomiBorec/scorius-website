'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAppState } from '@/components/state';
import { useMatch, type MatchVM } from '@/hooks/useMatch';

/**
 * One live match for the whole page.
 *
 * Every device mockup used to call useMatch() for itself, so /features showed
 * a Watch, an iPhone and a Live Activity of the same app running three
 * different scores side by side. They now read one shared view model.
 *
 * The engine only runs while something is actually rendering a device: pages
 * with no mockups (legal, imprint) never start a timer.
 */
const VmContext = createContext<MatchVM | null>(null);
const RegisterContext = createContext<(() => () => void) | null>(null);

export function MatchProvider({ children }: { children: React.ReactNode }) {
  const { sport } = useAppState();
  const [consumers, setConsumers] = useState(0);
  const vm = useMatch(sport, consumers > 0);

  const register = useCallback(() => {
    setConsumers((n) => n + 1);
    return () => setConsumers((n) => n - 1);
  }, []);

  return (
    <RegisterContext.Provider value={register}>
      <VmContext.Provider value={vm}>{children}</VmContext.Provider>
    </RegisterContext.Provider>
  );
}

/** Subscribe to the shared match; mounting this is what starts the engine. */
export function useMatchVm(): MatchVM {
  const vm = useContext(VmContext);
  const register = useContext(RegisterContext);
  if (!vm || !register) throw new Error('useMatchVm must be used inside MatchProvider');

  // Ref keeps the effect from re-running when `register`'s identity is stable
  // but React strict-mode double-invokes it.
  const registered = useRef(false);
  useEffect(() => {
    if (registered.current) return;
    registered.current = true;
    const unregister = register();
    return () => {
      registered.current = false;
      unregister();
    };
  }, [register]);

  return vm;
}
