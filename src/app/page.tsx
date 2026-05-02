import { Nav } from '@/components/sections/Nav';
import { Hero } from '@/components/sections/Hero';
import { Features } from '@/components/sections/Features';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { BWFRules } from '@/components/sections/BWFRules';
import { HistoryShowcase } from '@/components/sections/HistoryShowcase';
import { CTA } from '@/components/sections/CTA';
import { Footer } from '@/components/sections/Footer';

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <BWFRules />
        <HistoryShowcase />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
