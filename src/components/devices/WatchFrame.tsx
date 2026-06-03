import type { ReactNode } from 'react';

export function WatchFrame({
  children,
  scale = 1,
  dark = true,
}: {
  children: ReactNode;
  scale?: number;
  dark?: boolean;
}) {
  const W = 264;
  const H = 320;
  const screenW = 208;
  const screenH = 248;
  const radius = 58;
  const screenRadius = 44;

  return (
    <div
      style={{
        width: W * scale,
        height: H * scale,
        position: 'relative',
      }}
    >
      <div
        style={{
          width: W,
          height: H,
          position: 'absolute',
          top: 0,
          left: 0,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {/* Digital crown */}
        <div
          style={{
            position: 'absolute',
            right: -6,
            top: 96,
            width: 12,
            height: 38,
            borderRadius: 3,
            background: 'linear-gradient(90deg, #1a1a1a, #2e2e2e 40%, #0a0a0a)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 1px 2px rgba(0,0,0,0.4)',
          }}
        />
        {/* Side button */}
        <div
          style={{
            position: 'absolute',
            right: -4,
            top: 168,
            width: 8,
            height: 56,
            borderRadius: 2,
            background: 'linear-gradient(90deg, #1a1a1a, #2a2a2a 40%, #0a0a0a)',
          }}
        />
        {/* Body */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: radius,
            background: 'linear-gradient(160deg, #2a2a2c 0%, #1a1a1c 50%, #0a0a0a 100%)',
            boxShadow:
              '0 30px 60px -20px rgba(0,0,0,0.5), 0 8px 16px -8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
            // Center the screen on both axes — horizontal and vertical insets differ
            // because the body's aspect ratio isn't the same as the screen's.
            padding: `${(H - screenH) / 2}px ${(W - screenW) / 2}px`,
            boxSizing: 'border-box',
          }}
        >
          {/* Inner bezel */}
          <div
            style={{
              position: 'absolute',
              inset: 4,
              borderRadius: radius - 4,
              background: '#000',
            }}
          />
          {/* Screen */}
          <div
            style={{
              position: 'relative',
              width: screenW,
              height: screenH,
              borderRadius: screenRadius,
              background: dark ? '#000' : '#fff',
              overflow: 'hidden',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)',
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
