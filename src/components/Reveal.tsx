'use client';

import { type CSSProperties, type ElementType, type ReactNode, useEffect, useRef, useState } from 'react';

type RevealProps = {
  as?: ElementType;
  /** Stagger in ms applied as transition-delay once revealed. */
  delay?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  [key: string]: unknown;
};

/**
 * Scroll-reveal wrapper: renders with `.reveal` and adds `.in` when it first
 * intersects the viewport. Respects prefers-reduced-motion via the CSS (which
 * forces `.reveal` visible). Re-expresses the prototype's IntersectionObserver.
 */
export function Reveal({ as: Tag = 'div', delay, className = '', style, children, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      setInView(true);
      return;
    }

    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      setInView(true);
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };

    // Position check used as a fallback for engines where the observer's
    // scroll updates are unreliable — notably iOS Safari when the root element
    // clips overflow, which otherwise leaves this content stuck at opacity:0.
    const inViewport = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      return r.top < vh * 0.92 && r.bottom > 0;
    };
    const onScroll = () => {
      if (inViewport()) reveal();
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting) reveal();
        }
      },
      { threshold: 0, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);

    if (inViewport()) {
      reveal();
    } else {
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
    }

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <Tag
      ref={ref}
      className={`${className} reveal${inView ? ' in' : ''}`.trim()}
      style={delay ? { transitionDelay: `${delay}ms`, ...style } : style}
      {...rest}
    >
      {children}
    </Tag>
  );
}
