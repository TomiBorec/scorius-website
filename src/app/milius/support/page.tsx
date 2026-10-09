import type { Metadata } from 'next';
import { MiliusSupportContent } from './MiliusSupportContent';

/* Unlinked on purpose, like /milius/privacy: the App Store listing is the way in. */
export const metadata: Metadata = {
  title: 'Support — Milius',
  description: 'Help with Milius, the car trip tracker for iPhone and iPad.',
};

export default function MiliusSupportPage() {
  return <MiliusSupportContent />;
}
