'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Brand } from './Brand';
import { ThemeToggle } from './ThemeToggle';
import { LangSwitch } from './LangSwitch';
import { NavMenu, type NavItem } from './NavMenu';
import { APPSTORE_URL } from './constants';
import { useI18n } from '@/i18n';

export function Nav() {
  const pathname = usePathname();
  const { t } = useI18n();
  const navRef = useRef<HTMLElement | null>(null);

  // Drives the scroll edge effect: the bar only separates itself from the page
  // once content is actually running underneath it.
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const sync = () => {
      if (window.scrollY > 4) el.setAttribute('data-scrolled', '');
      else el.removeAttribute('data-scrolled');
    };
    sync();
    window.addEventListener('scroll', sync, { passive: true });
    return () => window.removeEventListener('scroll', sync);
  }, []);

  // One list, rendered inline on desktop and inside the menu panel on mobile.
  const items: NavItem[] = [
    { href: '/features', label: t.nav.features },
    { href: '/#sports', label: t.nav.sports },
    { href: '/support', label: t.nav.support },
    { href: '/privacy', label: t.nav.privacy },
    { href: '/accessibility', label: t.nav.accessibility },
  ];

  return (
    <nav className="nav" ref={navRef}>
      <div className="nav-inner">
        <Brand />
        <div className="nav-links">
          {items.map((it) => (
            <Link
              key={it.href}
              className={`nav-link${pathname === it.href ? ' active' : ''}`}
              href={it.href}
            >
              {it.label}
            </Link>
          ))}
        </div>
        <div className="nav-spacer" />
        <div className="nav-actions">
          <LangSwitch />
          <ThemeToggle />
          <a className="btn btn-primary btn-sm" href={APPSTORE_URL} target="_blank" rel="noopener noreferrer">
            {t.nav.download}
          </a>
          <NavMenu items={items} />
        </div>
      </div>
    </nav>
  );
}
