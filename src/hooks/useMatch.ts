'use client';

import { useEffect, useState } from 'react';
import type { Sport } from '@/components/state';
import { useI18n, type Dict } from '@/i18n';

/* ============================================================
   Live-match engine — a per-sport state machine.
   Re-expresses scripts/site.js → makeMatch() as a React hook.
   A "point" lands every 2s; a clock ticks every 90ms for the
   timed sports. Each device renders from the returned MatchVM.
   ============================================================ */

export type GolfChip = {
  hole: number;
  strokes: number;
  toPar: number;
  label: string;
  cls: 'under' | 'even' | 'over';
  current: boolean;
};

export type GolfVM = {
  hole: number;
  holes: number;
  par: number;
  strokes: number;
  total: number;
  toParLabel: string;
  thru: string;
  chips: GolfChip[];
  flash: boolean;
};

export type MatchVM = {
  sport: Sport;
  name: string;
  mode: string;
  nameA: string;
  nameB: string;
  gamesLabel: string;
  games: string;
  scoreA: string;
  scoreB: string;
  sub: string;
  flashA: boolean;
  flashB: boolean;
  /** Present only for golf (single-player layout). */
  golf: GolfVM | null;
};

type SportCfg = {
  name: string;
  mode: string;
  a: string;
  b: string;
  gamesLabel: string;
  cap?: number;
  hardCap?: number;
  tennis?: boolean;
  pts?: string[];
  clock?: boolean;
  startClock?: number;
  incs?: number[];
  countUp?: boolean;
  halfMin?: number;
  golf?: boolean;
  holes?: number;
};

const SPORT_DATA: Record<Sport, SportCfg> = {
  badminton: { name: 'Badminton', mode: 'Singles', a: 'Tom', b: 'Bob', gamesLabel: 'Games', cap: 21, hardCap: 30 },
  tennis: { name: 'Tennis', mode: 'Singles', a: 'Tom', b: 'Ana', gamesLabel: 'Games', tennis: true, pts: ['0', '15', '30', '40'] },
  padel: { name: 'Padel', mode: 'Doubles', a: 'Tom', b: 'Bob', gamesLabel: 'Games', tennis: true, pts: ['0', '15', '30', '40'] },
  pickleball: { name: 'Pickleball', mode: 'Doubles', a: 'Tom', b: 'Bob', gamesLabel: 'Games', cap: 11, hardCap: 15 },
  squash: { name: 'Squash', mode: 'Singles', a: 'Tom', b: 'Bob', gamesLabel: 'Games', cap: 11 },
  tableTennis: { name: 'Table Tennis', mode: 'Singles', a: 'Tom', b: 'Bob', gamesLabel: 'Games', cap: 11 },
  volleyball: { name: 'Volleyball', mode: '6 v 6', a: 'Home', b: 'Away', gamesLabel: 'Sets', cap: 25 },
  basketball: { name: 'Basketball', mode: '3 v 3', a: 'Reds', b: 'Blues', gamesLabel: 'Period', clock: true, startClock: 600, incs: [2, 2, 2, 3, 1] },
  football: { name: 'Football', mode: '5-a-side', a: 'Home', b: 'Away', gamesLabel: 'Half', countUp: true, halfMin: 45 },
  floorball: { name: 'Floorball', mode: '5 v 5', a: 'Home', b: 'Away', gamesLabel: 'Period', clock: true, startClock: 1200, incs: [3, 3, 3] },
  golf: { name: 'Golf', mode: 'Stroke play', a: 'Tom', b: 'Sam', gamesLabel: 'To par', golf: true, holes: 18 },
};

type Hole = { par: number; strokes: number };

type EngineState = {
  a: number;
  b: number;
  gA: number;
  gB: number;
  setsA: number;
  setsB: number;
  clk: number;
  up: number;
  period: number;
  holes: number;
  hole: number;
  par: number;
  target: number;
  strokes: number;
  played: Hole[];
  flash: 'a' | 'b' | 'golf' | null;
};

const PARS = [3, 4, 4, 4, 5];
const GOLF_DELTA = [-1, 0, 0, 1, 2];

const pad = (n: number) => (n < 10 ? '0' : '') + n;
const toPar = (v: number) => (v === 0 ? 'E' : v > 0 ? '+' + v : String(v));
const rpick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

function golfHole(st: EngineState) {
  st.par = rpick(PARS);
  st.strokes = 0;
  st.target = Math.max(1, st.par + rpick(GOLF_DELTA));
}

function golfReset(st: EngineState) {
  st.holes = 9;
  st.played = [];
  for (let i = 0; i < 3; i++) {
    const p = rpick(PARS);
    st.played.push({ par: p, strokes: Math.max(1, p + rpick(GOLF_DELTA)) });
  }
  st.hole = st.played.length + 1;
  golfHole(st);
}

function initState(cfg: SportCfg): EngineState {
  const st: EngineState = {
    a: 0,
    b: 0,
    gA: 0,
    gB: 0,
    setsA: 0,
    setsB: 0,
    clk: cfg.startClock ?? 0,
    up: 0,
    period: 1,
    holes: 9,
    hole: 1,
    par: 4,
    target: 4,
    strokes: 0,
    played: [],
    flash: null,
  };
  if (cfg.golf) golfReset(st);
  return st;
}

function golfTotals(st: EngineState) {
  let s = 0;
  let tp = 0;
  for (const h of st.played) {
    s += h.strokes;
    tp += h.strokes - h.par;
  }
  return { total: s + st.strokes, topar: tp + (st.strokes - st.par) };
}

function golfChips(st: EngineState): GolfChip[] {
  const arr = st.played.map((h, i) => ({ hole: i + 1, strokes: h.strokes, toPar: h.strokes - h.par, current: false }));
  arr.push({ hole: st.hole, strokes: st.strokes, toPar: st.strokes - st.par, current: true });
  return arr.slice(-5).map((c) => {
    const cls: GolfChip['cls'] = c.toPar < 0 ? 'under' : c.toPar > 0 ? 'over' : 'even';
    const label = c.toPar < 0 ? String(c.toPar) : c.toPar > 0 ? '+' + c.toPar : 'E';
    return { ...c, cls, label };
  });
}

function ptsDisplay(cfg: SportCfg, p: number, o: number): string {
  const pts = cfg.pts ?? ['0', '15', '30', '40'];
  if (p <= 3) return pts[p];
  if (p === o && p >= 3) return '40';
  if (p > o) return p === o + 1 ? 'AD' : '40';
  return '40';
}

function computeVm(st: EngineState, cfg: SportCfg, sport: Sport, t: Dict): MatchVM {
  const d = t.devices;
  const base = {
    sport,
    name: t.sports[sport],
    mode: d.modes[sport],
    nameA: cfg.a,
    nameB: cfg.b,
    gamesLabel: d.gamesLabels[sport],
    flashA: st.flash === 'a',
    flashB: st.flash === 'b',
  };

  if (cfg.golf) {
    const tot = golfTotals(st);
    const golf: GolfVM = {
      hole: st.hole,
      holes: st.holes,
      par: st.par,
      strokes: st.strokes,
      total: tot.total,
      toParLabel: toPar(tot.topar),
      thru: `${st.hole}/${st.holes}`,
      chips: golfChips(st),
      flash: st.flash === 'golf',
    };
    // Feed the standard fields too, so the Live-Activity island reads sensibly.
    return {
      ...base,
      flashA: false,
      flashB: false,
      scoreA: String(st.strokes),
      scoreB: '',
      games: toPar(tot.topar),
      sub: d.sub.golf(st.hole, st.par),
      golf,
    };
  }

  let scoreA: string;
  let scoreB: string;
  let sub: string;
  let games: string;

  if (cfg.tennis) {
    scoreA = ptsDisplay(cfg, st.a, st.b);
    scoreB = ptsDisplay(cfg, st.b, st.a);
    games = `${st.gA}–${st.gB}`;
    sub = d.sub.tennis(st.setsA + st.setsB + 1, st.setsA, st.setsB);
  } else if (cfg.clock) {
    scoreA = String(st.a);
    scoreB = String(st.b);
    sub = d.sub.basketball(st.period, `${pad(Math.floor(st.clk / 60))}:${pad(st.clk % 60)}`);
    games = d.periodShort(st.period);
  } else if (cfg.countUp) {
    scoreA = String(st.a);
    scoreB = String(st.b);
    sub = d.sub.football(st.period === 1, st.up);
    games = `${st.gA}–${st.gB}`;
  } else {
    // badminton
    scoreA = String(st.a);
    scoreB = String(st.b);
    sub = d.sub.badminton(st.gA + st.gB + 1);
    games = `${st.gA}–${st.gB}`;
  }

  return { ...base, scoreA, scoreB, sub, games, golf: null };
}

/**
 * @param active Run the engine at all. False when nothing is rendering a
 *   device (legal pages, for instance), so no page pays for timers it cannot
 *   show. The engine additionally halts itself whenever the tab is hidden.
 */
export function useMatch(sport: Sport, active = true): MatchVM {
  const { t } = useI18n();
  const [vm, setVm] = useState<MatchVM>(() => {
    const cfg = SPORT_DATA[sport];
    return computeVm(initState(cfg), cfg, sport, t);
  });

  useEffect(() => {
    if (!active) return;
    const cfg = SPORT_DATA[sport];
    let st = initState(cfg);
    let flashTimer: ReturnType<typeof setTimeout> | undefined;

    const update = () => setVm(computeVm(st, cfg, sport, t));
    update();

    const score = () => {
      const side: 'a' | 'b' = Math.random() < 0.52 ? 'a' : 'b';
      st.flash = side;

      if (cfg.tennis) {
        if (side === 'a') st.a++;
        else st.b++;
        if ((st.a >= 4 || st.b >= 4) && Math.abs(st.a - st.b) >= 2) {
          if (st.a > st.b) st.gA++;
          else st.gB++;
          st.a = 0;
          st.b = 0;
          if ((st.gA >= 6 || st.gB >= 6) && Math.abs(st.gA - st.gB) >= 2) {
            if (st.gA > st.gB) st.setsA++;
            else st.setsB++;
            st.gA = 0;
            st.gB = 0;
            if (st.setsA === 2 || st.setsB === 2) {
              st = initState(cfg);
              update();
              return;
            }
          }
        }
      } else if (cfg.golf) {
        st.strokes++;
        st.flash = 'golf';
        if (st.strokes >= st.target) {
          st.played.push({ par: st.par, strokes: st.strokes });
          st.hole++;
          if (st.hole > st.holes) {
            st = initState(cfg);
            update();
            return;
          }
          golfHole(st);
        }
      } else if (cfg.clock) {
        const incs = cfg.incs ?? [2];
        const inc = incs[Math.floor(Math.random() * incs.length)];
        if (side === 'a') st.a += inc;
        else st.b += inc;
      } else if (cfg.countUp) {
        if (side === 'a') st.a++;
        else st.b++;
      } else {
        // badminton
        if (side === 'a') st.a++;
        else st.b++;
        const hi = Math.max(st.a, st.b);
        const lo = Math.min(st.a, st.b);
        const cap = cfg.cap ?? 21;
        const hardCap = cfg.hardCap ?? 30;
        if ((hi >= cap && hi - lo >= 2) || hi >= hardCap) {
          if (st.a > st.b) st.gA++;
          else st.gB++;
          st.a = 0;
          st.b = 0;
          if (st.gA === 2 || st.gB === 2) {
            st = initState(cfg);
            update();
            return;
          }
        }
      }

      update();
      flashTimer = setTimeout(() => {
        st.flash = null;
        update();
      }, 420);
    };

    const tickClock = () => {
      if (cfg.clock) {
        st.clk -= 1;
        if (st.clk <= 0) {
          st.period = st.period >= 4 ? 1 : st.period + 1;
          st.clk = cfg.startClock ?? 600;
          if (st.period === 1) {
            st.a = 0;
            st.b = 0;
          }
        }
        update();
      } else if (cfg.countUp) {
        st.up += 1;
        if (st.up >= (cfg.halfMin ?? 45)) {
          if (st.period >= 2) {
            st = initState(cfg);
          } else {
            st.period = 2;
            st.up = 45;
          }
        }
        update();
      }
    };

    let pointTimer: ReturnType<typeof setInterval> | undefined;
    let clockTimer: ReturnType<typeof setInterval> | undefined;

    const stop = () => {
      if (pointTimer) clearInterval(pointTimer);
      if (clockTimer) clearInterval(clockTimer);
      pointTimer = clockTimer = undefined;
    };
    const start = () => {
      stop();
      pointTimer = setInterval(score, 2000);
      if (cfg.clock || cfg.countUp) clockTimer = setInterval(tickClock, 90);
    };

    // A backgrounded tab should not be running a scoring simulation — the
    // clocked sports tick every 90ms, which is a lot of wasted work for
    // something nobody can see.
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVisibility);
    if (!document.hidden) start();

    return () => {
      stop();
      if (flashTimer) clearTimeout(flashTimer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [sport, t, active]);

  return vm;
}
