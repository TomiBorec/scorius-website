'use client';

/* ============================================================
   Per-sport rules, for the match about to start.

   One editor per engine, not per sport — the twelve sports share six
   rule shapes, and the presets are what make badminton differ from
   squash. Whatever is edited here is baked into the match at start and
   never re-read, mirroring the app: a match is always scored under the
   rules it began with, even if the defaults change mid-round.

   Every change routes through the engine's `normalise*`, so an edit
   that would make an impossible match (a sudden-death cap below the
   game score, a tiebreak beyond the set) is corrected rather than
   stored.
   ============================================================ */

import type { MatchSettings } from '@/engine/active';
import { normaliseRally } from '@/engine/rally';
import { normaliseTennis } from '@/engine/tennis';
import { normalisePickleball } from '@/engine/pickleball';
import { normaliseBasketball } from '@/engine/basketball';
import { normaliseFootball } from '@/engine/football';
import { normaliseGolf } from '@/engine/golf';
import { minutes, Segmented, Stepper, Switch } from './RuleControls';

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export function RulesEditor({ settings, onChange, gameNoun }: {
  settings: MatchSettings;
  /**
   * Takes an updater, not a value. Steppers report a direction and it is applied
   * against whatever the rules are *now* — several taps in one React batch must
   * each see the previous one's result. See the note on `Stepper`.
   */
  onChange: (update: (previous: MatchSettings) => MatchSettings) => void;
  /** "game" or "set" — volleyball and tennis count sets. */
  gameNoun: 'game' | 'set';
}) {
  switch (settings.kind) {
    case 'rally': {
      const r = settings.rules;
      const set = (patch: Partial<typeof r>) =>
        onChange((prev) => (prev.kind !== 'rally' ? prev
          : { kind: 'rally', rules: normaliseRally({ ...prev.rules, ...patch }) }));
      const step = (field: 'gamesToWin' | 'maxPoints' | 'suddenDeathCap', delta: number, min: number, max: number) =>
        onChange((prev) => (prev.kind !== 'rally' ? prev : { kind: 'rally', rules: normaliseRally({
          ...prev.rules, [field]: clamp(prev.rules[field] + delta, min, max),
        }) }));
      const Noun = gameNoun === 'set' ? 'Sets' : 'Games';
      return (
        <>
          <Stepper label={`${Noun} to win`} value={r.gamesToWin} min={1} max={10}
                   onStep={(d) => step('gamesToWin', d, 1, 10)} />
          <Stepper label={`Points per ${gameNoun}`} value={r.maxPoints} min={3} max={100}
                   onStep={(d) => step('maxPoints', d, 3, 100)} />
          <Switch label="Win by two" value={r.winByTwo}
                  hint={`A ${gameNoun} keeps going until one side leads by two.`}
                  onChange={(v) => set({ winByTwo: v })} />
          {r.winByTwo ? (
            <>
              <Switch label="Cap the score" value={r.capEnabled}
                      hint="Badminton stops at 30; volleyball and squash play on."
                      onChange={(v) => set({ capEnabled: v })} />
              {r.capEnabled ? (
                <Stepper label="Cap at" value={r.suddenDeathCap} min={r.maxPoints + 5} max={200}
                         onStep={(d) => step('suddenDeathCap', d, r.maxPoints + 5, 200)} />
              ) : null}
            </>
          ) : null}
        </>
      );
    }

    case 'tennis': {
      const r = settings.rules;
      const set = (patch: Partial<typeof r>) =>
        onChange((prev) => (prev.kind !== 'tennis' ? prev
          : { kind: 'tennis', rules: normaliseTennis({ ...prev.rules, ...patch }) }));
      const step = (field: 'setsToWin' | 'gamesPerSet' | 'tiebreakAt' | 'tiebreakPoints', delta: number, min: number, max: number) =>
        onChange((prev) => (prev.kind !== 'tennis' ? prev : { kind: 'tennis', rules: normaliseTennis({
          ...prev.rules, [field]: clamp(prev.rules[field] + delta, min, max),
        }) }));
      return (
        <>
          <Stepper label="Sets to win" value={r.setsToWin} min={1} max={3}
                   hint={r.setsToWin === 2 ? 'Best of three' : r.setsToWin === 3 ? 'Best of five' : 'One set'}
                   onStep={(d) => step('setsToWin', d, 1, 3)} />
          <Stepper label="Games per set" value={r.gamesPerSet} min={1} max={10}
                   onStep={(d) => step('gamesPerSet', d, 1, 10)} />
          <Stepper label="Tiebreak at" value={r.tiebreakAt} min={1} max={10}
                   hint="Games apiece that forces a tiebreak."
                   onStep={(d) => step('tiebreakAt', d, 1, 10)} />
          <Stepper label="Tiebreak points" value={r.tiebreakPoints} min={5} max={20}
                   onStep={(d) => step('tiebreakPoints', d, 5, 20)} />
          <Switch label="Tiebreak in the final set" value={r.finalSetTiebreak}
                  hint="Off plays an advantage set — on until two games clear."
                  onChange={(v) => set({ finalSetTiebreak: v })} />
          <Switch label="Golden point" value={r.noAd}
                  hint="The next point after deuce takes the game. Standard in padel."
                  onChange={(v) => set({ noAd: v })} />
        </>
      );
    }

    case 'pickleball': {
      const r = settings.rules;
      const set = (patch: Partial<typeof r>) =>
        onChange((prev) => (prev.kind !== 'pickleball' ? prev
          : { kind: 'pickleball', rules: normalisePickleball({ ...prev.rules, ...patch }) }));
      const step = (field: 'gamesToWin' | 'pointsPerGame', delta: number, min: number, max: number) =>
        onChange((prev) => (prev.kind !== 'pickleball' ? prev : { kind: 'pickleball', rules: normalisePickleball({
          ...prev.rules, [field]: clamp(prev.rules[field] + delta, min, max),
        }) }));
      return (
        <>
          <Stepper label="Games to win" value={r.gamesToWin} min={1} max={10}
                   onStep={(d) => step('gamesToWin', d, 1, 10)} />
          <Stepper label="Points per game" value={r.pointsPerGame} min={5} max={50}
                   onStep={(d) => step('pointsPerGame', d, 5, 50)} />
          <Switch label="Win by two" value={r.winByTwo}
                  onChange={(v) => set({ winByTwo: v })} />
          <Segmented label="Scoring" value={r.scoringMode}
                     options={[
                       { value: 'sideOut', label: 'Side out' },
                       { value: 'rally', label: 'Rally' },
                     ]}
                     onChange={(v) => set({ scoringMode: v })} />
        </>
      );
    }

    case 'basketball': {
      const r = settings.rules;
      const set = (patch: Partial<typeof r>) =>
        onChange((prev) => (prev.kind !== 'basketball' ? prev
          : { kind: 'basketball', rules: normaliseBasketball({ ...prev.rules, ...patch }) }));
      const step = (field: 'periodCount' | 'periodDuration' | 'overtimeDuration', delta: number, min: number, max: number) =>
        onChange((prev) => (prev.kind !== 'basketball' ? prev : { kind: 'basketball', rules: normaliseBasketball({
          ...prev.rules, [field]: clamp(prev.rules[field] + delta, min, max),
        }) }));
      return (
        <>
          <Stepper label="Periods" value={r.periodCount} min={1} max={6}
                   hint={r.periodCount === 4 ? 'Quarters' : r.periodCount === 2 ? 'Halves' : undefined}
                   onStep={(d) => step('periodCount', d, 1, 6)} />
          <Stepper label="Period length" value={r.periodDuration} min={60} max={3600} step={60}
                   format={minutes} onStep={(d) => step('periodDuration', d, 60, 3600)} />
          <Switch label="Overtime" value={r.allowsOvertime}
                  hint="Off lets the match end level."
                  onChange={(v) => set({ allowsOvertime: v })} />
          {r.allowsOvertime ? (
            <Stepper label="Overtime length" value={r.overtimeDuration} min={60} max={1800} step={60}
                     format={minutes} onStep={(d) => step('overtimeDuration', d, 60, 1800)} />
          ) : null}
        </>
      );
    }

    case 'football': {
      const r = settings.rules;
      const set = (patch: Partial<typeof r>) =>
        onChange((prev) => (prev.kind !== 'football' ? prev
          : { kind: 'football', rules: normaliseFootball({ ...prev.rules, ...patch }) }));
      const step = (field: 'periodCount' | 'periodDuration' | 'extraTimePeriodCount' | 'extraTimeDuration', delta: number, min: number, max: number) =>
        onChange((prev) => (prev.kind !== 'football' ? prev : { kind: 'football', rules: normaliseFootball({
          ...prev.rules, [field]: clamp(prev.rules[field] + delta, min, max),
        }) }));
      return (
        <>
          <Stepper label="Periods" value={r.periodCount} min={1} max={4}
                   hint={r.periodCount === 2 ? 'Halves' : r.periodCount === 3 ? 'Thirds' : undefined}
                   onStep={(d) => step('periodCount', d, 1, 4)} />
          <Stepper label="Period length" value={r.periodDuration} min={60} max={3600} step={60}
                   format={minutes} onStep={(d) => step('periodDuration', d, 60, 3600)} />
          <Switch label="Extra time" value={r.allowsExtraTime}
                  hint="No shootout — a match still level after extra time is a draw."
                  onChange={(v) => set({ allowsExtraTime: v })} />
          {r.allowsExtraTime ? (
            <>
              <Stepper label="Extra-time periods" value={r.extraTimePeriodCount} min={1} max={4}
                       onStep={(d) => step('extraTimePeriodCount', d, 1, 4)} />
              <Stepper label="Extra-time length" value={r.extraTimeDuration} min={60} max={1800} step={60}
                       format={minutes} onStep={(d) => step('extraTimeDuration', d, 60, 1800)} />
            </>
          ) : null}
        </>
      );
    }

    case 'golf': {
      const r = settings.rules;
      // Pars follow the hole count: `normaliseGolf` truncates or pads, so a
      // shortened round can never leave a par list longer than its holes.
      const set = (patch: Partial<typeof r>) =>
        onChange((prev) => (prev.kind !== 'golf' ? prev
          : { kind: 'golf', rules: normaliseGolf({ ...prev.rules, ...patch }) }));
      const stepHoles = (delta: number) =>
        onChange((prev) => (prev.kind !== 'golf' ? prev : { kind: 'golf', rules: normaliseGolf({
          ...prev.rules, holeCount: clamp(prev.rules.holeCount + delta, 1, 18),
        }) }));
      // Par applies to every hole at once; stepping it reads the first hole's par
      // from current state rather than from what was painted.
      const stepPar = (delta: number) =>
        onChange((prev) => (prev.kind !== 'golf' ? prev : { kind: 'golf', rules: normaliseGolf({
          ...prev.rules, pars: Array(prev.rules.holeCount).fill(clamp((prev.rules.pars[0] ?? 4) + delta, 3, 6)),
        }) }));
      const uniformPar = r.pars.every((p) => p === r.pars[0]) ? r.pars[0] : null;
      return (
        <>
          <Stepper label="Holes" value={r.holeCount} min={1} max={18} onStep={stepHoles} />
          <Stepper label="Par per hole" value={uniformPar ?? 4} min={3} max={6}
                   hint={uniformPar === null ? 'Mixed — changing this sets every hole.' : undefined}
                   onStep={stepPar} />
          <Segmented label="Scoring" value={r.scoringFormat}
                     options={[
                       { value: 'strokePlay', label: 'Stroke' },
                       { value: 'stableford', label: 'Stableford' },
                       { value: 'matchPlay', label: 'Match' },
                     ]}
                     onChange={(v) => set({ scoringFormat: v })} />
        </>
      );
    }
  }
}
