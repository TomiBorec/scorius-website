import type { Metadata } from 'next';
import { SpectateContent } from './SpectateContent';

export const metadata: Metadata = {
  title: 'Live score — Scorius',
  description: 'Follow a Scorius match live in your browser.',
  // Player names travel in the payload. A spectate page must never be indexed,
  // and this is one of two belts: the other is the Disallow in robots.txt, and
  // the relay also sets x-robots-tag on the stream itself.
  robots: { index: false, follow: false },
};

export default function SpectatePage() {
  return <SpectateContent />;
}
