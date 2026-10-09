import type { Metadata } from 'next';
import { MiliusPrivacyContent } from './MiliusPrivacyContent';

/*
  Milius — the car trip tracker by the same developer — has no site of its own; its
  App Store listing points here. Deliberately unlinked: not in the nav, the footer or the
  sitemap, so browsing scorius.app never leads to it. Reachable by URL only.
*/
export const metadata: Metadata = {
  title: 'Privacy — Milius',
  description:
    'Milius privacy policy. No accounts, no analytics, no server. Your drives stay on your devices and in your own iCloud.',
};

export default function MiliusPrivacyPage() {
  return <MiliusPrivacyContent />;
}
