import type { Metadata } from 'next';

/* ============================================================
   Language alternates.

   The site is a static export: one HTML per route, with the language chosen in
   the browser. That leaves a Czech reader with no URL to send anybody — and the
   legal pages in particular need one, since "the Czech terms" has to be a link,
   not a toggle somebody else has to find. So `?lang=` is a real entry point (the
   bootstrap in layout.tsx honours it before anything paints) and hreflang points
   at those URLs. x-default is the bare path, which picks by browser language.
   ============================================================ */
export function languageAlternates(path: string): Metadata['alternates'] {
  return {
    canonical: path,
    languages: {
      cs: `${path}?lang=cs`,
      en: `${path}?lang=en`,
      'x-default': path,
    },
  };
}
