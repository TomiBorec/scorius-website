'use client';

import { useI18n } from '@/i18n';

export function ImprintContent() {
  const { t } = useI18n();
  const p = t.pages.imprint;
  return (
    <>
      <header className="page-hero">
        <span className="section-kicker">{p.kicker}</span>
        <h1>{p.title}</h1>
        <p className="lead">{p.lead}</p>
      </header>

      <article className="article">
        <dl className="imprint-grid">
          <dt>{p.nameLabel}</dt>
          <dd>{p.name}</dd>

          <dt>{p.addressLabel}</dt>
          <dd>{p.address}</dd>

          <dt>{p.businessIdLabel}</dt>
          <dd>{p.businessId}</dd>

          <dt>{p.emailLabel}</dt>
          <dd>
            <a className="inline" href={`mailto:${p.email}`}>
              {p.email}
            </a>
          </dd>
        </dl>

        <h3>{p.noteTitle}</h3>
        <p className="muted">{p.note}</p>
      </article>
    </>
  );
}
