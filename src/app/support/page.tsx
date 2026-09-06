import type { Metadata } from 'next';
import { languageAlternates } from '../alternates';
import { SupportContent } from './SupportContent';

export const metadata: Metadata = {
  title: 'Support — Scorius',
  description:
    'Scorius support and frequently asked questions. Devices, sports, iCloud sync, Apple Watch, golf course search and feedback.',
  alternates: languageAlternates('/support'),
};

export default function SupportPage() {
  return <SupportContent />;
}
