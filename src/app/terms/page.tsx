import type { Metadata } from 'next';
import { languageAlternates } from '../alternates';
import { TermsContent } from './TermsContent';

export const metadata: Metadata = {
  title: 'Terms of Use — Scorius',
  description: 'Terms of use for the Scorius app.',
  alternates: languageAlternates('/terms'),
};

export default function TermsPage() {
  return <TermsContent />;
}
