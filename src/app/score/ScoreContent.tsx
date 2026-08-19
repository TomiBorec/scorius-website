'use client';

/* ============================================================
   The web scorer.

   Deliberately narrower than the app: four sports so far, no account, no
   sync, matches on this device only. Everything it does share with the
   app is the engine — the same rules, pinned to the same fixtures — so a
   score kept here means what it would mean there.
   ============================================================ */

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { startMatch, type ActiveMatch } from '@/engine/active';
import {
  badmintonDefault, squashDefault, tableTennisDefault, volleyballDefault,
} from '@/engine/rally';
import { padelDefault, tennisDefault } from '@/engine/tennis';
import { pickleballDefault } from '@/engine/pickleball';
import type { MatchSettings } from '@/engine/active';
import type { Sport } from '@/engine/types';
import { History } from '@/components/score/History';
import { PickleballScorer } from '@/components/score/PickleballScorer';
import { RallyScorer } from '@/components/score/RallyScorer';
import { TennisScorer } from '@/components/score/TennisScorer';
import { finishMatch } from '@/engine/finish';
import { saveMatch } from '@/lib/history';
import { loadActiveMatch, requestPersistence, saveActiveMatch } from '@/lib/storage';

/**
 * Only the sports whose scorer exists. Offering the rest would mean a picker
 * that leads to a blank screen, which is worse than a short list.
 */
interface SportOption {
  sport: Sport;
  label: string;
  settings: MatchSettings;
  sides: [string, string];
}

const AVAILABLE: SportOption[] = [
  { sport: 'badminton', label: 'Badminton', settings: { kind: 'rally', rules: badmintonDefault }, sides: ['Side 1', 'Side 2'] },
  { sport: 'tennis', label: 'Tennis', settings: { kind: 'tennis', rules: tennisDefault }, sides: ['Side 1', 'Side 2'] },
  { sport: 'padel', label: 'Padel', settings: { kind: 'tennis', rules: padelDefault }, sides: ['Side 1', 'Side 2'] },
  { sport: 'pickleball', label: 'Pickleball', settings: { kind: 'pickleball', rules: pickleballDefault }, sides: ['Side 1', 'Side 2'] },
  { sport: 'volleyball', label: 'Volleyball', settings: { kind: 'rally', rules: volleyballDefault }, sides: ['Home', 'Away'] },
  { sport: 'tableTennis', label: 'Table Tennis', settings: { kind: 'rally', rules: tableTennisDefault }, sides: ['Side 1', 'Side 2'] },
  { sport: 'squash', label: 'Squash', settings: { kind: 'rally', rules: squashDefault }, sides: ['Side 1', 'Side 2'] },
];

export function ScoreContent() {
  const [match, setMatch] = useState<ActiveMatch | null>(null);
  const [restored, setRestored] = useState(false);
  /** Bumped on every save, so the history list below reloads without polling. */
  const [savedCount, setSavedCount] = useState(0);

  // Pick up an interrupted match before rendering anything, so a reload mid-game
  // does not flash the setup screen at someone who is 18-16 up.
  useEffect(() => {
    setMatch(loadActiveMatch());
    setRestored(true);
    void requestPersistence();
  }, []);

  // Persisted from an effect, not from inside the updater: a state updater has to
  // stay pure, and StrictMode calls it twice. Runs on every accepted change, so
  // the disk is at most one paint behind the screen.
  useEffect(() => {
    if (!restored) return;
    saveActiveMatch(match);
  }, [match, restored]);

  /**
   * Takes an updater rather than a finished match, deliberately.
   *
   * Passing the next state would close over whatever `match` was when the handler
   * was created, so two taps landing in the same React batch would both compute
   * from the same snapshot and the second would overwrite the first — a dropped
   * point during a fast rally, which is the one bug a scorer must not have.
   * Found by scoring forty points in a single tick and getting one.
   */
  const update = useCallback((updater: (m: ActiveMatch) => ActiveMatch) => {
    setMatch((prev) => (prev ? updater(prev) : prev));
  }, []);

  /**
   * Ends the match, saving it first.
   *
   * `finishMatch` returns null for a match nobody scored in — that is not history,
   * and saving it would fill the list with empty rows. Anything with a point in it
   * is kept.
   */
  const end = useCallback(() => {
    setMatch((current) => {
      if (current) {
        const record = finishMatch(current, { now: Date.now(), id: crypto.randomUUID() });
        if (record) {
          void saveMatch(record).then(() => setSavedCount((n) => n + 1));
        }
      }
      return null;
    });
  }, []);

  if (!restored) return <main className="sc-page" />;

  if (!match) return <Setup onStart={(m) => setMatch(m)} savedCount={savedCount} />;

  return (
    <main className="sc-page">
      <Scorer match={match} onChange={update} onEnd={end} />
    </main>
  );
}

/**
 * Picks the scorer by the settings' engine kind rather than by sport, mirroring
 * the app: twelve sports share six engines, and branching on the sport would mean
 * repeating the mapping everywhere it is needed.
 */
function Scorer({ match, onChange, onEnd }: {
  match: ActiveMatch;
  onChange: (updater: (m: ActiveMatch) => ActiveMatch) => void;
  onEnd: () => void;
}) {
  switch (match.settings.kind) {
    case 'rally':  return <RallyScorer match={match} onChange={onChange} onEnd={onEnd} />;
    case 'tennis': return <TennisScorer match={match} onChange={onChange} onEnd={onEnd} />;
    case 'pickleball': return <PickleballScorer match={match} onChange={onChange} onEnd={onEnd} />;
    default:       return null;
  }
}

function Setup({ onStart, savedCount }: { onStart: (m: ActiveMatch) => void; savedCount: number }) {
  const [sport, setSport] = useState<Sport>('badminton');
  const [side1, setSide1] = useState('');
  const [side2, setSide2] = useState('');

  const chosen = AVAILABLE.find((s) => s.sport === sport) ?? AVAILABLE[0];

  function start() {
    onStart(startMatch({
      sport: chosen.sport,
      settings: chosen.settings,
      side1Name: side1.trim() || undefined,
      side2Name: side2.trim() || undefined,
      now: Date.now(),
    }));
  }

  return (
    <main className="sc-page">
      <div className="sc-setup">
        <h1 className="sp-title">Keep score</h1>
        <p className="sp-note">
          Seven sports so far, and matches stay on this device — no account, nothing uploaded.
          The full tracker, with every sport and iCloud sync, is the{' '}
          <Link className="inline" href="/">Scorius app</Link>.
        </p>

        <div className="sc-sports" role="radiogroup" aria-label="Sport">
          {AVAILABLE.map((s) => (
            <button
              key={s.sport}
              className={`sc-sport${s.sport === sport ? ' on' : ''}`}
              data-sport={s.sport}
              role="radio"
              aria-checked={s.sport === sport}
              onClick={() => setSport(s.sport)}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="sc-names">
          <label className="sp-label" htmlFor="side1">{chosen.sides[0]}</label>
          <input id="side1" className="sc-input" value={side1} maxLength={24}
                 placeholder={chosen.sides[0]}
                 onChange={(e) => setSide1(e.target.value)} />
          <label className="sp-label" htmlFor="side2">{chosen.sides[1]}</label>
          <input id="side2" className="sc-input" value={side2} maxLength={24}
                 placeholder={chosen.sides[1]}
                 onChange={(e) => setSide2(e.target.value)} />
        </div>

        <button className="sc-primary" onClick={start}>Start match</button>
      </div>

      <History reloadKey={savedCount} />
    </main>
  );
}
