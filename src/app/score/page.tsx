import type { Metadata } from 'next';
import { ScoreContent } from './ScoreContent';

export const metadata: Metadata = {
  title: 'Keep score — Scorius',
  description: 'Keep score in your browser. Matches are saved on this device only.',
  robots: { index: false, follow: false },
};

export default function ScorePage() {
  return <ScoreContent />;
}
