import type { Metadata } from 'next';
import { languageAlternates } from '../alternates';
import { PrivacyContent } from './PrivacyContent';

export const metadata: Metadata = {
  title: 'Privacy — Scorius',
  description:
    'Scorius privacy policy. No accounts, no analytics, no third-party SDKs. Your data lives in your iCloud and Apple Health.',
  alternates: languageAlternates('/privacy'),
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
