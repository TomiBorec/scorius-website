'use client';

import Link from 'next/link';
import { Reveal } from '@/components/Reveal';
import { A11yIcon, VoiceOverIcon, DarkInterfaceIcon, DifferentiateIcon, CheckIcon } from '@/components/icons';
import { SUPPORT_EMAIL } from '@/components/constants';
import { useI18n } from '@/i18n';

const CARD_ICONS = [VoiceOverIcon, DarkInterfaceIcon, DifferentiateIcon];

export function AccessibilityContent() {
  const { t } = useI18n();
  const a = t.pages.accessibility;
  return (
    <>
      <header className="page-hero">
        <Reveal as="span" className="section-kicker">
          {a.kicker}
        </Reveal>
        <Reveal as="h1">{a.title}</Reveal>
        <Reveal as="p" className="lead">
          {a.lead}
        </Reveal>
      </header>

      {/* Per-device supported features — mirrors the App Store accessibility label. */}
      <section className="section" style={{ paddingTop: 24 }}>
        <div className="feat-grid">
          {a.devices.map((d, i) => (
            <Reveal key={d.name} className="card" delay={i ? i * 60 : undefined}>
              <div className="ico">
                <A11yIcon />
              </div>
              <h3>{d.name}</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--faint)' }}>{d.note}</p>
              <ul className="a11y-list">
                {a.supported.map((feat) => (
                  <li key={feat}>
                    <CheckIcon />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </section>

      <hr className="divider" />

      {/* What each feature means */}
      <section className="section">
        <Reveal className="section-head">
          <span className="section-kicker">{a.whatKicker}</span>
          <h2>{a.whatTitle}</h2>
          <p>{a.whatBody}</p>
        </Reveal>
        <div className="feat-grid">
          {a.cards.map((card, i) => {
            const Icon = CARD_ICONS[i];
            return (
              <Reveal key={card.title} className="card" delay={i ? i * 60 : undefined}>
                <div className="ico">
                  <Icon />
                </div>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Report an issue */}
      <div className="contact-band">
        <div className="contact-card">
          <div>
            <h3>{a.contactTitle}</h3>
            <p>{a.contactBody}</p>
          </div>
          <div className="hero-cta" style={{ margin: 0 }}>
            <a className="btn btn-primary" href={`mailto:${SUPPORT_EMAIL}`}>
              {a.emailSupport}
            </a>
            <Link className="btn btn-outline" href="/support">
              {a.support}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
