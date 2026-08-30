import type { SVGProps } from 'react';
import type { Sport } from './state';

/** Per-sport line icon used in the sport switcher and brand contexts. */
export function SportIcon({ sport, className }: { sport: Sport; className?: string }) {
  switch (sport) {
    case 'badminton':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="18.5" r="2.6" />
          <path d="M10.6 16.3 6 5M13.4 16.3 18 5M11.2 15.6 8.5 4.5M12.8 15.6l2.7-11.1M6 5l12 0" />
        </svg>
      );
    case 'tennis':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M4.5 6.5c4 2 4 9 0 11M19.5 6.5c-4 2-4 9 0 11" />
        </svg>
      );
    case 'padel':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="7" y="2" width="10" height="13" rx="2.5" />
          <path d="M12 15v6" />
        </svg>
      );
    case 'pickleball':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="8" y="3" width="8" height="11" rx="2" />
          <circle cx="18.5" cy="17" r="2" />
        </svg>
      );
    case 'squash':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="7.5" r="4.5" />
          <path d="M12 12 9 20M12 12l3 8" />
          <path d="M10 18.5h4" />
        </svg>
      );
    case 'tableTennis':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <ellipse cx="11" cy="7" rx="4.5" ry="5.5" />
          <path d="M12 12.5v8" />
          <circle cx="16.5" cy="16" r="1.5" />
        </svg>
      );
    case 'volleyball':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="8" />
          <path d="M6 8c2.5 2 2.5 6 0 8M18 8c-2.5 2-2.5 6 0 8M5 12h14" />
        </svg>
      );
    case 'basketball':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3v18M5.6 5.6C9 9 9 15 5.6 18.4M18.4 5.6C15 9 15 15 18.4 18.4" />
        </svg>
      );
    case 'football':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="m12 7.5 3.2 2.3-1.2 3.7h-4L8.8 9.8 12 7.5zM12 3v4.5M19.5 9.5 15.2 9.8M16.8 16.5 14 13.5M7.2 16.5 10 13.5M4.5 9.5l4.3.3" />
        </svg>
      );
    case 'floorball':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M8 21 13 6" />
          <path d="M18 4c2 .5 3 2 2 3.5" />
          <circle cx="9" cy="15" r="1.8" />
        </svg>
      );
    case 'golf':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M8 21h8M8 21V4l9 3.5L8 11" />
          <circle cx="8" cy="21" r="0.4" />
        </svg>
      );
    case 'discGolf':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <ellipse cx="9.5" cy="7" rx="6" ry="2.3" />
          <path d="M18 15.5v-4M18 15.5c-1.4 1.4-1.4 3.6 0 5M18 15.5c1.4 1.4 1.4 3.6 0 5M15.3 19.3h5.4" />
        </svg>
      );
  }
}

/** Apple logo glyph for App Store buttons / badges. Canonical clean vector —
   renders crisply at any size and on every platform (unlike the  U+F8FF
   glyph, which only shows on Apple devices). */
export function AppleGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  );
}

export function SunIcon() {
  return (
    <svg className="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.5M12 19v2.5M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2.5 12H5M19 12h2.5M4.2 19.8 6 18M18 6l1.8-1.8" />
    </svg>
  );
}

export function MoonIcon() {
  return (
    <svg className="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 14.5A8 8 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5z" />
    </svg>
  );
}

/** Checkmark used in feature lists. */
export function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="m5 12 5 5L20 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Apple-style accessibility figure in a ring. */
export function A11yIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9.5" />
      <circle cx="12" cy="7.3" r="1.35" fill="currentColor" stroke="none" />
      <path d="M6 9.7c1.9.8 3.9 1.2 6 1.2s4.1-.4 6-1.2" />
      <path d="M12 10.9v3.3M12 14.2l-2.1 3.9M12 14.2l2.1 3.9" />
    </svg>
  );
}

/** VoiceOver — figure with sound waves. */
export function VoiceOverIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="8.5" cy="12" r="3.2" />
      <path d="M14 8.5a5 5 0 0 1 0 7M16.7 6a8.5 8.5 0 0 1 0 12" />
    </svg>
  );
}

/** Dark interface — half-filled contrast circle. */
export function DarkInterfaceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Differentiate without colour — distinct shapes. */
export function DifferentiateIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 4.5l3.5 3.5M7.5 4.5 4 8" />
      <path d="M16.5 4l3 5.2h-6z" />
      <circle cx="5.75" cy="17" r="2.75" />
      <rect x="14" y="14.25" width="5.5" height="5.5" rx="1" />
    </svg>
  );
}
