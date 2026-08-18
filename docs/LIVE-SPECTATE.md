# Live Spectate — build plan

Read-only live score sharing: a match scored in Scorius is watchable in any browser
via a short code or a link. Ships in **app v2.2** (TestFlight first, web live in
parallel, App Store once it's debugged).

This file is the checklist. Nothing here is optional unless it says so.

Two repos are involved:

| Repo | Path | Carries |
|---|---|---|
| Website | `~/Documents/scorius-website` | Worker + Durable Object, spectator UI, web scorer, privacy policy |
| App | `~/Documents/BB3/BB3` | the publish path, the scorer UI control, the code sheet, 35 languages |

---

## 1. What it is

- **Read-only.** Spectators send nothing. Only the scoring device can write, and only
  with a token it never shares.
- **The code *is* the link.** `scorius.app/w/4KTM9P` and typing `4KTM9P` on
  `scorius.app/watch` are the same feature with two entry points — one identifier,
  one Durable Object, one renderer.
- **Ephemeral.** The live score is held in memory for the match and discarded a few
  hours after the last frame. No database, no backups, no history on the server.
- **Opt-in per match.** Off by default; the scorer taps to start.
- **Both scoring sources.** A match scored on the iPhone *and* a match scored on the
  Apple Watch can be shared. In both cases **the iPhone is the publisher and the iPhone
  is where you share the link** — the Watch has no sane way to hand someone a URL.

## 2. Architecture

The wire format already exists and is already proven in production: `MatchAttributes.ContentState`
(`Shared/MatchAttributes.swift`) — a flat Codable payload of ~25 fields covering all
12 sports, built by `liveActivityState(for:)` (iPhone-scored) and
`liveActivityState(forLive:)` (Watch-scored). It drives the Live Activity widget and
SharePlay today. Web spectate is a **third renderer over the same payload**.

```
  iPhone (or Watch → iPhone)
        │
        │  activeMatch / liveMatchData didSet
        │  → publishWebSpectate()          ~400 B JSON, PUT, throttled on equality
        ▼
  Cloudflare Worker  ──►  Durable Object (one per code)
        │                    holds last frame + open SSE connections
        │                    alarm-based TTL cleanup
        ▼
  scorius.app/w/<CODE>   ──  EventSource (SSE), auto-reconnect
```

The clock is **not** streamed. `periodEndsAt` says "zero falls at instant X" once and
the browser counts down locally — the same trick the widget uses. A running football
clock therefore costs zero requests.

### Frame volume (per match, measured against the engines)

| Sport | Frames | Why |
|---|---:|---|
| Football / floorball | 10–20 | only goals + period changes; the clock is local |
| Golf / disc golf | 18–40 | one per hole |
| Badminton, squash, table tennis, volleyball | 60–70 | one per rally |
| Basketball, tennis, padel, pickleball | 60–150 | one per basket / point |

~80 requests/match average. Workers free tier is 100k requests/day ≈ 1200 matches/day.

## 3. Decisions already made — do not re-open

- Read-only for spectators; write requires a token.
- Cloudflare (same account, same domain, same `wrangler deploy` as the site today).
- SSE, not WebSocket — traffic is one-way and `EventSource` reconnects for free.
- Ships in **2.2**, not 2.3.
- Web scorer is English-only, local-storage-only, no Scorius account.
- Export format is the app's existing `MatchesArchive` envelope (see Phase E).

## 4. Decisions still open — settle before Phase A

- [ ] **Durable Objects on the current Cloudflare plan.** Free-tier gating for DOs has
      changed over time; confirm in the dashboard. Fallback is Worker + KV + ~3 s polling,
      which is noticeably worse but works. **This gates everything — check it first.**
- [ ] **Code length and alphabet.** Proposal: 6 chars from `23456789ABCDEFGHJKMNPQRSTUVWXYZ`
      (31 chars, no `0/O/1/I/L`) ≈ 887M combinations. Long enough that guessing finds
      nothing, short enough to read out courtside.
- [ ] **TTL.** Proposal: 4 h after the last frame, 30 min after the final `isMatchComplete`
      frame.
- [ ] **Toolbar UX in the app.** There is already a `SharePlayToolbarButton`. Two share
      controls side by side is clutter — one button opening a menu (SharePlay / Link) is
      better but changes existing SharePlay UX. **This triggers the repo's design-first
      rule: present ~2 approaches and get Tom's OK before coding.**
- [ ] **QR code on the code sheet.** Courtside, showing a QR beats reading out characters.
      ~1 day. In or out?

---

## Phase A — Server (Cloudflare Worker + Durable Object)

Est. **4–6 days**. ~150–250 LOC TypeScript.

- [ ] Add the Worker to the existing `wrangler.toml`; keep it **same-origin** under
      `scorius.app/api/spectate/*` so the browser needs no CORS.
- [ ] `POST /api/spectate/start` → allocate an unused code, return `{code, token}`.
- [ ] `PUT /api/spectate/:code` → verify `x-scorius-token`, forward the frame to the DO.
      **Response body returns `{viewers: N}`** so the phone learns the watcher count with
      zero extra requests.
- [ ] `GET /api/spectate/:code/stream` → SSE subscription.
- [ ] Durable Object: `idFromName(code)`, holds the last frame + open connections.
- [ ] **On new subscriber, send the current frame immediately** — do not wait for the next
      point. Without this a spectator joining mid-match stares at an empty screen until
      someone scores.
- [ ] SSE keepalive comment (`:ka\n\n`) every ~25 s so proxies don't drop idle connections.
- [ ] **Envelope version field** (`{v: 1, state: {...}}`). The app ships independently of
      the web; without a version the first `ContentState` change breaks every old client.
- [ ] Alarm-based TTL cleanup per the decision above.
- [ ] Rate-limit `/start` by IP (Cloudflare rule + an in-DO guard). An unlimited public
      allocate endpoint is an invitation to burn the whole code space.
- [ ] Reject frames for an unknown/expired code with a distinguishable status so the app
      can tell "session died" from "network hiccup".
- [ ] No logging of frame contents. Names are in there.

## Phase B — Web spectator UI

Est. **6–9 days**.

- [ ] Route `/w/[code]` — the site is `output: 'export'`, so serve the static shell via a
      Pages Function on `/w/*` and read the code client-side.
- [ ] Route `/watch` — code entry field. Uppercase-normalise, strip spaces and dashes,
      tolerate a pasted full URL.
- [ ] Per-sport renderers over the flat frame — 5 layouts: rally, tennis/padel,
      clocked (football/floorball/basketball), pickleball, golf/disc golf.
      **Port `SpectatorMatchView.swift` (283 LOC); it already renders exactly one frame.**
- [ ] Local clock countdown from `periodEndsAt`; static `periodRemainingSeconds` when paused.
- [ ] States: connecting · live · **stale** (no frame for ~2 min — the phone may have died;
      say so rather than showing a frozen score as live) · match complete · code not found ·
      session expired.
- [ ] `EventSource` reconnect with backoff; show reconnecting, don't blank the score.
- [ ] **`noindex` on `/w/*` and `/watch`.** Player names must never land in Google.
      Add the meta tag *and* a `robots.txt` disallow, and confirm `src/app/sitemap.ts`
      does not emit these routes.
- [ ] Friendly "code not found" page, not the site's 404 (`not_found_handling` is
      currently `404-page`).
- [ ] Responsive: phone, desktop, and readable across a room on a laptop or TV.
- [ ] Dark mode + reduced motion, consistent with the rest of the site.
- [ ] Accessibility: live region announcements on score change, not a silent DOM swap.

## Phase C — Web scorer (stripped)

Est. **43–59 days**. English only, local storage, no account. **Not a blocker for
spectate** — with the publish path in 2.2, Tom's TestFlight build is the live source
during development.

- [ ] Port the 6 engines + model (`BadmintonRules`, `TennisRules`, `FootballRules`,
      `BasketballRules`, `PickleballRules`, `GolfRules`, `PeriodClockCarrying`,
      `Match`, `MatchSettings`, `ActiveMatchData`, `makeFinishedMatch`).
- [ ] **Generate JSON test fixtures from the Swift suite** (point sequence → expected state)
      and run them against the TS engines in CI. Two implementations that must agree; this
      is the only thing that catches drift before a user does.
- [ ] Scoring screens: 5 layouts + golf, undo, clock editor, serve chip, game-end banner.
- [ ] Setup flow: sport, side names, singles/doubles, team size, golf holes/pars.
- [ ] Per-sport rules editors for all 12 sports (port `SportRulesSections.swift`, 434 LOC).
- [ ] Local persistence (IndexedDB) + history list + match detail.
- [ ] Call `navigator.storage.persist()`. Safari ITP evicts non-installed PWA storage
      after 7 days idle.
- [ ] Wake Lock while scoring; reconstruct clocks from a monotonic stamp after backgrounding
      (timers throttle in background tabs).
- [ ] PWA manifest, offline service worker, cross-browser QA.
- [ ] Web-scored matches can publish a spectate session too — same Worker, same code.

## Phase D — iOS publish path (in 2.2)

Est. **6–8 days** plus the repo's gate.

- [ ] New `BB3/MatchStore+WebSpectate.swift` (~250 LOC): session start/stop, frame publish,
      viewer count, error handling.
- [ ] Hook into the **same two funnels** as SharePlay — `MatchStore.swift:185` and
      `MatchStore.swift:262`. Two traps:
      - `broadcastSpectateState()` bails on its `spectateMessenger` guard at the top, so the
        web path must be a **sibling call**, not code added inside it.
      - Both funnels sit under `#if canImport(ActivityKit)`. That is the wrong gate for web
        spectate — restructure so the web publish is not silently compiled out.
- [ ] Throttle on equality against the last published frame, mirroring `broadcastSpectateState`.
- [ ] **Failed frame → drop it.** A stale live score is worth nothing; the next point sends a
      fresh one. Never queue.
- [ ] **Final `isMatchComplete` frame gets 2–3 retries** — otherwise spectators are left
      watching a score that stopped moving and looks live.
- [ ] **On return to foreground, force-send the current frame** ignoring the throttle. iOS
      suspends URLSession tasks in the background; without this the score silently desyncs.
      Expect this to be the fiddliest part.
- [ ] Code sheet: the code, the link, share sheet, stop button (+ QR if decided).
- [ ] Scorer toolbar control across all six scoring screens (see the open design decision).
- [ ] `WebSpectateSettings` — per-device toggle, `@AppStorage`, **default off**. Mirror
      `LiveActivitySettings.swift`.
- [ ] Clear in-UI disclosure at the moment the session starts: this publishes the live score
      to anyone with the code, including the side names.
- [ ] Handle: session expired server-side mid-match · no network at start · user starts a
      second session · app killed with a session open.

### Watch-scored matches — share from the phone

**The data path already exists.** `broadcastSpectateState()` already handles the
Watch-scored source via `liveActivityState(forLive:)`, and the second funnel
(`MatchStore.swift:262`) *is* the `liveMatchData` didSet — the path the Watch pushes into.
The web publish, being a sibling call in the same two funnels, gets Watch matches for free.
What is missing is only the control.

- [ ] Put the share control in the **Live tab toolbar** — `ContentView.swift:317`, beside
      the existing scoreboard button. That view is the iPhone's mirror of a Watch-scored
      match, so it is exactly where someone reaches for it.
- [ ] Gate it on `liveMatchData?.isSessionActive` only. **Do not copy the neighbouring
      button's `!live.effectiveSport.isGolfLike` exclusion** — that exists because the
      courtside scoreboard has no two-sided score to draw for golf. Spectate has no such
      problem: `ContentState` already carries `golfHole` / `golfPar` / `golfToPar`, so a
      golf round on the wrist is perfectly watchable.
- [ ] Same code sheet as the iPhone-scored path — one sheet, two entry points.

#### The limitation, and be honest about it in the UI

The iPhone is the publisher; the Watch only feeds it. The wrist pushes `liveMatchData` via
`sendMessage` when reachable and `transferUserInfo` when not (`BB3 Watch App/MatchStore.swift:447`
and `:460`). A `sendMessage` from watchOS can wake a backgrounded iOS app, so a pocketed
phone is not hopeless — but it is **best-effort**: iOS throttles repeated background wakes,
so frames arrive late or not at all.

This is not a new risk. The existing SharePlay path already lives with exactly this — see
the comment at `MatchStore.swift:262` about "the phone in the bag does the broadcasting".
Same behaviour, same caveats.

- [ ] Say it plainly where the session is started from the Live tab: the score follows best
      when the phone stays unlocked and nearby. Do not imply real-time from a bag.
- [ ] The **stale state** in Phase B is what covers this visually — spectators see
      "no update for a while", never a frozen score presented as live.

### The repo's own gate (from `BB3/CLAUDE.md`) — none of this is optional

- [ ] All new UI strings translated into **all 34 languages** in the same commit.
      English-only strings are not shippable.
- [ ] `python3 scripts/verify-localization.py` green.
- [ ] Build green; tests green (`** TEST SUCCEEDED **`).
- [ ] `CURRENT_PROJECT_VERSION` bumped — **6 occurrences carry the real value**; leave the
      eight `= 1` test-target entries. Next build is **364**.
- [ ] Design-first approval for the toolbar/sheet UI before coding.
- [ ] `docs/ARCHITECTURE.md` — add the new file to §1 and the data flow.
- [ ] `docs/TESTING.md` — new manual section (see Phase G).
- [ ] `docs/ROADMAP-2.2.md` — update the "next build" line.
- [ ] Commit title `Build NNN — …`, explicit file list, no `git add -A`.

## Phase E — Export / import

Est. **2–3 days**. Web side only.

> **This is a constraint on Phase C, not a feature bolted on after it.** The web scorer's
> internal model must be a faithful port of the Swift `Match` shape from the first line of
> code. Retrofit it at the end and you are writing a conversion layer or redoing the model.

### The wire shape (verified against the source)

`MatchScore` and `MatchSettings` have **hand-written** `Codable` conformances
(`Shared/Match.swift:266`), not Swift's synthesized enum encoding. The JSON is therefore
clean and directly expressible as a TS discriminated union:

```json
{ "sport": "badminton", "badminton": { ... } }
```

A `sport` discriminator plus one payload key named after the sport. No `_0` wrappers.

Envelope: `{ "version": 1, "exportedAt": "<ISO8601>", "matches": [...] }` —
`tournaments` and `leagues` are optional and may be omitted entirely.

- [ ] Emit that envelope, ISO8601 dates, from the web.
- [ ] Import the same envelope on the web (so an app backup opens in the browser too).
- [ ] **Round-trip a real file both directions before trusting any of this.**
      Export from the app → import in the browser → export from the browser → import in
      the app. Diff the two JSON files.
- [ ] Make export prominent in the web UI. With local-only storage and no account it is
      the only safety net there is.

### The merge is safe — verified

`MatchStore.mergeImportedMatches` (`BB3/MatchStore.swift:838`) filters imported matches
against existing IDs and **appends only new ones. It never overwrites local data**, and
re-importing the same file twice is a no-op. So the web must mint a proper UUID per match;
duplicate or malformed IDs are the only way to break this.

### Open decision — player identity across the boundary

A `Match` references players by UUID (`playerSide: [UUID]?` / `opponentSide: [UUID]?`),
and `MatchesArchive` **carries no roster**. `MatchStore.displayName(for:)`
(`BB3/MatchStore.swift:494`) resolves an unknown UUID to the literal string `"Unknown"`.
A naive web export would therefore import as a history of matches between "Unknown" and
"Unknown".

There is an escape hatch already in the model: `Match.side1Name` / `side2Name` are
optional per-match display overrides, and when set they win over the joined player names.

- [ ] **Pick one:**
      - **(a) Names only — recommended for v1.** The web writes `side1Name` / `side2Name`
        and leaves the UUID arrays nil. Names display correctly, zero app changes.
        Cost: web matches don't attach to roster players, so they don't feed per-player
        stats or the ranking. Since the owner is always Side 1, the positional
        `outcome` still reads correctly for win/loss.
      - **(b) Add `players: [Player]?` to `MatchesArchive`.** Full fidelity, matches attach
        to the roster. Cost: app-side change that must land **in 2.2**. An older app
        reading a newer file ignores the unknown key safely, so it is backward-compatible —
        but keep `version` at 1 or `decodeJSON` hard-rejects the file.
- [ ] Whichever is chosen, state it in the web UI so the user is not surprised by what does
      and doesn't carry over.

## Phase F — Privacy & legal

**Ships in the same deploy as the feature, not before and not after.**

- [ ] Rewrite the two claims in `src/i18n/en.tsx` that stop being true:
      *"The app never talks to any server other than Apple's…"* and
      *"Nothing is uploaded to a server run by the developer."*
      Replacement keeps the promise and adds the boundary — the only upload is the live
      score of one match, only while you have a session open.
- [ ] New **Live Spectate** section in the privacy policy covering: off by default;
      anyone with the code can watch; read-only for spectators; held in memory only and
      discarded after the TTL; history is never sent; no account or device identifier;
      names you type are visible to anyone with the code.
- [ ] Update **Website data & local storage** for the web scorer's IndexedDB.
- [ ] Bump the policy's `meta` line (currently *"July 2026 · Applies to Scorius 2.0"*).
- [ ] Mirror the change in `src/i18n/cs.tsx` — the site ships EN + CS.
- [ ] Check the same claim isn't repeated elsewhere on the site (the `privacyBand`
      section and the features page both make privacy claims).

### App Store Connect — for the 2.2 submission

- [ ] **App Privacy** — add two data types, both `Not Linked to You`, purpose
      `App Functionality`, **not** used for tracking:

      | Data Type | Note |
      |---|---|
      | User Content → Other User Content | live score, side names |
      | Contact Info → Name | only because a user may type a real name as a side name |

      Apple's optional-disclosure exception arguably covers a user-initiated, clearly
      disclosed feature like this — but relying on it is more review risk than adding two
      rows. Declare it.
- [ ] **App Review Notes** — describe the feature, where the control is, and include a
      test code. A reviewer with no second device cannot otherwise test it, and that is a
      routine rejection reason.
- [ ] **Reviewer needs a code that still works.** A normal session dies at its TTL, so a
      code written into review notes will be dead by the time anyone tries it. Decide now:
      either a permanently reserved demo code whose Durable Object replays a canned match
      on loop, or a `/w/demo` route that needs no session at all. **Build it in Phase A/B —
      it is easy to forget until the submission is blocked on it.**
- [ ] **Privacy Policy URL** — unchanged; only the page content changes. Make sure the web
      deploy is live *before* submitting.
- [ ] Identifiers / Usage Data / Diagnostics — still nothing. Unchanged.
- [ ] Export compliance, age rating — unchanged (the app already makes HTTPS calls).
- [ ] **2.2 App Store metadata is already written** — `docs/app-store/2.2/` holds 89 files
      across 22 languages. Adding a feature means reopening `en-whats-new.txt` and
      retranslating the what's-new for the other 21 languages.

## Phase G — Testing

- [ ] New `docs/TESTING.md` section, alongside the existing
      *"SharePlay live spectating"* one.
- [ ] Walk **all 12 sports** end to end: code → watch → score → verify the browser matches
      the phone, including tennis point strings, golf to-par, period labels and the serve dot.
- [ ] **Watch-scored match, phone in the foreground** — start on the wrist, open the Live
      tab, share the link, verify the browser tracks the wrist. Distinct code path
      (`liveActivityState(forLive:)`) and easy to forget.
- [ ] **Watch-scored match, phone locked and pocketed** — establish what actually happens
      over a full match, not a 30-second sample. Write the real answer into
      `docs/TESTING.md` so the UI copy matches reality.
- [ ] **Golf on the wrist** — confirm the share control appears (the scoreboard button
      beside it is hidden for golf; this one must not be).
- [ ] Airplane mode mid-match → recovers on reconnect without a wrong score.
- [ ] Background the app for 5 min → foreground → browser resyncs.
- [ ] Kill the app mid-match → spectator goes stale, not frozen-looking-live.
- [ ] Let a session hit its TTL → both ends show a sane state.
- [ ] Bad / expired / lowercase / whitespace-padded codes, and a pasted full URL.
- [ ] 5+ simultaneous spectators on one code.
- [ ] Two matches at once from two devices — codes don't collide or cross-talk.
- [ ] Spectate a **paused** clocked sport; confirm the browser clock doesn't drift.
- [ ] Verify `/w/<code>` is not indexable (`curl` the headers, check `robots.txt`).
- [ ] Confirm no frame content appears in Worker logs.

## 5. Sequencing

| # | What | Blocked by | Est. |
|---|---|---|---:|
| 1 | Confirm DO availability | — | hours |
| 2 | Phase A — server | 1 | 4–6 d |
| 3 | Phase D — iOS publish path (TestFlight) | 2 | 5–7 d |
| 4 | Phase B — spectator UI | 2, and 3 for a real source | 6–9 d |
| 5 | Phase F — privacy + policy deploy | 4 | 1–2 d |
| 6 | Phase G — testing on TestFlight, web live | 3, 4, 5 | 3–4 d |
| 7 | **Ship 2.2 to the App Store** | 6 | — |
| 8 | Phase C — web scorer | independent | 43–59 d |
| 9 | Phase E — export/import | 8 | 2 d |

**Spectate to App Store: ~20–28 days of work.** The web scorer is a separate track and
does not gate the release.

Note the 2.2 submission still carries two pre-existing open items unrelated to this work:
the two-iPhone FaceTime pass on SharePlay, and the on-device Reduce Motion check backing
the Accessibility Nutrition Label.

## 6. Risks

| Risk | Mitigation |
|---|---|
| DOs unavailable on the current plan | Verify first. Fallback is KV + polling, or $5/mo. |
| Background suspension desyncs the score | Force-send on foreground; accept a short gap. |
| `ContentState` changes in a later app version | Envelope version field from day one. |
| Player names indexed by search engines | `noindex` + `robots.txt` + sitemap check, all in Phase B. |
| Someone spams `/start` | Rate limit + short TTL. |
| Worker deploy interrupts live sessions | Spectators auto-reconnect; deploy outside peak. |
| Two engine implementations drift (Phase C) | JSON fixtures generated from the Swift suite, run in CI. |

## 7. What changes operationally

Today: a static site with no moving parts and an app with no server. Nothing can break
between releases.

After: a live service. Uptime becomes a support surface; there is a public write endpoint
to rate-limit; personal data (a name) transits a server you operate, which makes you a
controller with a retention policy to honour; and the strongest line on the marketing
site gets a boundary. None of it is heavy — the whole server is ~200 lines — but it is a
category of responsibility that does not exist today.

Worth keeping in view: no failure mode here can lose a user's match. The score lives on
the phone; spectate is a projection of it. The worst outcome is a broadcast that stops.

---

## 8. What only Tom can do — and where

Everything below needs Tom's hands or Tom's account. Nothing here can be done from a
Claude Code session. **A concrete, filled-in version of this list is produced at the end
of implementation**, with the real values (codes, URLs, exact copy) rather than the
placeholders here.

### Before Phase A can start

| Where | What |
|---|---|
| Cloudflare dashboard | Confirm **Durable Objects** are available on the current plan. Upgrade to Workers Paid (~$5/mo) if not. **This gates the whole architecture.** |
| Here, in chat | Settle the four open decisions in §4 — code length, TTL, toolbar UX, QR. |
| Here, in chat | Approve the toolbar/sheet design (the repo's design-first rule requires ~2 approaches presented before any code). |
| Here, in chat | Pick (a) or (b) for player identity in Phase E. |

### During implementation

| Where | What |
|---|---|
| Cloudflare dashboard | Add the rate-limiting rule on `/api/spectate/start`. |
| Cloudflare dashboard | Confirm routing for `/api/spectate/*` and `/w/*` on the `scorius.app` custom domain. |
| Terminal | Run `wrangler deploy` for the Worker (or approve it being run). |
| Xcode | Nothing new — outbound HTTPS needs no new entitlement or capability, and signing is unchanged. |
| Here, in chat | Read and approve the final privacy-policy wording before it goes live. It is a publicly binding document; it should say what you are willing to stand behind. |

### Before submitting 2.2

| Where | What |
|---|---|
| Web | Deploy the updated privacy policy **before** submitting, so the URL Apple checks is already accurate. |
| TestFlight | Run the Phase G checklist on a real device — the simulator cannot prove the background/foreground resync. |
| App Store Connect → App Privacy | Add the two data types from §Phase F. |
| App Store Connect → Review Notes | Paste the feature description and the demo code. |
| App Store Connect → What's New | 22 languages. `docs/app-store/2.2/` is already written and will need reopening. |
| App Store Connect | Upload the build and submit. |
| Repo | Two pre-existing 2.2 items unrelated to this work are still open: the two-iPhone FaceTime pass on SharePlay, and the on-device Reduce Motion check backing the Accessibility Nutrition Label. |

### Ongoing, once it is live

| Where | What |
|---|---|
| Cloudflare dashboard | Watch request volume against the free tier for the first weeks. |
| Email | New support surface: "my code doesn't work". |
| Wherever you keep it | You are now a data controller for a small, ephemeral set. The retention policy in the privacy policy is a promise — the TTL in the Durable Object is what keeps it. If one changes, change the other. |
