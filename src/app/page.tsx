import type { Metadata } from 'next';
import { languageAlternates } from './alternates';
import { Hero } from '@/components/sections/Hero';
import { SwitchStrip } from '@/components/sections/SwitchStrip';
import { Features } from '@/components/sections/Features';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { PrivacyBand } from '@/components/sections/PrivacyBand';
import { AccessibilityNote } from '@/components/sections/AccessibilityNote';
import { CTA } from '@/components/sections/CTA';

export const metadata: Metadata = {
  alternates: languageAlternates('/'),
};

export default function Home() {
  return (
    <>
      <Hero />
      <SwitchStrip />
      <Features />
      <hr className="divider" />
      <HowItWorks />
      <PrivacyBand />
      <AccessibilityNote />
      <CTA variant="home" />
    </>
  );
}
