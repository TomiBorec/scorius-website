'use client';

import { useEffect, useMemo, useState } from 'react';

export type MatchState = {
  player: number;
  opponent: number;
  playerGames: number;
  opponentGames: number;
  gameMessage: string;
  isGamePoint: boolean;
  isWin: boolean;
  heartRate: number;
  calories: number;
  durationSec: number;
  pulse: 'p' | 'o' | null;
  phase: 'playing';
};

type ScriptStep = {
  dt: number;
  e: 'p' | 'o' | 'gamepoint' | 'gamewon' | 'reset';
};

const INITIAL_STATE: MatchState = {
  player: 0,
  opponent: 0,
  playerGames: 0,
  opponentGames: 0,
  gameMessage: '',
  isGamePoint: false,
  isWin: false,
  heartRate: 142,
  calories: 86,
  durationSec: 17 * 60 + 24,
  pulse: null,
  phase: 'playing',
};

export function useMatchLoop(): MatchState {
  // Pre-baked rally script — must reach 21 with a 2-point lead before 'gamewon'.
  // Counted: player scores 21 times, opponent scores 13 times → final 21–13.
  const script = useMemo<ScriptStep[]>(
    () => [
      { dt: 800, e: 'p' },
      { dt: 900, e: 'o' },
      { dt: 700, e: 'p' }, { dt: 700, e: 'p' },
      { dt: 850, e: 'o' },
      { dt: 700, e: 'p' }, { dt: 750, e: 'p' },
      { dt: 800, e: 'o' },
      { dt: 700, e: 'p' }, { dt: 750, e: 'p' }, { dt: 700, e: 'p' },
      { dt: 800, e: 'o' },
      { dt: 700, e: 'p' }, { dt: 750, e: 'p' },
      { dt: 800, e: 'o' }, { dt: 800, e: 'o' },
      { dt: 700, e: 'p' }, { dt: 750, e: 'p' }, { dt: 700, e: 'p' },
      { dt: 800, e: 'o' },
      { dt: 700, e: 'p' }, { dt: 750, e: 'p' },
      { dt: 800, e: 'o' }, { dt: 800, e: 'o' },
      { dt: 700, e: 'p' }, { dt: 700, e: 'p' }, { dt: 700, e: 'p' },
      { dt: 800, e: 'o' }, { dt: 800, e: 'o' }, { dt: 800, e: 'o' }, { dt: 800, e: 'o' },
      { dt: 700, e: 'p' }, { dt: 700, e: 'p' },
      { dt: 1100, e: 'gamepoint' },
      { dt: 900, e: 'p' },
      { dt: 1400, e: 'gamewon' },
      { dt: 1400, e: 'reset' },
    ],
    [],
  );

  const [state, setState] = useState<MatchState>(INITIAL_STATE);

  useEffect(() => {
    let cancel = false;
    let i = 0;

    const tick = async () => {
      while (!cancel) {
        const step = script[i % script.length];
        await new Promise((r) => setTimeout(r, step.dt));
        if (cancel) return;
        setState((s) => {
          const hr = Math.max(
            132,
            Math.min(168, Math.round(s.heartRate + (Math.random() - 0.5) * 6)),
          );
          const cal = s.calories + 0.4;
          const dur = s.durationSec + 1;

          if (step.e === 'p' || step.e === 'o') {
            const isP = step.e === 'p';
            return {
              ...s,
              player: isP ? s.player + 1 : s.player,
              opponent: isP ? s.opponent : s.opponent + 1,
              pulse: step.e,
              gameMessage: '',
              isGamePoint: false,
              heartRate: hr,
              calories: cal,
              durationSec: dur,
            };
          }
          if (step.e === 'gamepoint') {
            return {
              ...s,
              gameMessage: 'Game point',
              isGamePoint: true,
              heartRate: hr,
              calories: cal,
              durationSec: dur,
            };
          }
          if (step.e === 'gamewon') {
            return {
              ...s,
              gameMessage: 'You won the game!',
              isGamePoint: false,
              isWin: true,
              heartRate: hr,
              calories: cal,
              durationSec: dur,
            };
          }
          if (step.e === 'reset') {
            // Best-of-three: cycle 0 → 1 → 2, then start a fresh match.
            // Without the wrap the counter climbs unbounded as the demo loops.
            return {
              ...s,
              player: 0,
              opponent: 0,
              playerGames: (s.playerGames + 1) % 3,
              gameMessage: '',
              isGamePoint: false,
              isWin: false,
              pulse: null,
              heartRate: 138,
              calories: cal,
              durationSec: dur,
            };
          }
          return s;
        });
        i++;
      }
    };

    tick();
    return () => {
      cancel = true;
    };
  }, [script]);

  return state;
}
