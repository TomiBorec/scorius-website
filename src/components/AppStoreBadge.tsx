import { APPSTORE_URL } from '@/components/constants';

/**
 * Both badge variants are rendered and CSS hides one, keyed off the
 * <html data-theme> the pre-paint bootstrap script sets. Reading the theme
 * from React state instead meant the light badge painted first on every dark
 * load and swapped once hydration ran.
 */
export function AppStoreBadge() {
  return (
    <a href={APPSTORE_URL} target="_blank" rel="noopener noreferrer" className="app-store-badge-link">
      {/* Plain <img>: these are ~2KB static SVGs on an `output: export` build,
          where next/image needs a custom loader and cannot optimise vectors
          anyway. Both carry explicit dimensions, so there is no layout shift. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img data-theme-only="light" src="/badge-light.svg" alt="Download on the App Store" width={120} height={40} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img data-theme-only="dark" src="/badge-dark.svg" alt="Download on the App Store" width={120} height={40} />
    </a>
  );
}
