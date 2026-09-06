import Link from 'next/link';
import { OPERATOR_ID, OPERATOR_NAME, SUPPORT_EMAIL } from '@/components/constants';

/**
 * English content dictionary. This module defines the canonical *shape* of the
 * site copy — `Dict = typeof en` (see ./index), so every other locale is forced
 * to provide the exact same keys. Plain prose lives as strings; anything with
 * embedded markup (links, <br>, emphasis, lists) lives as a ReactNode.
 */
export const en = {
  nav: {
    features: 'Features',
    sports: 'Sports',
    support: 'Support',
    privacy: 'Privacy',
    accessibility: 'Accessibility',
    download: 'Download',
  },

  navMenu: {
    open: 'Open menu',
    close: 'Close menu',
    label: 'Site',
  },

  langSwitch: {
    aria: 'Choose language',
    cs: 'CZ',
    en: 'EN',
    csTitle: 'Přepnout do češtiny',
    enTitle: 'Switch to English',
  },

  themeToggle: {
    toLight: 'Switch to light theme',
    toDark: 'Switch to dark theme',
  },

  sports: {
    badminton: 'Badminton',
    tennis: 'Tennis',
    padel: 'Padel',
    pickleball: 'Pickleball',
    squash: 'Squash',
    tableTennis: 'Table Tennis',
    volleyball: 'Volleyball',
    basketball: 'Basketball',
    football: 'Football',
    floorball: 'Floorball',
    golf: 'Golf',
    discGolf: 'Disc Golf',
  },

  hero: {
    eyebrowTick: '2.0',
    eyebrow: 'Now multi-sport',
    title: (
      <>
        Score every game
        <br />
        from your <span className="accent">wrist.</span>
      </>
    ),
    lead: (
      <>
        Badminton, tennis, padel, squash, volleyball… <span className="muted">Twelve sports. One app. One tap.</span>
      </>
    ),
    sub: 'Scorius keeps score for you on Apple Watch across twelve sports — with heart rate, calories and per-sport rules built in. iPhone and iPad mirror every point live, and everything syncs over iCloud.',
    download: 'Download on App Store',
    see: 'See it in action →',
    scoreOnWeb: 'Keep score in your browser →',
    stats: { sports: 'Sports', sync: 'Live sync', accounts: 'Accounts' },
  },

  switchStrip: {
    hint: 'Tap a sport to preview its scorer',
  },

  features: {
    kicker: 'Built for the way you play',
    heading: 'Everything a scorekeeper needs. Nothing it doesn’t.',
    spotlight: {
      kicker: 'From your wrist',
      title: 'Keep both hands on the racquet.',
      body: 'Score a whole match from Apple Watch with a tap. Starting a match kicks off a native Apple Watch workout automatically — heart rate and active calories are logged in Apple Health, so there’s no second fitness app to remember to open. The score lands on your iPhone, iPad and Lock Screen in under a second.',
      cta: 'How it works →',
    },
    cards: [
      {
        title: 'Twelve sports, one app',
        body: 'Badminton, tennis, padel, squash, table tennis, volleyball, basketball, football, floorball, golf and disc golf — each with its own rules engine, scorer and stats. Switch sport, the app re-tunes itself.',
      },
      {
        title: 'iCloud sync',
        body: 'Match history, rules, your player roster and per-sport settings ride along on every device. No accounts, no sign-in — it just appears.',
      },
      {
        title: 'Live Activities',
        body: 'Score, period clock and game state on the Lock Screen and in the Dynamic Island — glance down, stay in the match.',
      },
      {
        title: 'Owner-perspective stats & tournaments',
        body: 'Head-to-head record against every opponent, win streaks and win-rate by format — plus singles or doubles brackets with automatic seeding and per-tournament rules.',
      },
      {
        title: 'HealthKit workouts',
        body: 'Start a match and a native Apple Watch workout starts with it — heart rate and active calories land in Apple Health. No separate fitness app to open.',
      },
    ],
  },

  howItWorks: {
    kicker: 'From first serve to final whistle',
    heading: 'Three taps to a tracked match.',
    steps: [
      {
        title: 'Pick a sport',
        body: 'Choose from twelve sports — from badminton to disc golf. Scorius loads the right rules — games, sets, periods, holes.',
      },
      {
        title: 'Tap to score',
        body: 'Score from your wrist or your phone. Rally points, 15/30/40, +2/+3, goals or strokes — handled for you.',
      },
      {
        title: 'Keep the record',
        body: 'Match lands in your history and stats, synced over iCloud, with a workout in Apple Health.',
      },
    ],
  },

  privacyBand: {
    kicker: 'Privacy first',
    heading: 'Your matches are yours.',
    body: 'No accounts. No analytics. No third-party SDKs. Your matches never leave your devices and your iCloud — the developer cannot see them. The one thing that ever goes further is a live score you choose to share, and only while the match is on.',
    cta: 'Read the privacy policy →',
    points: [
      {
        title: 'No accounts, ever',
        body: 'Open the app and play. Nothing to sign up for, nothing to remember.',
      },
      {
        title: 'Stored in your iCloud',
        body: 'Data lives in your private iCloud key-value store and Apple Health — not on anyone’s server.',
      },
      {
        title: 'Nothing tracked',
        body: 'Zero telemetry. We don’t know how, when or whether you use the app.',
      },
    ],
  },

  a11yNote: {
    kicker: 'Accessibility',
    heading: 'Everyone should get to keep score.',
    body: 'We want Scorius open to as many people as possible. It supports VoiceOver, a full dark interface and Differentiate Without Color on every device — and accessibility is never finished. If something gets in your way, or you have an idea that would make it better, we genuinely want to hear it.',
    pills: ['VoiceOver', 'Dark Interface', 'Differentiate Without Color'],
    cta: 'See what we support →',
  },

  cta: {
    kicker: 'Free · iPhone, iPad & Apple Watch',
    downloadSmall: 'Download on the',
    appStore: 'App Store',
    home: { title: 'Ready to play?', subtitle: 'Start tracking your next match in three taps.' },
    features: { title: 'Try it on your next match.', subtitle: 'Three taps from download to a tracked game.' },
  },

  footer: {
    tagline: 'A native multi-sport match tracker for iPhone, iPad and Apple Watch. Score from your wrist, sync via iCloud.',
    productHead: 'Product',
    supportHead: 'Support',
    legalHead: 'Legal',
    features: 'Features',
    sports: 'Sports',
    accessibility: 'Accessibility',
    appStore: 'App Store',
    faq: 'FAQ',
    giveFeedback: 'Give feedback',
    privacy: 'Privacy',
    terms: 'Terms of use',
    imprint: 'Imprint',
    rights: '© 2026 Scorius. Made for people who keep score.',
    trademarks:
      'Apple, the Apple logo, Apple Watch, iPhone and iPad are trademarks of Apple Inc., registered in the U.S. and other countries. App Store is a service mark of Apple Inc.',
  },

  devices: {
    activeMatch: 'Active Match',
    totals: 'Totals',
    holesLabel: 'Holes',
    prev: '◀◀ Prev',
    nextHole: 'Next hole ▶▶',
    you: 'You',
    hole: 'Hole',
    par: 'Par',
    liveActivity: 'LIVE ACTIVITY · LOCK SCREEN',
    modes: {
      badminton: 'Singles',
      tennis: 'Singles',
      padel: 'Doubles',
      pickleball: 'Doubles',
      squash: 'Singles',
      tableTennis: 'Singles',
      volleyball: '6 v 6',
      basketball: '3 v 3',
      football: '5-a-side',
      floorball: '5 v 5',
      golf: 'Stroke play',
      discGolf: 'Stroke play',
    },
    gamesLabels: {
      badminton: 'Games',
      tennis: 'Games',
      padel: 'Games',
      pickleball: 'Games',
      squash: 'Games',
      tableTennis: 'Games',
      volleyball: 'Sets',
      basketball: 'Period',
      football: 'Half',
      floorball: 'Period',
      golf: 'To par',
      discGolf: 'To par',
    },
    periodShort: (p: number) => `P${p}`,
    sub: {
      badminton: (game: number) => `Game ${game}`,
      tennis: (set: number, sa: number, sb: number) => `Set ${set} · Sets ${sa}–${sb}`,
      padel: (game: number) => `Game ${game}`,
      pickleball: (game: number) => `Game ${game}`,
      squash: (game: number) => `Game ${game}`,
      tableTennis: (game: number) => `Game ${game}`,
      volleyball: (set: number, sa: number, sb: number) => `Set ${set} · Sets ${sa}–${sb}`,
      basketball: (period: number, clock: string) => `P${period} · ${clock}`,
      football: (firstHalf: boolean, minute: number) => `${firstHalf ? '1st' : '2nd'} Half · ${minute}'`,
      floorball: (period: number, clock: string) => `P${period} · ${clock}`,
      golf: (hole: number, par: number) => `Hole ${hole} · Par ${par}`,
    },
  },

  faq: {
    items: [
      {
        q: 'How much does Scorius cost?',
        a: 'Scorius is a free download on the App Store for iPhone, iPad and Apple Watch — and every feature is included free, with no subscription. The only optional purchase is a set of alternative app-icon designs if you’d like to change how Scorius looks on your Home Screen; it’s purely cosmetic.',
      },
      {
        q: 'Do I need an account?',
        a: 'No. There is nothing to sign up for. Open the app and start scoring. Sync happens through your own iCloud automatically — no username, no password.',
      },
      {
        q: 'Which devices are supported?',
        a: 'iPhone and iPad on iOS / iPadOS 26 or later, and Apple Watch on watchOS 26 or later. The Watch app is optional — you can score entirely from your phone if you prefer.',
      },
      {
        q: 'Do I need an Apple Watch?',
        a: 'No. Everything works on iPhone and iPad on their own. An Apple Watch unlocks wrist scoring plus heart rate and calorie tracking, but it isn’t required.',
      },
      {
        q: 'Which sports can I track?',
        a: 'Badminton, tennis, padel, pickleball, squash, table tennis, volleyball, basketball, football, floorball, golf and disc golf — each with its own proper scoring rules, which you can configure per sport.',
      },
      {
        q: 'Does it work offline?',
        a: 'Yes. Scoring works fully offline. Each device keeps a local copy, and changes sync through iCloud the next time you’re online. The only feature needing a connection is golf course search.',
      },
      {
        q: 'How does golf course search work?',
        a: 'When you set up a golf round you can search a public course database to pull in holes and pars, or enter pars manually. The search sends only your query text — nothing personal.',
      },
      {
        q: 'Can I export my data?',
        a: 'Yes. Export your full match history as JSON or CSV from inside the app, and import it back whenever you like. Your data is never locked in.',
      },
      {
        q: 'Is my data private?',
        a: (
          <>
            Completely. No accounts, no analytics, no third-party SDKs. Your data stays in your iCloud and Apple Health — the
            developer can’t see it. The only exception is a live score you explicitly choose to share, which is held
            just while the match is played and never includes your history. See the{' '}
            <Link className="inline" href="/privacy">
              privacy policy
            </Link>{' '}
            for detail.
          </>
        ),
      },
    ],
  },

  pages: {
    support: {
      kicker: 'Support',
      title: 'Questions? Answered.',
      lead: 'The quick answers to the things people ask most. Can’t find it? Send feedback straight from the app.',
      contactTitle: 'Still stuck?',
      contactBody: (
        <>
          Email <strong>{SUPPORT_EMAIL}</strong>, tap <strong>Settings → Give Feedback</strong> inside the app, or open an
          issue on the project repo.
        </>
      ),
      emailSupport: 'Email support',
      appStore: 'App Store',
      openIssue: 'Open an issue',
    },

    features: {
      kicker: 'Features',
      title: (
        <>
          A scorekeeper for
          <br />
          every sport you play.
        </>
      ),
      lead: 'Twelve sports, three devices, one consistent app. Pick a sport below — the previews update to match.',
      watch: {
        kicker: 'Apple Watch',
        title: 'Score from your wrist.',
        body: 'The whole match lives on your wrist — tap a side to score, twist the crown to undo. Starting a match automatically starts a native Apple Watch workout, so heart rate and calories land in Apple Health with no second fitness app to open.',
        list: [
          'Per-sport scorer tuned to each game’s rules',
          'Starts a native Apple Watch workout — heart rate & calories, no extra app',
          'Mirrors to iPhone & iPad in under a second',
        ],
      },
      fiveSports: {
        kicker: 'Twelve sports',
        title: 'One app that speaks every game.',
        body: 'Each sport has its own scoring engine — not a generic counter with labels swapped. Rally points, 15/30/40, period clocks, goals or strokes are all modelled properly, with configurable rules per sport.',
      },
      table: {
        headers: ['Sport', 'Scoring', 'Setup'],
        rows: [
          {
            sport: 'Badminton',
            dot: 'dot-bad',
            scoring: 'Rally points, games to win the match, optional sudden-death cap',
            setup: 'Singles / Doubles, up to 4 players',
          },
          {
            sport: 'Tennis',
            dot: 'dot-ten',
            scoring: '0/15/30/40/AD, sets, tiebreak, optional final-set TB / No-Ad',
            setup: 'Singles / Doubles, up to 4 players',
          },
          {
            sport: 'Padel',
            dot: 'dot-pad',
            scoring: '0/15/30/40/AD, sets, tiebreak, optional No-Ad',
            setup: 'Doubles, up to 4 players',
          },
          {
            sport: 'Pickleball',
            dot: 'dot-pic',
            scoring: 'Rally to 11, win by 2, side-out scoring',
            setup: 'Singles / Doubles, up to 4 players',
          },
          {
            sport: 'Squash',
            dot: 'dot-squ',
            scoring: 'PAR to 11, best of 5 games',
            setup: 'Singles, 2 players',
          },
          {
            sport: 'Table Tennis',
            dot: 'dot-tab',
            scoring: 'Games to 11, best of 5 or 7 sets',
            setup: 'Singles / Doubles, up to 4 players',
          },
          {
            sport: 'Volleyball',
            dot: 'dot-vol',
            scoring: 'Rally to 25, sets to win match, 5th set to 15',
            setup: 'Rotations, up to 12 players per team',
          },
          {
            sport: 'Basketball',
            dot: 'dot-bas',
            scoring: '+1 / +2 / +3 per shot, periods with countdown clock + OT',
            setup: 'Variable team size 1–10',
          },
          {
            sport: 'Football',
            dot: 'dot-foo',
            scoring: '+1 goal per shot, halves with countdown clock + ET',
            setup: 'Team size 1–22 (starters + subs)',
          },
          {
            sport: 'Floorball',
            dot: 'dot-flo',
            scoring: '+1 goal per shot, 3 periods with countdown clock + OT',
            setup: 'Team size 1–20 (starters + subs)',
          },
          {
            sport: 'Golf',
            dot: 'dot-gol',
            scoring: 'Per-hole strokes, 1–4 player flight, to-par chip',
            setup: 'Course search (API) or manual par editor',
          },
          {
            sport: 'Disc Golf',
            dot: 'dot-dgo',
            scoring: 'Per-hole throws, 1–4 player flight, to-par chip',
            setup: 'Course search (API) or manual par editor',
          },
        ],
      },
      live: {
        kicker: 'Lock Screen & Dynamic Island',
        title: 'Glance down, stay in the game.',
        body: 'A Live Activity puts the score, period clock and game state on your Lock Screen and in the Dynamic Island. Golf shows only your own strokes — no opponent column to peek at.',
        list: ['Updates live as the match runs', 'End-of-period buzzer with haptics & sound'],
      },
      stats: {
        kicker: 'Stats & tournaments',
        title: 'Know your record. Run the bracket.',
        body: 'Owner-perspective stats give you a head-to-head record against every opponent, win streaks and win-rate by format. Spin up singles or doubles tournaments with automatic seeding and per-tournament rules.',
        list: [
          'Head-to-head vs every player on your roster',
          'Reusable player roster, synced via iCloud',
          'Auto-seeded brackets, configurable rules',
        ],
        widget: { head2head: 'Head-to-head · Tom vs Bob', wins: 'Wins', losses: 'Losses', streak: 'Streak' },
      },
      grid: {
        privacy: {
          title: 'Private by design',
          body: (
            <>
              No accounts, no analytics, no third-party SDKs. Data lives in your iCloud and Apple Health — the developer
              can’t see it. Only a live score you choose to share ever travels.{' '}
              <Link href="/privacy" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                Read the policy →
              </Link>
            </>
          ),
        },
        a11y: {
          title: 'Accessible to everyone',
          body: (
            <>
              VoiceOver, a full dark interface and Differentiate Without Color — Scorius supports Apple’s accessibility
              features on iPhone, iPad and Apple Watch.{' '}
              <Link href="/accessibility" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                See what we support →
              </Link>
            </>
          ),
        },
      },
    },

    accessibility: {
      kicker: 'Accessibility',
      title: (
        <>
          Made to be used
          <br />
          by everyone.
        </>
      ),
      lead: 'We want Scorius open to as many people as possible. It supports Apple’s built-in accessibility features across iPhone, iPad and Apple Watch — and because accessibility is never finished, we welcome every idea on how to make it better.',
      devices: [
        { name: 'iPhone', note: 'Requires iOS 26 or later' },
        { name: 'iPad', note: 'Requires iPadOS 26 or later' },
        { name: 'Apple Watch', note: 'Requires watchOS 26 or later' },
      ],
      supported: ['VoiceOver', 'Dark Interface', 'Differentiate Without Color Alone'],
      whatKicker: 'What we support',
      whatTitle: 'Accessibility, built in.',
      whatBody: 'Scorius leans on Apple’s frameworks, so these work the way you already expect across the whole app.',
      cards: [
        {
          title: 'VoiceOver',
          body: 'Every control — scoring, history and stats — is labelled for Apple’s screen reader, so you can run a whole match without looking.',
        },
        {
          title: 'Dark Interface',
          body: 'A full dark theme that follows your system appearance — easier on the eyes courtside or in low light.',
        },
        {
          title: 'Differentiate Without Color',
          body: 'Scores and match states never lean on colour alone — shapes, labels and symbols carry the meaning too.',
        },
      ],
      contactTitle: 'Hit a barrier, or have an idea?',
      contactBody: (
        <>
          We read every suggestion and we’re always glad to make Scorius work for more people — email{' '}
          <strong>{SUPPORT_EMAIL}</strong> or use <strong>Settings → Give Feedback</strong> inside the app.
        </>
      ),
      emailSupport: 'Email support',
      support: 'Support',
    },

    privacy: {
      kicker: 'Privacy',
      title: 'Your matches are yours.',
      lead: 'Scorius is built so the developer never sees your data. No accounts, no analytics, no third-party SDKs — your matches stay on your devices and in your iCloud.',
      meta: 'Last updated · September 2026 · Applies to Scorius 2.2',
      tocTitle: 'On this page',
      article: (
        <>
          <div className="toc">
            <h4>On this page</h4>
            <ol>
              <li>
                <a href="#summary">The short version</a>
              </li>
              <li>
                <a href="#controller">Who the controller is</a>
              </li>
              <li>
                <a href="#stored">What Scorius stores — and where</a>
              </li>
              <li>
                <a href="#spectate">Live Spectate</a>
              </li>
              <li>
                <a href="#network">Network &amp; third parties</a>
              </li>
              <li>
                <a href="#website">Website data &amp; local storage</a>
              </li>
              <li>
                <a href="#health">Health data</a>
              </li>
              <li>
                <a href="#control">Your control</a>
              </li>
              <li>
                <a href="#children">Children</a>
              </li>
              <li>
                <a href="#gdpr">Your GDPR rights</a>
              </li>
              <li>
                <a href="#changes">Changes &amp; contact</a>
              </li>
            </ol>
          </div>

          <h2 id="summary">The short version</h2>
          <p>
            Scorius has <strong>no accounts, no analytics, no telemetry and no third-party SDKs</strong>. Your match
            history lives on your own devices and is never uploaded anywhere. The only time anything leaves your device
            for a server run by the developer is when <strong>you</strong> start a Live Spectate session — and even then
            it is only the live score of that one match, for as long as it is being played. The developer cannot see your
            history, your stats or anything else.
          </p>

          <h2 id="controller">Who the controller is</h2>
          <p>
            Scorius is operated by <strong>{OPERATOR_NAME}</strong>, a sole trader registered in the Czech trade
            register, business ID (IČO) {OPERATOR_ID}, Petra Rezka 1114/8, Nusle, 140&nbsp;00 Prague 4, Czech Republic.
            For everything described below he is the data controller, and you can reach him at{' '}
            <a className="inline" href={`mailto:${SUPPORT_EMAIL}`}>
              {SUPPORT_EMAIL}
            </a>
            . Full contact details are on the{' '}
            <Link className="inline" href="/imprint">
              Imprint
            </Link>{' '}
            page.
          </p>
          <p>
            Given how Scorius is built, that role almost never comes into play: the only processing that happens on the
            operator&rsquo;s side is <a className="inline" href="#spectate">Live Spectate</a>, which you start yourself,
            and the legal basis is performance of a contract — providing the service you explicitly asked for
            (Art.&nbsp;6(1)(b) GDPR). Nothing else leaves your device for the operator.
          </p>

          <h2 id="stored">What Scorius stores — and where</h2>
          <p>
            Everything Scorius keeps lives on your own devices and in your own iCloud. Nothing here is uploaded to a
            server run by the developer — not your history, not your stats, not your roster. The one exception is
            described under <a className="inline" href="#spectate">Live Spectate</a>, and it never includes any of this.
          </p>
          <ul>
            <li>
              <strong>Match history, per-sport rules, player roster and settings</strong> are saved in your private
              iCloud key-value store (<span className="mono">NSUbiquitousKeyValueStore</span>), with a local mirror on
              each device for offline reads.
            </li>
            <li>
              <strong>An in-progress match</strong> is stored only on the device scoring it — it is not synced.
            </li>
            <li>
              <strong>Workouts (heart rate, active calories)</strong> are written to Apple Health, and only when you
              explicitly grant access on Apple Watch.
            </li>
          </ul>
          <p>
            Because sync uses your personal iCloud, it is covered by{' '}
            <a className="inline" href="https://www.apple.com/legal/privacy/" target="_blank" rel="noopener noreferrer">
              Apple’s privacy policy
            </a>
            . The developer has no access to it.
          </p>

          <h2 id="spectate">Live Spectate</h2>
          <p>
            Live Spectate is <strong>off by default and starts only when you tap it</strong>. While a session is running,
            Scorius sends the live score of that single match — points, games, period, clock and the side names you chose
            — to a server operated by the developer on Cloudflare, so anyone you give the code or link to can follow
            along in a browser.
          </p>
          <ul>
            <li>
              <strong>Anyone with the code can watch.</strong> There is no password. Only your device can update the
              score; spectators can only read it.
            </li>
            <li>
              <strong>It is kept only for the match.</strong> The relay remembers just the latest state of the match, so
              a spectator joining midway sees the current score. That state is deleted automatically{' '}
              <strong>at most 4 hours</strong> after the last update, and <strong>30 minutes</strong> after the match
              finishes. There is no history, no backup and no log of match content. Cloudflare, as the infrastructure
              provider, keeps standard operational request logs (technical metadata, not match content).
            </li>
            <li>
              <strong>Your history is never sent.</strong> Only the match currently being played, and only while the
              session is open. Sharing stops when the match ends.
            </li>
            <li>
              <strong>Nothing identifies you — except the names you type.</strong> No account, no device identifier, no
              IP logging beyond Cloudflare&rsquo;s standard network protection. The only personal data that reaches the
              relay are the names you give the sides.
            </li>
            <li>
              <strong>Names are up to you.</strong> If you name a side with a real name, that name is visible to anyone
              with the code. Use a nickname if you&rsquo;d rather not.
            </li>
          </ul>
          <p>
            Spectator pages are excluded from search engines. You can turn the whole feature off in Settings, which
            removes the sharing option from the app entirely.
          </p>
          <p>
            Naming a side after somebody else shares their data — only do it with their knowledge. If you come across a
            shared match carrying an abusive or otherwise inappropriate name, write to{' '}
            <a className="inline" href={`mailto:${SUPPORT_EMAIL}`}>
              {SUPPORT_EMAIL}
            </a>{' '}
            and the session will be shut down.
          </p>

          <h2 id="network">Network &amp; third parties</h2>
          <p>
            Scorius makes two kinds of optional outbound request, and you trigger both yourself. When you{' '}
            <strong>search for a golf course</strong>, the app queries the public golf-course database{' '}
            <a className="inline" href="https://golfcourseapi.com" target="_blank" rel="noopener noreferrer">
              golfcourseapi.com
            </a>{' '}
            to fetch course and par information; no personal data is attached beyond your search text. When you start{' '}
            <strong>Live Spectate</strong>, the live score goes to the developer&rsquo;s relay as described above. If you
            do neither, Scorius makes no network calls at all beyond your own iCloud.
          </p>
          <p>There are no advertising SDKs, no crash-reporting services and no usage analytics of any kind.</p>
          <p>
            The complete list of third parties involved in running Scorius: <strong>Apple</strong> (App Store
            distribution, iCloud, HealthKit — governed by{' '}
            <a className="inline" href="https://www.apple.com/legal/privacy/" target="_blank" rel="noopener noreferrer">
              Apple&rsquo;s privacy policy
            </a>
            ), <strong>Cloudflare</strong> (hosting for this site and the Live Spectate relay, acting as processor) and{' '}
            <strong>golfcourseapi.com</strong> (course lookup, only when you use it). Nobody else.
          </p>

          <h2 id="website">Website data &amp; local storage</h2>
          <p>
            This website (scorius.app) <strong>sets no cookies</strong> and embeds no third-party tracking scripts,
            analytics or advertising tools. Fonts are served from scorius.app itself, so simply reading the site sends
            not one request to anybody else&rsquo;s server. The site is hosted on Cloudflare Pages; Cloudflare, as the
            infrastructure provider, keeps standard operational request logs.
          </p>
          <p>
            The site does store data <strong>in your browser</strong>, though. Everything below is needed for what you
            explicitly asked for — a theme that survives a reload, or a scoreboard that doesn&rsquo;t forget the score
            when your screen locks. That is why there is no consent banner: this is strictly necessary storage under
            § 89(3) of Czech Act No. 127/2005 Coll. (the ePrivacy rule on terminal-equipment storage).
          </p>
          <p>
            <strong>On every page (localStorage):</strong>
          </p>
          <ul>
            <li>
              <strong>scorius-theme</strong> &mdash; your chosen colour scheme (light or dark)
            </li>
            <li>
              <strong>scorius-sport</strong> &mdash; your currently selected sport
            </li>
            <li>
              <strong>scorius-lang</strong> &mdash; your preferred language (English or Czech)
            </li>
          </ul>
          <p>These are written only once you actually switch something. Read the site and the store stays empty.</p>
          <p>
            <strong>Additionally in the browser scoreboard (<span className="mono">/score</span>):</strong>
          </p>
          <ul>
            <li>
              <strong>scorius-active-match</strong> and <strong>scorius-schema</strong> (localStorage) &mdash; the
              in-progress match and its format version, so a single point survives a locked phone or a reload.
            </li>
            <li>
              <strong>IndexedDB “scorius”</strong> &mdash; the history of finished matches, including the names you give
              the sides. You type those names, and they stay here.
            </li>
            <li>
              <strong>A service worker and its cache</strong> &mdash; a copy of the page, so the scoreboard works with
              no signal.
            </li>
            <li>
              <strong>Persistent storage</strong> &mdash; the scoreboard asks your browser not to evict this data when
              space runs short. Some browsers will ask you; declining breaks nothing.
            </li>
          </ul>
          <p>
            The spectator pages (<span className="mono">/w/</span> and <span className="mono">/watch</span>) display a
            live score and store nothing; they are excluded from search engines.
          </p>
          <p>
            None of this ever leaves your browser. It is not sent to any server &mdash; including the
            developer&rsquo;s &mdash; and is not used for analytics, advertising, profiling or any other purpose. You
            can export and delete your history from the scoreboard, and clear all of it at once by clearing site data in
            your browser settings.
          </p>

          <h2 id="health">Health data</h2>
          <p>
            If you start a match from Apple Watch, Scorius can run a workout to record <strong>heart rate</strong> and{' '}
            <strong>active calories</strong>. This data is written to Apple Health on your device and is governed by your
            Health permissions. You can revoke access at any time in{' '}
            <em>Settings → Health → Data Access &amp; Devices</em>. Scorius never transmits Health data anywhere.
          </p>

          <h2 id="control">Your control</h2>
          <ul>
            <li>
              <strong>Export &amp; import:</strong> you can export your full match history as JSON or CSV from inside the
              app, and import it back.
            </li>
            <li>
              <strong>Delete:</strong> deleting a match removes it from history and from iCloud sync. Removing the app and
              clearing its iCloud data deletes everything.
            </li>
            <li>
              <strong>Health:</strong> grant or revoke heart-rate and calorie access whenever you like.
            </li>
          </ul>

          <h2 id="children">Children</h2>
          <p>
            Scorius does not collect any personal information from anyone, including children. It is safe to use at any age,
            and it requires no account or profile.
          </p>

          <h2 id="gdpr">Your rights under GDPR</h2>
          <p>
            If you are in the European Economic Area, you have the following rights regarding your personal data:
          </p>
          <ul>
            <li>
              <strong>Right of access (Art.&nbsp;15 GDPR)</strong> &mdash; request a copy of the data we hold about you.
            </li>
            <li>
              <strong>Right to rectification (Art.&nbsp;16 GDPR)</strong> &mdash; correct inaccurate or incomplete data.
            </li>
            <li>
              <strong>Right to erasure (Art.&nbsp;17 GDPR)</strong> &mdash; request deletion of your data.
            </li>
            <li>
              <strong>Right to restriction (Art.&nbsp;18 GDPR)</strong> &mdash; limit how we process your data.
            </li>
            <li>
              <strong>Right to portability (Art.&nbsp;20 GDPR)</strong> &mdash; receive your data in a structured format.
            </li>
            <li>
              <strong>Right to object (Art.&nbsp;21 GDPR)</strong> &mdash; object to processing of your data.
            </li>
          </ul>
          <p>
            Outside a running Live Spectate session, Scorius stores no personal data on the operator&rsquo;s servers
            (the app uses only your private iCloud, and the website only local storage in your browser), so exercising
            these rights is straightforward: email{' '}
            <a className="inline" href={`mailto:${SUPPORT_EMAIL}`}>
              {SUPPORT_EMAIL}
            </a>{' '}
            and your request will be handled within one month. For the data in your own iCloud and your own browser you
            need not ask anyone — it is already in your hands.
          </p>
          <p>
            You also have the right to lodge a complaint with a supervisory authority. In the Czech Republic that is the{' '}
            <strong>Office for Personal Data Protection</strong> (Úřad pro ochranu osobních údajů), Pplk. Sochora 27,
            170&nbsp;00 Prague 7,{' '}
            <a className="inline" href="https://uoou.gov.cz" target="_blank" rel="noopener noreferrer">
              uoou.gov.cz
            </a>
            . If you live elsewhere in the EEA, you may also contact your own country&rsquo;s authority.
          </p>

          <h2 id="changes">Changes &amp; contact</h2>
          <p>
            If this policy ever changes, the updated version will appear here with a new date. Questions about privacy?
            Email{' '}
            <a className="inline" href={`mailto:${SUPPORT_EMAIL}`}>
              {SUPPORT_EMAIL}
            </a>
            , use <strong>Settings → Give Feedback</strong> inside the app, or reach out from the{' '}
            <Link className="inline" href="/support#contact">
              Support page
            </Link>
            .
          </p>
        </>
      ),
    },

    terms: {
      kicker: 'Legal',
      title: 'Terms of use.',
      lead: 'Plain-language terms for using Scorius. By downloading or using the app, you agree to what’s below.',
      meta: 'Last updated · September 2026 · Applies to Scorius 2.2',
      tocTitle: 'On this page',
      article: (
        <>
          <div className="toc">
            <h4>On this page</h4>
            <ol>
              <li>
                <a href="#provider">Who operates Scorius</a>
              </li>
              <li>
                <a href="#accept">Acceptance</a>
              </li>
              <li>
                <a href="#license">Licence to use</a>
              </li>
              <li>
                <a href="#data">Your data &amp; responsibilities</a>
              </li>
              <li>
                <a href="#third">Apple &amp; third-party services</a>
              </li>
              <li>
                <a href="#spectate">Live Spectate &amp; reporting content</a>
              </li>
              <li>
                <a href="#warranty">No warranty</a>
              </li>
              <li>
                <a href="#liability">Limitation of liability</a>
              </li>
              <li>
                <a href="#consumer">Your consumer rights</a>
              </li>
              <li>
                <a href="#law">Governing law &amp; disputes</a>
              </li>
              <li>
                <a href="#changes">Changes</a>
              </li>
              <li>
                <a href="#contact">Contact</a>
              </li>
            </ol>
          </div>

          <h2 id="provider">1 · Who operates Scorius</h2>
          <p>
            Scorius is operated by <strong>{OPERATOR_NAME}</strong>, a sole trader registered in the Czech trade
            register, business ID (IČO) {OPERATOR_ID}, Petra Rezka 1114/8, Nusle, 140&nbsp;00 Prague 4, Czech Republic,
            email{' '}
            <a className="inline" href={`mailto:${SUPPORT_EMAIL}`}>
              {SUPPORT_EMAIL}
            </a>
            . Referred to below as “the operator”. Full details are on the{' '}
            <Link className="inline" href="/imprint">
              Imprint
            </Link>{' '}
            page.
          </p>

          <h2 id="accept">2 · Acceptance</h2>
          <p>
            By downloading, installing or using Scorius (the “app”), you agree to these terms. If you do not agree, please
            don’t use the app. These terms are in addition to{' '}
            <a
              className="inline"
              href="https://www.apple.com/legal/internet-services/itunes/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Apple’s standard licensed-application terms
            </a>
            , which also apply.
          </p>

          <h2 id="license">3 · Licence to use</h2>
          <p>
            Scorius is licensed, not sold, to you for personal, non-commercial use on Apple devices you own or control, in
            line with the App Store terms. You may not copy, redistribute, reverse-engineer or resell the app except where
            the law expressly permits it.
          </p>

          <h2 id="data">4 · Your data &amp; responsibilities</h2>
          <ul>
            <li>You are responsible for the matches, player names, scores and other content you enter.</li>
            <li>
              Your data is stored in your own iCloud and on your devices. Keeping backups (for example via iCloud and the
              in-app export) is your responsibility.
            </li>
            <li>
              Scores and statistics are recorded for your own reference and are not guaranteed to be free of error — always
              treat the app as a convenience, not an official record.
            </li>
          </ul>

          <h2 id="third">5 · Apple &amp; third-party services</h2>
          <p>
            The app relies on Apple services — iCloud, HealthKit and ActivityKit — which are governed by Apple’s own terms
            and privacy policy. Golf course information comes from a third-party public database; Scorius does not control
            and is not responsible for the accuracy of that data.
          </p>

          <h2 id="spectate">6 · Live Spectate &amp; reporting content</h2>
          <p>
            You start Live Spectate, and you choose how the sides are named. Only share other people&rsquo;s names with
            their knowledge. The operator does not moderate or review shared matches — but if you report a match
            carrying an abusive, unlawful or otherwise inappropriate name to{' '}
            <a className="inline" href={`mailto:${SUPPORT_EMAIL}`}>
              {SUPPORT_EMAIL}
            </a>
            , the session will be shut down. Every session expires on its own at most 4 hours after the last update.
          </p>

          <h2 id="warranty">7 · No warranty</h2>
          <p>
            The app is provided <strong>“as is”</strong> and <strong>“as available”</strong>, without warranties of any
            kind, whether express or implied, including fitness for a particular purpose. The developer does not warrant
            that the app will be uninterrupted, error-free or compatible with every device or future OS version. If you
            are a consumer, this applies only as far as the law allows — see section 9.
          </p>

          <h2 id="liability">8 · Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, the developer is not liable for any indirect, incidental or
            consequential damages, or for any loss of data, arising from your use of — or inability to use — the app.
            This limitation does not apply where the law does not permit it: for consumers, section 9 prevails.
          </p>

          <h2 id="consumer">9 · Your consumer rights</h2>
          <p>
            If you are a consumer, <strong>sections 7 and 8 take nothing away from what the law gives you</strong>.
            Rights arising from defective performance, rights in defective digital content, and any claim that cannot be
            waived in advance under Czech law remain untouched; in particular the operator does not limit liability for
            harm caused intentionally or by gross negligence, or for harm to a person&rsquo;s natural rights
            (§ 2898 of the Czech Civil Code). Any term that would cut back a consumer&rsquo;s statutory rights does not
            apply.
          </p>
          <p>
            The app, including the optional icon purchase, is sold and billed by <strong>Apple</strong> through the App
            Store — so refunds and other seller-side claims go to Apple. The operator is responsible for the content and
            functioning of the app itself.
          </p>

          <h2 id="law">10 · Governing law &amp; disputes</h2>
          <p>
            These terms are governed by the law of the Czech Republic. If you are a consumer resident elsewhere in the
            EU, this choice does not deprive you of the protection of the mandatory rules of your own country.
          </p>
          <p>
            The fastest route through any dispute is email — get in touch and we will sort it out. If you would rather
            use out-of-court dispute resolution, the competent body is the{' '}
            <strong>Czech Trade Inspection Authority</strong>,{' '}
            <a className="inline" href="https://adr.coi.cz" target="_blank" rel="noopener noreferrer">
              adr.coi.cz
            </a>
            . Your right to go to court is unaffected.
          </p>

          <h2 id="changes">11 · Changes</h2>
          <p>
            These terms may be updated from time to time. The current version always lives on this page with its date.
            Continuing to use the app after a change means you accept the updated terms.
          </p>

          <h2 id="contact">12 · Contact</h2>
          <p>
            Questions about these terms? Email{' '}
            <a className="inline" href={`mailto:${SUPPORT_EMAIL}`}>
              {SUPPORT_EMAIL}
            </a>
            , use <strong>Settings → Give Feedback</strong> inside the app, or reach out from the{' '}
            <Link className="inline" href="/support#contact">
              Support page
            </Link>
            .
          </p>
        </>
      ),
    },

    imprint: {
      kicker: 'Legal',
      title: 'Imprint',
      lead: 'Operator identification and contact details as required by § 435 of Act No. 89/2012 Coll., the Czech Civil Code.',
      nameLabel: 'Name',
      name: 'Tomáš Kalmus',
      addressLabel: 'Address',
      address: 'Petra Rezka 1114/8, Nusle, 140 00 Prague 4, Czech Republic',
      registryLabel: 'Registration',
      registry: 'Registered in the Czech trade register kept by the Municipal District Office Prague 4',
      businessIdLabel: 'Business ID (IČO)',
      businessId: '22478680',
      emailLabel: 'Email',
      email: SUPPORT_EMAIL,
      note: 'Tomáš Kalmus operates as a sole trader (fyzická osoba podnikající) under Czech law and is not registered for VAT. Consumer protection is supervised by the Czech Trade Inspection Authority; data protection by the Office for Personal Data Protection.',
      noteTitle: 'Legal status',
    },
  },
};
