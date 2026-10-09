'use client';

import Link from 'next/link';
import { OPERATOR_ID, OPERATOR_NAME, SUPPORT_EMAIL } from '@/components/constants';
import { useI18n } from '@/i18n';

/*
  The Milius privacy policy, in both of the site's languages (the site's language switch
  picks). Every statement here is checked against the app's code — what leaves the phone,
  to whom, and when. Update it in the same change as anything that alters that.
*/

const mail = (
  <a className="inline" href={`mailto:${SUPPORT_EMAIL}`}>
    {SUPPORT_EMAIL}
  </a>
);

function English() {
  return (
    <>
      <header className="page-hero">
        <span className="section-kicker">Milius · Privacy</span>
        <h1>Your drives are yours.</h1>
        <p className="lead">
          Milius records where you drive, so it is built to keep that to you. No account, no analytics, no
          advertising, no server of our own — your drives stay on your devices and in your own iCloud.
        </p>
        <p className="meta">Last updated · October 2026 · Applies to Milius 1.0</p>
      </header>

      <article className="article">
        <h2 id="summary">The short version</h2>
        <p>
          Milius has <strong>no accounts, no analytics, no tracking, no advertising and no third-party SDKs</strong>,
          and the developer runs no server for it. Your drives, routes, cars and fuel receipts are stored on your
          iPhone or iPad and synced through <strong>your own private iCloud</strong>. The developer cannot see any of
          it. A few small, specific requests go to Apple and to the Czech National Bank; they are listed below, each
          with what it carries.
        </p>

        <h2 id="controller">Who is responsible</h2>
        <p>
          Milius is made by <strong>{OPERATOR_NAME}</strong>, a sole trader registered in the Czech trade register,
          business ID (IČO) {OPERATOR_ID}, Petra Rezka 1114/8, Nusle, 140&nbsp;00 Prague 4, Czech Republic. You can
          reach him at {mail}. Full details are on the{' '}
          <Link className="inline" href="/imprint">
            Imprint
          </Link>{' '}
          page. Because nothing about you reaches the developer, he processes no personal data of yours through the
          app.
        </p>

        <h2 id="stored">What Milius stores — and where</h2>
        <ul>
          <li>
            <strong>Drives</strong> — the route, its timing and speeds, the figures worked out from them, the car and
            consumption you assign, your note, and the names of the places it started and ended.
          </li>
          <li>
            <strong>Cars, fuel receipts and journeys</strong> — what you enter, including amounts paid and odometer
            readings.
          </li>
          <li>
            <strong>Settings</strong> — units, theme, reminders and similar preferences, kept on each device.
          </li>
        </ul>
        <p>
          All of this lives in the app&rsquo;s storage on your device and is synced between your devices through your{' '}
          <strong>private iCloud database</strong> (CloudKit), under your Apple Account. It is covered by Apple&rsquo;s
          iCloud terms, and the developer has no access to it. A drive still being recorded stays on the device that is
          recording it until it ends.
        </p>

        <h2 id="location">Location</h2>
        <p>
          Milius uses your location <strong>only while a drive is being recorded</strong> — started by you, by a
          Shortcut you set up, or by Siri. Between drives it does not track you. <em>Always</em> permission exists only so
          a Shortcut can start a drive while the app is closed; with <em>While Using</em>, drives you start in the app
          still record with the phone locked. The barometer (Motion &amp; Fitness) is used during a drive to measure
          climb and descent.
        </p>

        <h2 id="network">What leaves your device</h2>
        <ul>
          <li>
            <strong>Apple Maps.</strong> Maps are drawn by Apple&rsquo;s MapKit. To name a drive (&ldquo;Brno →
            Prague&rdquo;), the <strong>first and last point of each drive</strong> are sent once to Apple&rsquo;s
            geocoding service. When you ask for fuel stations or chargers nearby, the location being searched around is
            sent to Apple Maps. Apple handles these under its own privacy policy.
          </li>
          <li>
            <strong>iCloud.</strong> Your data syncs through your own iCloud account, as described above.
          </li>
          <li>
            <strong>Exchange rates.</strong> Only when you tap the download button in Settings, Milius fetches the
            Czech National Bank&rsquo;s public daily rates file. The request carries nothing about you beyond what any
            web request does.
          </li>
          <li>
            <strong>Tips.</strong> If you leave a tip, the purchase is handled entirely by Apple through the App Store.
            The developer receives no payment details. Whether the icons are unlocked is kept in your iCloud.
          </li>
        </ul>
        <p>Nothing else is sent anywhere — no analytics, no crash reporting of our own, no advertising identifiers.</p>

        <h2 id="device">Things that stay on your device</h2>
        <ul>
          <li>
            <strong>Receipt photos</strong> are read on your iPhone (text recognition and, where available,
            Apple&rsquo;s on-device model). The photo is not kept and is never uploaded.
          </li>
          <li>
            <strong>Spotlight, widgets, the Lock Screen and Siri</strong> work from data kept on the device.
          </li>
          <li>
            <strong>Notifications</strong> (a drive still recording, a finished drive, an odometer reminder) are
            created on the device; none come from a server.
          </li>
          <li>
            <strong>Pictures of a drive</strong> are saved to Photos only when you choose to; Milius never reads your
            photo library.
          </li>
        </ul>

        <h2 id="control">Your control</h2>
        <ul>
          <li>Delete any drive, journey, car or receipt in the app; the deletion syncs to your other devices.</li>
          <li>Export everything to JSON, CSV or GPX from Settings, at any time.</li>
          <li>
            Turn iCloud sync off for Milius in the iOS Settings app, or revoke location, camera and motion access
            there.
          </li>
          <li>Deleting the app removes its data from the device; data in iCloud can be removed from iCloud settings.</li>
        </ul>
        <p>
          Feedback you send by email reaches the developer as an ordinary email, with the app version and device model
          the draft already contains; it is used only to answer you.
        </p>

        <h2 id="children">Children</h2>
        <p>Milius is not directed at children and collects nothing from anyone.</p>

        <h2 id="changes">Changes and contact</h2>
        <p>
          If this policy changes, the new version will be published here with a new date. Questions or requests — write
          to {mail}. You also have the right to lodge a complaint with the Czech data protection authority (Úřad pro
          ochranu osobních údajů, uoou.gov.cz).
        </p>
      </article>
    </>
  );
}

function Czech() {
  return (
    <>
      <header className="page-hero">
        <span className="section-kicker">Milius · Soukromí</span>
        <h1>Tvoje jízdy patří tobě.</h1>
        <p className="lead">
          Milius zaznamenává, kudy jezdíš, a proto je postavený tak, aby to zůstalo jen u tebe. Žádný účet, žádná
          analytika, žádná reklama, žádný vlastní server — jízdy zůstávají v tvých zařízeních a v tvém iCloudu.
        </p>
        <p className="meta">Poslední úprava · říjen 2026 · Platí pro Milius 1.0</p>
      </header>

      <article className="article">
        <h2 id="summary">Ve zkratce</h2>
        <p>
          Milius nemá <strong>účty, analytiku, sledování, reklamu ani SDK třetích stran</strong> a vývojář pro něj
          neprovozuje žádný server. Jízdy, trasy, auta a účtenky z tankování jsou uložené v iPhonu nebo iPadu a
          synchronizují se přes <strong>tvůj vlastní soukromý iCloud</strong>. Vývojář do nich nevidí. Pár malých,
          konkrétních požadavků jde k Applu a k České národní bance; jsou vypsané níže, každý s tím, co nese.
        </p>

        <h2 id="controller">Kdo odpovídá</h2>
        <p>
          Milius vytváří <strong>{OPERATOR_NAME}</strong>, fyzická osoba podnikající podle živnostenského zákona, IČO{' '}
          {OPERATOR_ID}, Petra Rezka 1114/8, Nusle, 140&nbsp;00 Praha 4. Kontakt: {mail}. Úplné údaje jsou na stránce{' '}
          <Link className="inline" href="/imprint">
            Provozovatel
          </Link>
          . Protože se k vývojáři o tobě nic nedostane, aplikací žádné tvé osobní údaje nezpracovává.
        </p>

        <h2 id="stored">Co Milius ukládá — a kam</h2>
        <ul>
          <li>
            <strong>Jízdy</strong> — trasu, časy a rychlosti, z nich spočítané údaje, auto a spotřebu, které přiřadíš,
            poznámku a názvy míst, kde jízda začala a skončila.
          </li>
          <li>
            <strong>Auta, účtenky z tankování a cesty</strong> — co zadáš, včetně zaplacených částek a stavu
            tachometru.
          </li>
          <li>
            <strong>Nastavení</strong> — jednotky, vzhled, připomínky a podobné předvolby, v každém zařízení zvlášť.
          </li>
        </ul>
        <p>
          Všechno je v úložišti aplikace v tvém zařízení a mezi zařízeními se synchronizuje přes tvou{' '}
          <strong>soukromou databázi v iCloudu</strong> (CloudKit) pod tvým Apple účtem. Platí pro ni podmínky iCloudu
          a vývojář k ní nemá přístup. Jízda, která se právě nahrává, zůstává do svého konce jen v zařízení, které ji
          nahrává.
        </p>

        <h2 id="location">Poloha</h2>
        <p>
          Milius používá polohu <strong>jen během nahrávání jízdy</strong> — kterou spustíš ty, zkratka, kterou sis
          nastavil, nebo Siri. Mezi jízdami tě nesleduje. Oprávnění <em>Vždy</em> je potřeba jen proto, aby zkratka
          mohla spustit jízdu, když je aplikace zavřená; s oprávněním <em>Při používání</em> se jízdy spuštěné v aplikaci
          nahrávají i se zamčeným telefonem. Barometr (Pohyb a kondice) se během jízdy používá k měření stoupání a
          klesání.
        </p>

        <h2 id="network">Co opouští zařízení</h2>
        <ul>
          <li>
            <strong>Mapy Apple.</strong> Mapy vykresluje Apple MapKit. Aby jízda dostala název (&bdquo;Brno →
            Praha&ldquo;), pošle se <strong>první a poslední bod každé jízdy</strong> jednou geokódovací službě Applu.
            Když hledáš čerpací stanice nebo nabíječky poblíž, pošle se Mapám Apple místo, kolem kterého se hledá. Apple
            s tím nakládá podle svých zásad ochrany soukromí.
          </li>
          <li>
            <strong>iCloud.</strong> Data se synchronizují přes tvůj vlastní iCloud, jak je popsáno výše.
          </li>
          <li>
            <strong>Kurzy měn.</strong> Jen když v Nastavení klepneš na stažení, Milius stáhne veřejný denní kurzovní
            lístek České národní banky. Požadavek o tobě nenese nic víc než jakýkoli jiný požadavek na web.
          </li>
          <li>
            <strong>Spropitné.</strong> Pokud přispěješ, nákup celý vyřizuje Apple přes App Store. Vývojář nedostane
            žádné platební údaje. Informace o odemčených ikonách je uložená v tvém iCloudu.
          </li>
        </ul>
        <p>Nic dalšího se nikam neposílá — žádná analytika, žádné vlastní hlášení pádů, žádné reklamní identifikátory.</p>

        <h2 id="device">Co zůstává v zařízení</h2>
        <ul>
          <li>
            <strong>Fotky účtenek</strong> se čtou přímo v iPhonu (rozpoznání textu a tam, kde je k dispozici,
            model Applu běžící v zařízení). Fotka se neukládá a nikam se neodesílá.
          </li>
          <li>
            <strong>Spotlight, widgety, zamčená obrazovka a Siri</strong> pracují s daty uloženými v zařízení.
          </li>
          <li>
            <strong>Oznámení</strong> (jízda se pořád nahrává, jízda skončila, připomínka tachometru) vznikají v
            zařízení; žádné nechodí ze serveru.
          </li>
          <li>
            <strong>Obrázky jízdy</strong> se ukládají do Fotek, jen když to zvolíš; Milius tvoji knihovnu fotek nikdy
            nečte.
          </li>
        </ul>

        <h2 id="control">Máš to ve své moci</h2>
        <ul>
          <li>Jakoukoli jízdu, cestu, auto nebo účtenku smažeš v aplikaci; smazání se propíše do tvých dalších zařízení.</li>
          <li>Všechno kdykoli exportuješ do JSON, CSV nebo GPX v Nastavení.</li>
          <li>
            Synchronizaci přes iCloud pro Milius vypneš v aplikaci Nastavení v iOS, kde také odebereš přístup k poloze,
            fotoaparátu a pohybu.
          </li>
          <li>Smazáním aplikace zmizí její data ze zařízení; data v iCloudu odstraníš v nastavení iCloudu.</li>
        </ul>
        <p>
          Zpětná vazba, kterou pošleš e-mailem, dorazí vývojáři jako obyčejný e-mail s verzí aplikace a modelem
          zařízení, které koncept už obsahuje; použije se jen k odpovědi.
        </p>

        <h2 id="children">Děti</h2>
        <p>Milius není určen dětem a nesbírá nic od nikoho.</p>

        <h2 id="changes">Změny a kontakt</h2>
        <p>
          Když se tyto zásady změní, nová verze vyjde tady s novým datem. Dotazy a žádosti piš na {mail}. Máš také
          právo podat stížnost u Úřadu pro ochranu osobních údajů (uoou.gov.cz).
        </p>
      </article>
    </>
  );
}

export function MiliusPrivacyContent() {
  const { lang } = useI18n();
  return lang === 'cs' ? <Czech /> : <English />;
}
