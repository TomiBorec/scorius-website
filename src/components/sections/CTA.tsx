'use client';

import { useState } from 'react';

const TESTFLIGHT_EMAIL = 'kalmus.tom@icloud.com';

export function CTA() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    const subject = encodeURIComponent('TestFlight invite request');
    const body = encodeURIComponent(`Hi Tom,\n\nPlease send me a TestFlight invite for Badminton Log.\n\nMy email: ${email}\n\nThanks!`);
    window.location.href = `mailto:${TESTFLIGHT_EMAIL}?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

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
        Be on court when v3 ships.
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
        TestFlight invites go out weekly. Drop your email and we&apos;ll send you a code.
      </p>

      {!submitted ? (
        <form
          onSubmit={onSubmit}
          style={{
            display: 'flex',
            gap: 8,
            maxWidth: 460,
            margin: '0 auto',
            padding: 6,
            background: 'var(--pill-bg)',
            borderRadius: 999,
          }}
        >
          <input
            type="email"
            required
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              padding: '12px 18px',
              fontSize: 15,
              color: 'var(--fg)',
              fontFamily: 'inherit',
            }}
          />
          <button
            type="submit"
            style={{
              background: 'var(--fg)',
              color: 'var(--bg)',
              border: 'none',
              borderRadius: 999,
              padding: '12px 22px',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Request invite
          </button>
        </form>
      ) : (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 24px',
            borderRadius: 999,
            background: 'rgba(52,199,89,0.12)',
            color: '#34C759',
            fontSize: 15,
            fontWeight: 600,
            animation: 'bb-fade-up 240ms ease',
          }}
        >
          ✓ You&apos;re on the list. Check your inbox shortly.
        </div>
      )}

      <div style={{ marginTop: 28, fontSize: 12, color: 'var(--muted)', letterSpacing: 0.4 }}>
        Requires iPhone with iOS 17+ and Apple Watch Series 6 or later.
      </div>
    </section>
  );
}
