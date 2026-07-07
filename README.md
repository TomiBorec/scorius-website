# Scorius — Marketing site

Marketing website for **Scorius** — the multi-sport score keeper for iPhone, iPad, and Apple Watch that keeps score across badminton, tennis, basketball, football and golf.

Stack: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · static export.

## Pages

- `/` — landing: hero, sport switcher, features, how-it-works, privacy band, CTA
- `/features` — feature detail blocks + per-sport rules table
- `/support` — FAQ accordion + contact card
- `/privacy` — privacy policy
- `/terms` — terms of use

## Signature interactions

- **Sport switcher** — a single `data-sport` attribute on `<html>` re-tints every
  `--accent*` token (per-sport, light + dark) and swaps the live device-mock content.
  Persisted to `localStorage['scorius-sport']`. The accent props are registered with
  `@property` so Chromium repaints them on attribute change.
- **Live-match engine** — `src/hooks/useMatch.ts` is a per-sport state machine (badminton
  rally cap, tennis 0/15/30/40/AD + sets, basketball clock + 2/3-pointers, football count-up
  halves, golf strokes/holes) driving the iPhone, Watch and Live-Activity mocks.
- **Theme** — light/dark toggle, `localStorage['scorius-theme']`, defaults to
  `prefers-color-scheme`. Both theme and sport are applied pre-paint by an inline bootstrap
  script in `app/layout.tsx`.

The design system (tokens, devices, layouts) lives in `src/app/globals.css`; fonts (Inter +
JetBrains Mono) are loaded via `next/font`.

## Develop

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Build

```bash
npm run build
```

Outputs static HTML/CSS/JS into `out/`. The `out/` directory is what gets deployed.

## Deploy

Deployed automatically by **Cloudflare Pages** on every push to `main`.

Build settings used in Cloudflare Pages:

| Setting | Value |
|---|---|
| Framework preset | Next.js (Static HTML Export) |
| Build command | `npm run build` |
| Build output directory | `out` |
| Root directory | `/` |
| Node version | 20 |

Live URL: https://scorius.app
