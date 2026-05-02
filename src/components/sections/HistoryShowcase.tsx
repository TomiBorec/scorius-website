'use client';

import { useTheme } from '../ThemeProvider';
import { IOSDevice } from '../devices/IOSDevice';
import { PhoneHistory } from '../screens/PhoneHistory';
import { SectionHeader } from './Features';

export function HistoryShowcase() {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  return (
    <section style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 32px 60px' }}>
      <SectionHeader
        eyebrow="Match history"
        title="Every match. Every game."
        subtitle="Saved automatically."
      />
      <div
        className="bb-history-grid"
        style={{
          marginTop: 56,
          display: 'grid',
          gridTemplateColumns: '1fr 1.2fr',
          gap: 56,
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: -0.4,
              marginBottom: 16,
              lineHeight: 1.25,
            }}
          >
            Played in the morning, reviewed at lunch.
          </div>
          <p style={{ fontSize: 16, lineHeight: 1.55, color: 'var(--muted)', margin: 0 }}>
            Your iPhone shows the full archive — final score, every game&apos;s score, duration, average heart
            rate, calories burned. Watch Connectivity keeps both devices identical, so it doesn&apos;t matter
            which one you opened first.
          </p>
          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Bullet text="Full game-by-game breakdown" />
            <Bullet text="HealthKit metrics per match" />
            <Bullet text="Two-way sync via WatchConnectivity" />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ transform: 'scale(0.85)', transformOrigin: 'center' }}>
            <IOSDevice width={402} height={874} dark={dark}>
              <PhoneHistory dark={dark} />
            </IOSDevice>
          </div>
        </div>
      </div>
    </section>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15 }}>
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: 8,
          border: '1.5px solid var(--fg)',
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--fg)' }} />
      </span>
      <span>{text}</span>
    </div>
  );
}
