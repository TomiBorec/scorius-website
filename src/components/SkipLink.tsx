'use client';

import { useI18n } from '@/i18n';

/** First tab stop on every page — keyboard users skip the nav in one keystroke. */
export function SkipLink() {
  const { t } = useI18n();
  return (
    <a className="skip-link" href="#main">
      {t.nav.skipToContent}
    </a>
  );
}
