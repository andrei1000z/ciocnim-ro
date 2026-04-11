import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

// Generates Apple touch icon: red Easter egg on transparent-ish rounded bg.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #1a0505 0%, #0c0a0a 100%)',
        }}
      >
        <svg width="140" height="140" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="r" cx="38%" cy="28%" r="85%">
              <stop offset="0%" stopColor="#fecaca" />
              <stop offset="18%" stopColor="#f87171" />
              <stop offset="45%" stopColor="#dc2626" />
              <stop offset="85%" stopColor="#991b1b" />
              <stop offset="100%" stopColor="#450a0a" />
            </radialGradient>
          </defs>
          <path
            d="M32 3 C18 3 10 22 10 37 C10 52 19 61 32 61 C45 61 54 52 54 37 C54 22 46 3 32 3 Z"
            fill="url(#r)"
          />
          <ellipse cx="24" cy="22" rx="5.5" ry="10" fill="#ffffff" opacity="0.38" />
          <ellipse cx="27" cy="14" rx="2" ry="3" fill="#ffffff" opacity="0.6" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
