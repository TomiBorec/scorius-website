export function BWFRules() {
  return (
    <section id="rules" style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 32px 60px' }}>
      <div
        className="bb-rules-card"
        style={{
          background: 'var(--fg)',
          color: 'var(--bg)',
          borderRadius: 28,
          padding: '72px 56px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 48,
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1.6,
              textTransform: 'uppercase',
              opacity: 0.55,
              marginBottom: 16,
            }}
          >
            BWF rules built-in
          </div>
          <h2
            style={{
              fontSize: 'clamp(34px, 4vw, 52px)',
              fontWeight: 700,
              letterSpacing: -1.4,
              lineHeight: 1,
              margin: 0,
              textWrap: 'balance',
            }}
          >
            You play. The app calls game.
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.55, opacity: 0.65, marginTop: 20, marginBottom: 0 }}>
            Badminton Log enforces official BWF scoring — so you never have to argue whether 21–20 is game, or wonder what
            happens at 29–all.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <RuleCard num="21" label="Points to win a game" detail="First to 21 wins the game." />
          <RuleCard
            num="2"
            label="Lead required"
            detail="Must win by 2 — play continues past 21 until someone leads by two."
          />
          <RuleCard num="30" label="Sudden death cap" detail="At 29–29, the next point wins. No exceptions." />
        </div>
      </div>
    </section>
  );
}

function RuleCard({ num, label, detail }: { num: string; label: string; detail: string }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '80px 1fr',
        gap: 20,
        alignItems: 'center',
        padding: '20px 0',
        borderTop: '1px solid rgba(127,127,127,0.2)',
      }}
    >
      <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: -2, lineHeight: 1, fontFeatureSettings: '"tnum"' }}>
        {num}
      </div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 14, lineHeight: 1.5, opacity: 0.65 }}>{detail}</div>
      </div>
    </div>
  );
}
