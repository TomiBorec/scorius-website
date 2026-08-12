'use client';

import { Reveal } from '@/components/Reveal';
import { SportSwitch } from '@/components/SportSwitch';
import { CheckIcon } from '@/components/icons';
import { MatchWatch, MatchPhone, MatchIsland } from '@/components/match/MatchDevices';
import { CTA } from '@/components/sections/CTA';
import { useI18n } from '@/i18n';

export function FeaturesContent() {
  const { t } = useI18n();
  const f = t.pages.features;
  return (
    <>
      <header className="page-hero">
        <Reveal as="span" className="section-kicker">
          {f.kicker}
        </Reveal>
        <Reveal as="h1">{f.title}</Reveal>
        <Reveal as="p" className="lead">
          {f.lead}
        </Reveal>
        <div className="switch-strip" style={{ alignItems: 'flex-start', padding: '24px 0 0', margin: 0 }}>
          <SportSwitch />
        </div>
      </header>

      {/* Score from wrist */}
      <section className="fblock">
        <Reveal className="fcopy">
          <span className="section-kicker">{f.watch.kicker}</span>
          <h2>{f.watch.title}</h2>
          <p>{f.watch.body}</p>
          <ul className="flist">
            {f.watch.list.map((item) => (
              <li key={item}>
                <CheckIcon />
                {item}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal className="fvisual" delay={80}>
          <div className="surface">
            <MatchWatch style={{ transform: 'scale(1.25)' }} />
          </div>
        </Reveal>
      </section>

      {/* Five sports */}
      <section className="fblock flip">
        <Reveal className="fcopy">
          <span className="section-kicker">{f.fiveSports.kicker}</span>
          <h2>{f.fiveSports.title}</h2>
          <p>{f.fiveSports.body}</p>
        </Reveal>
        <Reveal className="fvisual" delay={80}>
          <div className="surface" style={{ padding: 28 }}>
            <MatchPhone style={{ transform: 'scale(.82)' }} />
          </div>
        </Reveal>
      </section>

      <Reveal className="sports-table">
        <table className="stable">
          <thead>
            <tr>
              <th>{f.table.headers[0]}</th>
              <th>{f.table.headers[1]}</th>
              <th>{f.table.headers[2]}</th>
            </tr>
          </thead>
          <tbody>
            {f.table.rows.map((row) => (
              <tr key={row.sport}>
                <td className="sname">
                  <span className={`sdot ${row.dot}`} />
                  {row.sport}
                </td>
                <td>{row.scoring}</td>
                <td>{row.setup}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>

      {/* Live Activities */}
      <section className="fblock">
        <Reveal className="fcopy">
          <span className="section-kicker">{f.live.kicker}</span>
          <h2>{f.live.title}</h2>
          <p>{f.live.body}</p>
          <ul className="flist">
            {f.live.list.map((item) => (
              <li key={item}>
                <CheckIcon />
                {item}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal className="fvisual" delay={80}>
          <div className="surface" style={{ background: '#0b0b0d', borderColor: 'rgba(255,255,255,.08)' }}>
            <MatchIsland />
          </div>
        </Reveal>
      </section>

      {/* Stats & tournaments */}
      <section className="fblock flip">
        <Reveal className="fcopy">
          <span className="section-kicker">{f.stats.kicker}</span>
          <h2>{f.stats.title}</h2>
          <p>{f.stats.body}</p>
          <ul className="flist">
            {f.stats.list.map((item) => (
              <li key={item}>
                <CheckIcon />
                {item}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal className="fvisual" delay={80}>
          <div className="surface" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{f.stats.widget.head2head}</span>
              <span className="mono" style={{ color: 'var(--accent)', fontWeight: 700 }}>
                68%
              </span>
            </div>
            <div style={{ height: 10, borderRadius: 6, background: 'var(--hairline)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '68%', background: 'var(--accent)', borderRadius: 6 }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 8 }}>
              <div style={{ background: 'var(--card)', border: '1px solid var(--hairline)', borderRadius: 14, padding: 16 }}>
                <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                  17
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 4 }}>{f.stats.widget.wins}</div>
              </div>
              <div style={{ background: 'var(--card)', border: '1px solid var(--hairline)', borderRadius: 14, padding: 16 }}>
                <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                  8
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 4 }}>{f.stats.widget.losses}</div>
              </div>
              <div style={{ background: 'var(--card)', border: '1px solid var(--hairline)', borderRadius: 14, padding: 16 }}>
                <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>
                  W5
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 4 }}>{f.stats.widget.streak}</div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <hr className="divider" />

      {/* privacy + accessibility grid */}
      <section className="section">
        <div className="feat-grid" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
          <Reveal className="card mono">
            <div className="ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3 4 6v6c0 5 3.5 7.5 8 9 4.5-1.5 8-4 8-9V6l-8-3z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <h3>{f.grid.privacy.title}</h3>
            <p>{f.grid.privacy.body}</p>
          </Reveal>
          <Reveal className="card mono" delay={60}>
            <div className="ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v.01M11 12h1v4h1" />
              </svg>
            </div>
            <h3>{f.grid.a11y.title}</h3>
            <p>{f.grid.a11y.body}</p>
          </Reveal>
        </div>
      </section>

      <CTA variant="features" />
    </>
  );
}
