'use client';

import { useState } from 'react';
import { useI18n } from '@/i18n';

function Chevron() {
  return (
    <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function Faq() {
  const { t } = useI18n();
  const items = t.faq.items;
  // The first answer is open by default; items toggle independently.
  const [open, setOpen] = useState<Set<number>>(() => new Set([0]));

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <section className="faq-list">
      {items.map((item, i) => {
        const isOpen = open.has(i);
        return (
          <div key={item.q} className={`faq-item${isOpen ? ' open' : ''}`}>
            <button className="faq-q" onClick={() => toggle(i)} aria-expanded={isOpen}>
              {item.q} <Chevron />
            </button>
            <div className="faq-a">
              <div className="inner">
                <p>{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
