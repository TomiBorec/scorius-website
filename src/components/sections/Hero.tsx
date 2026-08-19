'use client';

import { HeroStage } from '@/components/match/MatchDevices';
import { AppStoreBadge } from '@/components/AppStoreBadge';
import Link from 'next/link';
import { useI18n } from '@/i18n';

export function Hero() {
  const { t } = useI18n();
  return (
    <header className="hero">
      <div>
        <span className="eyebrow">
          <span className="tick">{t.hero.eyebrowTick}</span> · {t.hero.eyebrow}
        </span>
        <h1>{t.hero.title}</h1>
        <p className="hero-lead">{t.hero.lead}</p>
        <p className="hero-sub">{t.hero.sub}</p>
        <div className="hero-cta">
          <AppStoreBadge />
          {/* Secondary on purpose. The web scorer covers four sports and keeps
              matches on one device; the app is still what this page is selling,
              so this sits beside the badge rather than competing with it. */}
          <Link className="btn btn-ghost" href="/score">
            {t.hero.scoreOnWeb}
          </Link>
          <a className="btn btn-ghost" href="#sports">
            {t.hero.see}
          </a>
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="v">11</div>
            <div className="l">{t.hero.stats.sports}</div>
          </div>
          <div className="hero-stat">
            <div className="v">&lt;1s</div>
            <div className="l">{t.hero.stats.sync}</div>
          </div>
          <div className="hero-stat">
            <div className="v">0</div>
            <div className="l">{t.hero.stats.accounts}</div>
          </div>
        </div>
      </div>

      <HeroStage />
    </header>
  );
}
