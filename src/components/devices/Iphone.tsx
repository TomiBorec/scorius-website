import type { CSSProperties } from 'react';
import type { GolfVM, MatchVM } from '@/hooks/useMatch';
import type { Dict } from '@/i18n';

type DeviceLoc = Dict['devices'];

function WifiGlyph() {
  return (
    <svg width="16" height="12" viewBox="0 0 18 13" fill="currentColor" aria-hidden>
      <path d="M9 2.2c2.5 0 4.8 1 6.4 2.5l1.3-1.4A11 11 0 0 0 9 .3 11 11 0 0 0 1.3 3.3l1.3 1.4A9 9 0 0 1 9 2.2zM9 6c1.4 0 2.7.5 3.6 1.5l1.3-1.4A7.6 7.6 0 0 0 9 4a7.6 7.6 0 0 0-4.9 2.1l1.3 1.4A5.3 5.3 0 0 1 9 6zm0 3.7c.7 0 1.3.3 1.8.8L9 12.4 7.2 10.5c.5-.5 1.1-.8 1.8-.8z" />
    </svg>
  );
}

function StandardScreen({ vm, loc }: { vm: MatchVM; loc: DeviceLoc }) {
  return (
    <div className="lm">
      <div className="lm-top">
        <div className="lm-title">{loc.activeMatch}</div>
        <div className="lm-close">✕</div>
      </div>
      <div className="lm-badge">
        <span>{vm.name}</span> · <span>{vm.mode}</span>
      </div>
      <div className="lm-games">
        <span>{vm.gamesLabel}</span>
        <b>{vm.games}</b>
      </div>
      <div className="lm-score">
        <div className={`lm-num a${vm.flashA ? ' pop' : ''}`}>{vm.scoreA}</div>
        <div className="lm-colon">
          <span />
          <span />
        </div>
        <div className={`lm-num b${vm.flashB ? ' pop' : ''}`}>{vm.scoreB}</div>
      </div>
      <div className="lm-taps">
        <div className={`lm-tap a${vm.flashA ? ' pop' : ''}`}>
          <div className="nm">{vm.nameA}</div>
          <div className="plus">+1</div>
        </div>
        <div className={`lm-tap b${vm.flashB ? ' pop' : ''}`}>
          <div className="nm">{vm.nameB}</div>
          <div className="plus">+1</div>
        </div>
      </div>
      <div className="lm-sub">
        <span className="clk" />
        <span>{vm.sub}</span>
      </div>
    </div>
  );
}

function GolfScreen({ golf, loc }: { golf: GolfVM; loc: DeviceLoc }) {
  return (
    <div className="lm-golf">
      <div className="gf-topbar">
        <span className="gf-x">✕</span>
        <span className="gf-title">{loc.activeMatch}</span>
        <span className="gf-moon">☾</span>
      </div>
      <div className="gf-head">
        <div className="gf-hole">
          {loc.hole} <b>{golf.hole}</b> / <span>{golf.holes}</span>
        </div>
        <div className="gf-par">
          {loc.par} <b>{golf.par}</b>
        </div>
      </div>
      <div className="gf-player">
        <div className="gf-pname">
          Tom<span>{loc.you}</span>
        </div>
        <div className="gf-step">
          <span className="gf-btn">−</span>
          <span className={`gf-strokes${golf.flash ? ' pop' : ''}`}>{golf.strokes}</span>
          <span className="gf-btn">+</span>
        </div>
      </div>
      <div className="gf-tot-label">{loc.totals}</div>
      <div className="gf-tot">
        <div className="gf-tot-name">Tom</div>
        <div className="gf-tot-big">{golf.total}</div>
        <div className="gf-tot-par">{golf.toParLabel}</div>
        <div className="gf-tot-thru">{golf.thru}</div>
      </div>
      <div className="gf-nav">
        <span className="gf-prev">{loc.prev}</span>
        <span className="gf-next">{loc.nextHole}</span>
      </div>
      <div className="gf-holes-label">{loc.holesLabel}</div>
      <div className="gf-chips">
        {golf.chips.map((c) => (
          <div key={c.hole} className={`gchip ${c.cls}${c.current ? ' cur' : ''}`}>
            <div className="gh-n">H{c.hole}</div>
            <div className="gh-s">{c.strokes}</div>
            <div className="gh-t">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Iphone({ vm, loc, style }: { vm: MatchVM; loc: DeviceLoc; style?: CSSProperties }) {
  return (
    // Decorative: the score changes on a timer, so exposing it to a screen
    // reader would be a stream of meaningless numbers. The surrounding copy
    // and the sr-only summary carry the meaning instead.
    <div className="iphone" style={style} aria-hidden="true">
      <div className="island" />
      <div className="iphone-screen">
        <div className="statusbar">
          <span>22:29</span>
          <span className="sb-r">
            <WifiGlyph />
            <span className="sb-batt" />
          </span>
        </div>
        {vm.golf ? <GolfScreen golf={vm.golf} loc={loc} /> : <StandardScreen vm={vm} loc={loc} />}
      </div>
    </div>
  );
}
