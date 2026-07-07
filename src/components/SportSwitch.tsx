'use client';

import { SPORTS, useAppState, type Sport } from './state';
import { SportIcon } from './icons';
import { useI18n } from '@/i18n';

const SPORT_COLORS: Record<Sport, string> = {
  badminton: '#ff5a4a',
  tennis: '#f09030',
  padel: '#edb400',
  pickleball: '#edc200',
  squash: '#9ad60f',
  tableTennis: '#3ad06a',
  volleyball: '#1fd0d0',
  basketball: '#38b8f0',
  football: '#5b9bff',
  floorball: '#9a6ad8',
  golf: '#ee5dab',
};

const SPORT_RGB: Record<Sport, string> = {
  badminton: '255,90,74',
  tennis: '240,144,48',
  padel: '237,180,0',
  pickleball: '237,194,0',
  squash: '154,214,15',
  tableTennis: '58,208,106',
  volleyball: '31,208,208',
  basketball: '56,184,240',
  football: '91,155,255',
  floorball: '154,106,216',
  golf: '238,93,171',
};

export function SportSwitch() {
  const { sport, setSport } = useAppState();
  const { t } = useI18n();
  return (
    <div className="sport-switch" role="tablist" aria-label={t.switchStrip.hint}>
      {SPORTS.map((s) => {
        const active = sport === s;
        return (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={active}
            className={`sport-pill${active ? ' active' : ''}`}
            onClick={() => setSport(s)}
            style={{
              background: active ? SPORT_COLORS[s] : `rgba(${SPORT_RGB[s]},0.15)`,
              color: active ? '#fff' : SPORT_COLORS[s],
              borderColor: active ? SPORT_COLORS[s] : 'transparent',
            }}
          >
            <SportIcon sport={s} className="si" />
            {t.sports[s]}
          </button>
        );
      })}
    </div>
  );
}
