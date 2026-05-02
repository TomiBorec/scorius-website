type IconKind = 'tap' | 'heart' | 'rules' | 'games' | 'mirror' | 'history';

const ITEMS: { title: string; body: string; icon: IconKind }[] = [
  { title: 'Tap to score', body: 'Two big buttons on your wrist. P1 to add, long-press to undo.', icon: 'tap' },
  { title: 'Heart rate live', body: 'HealthKit reads BPM and calories during every rally.', icon: 'heart' },
  {
    title: 'BWF rules built in',
    body: '21 points, 2-point lead, 30 cap. The watch knows when the game is won.',
    icon: 'rules',
  },
  { title: 'Best of 5 games', body: 'Full match logic — game, set, match. Auto-saves on completion.', icon: 'games' },
  { title: 'iPhone mirror', body: 'A live scoreboard on your phone, perfect for the bench.', icon: 'mirror' },
  { title: 'Match history', body: 'Every game, every score, every win. Synced both ways.', icon: 'history' },
];

export function Features() {
  return (
    <section
      id="features"
      className="bb-features"
      style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 32px 60px' }}
    >
      <SectionHeader
        eyebrow="Features"
        title="Everything you need on court."
        subtitle="Nothing you don't."
      />
      <div
        className="bb-feature-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1,
          marginTop: 56,
          background: 'var(--hairline)',
          border: '1px solid var(--hairline)',
          borderRadius: 24,
          overflow: 'hidden',
        }}
      >
        {ITEMS.map((it) => (
          <div
            key={it.title}
            style={{
              background: 'var(--bg)',
              padding: '36px 32px',
              minHeight: 220,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <FeatureIcon kind={it.icon} />
            <div style={{ marginTop: 'auto' }}>
              <div style={{ fontSize: 19, fontWeight: 600, letterSpacing: -0.3, marginBottom: 6 }}>{it.title}</div>
              <div style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--muted)' }}>{it.body}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeatureIcon({ kind }: { kind: IconKind }) {
  const s = { width: 32, height: 32, color: 'var(--fg)' as const };
  if (kind === 'tap')
    return (
      <svg style={s} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="16" cy="16" r="6" />
        <circle cx="16" cy="16" r="11" opacity="0.4" />
      </svg>
    );
  if (kind === 'heart')
    return (
      <svg style={s} viewBox="0 0 32 32" fill="currentColor">
        <path d="M16 27s-10-6-10-13a6 6 0 0 1 10-4 6 6 0 0 1 10 4c0 7-10 13-10 13z" />
      </svg>
    );
  if (kind === 'rules')
    return (
      <svg style={s} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="6" y="5" width="20" height="22" rx="2" />
        <path d="M10 11h12M10 16h12M10 21h8" />
      </svg>
    );
  if (kind === 'games')
    return (
      <svg style={s} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="8" cy="16" r="3" />
        <circle cx="16" cy="16" r="3" fill="currentColor" />
        <circle cx="24" cy="16" r="3" fill="currentColor" />
      </svg>
    );
  if (kind === 'mirror')
    return (
      <svg style={s} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="4" y="9" width="16" height="20" rx="2" />
        <rect x="22" y="6" width="6" height="8" rx="1.5" />
      </svg>
    );
  return (
    <svg style={s} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="16" cy="16" r="11" />
      <path d="M16 9v7l5 3" />
    </svg>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 1.6,
          textTransform: 'uppercase',
          color: 'var(--muted)',
          marginBottom: 12,
        }}
      >
        {eyebrow}
      </div>
      <h2
        style={{
          fontSize: 'clamp(36px, 4.5vw, 60px)',
          fontWeight: 700,
          letterSpacing: -1.6,
          lineHeight: 1,
          margin: 0,
          textWrap: 'balance',
        }}
      >
        {title}
        {subtitle && (
          <>
            {' '}
            <span style={{ color: 'var(--muted)' }}>{subtitle}</span>
          </>
        )}
      </h2>
    </div>
  );
}
