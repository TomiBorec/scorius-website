import { Shuttlecock } from '../Shuttlecock';

export function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--hairline)', padding: '32px 32px 48px' }}>
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          fontSize: 13,
          color: 'var(--muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shuttlecock size={18} />
          <span style={{ fontWeight: 600, color: 'var(--fg)' }}>Badminton Log</span>
          <span>· Designed &amp; built by Tomáš Kalmus.</span>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          <a href="#" style={{ color: 'var(--muted)', textDecoration: 'none' }}>
            Privacy
          </a>
          <a href="#" style={{ color: 'var(--muted)', textDecoration: 'none' }}>
            Support
          </a>
          <a href="#" style={{ color: 'var(--muted)', textDecoration: 'none' }}>
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
