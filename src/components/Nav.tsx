'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Brand } from './Brand';
import { ThemeToggle } from './ThemeToggle';
import { LangSwitch } from './LangSwitch';
import { MobileNav } from './MobileNav';
import { APPSTORE_URL } from './constants';
import { useI18n } from '@/i18n';

export function Nav() {
  const pathname = usePathname();
  const { t } = useI18n();
  const active = (path: string) => (pathname === path ? ' active' : '');

  // Drives the scroll edge effect: the separation only appears once content is
  // actually underneath the bar, not as a permanent hairline over nothing.
  const [overlapping, setOverlapping] = useState(false);
  useEffect(() => {
    const onScroll = () => setOverlapping(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`nav${overlapping ? ' scrolled' : ''}`}>
      <div className="nav-inner">
        <Brand />
        <div className="nav-links">
          <Link className={`nav-link${active('/features')}`} href="/features">
            {t.nav.features}
          </Link>
          <Link className="nav-link" href="/#sports">
            {t.nav.sports}
          </Link>
          <Link className={`nav-link${active('/support')}`} href="/support">
            {t.nav.support}
          </Link>
          <Link className={`nav-link${active('/privacy')}`} href="/privacy">
            {t.nav.privacy}
          </Link>
          <Link className={`nav-link${active('/accessibility')}`} href="/accessibility">
            {t.nav.accessibility}
          </Link>
        </div>
        <div className="nav-spacer" />
        <div className="nav-actions">
          <LangSwitch />
          <ThemeToggle />
          <a className="btn btn-primary btn-sm nav-download" href={APPSTORE_URL} target="_blank" rel="noopener noreferrer">
            {t.nav.download}
          </a>
          <MobileNav />
        </div>
      </div>
    </nav>
  );
}
