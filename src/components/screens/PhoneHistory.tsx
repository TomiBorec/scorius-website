type Match = {
  score: string;
  date: string;
  win: boolean;
  dur: string;
  games: string[];
};

const MATCHES: Match[] = [
  { score: '3–1', date: 'Today · 18:42', win: true, dur: '24m', games: ['21–18', '19–21', '21–15', '21–17'] },
  { score: '3–0', date: 'Yesterday · 20:11', win: true, dur: '19m', games: ['21–14', '21–16', '21–12'] },
  { score: '2–3', date: 'Sun · 17:30', win: false, dur: '32m', games: ['21–19', '18–21', '21–17', '15–21', '17–21'] },
  { score: '3–2', date: 'Fri · 19:05', win: true, dur: '36m', games: ['21–17', '15–21', '21–18', '19–21', '21–14'] },
];

export function PhoneHistory({ dark = false }: { dark?: boolean }) {
  const fg = dark ? '#fff' : '#000';
  const muted = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const card = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: dark ? '#000' : '#fff',
        color: fg,
        fontFamily: '-apple-system, "SF Pro Text", system-ui, sans-serif',
        padding: '60px 20px 40px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        overflow: 'hidden',
      }}
    >
      <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.6, marginTop: 4 }}>Match History</div>

      {/* New match button */}
      <div
        style={{
          background: '#34C759',
          color: '#fff',
          borderRadius: 14,
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontWeight: 600,
          fontSize: 17,
          boxShadow: '0 4px 14px -6px rgba(52,199,89,0.5)',
        }}
      >
        <span>+ New Match</span>
        <span style={{ opacity: 0.9, fontSize: 14, fontWeight: 500 }}>BO 5</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
        {MATCHES.map((m, i) => (
          <div
            key={i}
            style={{
              background: card,
              borderRadius: 14,
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: m.win ? '#34C759' : '#FF3B30',
                fontFeatureSettings: '"tnum"',
                minWidth: 52,
              }}
            >
              {m.score}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: muted, fontWeight: 500 }}>
                {m.date} · {m.dur}
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: 6,
                  marginTop: 4,
                  fontSize: 12,
                  color: muted,
                  fontFeatureSettings: '"tnum"',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {m.games.join(' · ')}
              </div>
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: m.win ? '#34C759' : '#FF3B30',
                padding: '4px 8px',
                borderRadius: 6,
                background: m.win ? 'rgba(52,199,89,0.12)' : 'rgba(255,59,48,0.12)',
                letterSpacing: 0.4,
              }}
            >
              {m.win ? 'WIN' : 'LOSS'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
