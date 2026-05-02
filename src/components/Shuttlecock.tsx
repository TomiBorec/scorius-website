export function Shuttlecock({ size = 24 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.22,
        background: 'var(--fg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 305 305" fill="none">
        <path
          d="M35.7 192L16.7 211c-21.6 21.6-22.2 56 -1.4 78.4c.2.3.5.5.7.8c10.5 9.8 24.2 15.1 38.5 15.1c15.1 0 29.3-5.9 39.9-16.5l19.1-19.1l107.5-44c0 0 .1 0 .1-.1l57.3-23.4c18.4-7.5 24.4-19.7 26.2-28.6c2.9-14.2-3.3-30.5-16.5-43.7c-10.9-10.9-26.2-16.4-42.3-16.1c1.2-14.1-3.4-28.6-13.7-39.9c-.3-.3-.5-.6-.8-.8c-11.2-10.4-25.8-14.9-39.9-13.7c.3-16.1-5.2-31.4-16.1-42.3C164.3 6.1 151 0 138.7 0c-2.4 0-4.7.2-7 .7c-8.9 1.8-21.1 7.8-28.6 26.2L79.7 84.3c0 0 0 .1 0 .1L35.7 192z"
          fill="var(--bg)"
          transform="scale(0.85) translate(28 28)"
        />
      </svg>
    </div>
  );
}
