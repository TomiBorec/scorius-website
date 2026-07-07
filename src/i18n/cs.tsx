import Link from 'next/link';
import { SUPPORT_EMAIL } from '@/components/constants';
import type { Dict } from './index';

/** Czech content. Shape is enforced against the English dictionary (Dict = typeof en). */
export const cs: Dict = {
  nav: {
    features: 'Funkce',
    sports: 'Sporty',
    support: 'Podpora',
    privacy: 'Soukromí',
    accessibility: 'Přístupnost',
    download: 'Stáhnout',
  },

  langSwitch: {
    aria: 'Volba jazyka',
    cs: 'CZ',
    en: 'EN',
    csTitle: 'Přepnout do češtiny',
    enTitle: 'Switch to English',
  },

  themeToggle: {
    toLight: 'Přepnout na světlý režim',
    toDark: 'Přepnout na tmavý režim',
  },

  sports: {
    badminton: 'Badminton',
    tennis: 'Tenis',
    basketball: 'Basketbal',
    football: 'Fotbal',
    golf: 'Golf',
  },

  hero: {
    eyebrowTick: '2.0',
    eyebrow: 'Nově multisportovní',
    title: (
      <>
        Skóre každého zápasu
        <br />
        přímo ze <span className="accent">zápěstí.</span>
      </>
    ),
    lead: (
      <>
        Badminton, tenis, basketbal, fotbal, golf. <span className="muted">Jedna aplikace. Jedno ťuknutí.</span>
      </>
    ),
    sub: 'Scorius počítá skóre za tebe na Apple Watch v pěti sportech — s tepovou frekvencí, kaloriemi a pravidly pro každý sport. iPhone a iPad živě zrcadlí každý bod a všechno se synchronizuje přes iCloud.',
    download: 'Stáhnout z App Store',
    see: 'Podívej se na to v akci →',
    stats: { sports: 'Sportů', sync: 'Živá synchronizace', accounts: 'Účtů' },
  },

  switchStrip: {
    hint: 'Ťukni na sport a zobraz si jeho počítadlo',
  },

  features: {
    kicker: 'Vytvořeno pro to, jak hraješ',
    heading: 'Všechno, co počítadlo skóre potřebuje. Nic navíc.',
    spotlight: {
      kicker: 'Přímo ze zápěstí',
      title: 'Měj obě ruce na raketě.',
      body: 'Zapiš celý zápas z Apple Watch jediným ťuknutím. Spuštěním zápasu se automaticky rozběhne nativní trénink na Apple Watch — tepová frekvence a aktivní kalorie se ukládají do Apple Health, takže si nemusíš pamatovat na žádnou druhou fitness aplikaci. Skóre se objeví na iPhonu, iPadu i na zamčené obrazovce za méně než vteřinu.',
      cta: 'Jak to funguje →',
    },
    cards: [
      {
        title: 'Pět sportů, jedna aplikace',
        body: 'Badminton, tenis, basketbal, fotbal a golf — každý má vlastní pravidla, počítadlo i statistiky. Přepneš sport a aplikace se sama přeladí.',
      },
      {
        title: 'Synchronizace přes iCloud',
        body: 'Historie zápasů, pravidla, tvůj seznam hráčů i nastavení pro každý sport putují na všechna zařízení. Žádné účty, žádné přihlašování — prostě se objeví.',
      },
      {
        title: 'Live aktivity',
        body: 'Skóre, hrací čas a stav zápasu na zamčené obrazovce i v Dynamic Islandu — mrkneš dolů a zůstaneš ve hře.',
      },
      {
        title: 'Statistiky z tvého pohledu a turnaje',
        body: 'Vzájemná bilance proti každému soupeři, série výher a úspěšnost podle formátu — plus pavouky pro dvouhru i čtyřhru s automatickým nasazením a vlastními pravidly turnaje.',
      },
      {
        title: 'Tréninky v HealthKitu',
        body: 'Spustíš zápas a s ním i nativní trénink na Apple Watch — tepová frekvence a aktivní kalorie míří do Apple Health. Žádná další fitness aplikace.',
      },
    ],
  },

  howItWorks: {
    kicker: 'Od prvního podání po závěrečný hvizd',
    heading: 'Tři ťuknutí k zaznamenanému zápasu.',
    steps: [
      {
        title: 'Vyber sport',
        body: 'Zvol badminton, tenis, basketbal, fotbal nebo golf. Scorius načte správná pravidla — sety, gemy, čtvrtiny, jamky.',
      },
      {
        title: 'Ťukáním počítej',
        body: 'Skóruj ze zápěstí nebo z telefonu. Body z výměn, 15/30/40, +2/+3, góly nebo rány — postaráme se o to za tebe.',
      },
      {
        title: 'Měj přehled',
        body: 'Zápas se uloží do historie a statistik, synchronizuje se přes iCloud a v Apple Health zůstane trénink.',
      },
    ],
  },

  privacyBand: {
    kicker: 'Soukromí na prvním místě',
    heading: 'Tvoje zápasy patří tobě.',
    body: 'Žádné účty. Žádná analytika. Žádné SDK třetích stran. Scorius nekomunikuje s žádným serverem kromě Applu — vývojář na tvoje data nevidí.',
    cta: 'Přečíst zásady ochrany soukromí →',
    points: [
      {
        title: 'Nikdy žádné účty',
        body: 'Otevři aplikaci a hraj. Není se kam registrovat, není co si pamatovat.',
      },
      {
        title: 'Uloženo ve tvém iCloudu',
        body: 'Data žijí v tvém soukromém úložišti iCloud a v Apple Health — na ničím serveru.',
      },
      {
        title: 'Nic se nesleduje',
        body: 'Nulová telemetrie. Nevíme, jak, kdy ani jestli aplikaci používáš.',
      },
    ],
  },

  a11yNote: {
    kicker: 'Přístupnost',
    heading: 'Skóre by si měl moct počítat každý.',
    body: 'Chceme, aby byl Scorius dostupný co největšímu počtu lidí. Na každém zařízení podporuje VoiceOver, plně tmavé rozhraní i Rozlišení bez barev — a přístupnost není nikdy hotová. Pokud ti něco stojí v cestě nebo máš nápad, jak ji vylepšit, opravdu to chceme slyšet.',
    pills: ['VoiceOver', 'Tmavé rozhraní', 'Rozlišení bez barev'],
    cta: 'Podívej se, co podporujeme →',
  },

  cta: {
    kicker: 'Zdarma · iPhone, iPad a Apple Watch',
    downloadSmall: 'Stáhnout v',
    appStore: 'App Store',
    home: { title: 'Připraven hrát?', subtitle: 'Začni sledovat svůj další zápas třemi ťuknutími.' },
    features: { title: 'Vyzkoušej to při dalším zápase.', subtitle: 'Tři ťuknutí od stažení k zaznamenané hře.' },
  },

  footer: {
    tagline: 'Nativní multisportovní zápisník zápasů pro iPhone, iPad a Apple Watch. Skóruj ze zápěstí, synchronizuj přes iCloud.',
    productHead: 'Produkt',
    supportHead: 'Podpora',
    legalHead: 'Právní',
    features: 'Funkce',
    sports: 'Sporty',
    accessibility: 'Přístupnost',
    appStore: 'App Store',
    faq: 'Časté dotazy',
    giveFeedback: 'Napsat zpětnou vazbu',
    privacy: 'Soukromí',
    terms: 'Podmínky použití',
    imprint: 'Imprint',
    rights: '© 2026 Scorius. Pro všechny, kdo si počítají skóre.',
  },

  devices: {
    activeMatch: 'Aktivní zápas',
    totals: 'Celkem',
    holesLabel: 'Jamky',
    prev: '◀◀ Předchozí',
    nextHole: 'Další jamka ▶▶',
    you: 'Ty',
    hole: 'Jamka',
    par: 'Par',
    liveActivity: 'LIVE AKTIVITA · ZAMČENÁ OBRAZOVKA',
    modes: {
      badminton: 'Dvouhra',
      tennis: 'Dvouhra',
      basketball: '3 na 3',
      football: '5 na 5',
      golf: 'Na rány',
    },
    gamesLabels: {
      badminton: 'Sety',
      tennis: 'Gemy',
      basketball: 'Čtvrtina',
      football: 'Poločas',
      golf: 'Na par',
    },
    periodShort: (p) => `Č${p}`,
    sub: {
      badminton: (game) => `Set ${game}`,
      tennis: (set, sa, sb) => `Sada ${set} · Sady ${sa}–${sb}`,
      basketball: (period, clock) => `Č${period} · ${clock}`,
      football: (firstHalf, minute) => `${firstHalf ? '1.' : '2.'} poločas · ${minute}'`,
      golf: (hole, par) => `Jamka ${hole} · Par ${par}`,
    },
  },

  faq: {
    items: [
      {
        q: 'Kolik Scorius stojí?',
        a: 'Scorius si zdarma stáhneš z App Store pro iPhone, iPad i Apple Watch — a všechny funkce máš zdarma, bez předplatného. Jediný volitelný nákup je sada alternativních ikon aplikace, pokud chceš změnit, jak Scorius vypadá na ploše; je to čistě kosmetické.',
      },
      {
        q: 'Potřebuju účet?',
        a: 'Ne. Není se kam registrovat. Otevři aplikaci a začni počítat skóre. Synchronizace probíhá automaticky přes tvůj vlastní iCloud — žádné jméno, žádné heslo.',
      },
      {
        q: 'Která zařízení jsou podporovaná?',
        a: 'iPhone a iPad s iOS / iPadOS 26 nebo novějším a Apple Watch s watchOS 26 nebo novějším. Aplikace pro Watch je volitelná — pokud chceš, můžeš počítat skóre celé z telefonu.',
      },
      {
        q: 'Potřebuju Apple Watch?',
        a: 'Ne. Všechno funguje i samostatně na iPhonu a iPadu. Apple Watch odemknou počítání ze zápěstí a sledování tepu a kalorií, ale nejsou nutné.',
      },
      {
        q: 'Které sporty můžu sledovat?',
        a: 'Badminton, tenis, basketbal, fotbal a golf — každý s vlastními správnými pravidly počítání, která si můžeš pro každý sport nastavit.',
      },
      {
        q: 'Funguje to offline?',
        a: 'Ano. Počítání skóre funguje plně offline. Každé zařízení si drží lokální kopii a změny se synchronizují přes iCloud, jakmile jsi zase online. Jediná funkce, která potřebuje připojení, je vyhledávání golfových hřišť.',
      },
      {
        q: 'Jak funguje vyhledávání golfových hřišť?',
        a: 'Při nastavování golfového kola můžeš prohledat veřejnou databázi hřišť a načíst jamky a pary, nebo pary zadat ručně. Vyhledávání odesílá jen text tvého dotazu — nic osobního.',
      },
      {
        q: 'Můžu exportovat svoje data?',
        a: 'Ano. Celou historii zápasů vyexportuješ z aplikace jako JSON nebo CSV a kdykoli ji zase naimportuješ zpět. Tvoje data nikdy nejsou uzamčená.',
      },
      {
        q: 'Jsou moje data soukromá?',
        a: (
          <>
            Naprosto. Žádné účty, žádná analytika, žádná SDK třetích stran. Tvoje data zůstávají v tvém iCloudu a Apple
            Health — vývojář na ně nevidí. Podrobnosti najdeš v{' '}
            <Link className="inline" href="/privacy">
              zásadách ochrany soukromí
            </Link>
            .
          </>
        ),
      },
    ],
  },

  pages: {
    support: {
      kicker: 'Podpora',
      title: 'Otázky? Zodpovězeno.',
      lead: 'Rychlé odpovědi na to, na co se lidé ptají nejčastěji. Nenašel jsi to? Napiš nám zpětnou vazbu přímo z aplikace.',
      contactTitle: 'Pořád nevíš?',
      contactBody: (
        <>
          Napiš na <strong>{SUPPORT_EMAIL}</strong>, ťukni v aplikaci na <strong>Nastavení → Napsat zpětnou vazbu</strong>,
          nebo založ issue v repozitáři projektu.
        </>
      ),
      emailSupport: 'Napsat podpoře',
      appStore: 'App Store',
      openIssue: 'Založit issue',
    },

    features: {
      kicker: 'Funkce',
      title: (
        <>
          Počítadlo skóre pro
          <br />
          každý sport, který hraješ.
        </>
      ),
      lead: 'Pět sportů, tři zařízení, jedna konzistentní aplikace. Vyber sport níže — náhledy se mu přizpůsobí.',
      watch: {
        kicker: 'Apple Watch',
        title: 'Skóruj ze zápěstí.',
        body: 'Celý zápas máš na zápěstí — ťukni na jednu stranu pro bod, otoč Digital Crownem pro krok zpět. Spuštěním zápasu se automaticky rozběhne nativní trénink na Apple Watch, takže tepová frekvence a kalorie míří do Apple Health bez nutnosti otevírat druhou fitness aplikaci.',
        list: [
          'Počítadlo vyladěné na pravidla každého sportu',
          'Spustí nativní trénink na Apple Watch — tep a kalorie, žádná další aplikace',
          'Zrcadlí se na iPhone a iPad za méně než vteřinu',
        ],
      },
      fiveSports: {
        kicker: 'Pět sportů',
        title: 'Jedna aplikace, která rozumí každé hře.',
        body: 'Každý sport má vlastní engine pro počítání skóre — ne jen obecné počítadlo s vyměněnými popisky. Body z výměn, 15/30/40, hrací časy, góly i rány jsou správně namodelované, s nastavitelnými pravidly pro každý sport.',
      },
      table: {
        headers: ['Sport', 'Počítání', 'Nastavení'],
        rows: [
          {
            sport: 'Badminton',
            dot: 'dot-bad',
            scoring: 'Body z výměn, sety na vítězství v zápase, volitelný strop náhlé smrti',
            setup: 'Dvouhra / čtyřhra, až 4 hráči',
          },
          {
            sport: 'Tenis',
            dot: 'dot-ten',
            scoring: '0/15/30/40/AD, sady, tiebreak, volitelný TB v rozhodující sadě / No-Ad',
            setup: 'Dvouhra / čtyřhra, až 4 hráči',
          },
          {
            sport: 'Basketbal',
            dot: 'dot-bas',
            scoring: '+1 / +2 / +3 za koš, čtvrtiny s odpočtem + prodloužení',
            setup: 'Proměnlivá velikost týmu 1–10',
          },
          {
            sport: 'Fotbal',
            dot: 'dot-foo',
            scoring: '+1 gól za střelu, poločasy s odpočtem + prodloužení',
            setup: 'Velikost týmu 1–22 (základ + střídající)',
          },
          {
            sport: 'Golf',
            dot: 'dot-gol',
            scoring: 'Rány po jamkách, flight 1–4 hráčů, ukazatel na par',
            setup: 'Vyhledání hřiště (API) nebo ruční editor parů',
          },
        ],
      },
      live: {
        kicker: 'Zamčená obrazovka a Dynamic Island',
        title: 'Mrkni dolů a zůstaň ve hře.',
        body: 'Live aktivita zobrazí skóre, hrací čas a stav zápasu na zamčené obrazovce i v Dynamic Islandu. U golfu vidíš jen svoje rány — žádný soupeřův sloupec.',
        list: ['Aktualizuje se živě v průběhu zápasu', 'Signál konce části s haptikou a zvukem'],
      },
      stats: {
        kicker: 'Statistiky a turnaje',
        title: 'Znej svoji bilanci. Veď pavouka.',
        body: 'Statistiky z tvého pohledu ti dají vzájemnou bilanci proti každému soupeři, série výher a úspěšnost podle formátu. Rozjeď turnaje ve dvouhře i čtyřhře s automatickým nasazením a pravidly pro každý turnaj.',
        list: [
          'Vzájemná bilance proti každému hráči ze seznamu',
          'Opakovaně použitelný seznam hráčů, synchronizovaný přes iCloud',
          'Pavouky s automatickým nasazením, nastavitelná pravidla',
        ],
        widget: { head2head: 'Vzájemně · Tom vs Bob', wins: 'Výhry', losses: 'Prohry', streak: 'Série' },
      },
      grid: {
        privacy: {
          title: 'Soukromé už od návrhu',
          body: (
            <>
              Žádné účty, žádná analytika, žádná SDK třetích stran. Data žijí v tvém iCloudu a Apple Health — vývojář na ně
              nevidí.{' '}
              <Link href="/privacy" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                Přečíst zásady →
              </Link>
            </>
          ),
        },
        a11y: {
          title: 'Přístupné pro každého',
          body: (
            <>
              VoiceOver, plně tmavé rozhraní a Rozlišení bez barev — Scorius podporuje funkce přístupnosti od Applu na
              iPhonu, iPadu i Apple Watch.{' '}
              <Link href="/accessibility" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                Podívej se, co podporujeme →
              </Link>
            </>
          ),
        },
      },
    },

    accessibility: {
      kicker: 'Přístupnost',
      title: (
        <>
          Vytvořeno tak,
          <br />
          aby ho používal každý.
        </>
      ),
      lead: 'Chceme, aby byl Scorius dostupný co největšímu počtu lidí. Podporuje vestavěné funkce přístupnosti od Applu na iPhonu, iPadu i Apple Watch — a protože přístupnost není nikdy hotová, vítáme každý nápad, jak ji zlepšit.',
      devices: [
        { name: 'iPhone', note: 'Vyžaduje iOS 26 nebo novější' },
        { name: 'iPad', note: 'Vyžaduje iPadOS 26 nebo novější' },
        { name: 'Apple Watch', note: 'Vyžaduje watchOS 26 nebo novější' },
      ],
      supported: ['VoiceOver', 'Tmavé rozhraní', 'Rozlišení bez samotné barvy'],
      whatKicker: 'Co podporujeme',
      whatTitle: 'Přístupnost je součástí.',
      whatBody: 'Scorius staví na frameworcích od Applu, takže to v celé aplikaci funguje tak, jak už znáš.',
      cards: [
        {
          title: 'VoiceOver',
          body: 'Každý ovládací prvek — počítání, historie i statistiky — je popsaný pro čtečku obrazovky od Applu, takže celý zápas zvládneš bez koukání.',
        },
        {
          title: 'Tmavé rozhraní',
          body: 'Plně tmavý vzhled, který se řídí nastavením systému — šetrnější k očím u kurtu i za šera.',
        },
        {
          title: 'Rozlišení bez barev',
          body: 'Skóre ani stavy zápasu nestojí jen na barvě — význam nesou i tvary, popisky a symboly.',
        },
      ],
      contactTitle: 'Narazil jsi na překážku, nebo máš nápad?',
      contactBody: (
        <>
          Čteme každý návrh a vždycky rádi uděláme Scorius použitelný pro víc lidí — napiš na <strong>{SUPPORT_EMAIL}</strong>{' '}
          nebo využij <strong>Nastavení → Napsat zpětnou vazbu</strong> přímo v aplikaci.
        </>
      ),
      emailSupport: 'Napsat podpoře',
      support: 'Podpora',
    },

    privacy: {
      kicker: 'Soukromí',
      title: 'Tvoje zápasy patří tobě.',
      lead: 'Scorius je postavený tak, aby vývojář nikdy neviděl tvoje data. Žádné účty, žádná analytika, žádná SDK třetích stran — tvoje zápasy zůstávají na tvých zařízeních a v tvém iCloudu.',
      meta: 'Naposledy aktualizováno · červenec 2026 · Platí pro Scorius 2.0',
      tocTitle: 'Na této stránce',
      article: (
        <>
          <div className="toc">
            <h4>Na této stránce</h4>
            <ol>
              <li>
                <a href="#summary">Ve zkratce</a>
              </li>
              <li>
                <a href="#stored">Co Scorius ukládá — a kde</a>
              </li>
              <li>
                <a href="#network">Síť a třetí strany</a>
              </li>
              <li>
                <a href="#website">Webové stránky a lokální úložiště</a>
              </li>
              <li>
                <a href="#health">Zdravotní data</a>
              </li>
              <li>
                <a href="#control">Tvoje kontrola</a>
              </li>
              <li>
                <a href="#children">Děti</a>
              </li>
              <li>
                <a href="#gdpr">Tvoje práva podle GDPR</a>
              </li>
              <li>
                <a href="#changes">Změny a kontakt</a>
              </li>
            </ol>
          </div>

          <h2 id="summary">Ve zkratce</h2>
          <p>
            Scorius nemá <strong>žádné účty, žádnou analytiku, žádnou telemetrii ani žádná SDK třetích stran</strong>.
            Aplikace nikdy nekomunikuje s žádným serverem kromě Applu — a s jednou veřejnou databází golfových hřišť, a to
            jen když aktivně hledáš hřiště. Vývojář nevidí tvoje zápasy, tvoje statistiky ani nic dalšího.
          </p>

          <h2 id="stored">Co Scorius ukládá — a kde</h2>
          <p>
            Všechno, co Scorius uchovává, žije na tvých vlastních zařízeních a v tvém vlastním iCloudu. Nic se nenahrává na
            server provozovaný vývojářem.
          </p>
          <ul>
            <li>
              <strong>Historie zápasů, pravidla pro jednotlivé sporty, seznam hráčů a nastavení</strong> se ukládají do
              tvého soukromého úložiště klíč-hodnota v iCloudu (<span className="mono">NSUbiquitousKeyValueStore</span>), s
              lokální kopií na každém zařízení pro offline čtení.
            </li>
            <li>
              <strong>Rozehraný zápas</strong> je uložený jen na zařízení, které ho počítá — nesynchronizuje se.
            </li>
            <li>
              <strong>Tréninky (tepová frekvence, aktivní kalorie)</strong> se zapisují do Apple Health, a to jen když k
              tomu na Apple Watch výslovně udělíš přístup.
            </li>
          </ul>
          <p>
            Protože synchronizace využívá tvůj osobní iCloud, vztahují se na ni{' '}
            <a className="inline" href="https://www.apple.com/legal/privacy/" target="_blank" rel="noopener noreferrer">
              zásady ochrany soukromí Applu
            </a>
            . Vývojář k ní nemá přístup.
          </p>

          <h2 id="network">Síť a třetí strany</h2>
          <p>
            Scorius dělá přesně jeden druh volitelného odchozího požadavku: když <strong>hledáš golfové hřiště</strong>,
            aplikace se dotáže veřejné databáze hřišť na informace o hřišti a parech. K tomuto požadavku se kromě textu
            tvého hledání nepřipojují žádná osobní data. Pokud hřiště nikdy nehledáš, Scorius nedělá vůbec žádné síťové
            požadavky na třetí strany.
          </p>
          <p>Nejsou tu žádná reklamní SDK, žádné služby pro hlášení pádů ani žádná analytika používání.</p>

          <h2 id="website">Webové stránky a lokální úložiště</h2>
          <p>
            Tato webová stránka (scorius.app) je statický marketingový web. Nepoužívá cookies, neobsahuje
            skripty třetích stran pro sledování a nesbírá žádné osobní údaje prostřednictvím formulářů.
          </p>
          <p>
            Webová stránka využívá <strong>localStorage</strong> ve tvém prohlížeči k zapamatování tří čistě
            funkčních preferencí:
          </p>
          <ul>
            <li>
              <strong>scorius-theme</strong> &mdash; tvoje zvolené barevné schéma (světlý nebo tmavý režim)
            </li>
            <li>
              <strong>scorius-sport</strong> &mdash; právě vybraný sport
            </li>
            <li>
              <strong>scorius-lang</strong> &mdash; preferovaný jazyk (angličtina nebo čeština)
            </li>
          </ul>
          <p>
            Tato data nikdy neopouštějí tvůj prohlížeč. Nejsou odesílána na žádný server &mdash; včetně
            serveru vývojáře &mdash; a nejsou používána pro analytiku, reklamu, profilování ani žádný jiný
            účel. Můžeš je kdykoli smazat v nastavení svého prohlížeče.
          </p>

          <h2 id="health">Zdravotní data</h2>
          <p>
            Když spustíš zápas z Apple Watch, Scorius může spustit trénink a zaznamenat <strong>tepovou frekvenci</strong> a{' '}
            <strong>aktivní kalorie</strong>. Tato data se zapisují do Apple Health ve tvém zařízení a řídí se tvými
            oprávněními pro Zdraví. Přístup můžeš kdykoli odvolat v <em>Nastavení → Zdraví → Přístup k datům a zařízení</em>.
            Scorius zdravotní data nikam nepřenáší.
          </p>

          <h2 id="control">Tvoje kontrola</h2>
          <ul>
            <li>
              <strong>Export a import:</strong> celou historii zápasů můžeš z aplikace vyexportovat jako JSON nebo CSV a
              zase ji naimportovat zpět.
            </li>
            <li>
              <strong>Mazání:</strong> smazáním zápasu ho odebereš z historie i ze synchronizace přes iCloud. Odebráním
              aplikace a vymazáním jejích dat z iCloudu smažeš úplně všechno.
            </li>
            <li>
              <strong>Zdraví:</strong> přístup k tepové frekvenci a kaloriím můžeš kdykoli udělit nebo odvolat.
            </li>
          </ul>

          <h2 id="children">Děti</h2>
          <p>
            Scorius nesbírá žádné osobní údaje od nikoho, včetně dětí. Je bezpečný pro použití v jakémkoli věku a nevyžaduje
            žádný účet ani profil.
          </p>

          <h2 id="gdpr">Tvoje práva podle GDPR</h2>
          <p>
            Pokud se nacházíš v Evropském hospodářském prostoru, máš následující práva týkající se svých
            osobních údajů:
          </p>
          <ul>
            <li>
              <strong>Právo na přístup (čl.&nbsp;15 GDPR)</strong> &mdash; požádat o kopii údajů, které o tobě
              zpracováváme.
            </li>
            <li>
              <strong>Právo na opravu (čl.&nbsp;16 GDPR)</strong> &mdash; opravit nepřesné nebo neúplné údaje.
            </li>
            <li>
              <strong>Právo na výmaz (čl.&nbsp;17 GDPR)</strong> &mdash; požádat o smazání svých údajů.
            </li>
            <li>
              <strong>Právo na omezení zpracování (čl.&nbsp;18 GDPR)</strong> &mdash; omezit, jak zpracováváme
              tvoje údaje.
            </li>
            <li>
              <strong>Právo na přenositelnost (čl.&nbsp;20 GDPR)</strong> &mdash; získat své údaje ve
              strukturovaném formátu.
            </li>
            <li>
              <strong>Právo vznést námitku (čl.&nbsp;21 GDPR)</strong> &mdash; namítat zpracování svých údajů.
            </li>
          </ul>
          <p>
            Jelikož Scorius neukládá žádné osobní údaje na svých serverech (aplikace používá jen tvůj
            soukromý iCloud a webová stránka využívá pouze lokální úložiště v tvém prohlížeči), uplatnění
            těchto práv je přímočaré: napiš na{' '}
            <a className="inline" href={`mailto:${SUPPORT_EMAIL}`}>
              {SUPPORT_EMAIL}
            </a>{' '}
            a tvoje žádost bude vyřízena do 30 dnů. Máš také právo podat stížnost u svého místního úřadu
            pro ochranu osobních údajů.
          </p>

          <h2 id="changes">Změny a kontakt</h2>
          <p>
            Pokud se tyto zásady někdy změní, aktualizovaná verze se objeví tady s novým datem. Máš dotazy ohledně soukromí?
            Napiš na{' '}
            <a className="inline" href={`mailto:${SUPPORT_EMAIL}`}>
              {SUPPORT_EMAIL}
            </a>
            , využij <strong>Nastavení → Napsat zpětnou vazbu</strong> přímo v aplikaci, nebo se ozvi přes{' '}
            <Link className="inline" href="/support#contact">
              stránku Podpora
            </Link>
            .
          </p>
        </>
      ),
    },

    terms: {
      kicker: 'Právní',
      title: 'Podmínky použití.',
      lead: 'Srozumitelné podmínky pro používání Scoria. Stažením nebo používáním aplikace souhlasíš s tím, co je níže.',
      meta: 'Naposledy aktualizováno · červenec 2026 · Platí pro Scorius 2.0',
      tocTitle: 'Na této stránce',
      article: (
        <>
          <div className="toc">
            <h4>Na této stránce</h4>
            <ol>
              <li>
                <a href="#accept">Souhlas</a>
              </li>
              <li>
                <a href="#license">Licence k použití</a>
              </li>
              <li>
                <a href="#data">Tvoje data a odpovědnost</a>
              </li>
              <li>
                <a href="#third">Apple a služby třetích stran</a>
              </li>
              <li>
                <a href="#warranty">Bez záruky</a>
              </li>
              <li>
                <a href="#liability">Omezení odpovědnosti</a>
              </li>
              <li>
                <a href="#changes">Změny</a>
              </li>
              <li>
                <a href="#contact">Kontakt</a>
              </li>
            </ol>
          </div>

          <h2 id="accept">1 · Souhlas</h2>
          <p>
            Stažením, instalací nebo používáním Scoria („aplikace“) souhlasíš s těmito podmínkami. Pokud nesouhlasíš,
            aplikaci prosím nepoužívej. Tyto podmínky doplňují{' '}
            <a
              className="inline"
              href="https://www.apple.com/legal/internet-services/itunes/"
              target="_blank"
              rel="noopener noreferrer"
            >
              standardní podmínky Applu pro licencované aplikace
            </a>
            , které rovněž platí.
          </p>

          <h2 id="license">2 · Licence k použití</h2>
          <p>
            Scorius je ti poskytnut na základě licence, nikoli prodán, pro osobní, nekomerční použití na zařízeních Apple,
            která vlastníš nebo ovládáš, v souladu s podmínkami App Store. Aplikaci nesmíš kopírovat, dále šířit, zpětně
            analyzovat ani přeprodávat, s výjimkou případů, kdy to zákon výslovně dovoluje.
          </p>

          <h2 id="data">3 · Tvoje data a odpovědnost</h2>
          <ul>
            <li>Odpovídáš za zápasy, jména hráčů, skóre a další obsah, který zadáš.</li>
            <li>
              Tvoje data jsou uložená v tvém vlastním iCloudu a na tvých zařízeních. Za zálohy (například přes iCloud a
              export v aplikaci) odpovídáš ty.
            </li>
            <li>
              Skóre a statistiky se zaznamenávají pro tvoji vlastní potřebu a není zaručeno, že jsou bez chyb — ber aplikaci
              vždy jako pomůcku, ne jako oficiální záznam.
            </li>
          </ul>

          <h2 id="third">4 · Apple a služby třetích stran</h2>
          <p>
            Aplikace využívá služby Applu — iCloud, HealthKit a ActivityKit — které se řídí vlastními podmínkami a zásadami
            ochrany soukromí Applu. Informace o golfových hřištích pocházejí z veřejné databáze třetí strany; Scorius nemá
            kontrolu nad přesností těchto dat a neodpovídá za ni.
          </p>

          <h2 id="warranty">5 · Bez záruky</h2>
          <p>
            Aplikace je poskytována <strong>„tak, jak je“</strong> a <strong>„podle dostupnosti“</strong>, bez jakýchkoli
            záruk, ať už výslovných nebo předpokládaných, včetně vhodnosti pro konkrétní účel. Vývojář nezaručuje, že
            aplikace poběží nepřerušovaně, bez chyb nebo že bude kompatibilní s každým zařízením či budoucí verzí systému.
          </p>

          <h2 id="liability">6 · Omezení odpovědnosti</h2>
          <p>
            V maximálním rozsahu povoleném zákonem vývojář neodpovídá za žádné nepřímé, náhodné ani následné škody ani za
            jakoukoli ztrátu dat vzniklou z používání — nebo nemožnosti používat — aplikaci. Některé jurisdikce tato
            vyloučení neumožňují, takže se na tebe nemusí vztahovat.
          </p>

          <h2 id="changes">7 · Změny</h2>
          <p>
            Tyto podmínky mohou být čas od času aktualizovány. Aktuální verze vždy žije na této stránce i s datem. Pokud
            aplikaci po změně používáš dál, znamená to, že s aktualizovanými podmínkami souhlasíš.
          </p>

          <h2 id="contact">8 · Kontakt</h2>
          <p>
            Máš dotazy k těmto podmínkám? Napiš na{' '}
            <a className="inline" href={`mailto:${SUPPORT_EMAIL}`}>
              {SUPPORT_EMAIL}
            </a>
            , využij <strong>Nastavení → Napsat zpětnou vazbu</strong> přímo v aplikaci, nebo se ozvi přes{' '}
            <Link className="inline" href="/support#contact">
              stránku Podpora
            </Link>
            .
          </p>
        </>
      ),
    },

    imprint: {
      kicker: 'Právní',
      title: 'Imprint / Kontaktní údaje',
      lead: 'Kontaktní údaje provozovatele podle §3 zákona č. 480/2004 Sb., o službách informační společnosti.',
      nameLabel: 'Jméno',
      name: 'Tomáš Kalmus',
      addressLabel: 'Adresa',
      address: 'Petra Rezka 1114/8, Praha 4, 14000, Česká republika',
      businessIdLabel: 'IČO',
      businessId: '22478680',
      emailLabel: 'Email',
      email: SUPPORT_EMAIL,
      note: 'Tomáš Kalmus podniká jako fyzická osoba podle českého práva.',
      noteTitle: 'Právní status',
    },
  },
};
