'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { normaliseCode } from '@/lib/spectate';

/** Code entry. Accepts a bare code, a pasted URL, lowercase, dashes, spaces. */
export function WatchEntry() {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const code = normaliseCode(value);
    if (!code) {
      setError(true);
      return;
    }
    router.push(`/w/${code}`);
  }

  return (
    <main className="sp-wrap">
      <div className="sp-board">
        <h1 className="sp-title">Watch a live match</h1>
        <p className="sp-note">
          Enter the six-character code from the Scorius app, or open the link you were sent.
        </p>
        <form className="sp-form" onSubmit={submit}>
          <label className="sp-label" htmlFor="spectate-code">Match code</label>
          <input
            id="spectate-code"
            className={`sp-input${error ? ' invalid' : ''}`}
            value={value}
            onChange={(event) => { setValue(event.target.value); setError(false); }}
            placeholder="4KTM9P"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            inputMode="text"
            aria-invalid={error}
            aria-describedby={error ? 'spectate-error' : undefined}
          />
          {error ? (
            <p className="sp-error" id="spectate-error" role="alert">
              A code is six characters, like 4KTM9P.
            </p>
          ) : null}
          <button className="sp-cta" type="submit">Watch</button>
        </form>
      </div>
      <p className="sp-foot">
        Codes come from the Scorius app — tap Share while scoring a match.
      </p>
    </main>
  );
}
