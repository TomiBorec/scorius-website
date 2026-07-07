import type { Metadata } from 'next';
import { ImprintContent } from './ImprintContent';

export const metadata: Metadata = {
  title: 'Imprint — Scorius',
  description:
    'Operator and contact information for Scorius as required by §3 of Act No. 480/2004 Coll.',
};

export default function ImprintPage() {
  return <ImprintContent />;
}
