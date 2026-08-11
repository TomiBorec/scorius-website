import type { MatchVM } from '@/hooks/useMatch';
import type { Dict } from '@/i18n';

type DeviceLoc = Dict['devices'];

/**
 * Dynamic-Island / Lock-Screen Live Activity mock used on the Features page.
 * Under golf (single-player) the opponent column is hidden.
 */
export function LiveActivity({ vm, loc }: { vm: MatchVM; loc: DeviceLoc }) {
  const golf = !!vm.golf;
  return (
    <div style={{ width: '100%', maxWidth: 340 }} aria-hidden="true">
      <div
        style={{
          background: '#000',
          borderRadius: 26,
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          boxShadow: '0 20px 50px rgba(0,0,0,.5)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#fff' }}>
          <div
            className="mono"
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: 'var(--accent-soft)',
              display: 'grid',
              placeItems: 'center',
              color: 'var(--accent-bright)',
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            SC
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', fontWeight: 600 }}>{vm.sub}</div>
            <div style={{ fontSize: 13, color: '#fff', fontWeight: 700 }}>
              <span>{vm.nameA}</span>
              {!golf && (
                <span>
                  {' '}
                  v <span>{vm.nameB}</span>
                </span>
              )}
            </div>
          </div>
        </div>
        <div
          className="mono"
          style={{ fontWeight: 700, fontSize: 30, fontFeatureSettings: "'tnum'", display: 'flex', gap: 8, alignItems: 'center' }}
        >
          {/* The card is always black, so it takes the bright accent variant. */}
          <span style={{ color: 'var(--accent-bright)' }}>{vm.scoreA}</span>
          {!golf && (
            <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,.35)' }}>:</span>
              <span style={{ color: 'var(--rose)' }}>{vm.scoreB}</span>
            </span>
          )}
        </div>
      </div>
      <div className="mono" style={{ textAlign: 'center', color: 'rgba(255,255,255,.4)', fontSize: 12, marginTop: 16 }}>
        {loc.liveActivity}
      </div>
    </div>
  );
}
