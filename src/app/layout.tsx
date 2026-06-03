import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { AppProvider } from '@/components/state';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['500', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://badmintonlog.com'),
  title: 'Scorius — Score every game from your wrist',
  description:
    'Scorius is a native iPhone, iPad and Apple Watch app that keeps score across five sports — badminton, tennis, basketball, football and golf. Heart rate, calories and per-sport rules built in. No servers, no accounts. (Formerly Badminton Log.)',
  applicationName: 'Scorius',
  authors: [{ name: 'Tomáš Kalmus' }],
  keywords: [
    'scorius',
    'badminton log',
    'badminton',
    'tennis',
    'basketball',
    'football',
    'golf',
    'apple watch',
    'iphone',
    'ipad',
    'score keeper',
    'tournament',
    'heart rate',
    'healthkit',
  ],
  openGraph: {
    title: 'Scorius — Score every game from your wrist',
    description:
      'Badminton Log is now Scorius. Score on your wrist for badminton, tennis, basketball, football and golf. Live BPM, calories and per-sport rules, synced over iCloud with no accounts.',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-32.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180' }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbfbfa' },
    { media: '(prefers-color-scheme: dark)', color: '#07070a' },
  ],
};

// Runs before paint so the theme + sport accent are correct on first frame
// (no flash of the wrong colour). Mirrors scripts/site.js init in the prototype.
const bootstrap = `(() => {
  try {
    var d = document.documentElement;
    var t = localStorage.getItem('scorius-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    d.dataset.theme = (t === 'light' || t === 'dark') ? t : (prefersDark ? 'dark' : 'light');
    var s = localStorage.getItem('scorius-sport');
    var sports = ['badminton','tennis','basketball','football','golf'];
    d.dataset.sport = sports.indexOf(s) !== -1 ? s : 'badminton';
  } catch (e) {
    document.documentElement.dataset.theme = 'light';
    document.documentElement.dataset.sport = 'badminton';
  }
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      data-sport="badminton"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootstrap }} />
      </head>
      <body>
        <AppProvider>
          <Nav />
          <main>{children}</main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
