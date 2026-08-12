'use client';

import type { CSSProperties } from 'react';
import { useI18n } from '@/i18n';
import { useMatchVm } from './MatchProvider';
import { Iphone } from '@/components/devices/Iphone';
import { Watch } from '@/components/devices/Watch';
import { LiveActivity } from '@/components/devices/LiveActivity';

/* Every device below reads the same shared match, so multiple mockups on one
   page always show the same score. */

/** Hero device stage: an iPhone + Watch sharing one live match, on a glow. */
export function HeroStage() {
  const { t } = useI18n();
  const vm = useMatchVm();
  return (
    <div className="device-stage">
      <div className="device-glow" />
      <Iphone vm={vm} loc={t.devices} />
      <Watch vm={vm} loc={t.devices} />
    </div>
  );
}

/** A Watch running the page's live match. */
export function MatchWatch({ style }: { style?: CSSProperties }) {
  const { t } = useI18n();
  const vm = useMatchVm();
  return <Watch vm={vm} loc={t.devices} style={style} />;
}

/** An iPhone running the page's live match. */
export function MatchPhone({ style }: { style?: CSSProperties }) {
  const { t } = useI18n();
  const vm = useMatchVm();
  return <Iphone vm={vm} loc={t.devices} style={style} />;
}

/** A Live-Activity island running the page's live match. */
export function MatchIsland() {
  const { t } = useI18n();
  const vm = useMatchVm();
  return <LiveActivity vm={vm} loc={t.devices} />;
}
