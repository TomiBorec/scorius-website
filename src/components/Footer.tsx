'use client';

import Link from 'next/link';
import { Brand } from './Brand';
import { APPSTORE_URL } from './constants';
import { useI18n } from '@/i18n';

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Brand />
          <p>{t.footer.tagline}</p>
        </div>
        <div className="footer-col">
          <h4>{t.footer.productHead}</h4>
          <Link href="/features">{t.footer.features}</Link>
          <Link href="/#sports">{t.footer.sports}</Link>
          <Link href="/accessibility">{t.footer.accessibility}</Link>
          <a href={APPSTORE_URL} target="_blank" rel="noopener noreferrer">
            {t.footer.appStore}
          </a>
        </div>
        <div className="footer-col">
          <h4>{t.footer.supportHead}</h4>
          <Link href="/support">{t.footer.faq}</Link>
          <Link href="/support#contact">{t.footer.giveFeedback}</Link>
        </div>
        <div className="footer-col">
          <h4>{t.footer.legalHead}</h4>
          <Link href="/privacy">{t.footer.privacy}</Link>
          <Link href="/terms">{t.footer.terms}</Link>
          <Link href="/imprint">{t.footer.imprint}</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>{t.footer.rights}</span>
        <span className="mono">v2.2</span>
      </div>
      {/* Apple's marketing guidelines want the attribution wherever their marks
          appear — and they appear on every page, so it lives in the footer. */}
      <p className="footer-trademarks">{t.footer.trademarks}</p>
    </footer>
  );
}
