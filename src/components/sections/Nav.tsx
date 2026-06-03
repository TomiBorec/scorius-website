import { Shuttlecock } from '../Shuttlecock';
import { ThemeToggle } from '../ThemeToggle';

const APPSTORE_HREF = 'https://apps.apple.com/app/id6766060549';

const linkStyle = {
  color: 'var(--muted)',
  textDecoration: 'none',
  fontSize: 14,
  fontWeight: 500,
} as const;

export function Nav() {
  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'var(--bg-translucent)',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        borderBottom: '1px solid var(--hairline)',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 32px',
        }}
      >
        <a
          href="/"
          style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--fg)' }}
        >
          <Shuttlecock size={22} />
          <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: -0.2 }}>Scorius</span>
          <span
            className="bb-nav-tag"
            style={{
              fontSize: 10,
              fontWeight: 600,
              padding: '2px 6px',
              borderRadius: 4,
              border: '1px solid var(--hairline)',
              color: 'var(--muted)',
              letterSpacing: 0.4,
              marginLeft: 4,
              whiteSpace: 'nowrap',
            }}
          >
            Formerly Badminton Log
          </span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <a href="/#features" style={linkStyle} className="bb-nav-link">
            Features
          </a>
          <a href="/#how" style={linkStyle} className="bb-nav-link">
            How it works
          </a>
          <a href="/#sports" style={linkStyle} className="bb-nav-link">
            Sports
          </a>
          <ThemeToggle />
          <a
            href={APPSTORE_HREF}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: 'var(--fg)',
              color: 'var(--bg)',
              padding: '8px 14px',
              borderRadius: 999,
              fontWeight: 600,
              fontSize: 14,
              textDecoration: 'none',
            }}
          >
            Download on App Store
          </a>
        </div>
      </div>
    </nav>
  );
}
