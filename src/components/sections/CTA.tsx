const TESTFLIGHT_HREF = 'https://testflight.apple.com/join/6QfNavYx';

export function CTA() {
  return (
    <section
      id="waitlist"
      style={{ maxWidth: 1200, margin: '0 auto', padding: '120px 32px 80px', textAlign: 'center' }}
    >
      <h2
        style={{
          fontSize: 'clamp(40px, 5.5vw, 80px)',
          fontWeight: 700,
          letterSpacing: -2,
          lineHeight: 0.98,
          margin: 0,
          textWrap: 'balance',
          maxWidth: 800,
          marginInline: 'auto',
        }}
      >
        Be there when new features ship.
      </h2>
      <p
        style={{
          fontSize: 18,
          lineHeight: 1.5,
          color: 'var(--muted)',
          maxWidth: 520,
          marginTop: 20,
          marginInline: 'auto',
          marginBottom: 40,
        }}
      >
        Join the TestFlight beta and be the first to try Badminton Log v3.
      </p>

      <a
        href={TESTFLIGHT_HREF}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-block',
          background: 'var(--fg)',
          color: 'var(--bg)',
          borderRadius: 999,
          padding: '14px 32px',
          fontSize: 16,
          fontWeight: 600,
          textDecoration: 'none',
          fontFamily: 'inherit',
        }}
      >
        Join TestFlight →
      </a>

      <div style={{ marginTop: 28, fontSize: 12, color: 'var(--muted)', letterSpacing: 0.4 }}>
        Requires iPhone with iOS 26+ and Apple Watch with watchOS 26+.
      </div>
    </section>
  );
}
