import type { Metadata } from 'next';
import { WatchEntry } from './WatchEntry';

export const metadata: Metadata = {
  title: 'Watch a live match — Scorius',
  description: 'Enter a Scorius code to follow a match live in your browser.',
  robots: { index: false, follow: false },
};

export default function WatchPage() {
  return <WatchEntry />;
}
