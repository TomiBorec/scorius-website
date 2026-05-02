'use client';

import { useEffect, useState } from 'react';
import type { MatchState } from '@/hooks/useMatchLoop';

type Accent = 'system' | 'mono';

export function PhoneLiveMatch({
  match,
  accent = 'system',
  dark = false,
}: {
  match: MatchState;
  accent?: Accent;
  dark?: boolean;
}) {
  const fg = dark ? '#fff' : '#000';
  const muted = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const blue = accent === 'mono' ? fg : '#007AFF';
  const red = accent === 'mono' ? fg : '#FF3B30';
  const green = '#34C759';
  const orange = '#FF9500';

  const min = Math.floor(match.durationSec / 60);
  const sec = match.durationSec % 60;
  const dur = `${min}:${String(sec).padStart(2, '0')}`;

  const gamesColor =
    match.playerGames > match.opponentGames
      ? green
      : match.opponentGames > match.playerGames
        ? red
        : fg;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: dark ? '#000' : '#fff',
        color: fg,
        fontFamily: '-apple-system, "SF Pro Text", system-ui, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        padding: '60px 24px 50px',
        boxSizing: 'border-box',
        gap: 18,
      }}
    >
      {/* Live indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              borderRadius: 5,
              background: '#FF3B30',
              boxShadow: '0 0 0 4px rgba(255,59,48,0.18)',
              animation: 'bb-pulse 1.4s ease-in-out infinite',
            }}
          />
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: 0.6,
              textTransform: 'uppercase',
            }}
          >
            Live · Apple Watch
          </span>
        </div>
        <span style={{ fontSize: 13, color: muted, fontFeatureSettings: '"tnum"' }}>{dur}</span>
      </div>

      {/* Games */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 4 }}>
        <span style={{ fontSize: 17, color: muted, fontWeight: 500 }}>Games</span>
        <span
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: gamesColor,
            fontFeatureSettings: '"tnum"',
          }}
        >
          {match.playerGames}–{match.opponentGames}
        </span>
      </div>

      {/* Big score */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          marginTop: -8,
          minWidth: 0,
        }}
      >
        <BigPulse value={match.player} color={blue} pulse={match.pulse === 'p'} />
        <span
          style={{
            fontSize: 72,
            color: muted,
            lineHeight: 1,
            fontWeight: 300,
            transform: 'translateY(-8px)',
          }}
        >
          :
        </span>
        <BigPulse value={match.opponent} color={red} pulse={match.pulse === 'o'} />
      </div>

      {/* Status message */}
      <div
        style={{
          textAlign: 'center',
          minHeight: 24,
          fontSize: 17,
          fontWeight: 600,
          color: match.isWin ? green : match.isGamePoint ? orange : muted,
          letterSpacing: 0.1,
        }}
      >
        {match.gameMessage || (match.isGamePoint ? 'Game point' : '·')}
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        <Metric label="Heart Rate" value={Math.round(match.heartRate)} unit="bpm" color="#FF3B30" dark={dark} />
        <Metric label="Calories" value={Math.round(match.calories)} unit="kcal" color={orange} dark={dark} />
        <Metric label="Duration" value={dur} unit="" color={blue} dark={dark} mono />
      </div>
    </div>
  );
}

function BigPulse({ value, color, pulse }: { value: number; color: string; pulse: boolean }) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    if (pulse) {
      setScale(1.12);
      const t = setTimeout(() => setScale(1), 200);
      return () => clearTimeout(t);
    }
  }, [value, pulse]);
  return (
    <span
      style={{
        fontSize: 120,
        fontWeight: 700,
        color,
        lineHeight: 1,
        fontFeatureSettings: '"tnum"',
        transform: `scale(${scale})`,
        transition: 'transform 240ms cubic-bezier(0.34,1.56,0.64,1)',
        transformOrigin: 'center',
        display: 'inline-block',
        textAlign: 'center',
        letterSpacing: -3,
      }}
    >
      {value}
    </span>
  );
}

function Metric({
  label,
  value,
  unit,
  color,
  dark,
  mono = false,
}: {
  label: string;
  value: number | string;
  unit: string;
  color: string;
  dark: boolean;
  mono?: boolean;
}) {
  const bg = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const muted = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  return (
    <div
      style={{
        background: bg,
        borderRadius: 14,
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <div style={{ fontSize: 11, color: muted, fontWeight: 500, letterSpacing: 0.2 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span
          style={{
            fontSize: mono ? 20 : 24,
            fontWeight: 700,
            color,
            fontFeatureSettings: '"tnum"',
          }}
        >
          {value}
        </span>
        {unit && <span style={{ fontSize: 11, color: muted, fontWeight: 600 }}>{unit}</span>}
      </div>
    </div>
  );
}
