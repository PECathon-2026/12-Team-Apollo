import React from 'react';

/**
 * WatchtowerIllustration - Japanese Feudal Castle Watchtower (望楼 / 天守閣)
 * Red & Black Theme: Castle silhouetted against deep crimson night sky with orbital satellite (ISS) beacon.
 */
export const WatchtowerIllustration: React.FC<{ className?: string; style?: React.CSSProperties }> = ({
  className = '',
  style = {},
}) => {
  return (
    <div
      className={`jrpg-card-art watchtower-art ${className}`}
      style={{
        position: 'relative',
        width: '180px',
        height: '130px',
        flexShrink: 0,
        overflow: 'hidden',
        borderRadius: '8px',
        background: 'radial-gradient(ellipse at 50% 30%, #280a0d 0%, #050608 85%)',
        border: '1px solid rgba(220, 38, 38, 0.45)',
        ...style,
      }}
    >
      <svg
        viewBox="0 0 200 150"
        width="100%"
        height="100%"
        style={{ display: 'block', overflow: 'hidden' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="wtSkyGlow" cx="50%" cy="25%" r="60%">
            <stop offset="0%" stopColor="#dc2626" stopOpacity="0.5" />
            <stop offset="60%" stopColor="#7f1d1d" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#050608" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="roofGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e1315" />
            <stop offset="100%" stopColor="#0a0506" />
          </linearGradient>
          <linearGradient id="wallGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d4d4d8" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#e4e4e7" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#a1a1aa" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="redOrnament" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff4d4d" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>
          <linearGradient id="orbitArcGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7f1d1d" stopOpacity="0.1" />
            <stop offset="60%" stopColor="#ef4444" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ff4d4d" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Ambient Sky Glow */}
        <rect x="0" y="0" width="200" height="150" fill="url(#wtSkyGlow)" />

        {/* Distant Mountains / Citadel Ridge */}
        <path d="M 0 135 L 35 118 L 80 128 L 130 115 L 180 125 L 200 120 L 200 150 L 0 150 Z" fill="#0c0709" />

        {/* Stars */}
        <circle cx="25" cy="22" r="1" fill="#fff" opacity="0.7" />
        <circle cx="65" cy="15" r="1.2" fill="#ff4d4d" opacity="0.85" />
        <circle cx="150" cy="28" r="0.8" fill="#fff" opacity="0.6" />
        <circle cx="180" cy="18" r="1.1" fill="#fff" opacity="0.9" />
        <circle cx="110" cy="12" r="1" fill="#ef4444" opacity="0.8" />

        {/* Orbital Track Arc (ISS Pass) */}
        <path
          d="M 10 95 Q 85 20 185 30"
          fill="none"
          stroke="url(#orbitArcGrad)"
          strokeWidth="1.6"
          strokeDasharray="4 2"
        />

        {/* Satellite / Orbital Citadel beacon */}
        <g transform="translate(145, 27)">
          <line x1="-8" y1="0" x2="8" y2="0" stroke="#ef4444" strokeWidth="2.5" />
          <line x1="0" y1="-5" x2="0" y2="5" stroke="#ffffff" strokeWidth="1.5" />
          <circle cx="0" cy="0" r="2.5" fill="#ffffff" />
          <circle cx="0" cy="0" r="5.5" fill="none" stroke="#ef4444" strokeWidth="0.8" opacity="0.8" />
        </g>

        {/* Stone Citadel Foundation (Ishigaki - 石垣) */}
        <polygon points="62,148 72,112 128,112 138,148" fill="#180e10" stroke="#2a1418" strokeWidth="1" />
        <line x1="72" y1="124" x2="128" y2="124" stroke="#0e0608" strokeWidth="1" />
        <line x1="68" y1="136" x2="132" y2="136" stroke="#0e0608" strokeWidth="1" />

        {/* Level 1: Base Walls & Balcony */}
        <rect x="76" y="94" width="48" height="18" fill="url(#wallGrad)" />
        <path
          d="M 60 96 Q 100 90 140 96 L 135 91 Q 100 86 65 91 Z"
          fill="url(#roofGrad)"
          stroke="#451216"
          strokeWidth="0.8"
        />

        {/* Level 2: Middle Eaves & Pillars */}
        <rect x="82" y="76" width="36" height="16" fill="url(#wallGrad)" />
        {/* Watch windows (sliding shōji lattice with red glow) */}
        <rect x="88" y="79" width="10" height="10" fill="#0f0709" />
        <rect x="102" y="79" width="10" height="10" fill="#dc2626" opacity="0.9" />
        <line x1="107" y1="79" x2="107" y2="89" stroke="#7f1d1d" strokeWidth="0.8" />
        <line x1="102" y1="84" x2="112" y2="84" stroke="#7f1d1d" strokeWidth="0.8" />

        {/* Middle Eaves (Roof 2) */}
        <path
          d="M 68 77 C 80 73, 120 73, 132 77 L 128 72 C 118 69, 82 69, 72 72 Z"
          fill="url(#roofGrad)"
          stroke="#451216"
          strokeWidth="0.8"
        />

        {/* Top Level: Tenshu Observatory Lookout */}
        <rect x="88" y="60" width="24" height="13" fill="url(#wallGrad)" />
        <rect x="94" y="63" width="12" height="8" fill="#ef4444" opacity="0.95" />
        <circle cx="100" cy="67" r="2" fill="#fff" />

        {/* Top Curved Roof (Irimoya Eaves) */}
        <path
          d="M 76 61 C 90 55, 110 55, 124 61 L 119 55 C 108 50, 92 50, 81 55 Z"
          fill="url(#roofGrad)"
          stroke="#ef4444"
          strokeWidth="0.8"
        />

        {/* Spire */}
        <path d="M 98 48 L 100 42 L 102 48 Z" fill="url(#redOrnament)" />
        <circle cx="100" cy="42" r="1.5" fill="#ff4d4d" />

        {/* Floating Red Petals */}
        <path d="M 40 45 Q 45 40 48 44 Q 45 48 40 45 Z" fill="#ef4444" opacity="0.8" />
        <path d="M 165 80 Q 170 76 172 80 Q 169 84 165 80 Z" fill="#dc2626" opacity="0.7" />
      </svg>

      <div
        style={{
          position: 'absolute',
          top: '4px',
          right: '6px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.62rem',
          fontWeight: 800,
          color: '#ff4d4d',
          background: 'rgba(10, 4, 6, 0.88)',
          padding: '2px 6px',
          borderRadius: '3px',
          border: '1px solid rgba(220, 38, 38, 0.5)',
          letterSpacing: '0.06em',
        }}
      >
        ISS ORBIT
      </div>
    </div>
  );
};
