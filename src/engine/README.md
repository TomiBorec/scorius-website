# Scoring engines

A TypeScript port of the six scoring engines from the Scorius iOS app
(`~/Documents/BB3/BB3/Shared/`). Twelve sports, six engines — routing is decided by
flags in `types.ts`, never by string branching, exactly as it is in Swift.

| Engine | File | Sports |
|---|---|---|
| Rally | `rally.ts` | badminton, volleyball, table tennis, squash |
| Tennis | `tennis.ts` | tennis, padel |
| Pickleball | `pickleball.ts` | pickleball |
| Clocked goals | `football.ts` | football, floorball |
| Basketball | `basketball.ts` | basketball |
| Golf | `golf.ts` | golf, disc golf |

`clock.ts` is the period-clock core the two clocked engines share.

## The rules now exist twice, and that is the risk

A drift between this port and the Swift original means a match scored in the browser
reads differently in the app — a data-integrity bug, not a cosmetic one.

The guard is `engine.fixtures.test.ts`, which replays
`__fixtures__/engine-fixtures.json`. That file is **generated from the shipped Swift
engines**, not written by hand: hand-written expectations would only pin the author's
understanding of the rules, while generated ones pin the rules themselves.

```bash
npm run test:engine
```

Coverage as committed: 2,822 rally cases (predicates across six presets plus the full
table-tennis serve rotation), 15 tennis matches replayed point by point with full state,
18 pickleball rally sequences across singles/doubles and both scoring modes, 30
basketball and 135 football gating cases, and 65 golf rounds hole by hole.

The suite is known to catch real divergence — disabling the tennis 4-4 → deuce
normalisation fails it at a specific point in a specific match.

## Regenerating the fixture

After any engine change on **either** side:

```bash
cd ~/Documents/BB3/BB3
xcodebuild -project BB3.xcodeproj -scheme BB3 \
  -destination 'platform=iOS Simulator,name=iPhone 17' \
  -only-testing:BB3Tests/EngineFixtureExport test | grep FIXTURE_OUT
```

It prints the file it wrote; copy that over `__fixtures__/engine-fixtures.json` and run
the suite. The generator uses a seeded PRNG and sorted keys, so the output is
byte-stable — a diff shows real behaviour changes and nothing else.

## Porting conventions

- Swift `mutating func` on a struct becomes a pure function returning new state. Swift
  structs are values, so the engines were already effectively pure.
- `TimeInterval` stays a number of seconds. `Date` becomes epoch milliseconds;
  ISO-8601 conversion belongs at the persistence and export boundary, never in here.
- Faithfulness beats tidiness. Where Swift omits a bound, this omits it too — clamping
  on only one side would make the two disagree on out-of-range input, and a divergence
  on impossible input is still a divergence.
