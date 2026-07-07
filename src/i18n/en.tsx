import Link from 'next/link';
import { SUPPORT_EMAIL } from '@/components/constants';

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
    basketball: 'Basketball',
    football: 'Football',
    golf: 'Golf',
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
        Badminton, tennis, basketball, football, golf. <span className="muted">One app. One tap.</span>
      </>
    ),
    sub: 'Scorius keeps score for you on Apple Watch across five sports — with heart rate, calories and per-sport rules built in. iPhone and iPad mirror every point live, and everything syncs over iCloud.',
    download: 'Download on App Store',
    see: 'See it in action →',
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
        title: 'Five sports, one app',
        body: 'Badminton, tennis, basketball, football and golf — each with its own rules engine, scorer and stats. Switch sport, the app re-tunes itself.',
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
        body: 'Choose badminton, tennis, basketball, football or golf. Scorius loads the right rules — games, sets, periods, holes.',
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
    body: 'No accounts. No analytics. No third-party SDKs. Scorius never talks to any server other than Apple’s — the developer cannot see your data.',
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
      basketball: '3 v 3',
      football: '5-a-side',
      golf: 'Stroke play',
    },
    gamesLabels: {
      badminton: 'Games',
      tennis: 'Games',
      basketball: 'Period',
      football: 'Half',
      golf: 'To par',
    },
    periodShort: (p: number) => `P${p}`,
    sub: {
      badminton: (game: number) => `Game ${game}`,
      tennis: (set: number, sa: number, sb: number) => `Set ${set} · Sets ${sa}–${sb}`,
      basketball: (period: number, clock: string) => `P${period} · ${clock}`,
      football: (firstHalf: boolean, minute: number) => `${firstHalf ? '1st' : '2nd'} Half · ${minute}'`,
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
        a: 'Badminton, tennis, basketball, football and golf — each with its own proper scoring rules, which you can configure per sport.',
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
            developer can’t see it. See the{' '}
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
      lead: 'Five sports, three devices, one consistent app. Pick a sport below — the previews update to match.',
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
        kicker: 'Five sports',
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
            sport: 'Golf',
            dot: 'dot-gol',
            scoring: 'Per-hole strokes, 1–4 player flight, to-par chip',
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
              can’t see it.{' '}
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
      meta: 'Last updated · July 2026 · Applies to Scorius 2.0',
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
                <a href="#stored">What Scorius stores — and where</a>
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
            Scorius has <strong>no accounts, no analytics, no telemetry and no third-party SDKs</strong>. The app never
            talks to any server other than Apple’s — and one public golf-course database, only when you actively search
            for a course. The developer cannot see your matches, your stats or anything else.
          </p>

          <h2 id="stored">What Scorius stores — and where</h2>
          <p>
            Everything Scorius keeps lives on your own devices and in your own iCloud. Nothing is uploaded to a server run
            by the developer.
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

          <h2 id="network">Network &amp; third parties</h2>
          <p>
            Scorius makes exactly one kind of optional outbound request: when you <strong>search for a golf course</strong>,
            the app queries a public golf-course database to fetch course and par information. No personal data is attached
            to that request beyond your search text. If you never search for a course, Scorius makes no third-party network
            calls at all.
          </p>
          <p>There are no advertising SDKs, no crash-reporting services and no usage analytics of any kind.</p>

          <h2 id="website">Website data &amp; local storage</h2>
          <p>
            This website (scorius.app) is a static marketing site. It does not set cookies, does not embed
            third-party tracking scripts, and does not collect any personal data through forms.
          </p>
          <p>
            The website uses your browser&rsquo;s <strong>localStorage</strong> to remember three strictly
            functional preferences so they persist between visits:
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
          <p>
            This data never leaves your browser. It is not sent to any server &mdash; including the
            developer&rsquo;s &mdash; and is not used for analytics, advertising, profiling or any other
            purpose. You can clear it at any time through your browser settings.
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
            Since Scorius stores no personal data on its servers (the app uses only your private iCloud, and the
            website uses only local storage in your browser), exercising these rights is straightforward: email{' '}
            <a className="inline" href={`mailto:${SUPPORT_EMAIL}`}>
              {SUPPORT_EMAIL}
            </a>{' '}
            and your request will be handled within 30 days. You also have the right to lodge a complaint with
            your local data protection authority.
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
      meta: 'Last updated · July 2026 · Applies to Scorius 2.0',
      tocTitle: 'On this page',
      article: (
        <>
          <div className="toc">
            <h4>On this page</h4>
            <ol>
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
                <a href="#warranty">No warranty</a>
              </li>
              <li>
                <a href="#liability">Limitation of liability</a>
              </li>
              <li>
                <a href="#changes">Changes</a>
              </li>
              <li>
                <a href="#contact">Contact</a>
              </li>
            </ol>
          </div>

          <h2 id="accept">1 · Acceptance</h2>
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

          <h2 id="license">2 · Licence to use</h2>
          <p>
            Scorius is licensed, not sold, to you for personal, non-commercial use on Apple devices you own or control, in
            line with the App Store terms. You may not copy, redistribute, reverse-engineer or resell the app except where
            the law expressly permits it.
          </p>

          <h2 id="data">3 · Your data &amp; responsibilities</h2>
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

          <h2 id="third">4 · Apple &amp; third-party services</h2>
          <p>
            The app relies on Apple services — iCloud, HealthKit and ActivityKit — which are governed by Apple’s own terms
            and privacy policy. Golf course information comes from a third-party public database; Scorius does not control
            and is not responsible for the accuracy of that data.
          </p>

          <h2 id="warranty">5 · No warranty</h2>
          <p>
            The app is provided <strong>“as is”</strong> and <strong>“as available”</strong>, without warranties of any
            kind, whether express or implied, including fitness for a particular purpose. The developer does not warrant
            that the app will be uninterrupted, error-free or compatible with every device or future OS version.
          </p>

          <h2 id="liability">6 · Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, the developer is not liable for any indirect, incidental or
            consequential damages, or for any loss of data, arising from your use of — or inability to use — the app. Some
            jurisdictions don’t allow these exclusions, so parts may not apply to you.
          </p>

          <h2 id="changes">7 · Changes</h2>
          <p>
            These terms may be updated from time to time. The current version always lives on this page with its date.
            Continuing to use the app after a change means you accept the updated terms.
          </p>

          <h2 id="contact">8 · Contact</h2>
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
      lead: 'Operator and contact information as required by §3 of Act No. 480/2004 Coll., on information society services.',
      nameLabel: 'Name',
      name: 'Tomáš Kalmus',
      addressLabel: 'Address',
      address: 'Petra Rezka 1114/8, Praha 4, 14000, Czech Republic',
      businessIdLabel: 'Business ID (IČO)',
      businessId: '22478680',
      emailLabel: 'Email',
      email: SUPPORT_EMAIL,
      note: 'Tomáš Kalmus operates as a sole trader (fyzická osoba podnikající) under Czech law.',
      noteTitle: 'Legal status',
    },
  },
};
