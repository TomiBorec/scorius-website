import type { Metadata } from 'next';
import { languageAlternates } from '../alternates';
import { ImprintContent } from './ImprintContent';

export const metadata: Metadata = {
  title: 'Imprint — Scorius',
  description:
    'Operator identification and contact details for Scorius, as required by § 435 of the Czech Civil Code.',
  alternates: languageAlternates('/imprint'),
};

export default function ImprintPage() {
  return <ImprintContent />;
}
