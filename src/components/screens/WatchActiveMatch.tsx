'use client';

import { useEffect, useState } from 'react';
import type { MatchState } from '@/hooks/useMatchLoop';

type Accent = 'system' | 'mono';

export function WatchActiveMatch({
  match,
  accent = 'system',
}: {
  match: MatchState;
  accent?: Accent;
}) {
  const blue = accent === 'mono' ? '#fff' : '#5AC8FA';
  const red = accent === 'mono' ? '#fff' : '#FF453A';
  const green = '#30D158';
  const yellow = '#FFD60A';

  const gamesColor =
    match.playerGames > match.opponentGames
      ? green
      : match.opponentGames > match.playerGames
        ? red
        : '#fff';

  const msgColor = match.isWin ? green : match.isGamePoint ? yellow : 'rgba(235,235,245,0.6)';

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '14px 12px 10px',
        boxSizing: 'border-box',
        color: '#fff',
        fontFamily: '-apple-system, "SF Pro Text", system-ui, sans-serif',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 4,
          right: 14,
          fontSize: 14,
          fontWeight: 600,
          color: '#fff',
          fontFeatureSettings: '"tnum"',
        }}
      >
        10:09
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 6, marginTop: 8 }}>
        <span style={{ fontSize: 11, color: 'rgba(235,235,245,0.6)' }}>Games</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: gamesColor, fontFeatureSettings: '"tnum"' }}>
          {match.playerGames}-{match.opponentGames}
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 4, marginTop: 6 }}>
        <PulseScore value={match.player} color={blue} pulse={match.pulse === 'p'} />
        <span
          style={{
            fontSize: 38,
            color: 'rgba(235,235,245,0.45)',
            lineHeight: 1,
            transform: 'translateY(-6px)',
          }}
        >
          :
        </span>
        <PulseScore value={match.opponent} color={red} pulse={match.pulse === 'o'} />
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 8, justifyContent: 'center' }}>
        <ScoreBtn label="P1" color={blue} />
        <ScoreBtn label="P2" color={red} />
      </div>

      <div
        style={{
          marginTop: 8,
          textAlign: 'center',
          fontSize: 11,
          fontWeight: 600,
          color: msgColor,
          minHeight: 14,
          letterSpacing: 0.1,
        }}
      >
        {match.gameMessage}
      </div>
    </div>
  );
}

function PulseScore({ value, color, pulse }: { value: number; color: string; pulse: boolean }) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    if (pulse) {
      setScale(1.18);
      const t = setTimeout(() => setScale(1), 160);
      return () => clearTimeout(t);
    }
  }, [value, pulse]);
  return (
    <span
      style={{
        fontSize: 56,
        fontWeight: 700,
        color,
        lineHeight: 1,
        fontFeatureSettings: '"tnum"',
        transform: `scale(${scale})`,
        transition: 'transform 200ms cubic-bezier(0.34,1.56,0.64,1)',
        transformOrigin: 'center',
        display: 'inline-block',
        minWidth: 44,
        textAlign: 'center',
      }}
    >
      {value}
    </span>
  );
}

function ScoreBtn({ label, color }: { label: string; color: string }) {
  return (
    <div
      style={{
        width: 84,
        height: 38,
        borderRadius: 12,
        background: `color-mix(in srgb, ${color} 22%, transparent)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color,
        fontWeight: 700,
        fontSize: 16,
        letterSpacing: 0.3,
      }}
    >
      {label}
    </div>
  );
}
