import { SectionHeader } from './Features';

const STEPS = [
  {
    n: '01',
    title: 'Open on your wrist',
    body: 'Tap "New Match". The watch starts a HealthKit workout in the background.',
  },
  {
    n: '02',
    title: 'Tap to score',
    body: 'P1 or P2 to add a point. Long press to undo. Your iPhone mirrors instantly.',
  },
  {
    n: '03',
    title: 'Match auto-saves',
    body: 'Best of 5. When games hit 3, Badminton Log saves the full match — every game, every score.',
  },
];

export function HowItWorks() {
  return (
    <section id="how" style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 32px 60px' }}>
      <SectionHeader eyebrow="How it works" title="Three taps." subtitle="That's it." />
      <div
        className="bb-three-col"
        style={{ marginTop: 56, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}
      >
        {STEPS.map((s) => (
          <div key={s.n} style={{ paddingTop: 32, borderTop: '1px solid var(--hairline)' }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 1,
                color: 'var(--muted)',
                marginBottom: 24,
                fontFeatureSettings: '"tnum"',
              }}
            >
              {s.n}
            </div>
            <div
              style={{
                fontSize: 26,
                fontWeight: 600,
                letterSpacing: -0.5,
                marginBottom: 12,
                lineHeight: 1.1,
              }}
            >
              {s.title}
            </div>
            <div style={{ fontSize: 15, lineHeight: 1.55, color: 'var(--muted)' }}>{s.body}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
