import type { Metadata } from 'next';
import { FeaturesContent } from './FeaturesContent';

export const metadata: Metadata = {
  title: 'Features — Scorius',
  description:
    'Everything Scorius does: score from your wrist, twelve sports, Live Activities, stats, tournaments, HealthKit and iCloud sync.',
};

export default function FeaturesPage() {
  return <FeaturesContent />;
}
