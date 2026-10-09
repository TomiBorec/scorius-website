'use client';

import Link from 'next/link';
import { useState } from 'react';
import { SUPPORT_EMAIL } from '@/components/constants';
import { useI18n } from '@/i18n';

/* Help for Milius, in both of the site's languages. The answers match what the app does. */

type Item = { q: string; a: string };

const en = {
  kicker: 'Milius · Support',
  title: 'Help with Milius.',
  lead: 'Milius records your car trips on iPhone and iPad: the route coloured by speed, the figures that matter and what each drive cost. If something does not work the way you expect, the answers below cover the usual cases — and an email reaches the developer directly.',
  contactTitle: 'Still stuck?',
  contactBody: 'Write to the developer. In the app, Settings → Send Feedback opens a draft that already carries the app version and the model of your phone.',
  email: 'Email support',
  privacy: 'Privacy policy',
  items: [
    {
      q: 'How do I record a drive?',
      a: 'Press Start on the first screen. The route draws as you go and recording continues with the phone locked. Press Stop when you arrive, and the drive opens with its map and figures. You can also start and stop from Siri, Control Center, the Lock Screen, the Action button or the Home Screen widget.',
    },
    {
      q: 'Can a drive start by itself?',
      a: 'Yes, with a Shortcuts automation: when your iPhone connects to the car’s Bluetooth, run Milius’s Start Tracking; when it disconnects, Stop Tracking. The Shortcuts guide on the location page of Milius’s Settings walks you through it. For a drive to start while the app is closed, location access needs to be set to Always.',
    },
    {
      q: 'Why does Milius ask for Always location access?',
      a: 'Only so a Shortcut can begin a drive while the app is closed. If you always start drives yourself, While Using is enough — recording still continues with the phone locked. Between drives Milius does not use your location at all.',
    },
    {
      q: 'I stopped for fuel. Do I need to stop the drive?',
      a: 'No. Leave it recording; a stop at the pump counts as one stop. If a Shortcut stops the drive when you get out, it waits five minutes — get back in by then and it carries on as one drive.',
    },
    {
      q: 'How does Milius know what my car really uses?',
      a: 'From your fill-ups. Log each one (or photograph the receipt), fill to the brim and note the odometer. Between two full tanks Milius measures the real consumption and works out what each kilometre cost. Until then it can use the consumption you type in for the car.',
    },
    {
      q: 'My drives are not on my other device.',
      a: 'Both devices need to be signed in to the same Apple Account with iCloud Drive on and Milius allowed to use iCloud. The iCloud and data page of Milius’s Settings shows what sync is doing, and can put every record back in the queue if something got stuck.',
    },
    {
      q: 'Can I record on an iPad?',
      a: 'Only on an iPad with GPS (the Wi-Fi + Cellular models). A Wi-Fi-only iPad has no GPS, so it cannot record — but it shows all your drives synced from your iPhone.',
    },
    {
      q: 'Why is there no 0–100 time?',
      a: 'A phone cannot measure acceleration or braking accurately enough. Earlier versions tried, and the figures were wrong — so Milius shows none rather than a misleading one.',
    },
    {
      q: 'How do I get my data out?',
      a: 'Export everything, on the iCloud and data page of Settings, writes JSON (which Milius can read back), CSV or GPX. Every drive can also be exported on its own from its menu.',
    },
  ] as Item[],
};

const cs: typeof en = {
  kicker: 'Milius · Podpora',
  title: 'Pomoc s Miliusem.',
  lead: 'Milius zaznamenává tvoje jízdy autem na iPhonu a iPadu: trasu obarvenou podle rychlosti, údaje, na kterých záleží, a kolik která jízda stála. Když něco nefunguje, jak čekáš, odpovědi níže pokryjí běžné případy — a e-mail se dostane přímo k vývojáři.',
  contactTitle: 'Pořád nevíš?',
  contactBody: 'Napiš vývojáři. V aplikaci otevře Nastavení → Poslat zpětnou vazbu koncept, ve kterém už je verze aplikace a model telefonu.',
  email: 'Napsat e-mail',
  privacy: 'Ochrana soukromí',
  items: [
    {
      q: 'Jak nahraju jízdu?',
      a: 'Na první obrazovce zmáčkni Start. Trasa se kreslí průběžně a nahrávání pokračuje i se zamčeným telefonem. Po příjezdu zmáčkni Stop a otevře se jízda s mapou a údaji. Spustit a zastavit ji můžeš i přes Siri, Ovládací centrum, zamčenou obrazovku, tlačítko Akce nebo widget na ploše.',
    },
    {
      q: 'Může se jízda spustit sama?',
      a: 'Ano, automatizací ve Zkratkách: když se iPhone připojí k Bluetooth auta, spusť akci Miliusu Spustit sledování; když se odpojí, Zastavit sledování. Provede tě tím návod ke Zkratkám na stránce polohy v Nastavení Miliusu. Aby se jízda spustila i se zavřenou aplikací, musí mít přístup k poloze nastavený na Vždy.',
    },
    {
      q: 'Proč Milius chce přístup k poloze Vždy?',
      a: 'Jen proto, aby zkratka mohla spustit jízdu, když je aplikace zavřená. Pokud jízdy spouštíš sám, stačí Při používání — nahrávání i tak pokračuje se zamčeným telefonem. Mezi jízdami Milius polohu vůbec nepoužívá.',
    },
    {
      q: 'Zastavil jsem na benzince. Musím jízdu ukončit?',
      a: 'Ne. Nech ji nahrávat; zastávka u pumpy se počítá jako jedna zastávka. Když jízdu po vystoupení zastaví zkratka, počká pět minut — když se do té doby vrátíš, pokračuje jako jedna jízda.',
    },
    {
      q: 'Jak Milius pozná, kolik auto doopravdy žere?',
      a: 'Z tankování. Zapiš každé (nebo vyfoť účtenku), tankuj do plna a poznamenej si stav tachometru. Mezi dvěma plnými nádržemi Milius změří skutečnou spotřebu a spočítá, kolik stál každý kilometr. Do té doby může použít spotřebu, kterou autu zadáš.',
    },
    {
      q: 'Jízdy nejsou v mém druhém zařízení.',
      a: 'Obě zařízení musí být přihlášená ke stejnému Apple účtu se zapnutým iCloud Drive a Milius musí mít iCloud povolený. Stránka iCloud a data v Nastavení Miliusu ukáže, co synchronizace dělá, a umí všechny záznamy znovu zařadit do fronty, když se něco zasekne.',
    },
    {
      q: 'Můžu nahrávat na iPadu?',
      a: 'Jen na iPadu s GPS (modely Wi-Fi + Cellular). iPad jen s Wi-Fi GPS nemá, takže nahrávat neumí — ale ukáže všechny jízdy synchronizované z iPhonu.',
    },
    {
      q: 'Proč tu není čas na 0–100?',
      a: 'Telefon zrychlení ani brzdění nezměří dost přesně. Starší verze to zkoušely a čísla byla špatně — Milius proto radši neukazuje žádné, než aby ukazoval zavádějící.',
    },
    {
      q: 'Jak dostanu data ven?',
      a: 'Exportovat vše na stránce iCloud a data v Nastavení zapíše JSON (který Milius umí načíst zpět), CSV nebo GPX. Každou jízdu exportuješ i samostatně z jejího menu.',
    },
  ],
};

export function MiliusSupportContent() {
  const { lang } = useI18n();
  const s = lang === 'cs' ? cs : en;
  const [open, setOpen] = useState<Set<number>>(() => new Set([0]));
  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <>
      <header className="page-hero">
        <span className="section-kicker">{s.kicker}</span>
        <h1>{s.title}</h1>
        <p className="lead">{s.lead}</p>
      </header>

      <section className="faq-list">
        {s.items.map((item, i) => {
          const isOpen = open.has(i);
          return (
            <div key={item.q} className={`faq-item${isOpen ? ' open' : ''}`}>
              <button className="faq-q" onClick={() => toggle(i)} aria-expanded={isOpen}>
                {item.q}
                <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
              <div className="faq-a">
                <div className="inner">
                  <p>{item.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <div className="contact-band" id="contact">
        <div className="contact-card">
          <div>
            <h3>{s.contactTitle}</h3>
            <p>
              {s.contactBody} <strong>{SUPPORT_EMAIL}</strong>
            </p>
          </div>
          <div className="hero-cta" style={{ margin: 0 }}>
            <a className="btn btn-primary" href={`mailto:${SUPPORT_EMAIL}?subject=Milius`}>
              {s.email}
            </a>
            <Link className="btn btn-outline" href="/milius/privacy">
              {s.privacy}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
