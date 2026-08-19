'use client';

/* ============================================================
   Registers the service worker, and asks for persistent storage.

   Both are best-effort and neither blocks anything: a browser that
   refuses either still scores matches, it just loses them sooner and
   needs signal to load.
   ============================================================ */

import { useEffect } from 'react';

export function OfflineReady() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    // After load, so registering never competes with the first paint of a
    // scorer someone is already tapping.
    const register = () => void navigator.serviceWorker.register('/sw.js').catch(() => {});
    if (document.readyState === 'complete') register();
    else {
      window.addEventListener('load', register, { once: true });
      return () => window.removeEventListener('load', register);
    }
  }, []);

  return null;
}
