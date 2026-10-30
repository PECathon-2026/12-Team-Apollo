import React from 'react';

/**
 * CelestialScrollIllustration - Unfurled Japanese Makimono Scroll (天巻)
 * Red & Black Theme: Dark lacquer and obsidian parchment with glowing red/silver moon phases.
 */
export const CelestialScrollIllustration: React.FC<{ className?: string; style?: React.CSSProperties }> = ({
  className = '',
  style = {},
}) => {
  return (
    <div
      className={`jrpg-card-art scroll-art ${className}`}
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
          <radialGradient id="scrollGlow" cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#dc2626" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#7f1d1d" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#050608" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="parchmentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2a1013" />
            <stop offset="25%" stopColor="#3d161a" />
            <stop offset="70%" stopColor="#2a1013" />
            <stop offset="100%" stopColor="#18080a" />
          </linearGradient>
          <linearGradient id="rollerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#450a0a" />
            <stop offset="50%" stopColor="#1c0505" />
            <stop offset="100%" stopColor="#0a0202" />
          </linearGradient>
          <linearGradient id="moonBlood" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#f87171" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
        </defs>

        {/* Ambient Crimson Glow */}
        <rect x="0" y="0" width="200" height="150" fill="url(#scrollGlow)" />

        {/* Background Constellation Lines */}
        <line x1="20" y1="25" x2="65" y2="40" stroke="rgba(239, 68, 68, 0.35)" strokeWidth="0.8" />
        <line x1="65" y1="40" x2="110" y2="20" stroke="rgba(239, 68, 68, 0.35)" strokeWidth="0.8" />
        <line x1="110" y1="20" x2="160" y2="35" stroke="rgba(239, 68, 68, 0.35)" strokeWidth="0.8" />
        <circle cx="20" cy="25" r="1.5" fill="#f87171" opacity="0.7" />
        <circle cx="65" cy="40" r="1.8" fill="#ef4444" opacity="0.9" />
        <circle cx="110" cy="20" r="1.5" fill="#f87171" opacity="0.8" />
        <circle cx="160" cy="35" r="2" fill="#ff4d4d" opacity="0.95" />

        {/* Scroll Paper Body */}
        <path
          d="M 25 40 Q 100 36 175 40 L 175 112 Q 100 116 25 112 Z"
          fill="url(#parchmentGrad)"
          stroke="#991b1b"
          strokeWidth="1.2"
        />

        {/* Inner Border */}
        <path
          d="M 33 46 Q 100 43 167 46 L 167 106 Q 100 109 33 106 Z"
          fill="#100507"
          stroke="#dc2626"
          strokeWidth="0.8"
        />

        {/* Left Scroll Roller */}
        <rect x="20" y="32" width="7" height="88" rx="2.5" fill="url(#rollerGrad)" stroke="#ef4444" strokeWidth="0.8" />
        <circle cx="23.5" cy="32" r="3" fill="#ef4444" />
        <circle cx="23.5" cy="120" r="3" fill="#ef4444" />

        {/* Right Scroll Roller */}
        <rect x="173" y="32" width="7" height="88" rx="2.5" fill="url(#rollerGrad)" stroke="#ef4444" strokeWidth="0.8" />
        <circle cx="176.5" cy="32" r="3" fill="#ef4444" />
        <circle cx="176.5" cy="120" r="3" fill="#ef4444" />

        {/* Moon Phase Progression */}
        <path
          d="M 48 68 A 9 9 0 0 0 57 81 A 11 11 0 0 1 48 68 Z"
          fill="url(#moonBlood)"
          opacity="0.9"
        />

        <path
          d="M 80 65 A 11 11 0 0 0 80 87 Z"
          fill="url(#moonBlood)"
          opacity="0.95"
        />

        {/* Blood Moon */}
        <circle cx="112" cy="76" r="13" fill="url(#moonBlood)" />
        <circle cx="112" cy="76" r="16" fill="none" stroke="#ef4444" strokeWidth="0.8" opacity="0.7" strokeDasharray="2 2" />

        <path
          d="M 148 68 A 9 9 0 0 1 139 81 A 11 11 0 0 0 148 68 Z"
          fill="url(#moonBlood)"
          opacity="0.9"
        />

        {/* Vermilion Hanko Seal */}
        <rect x="150" y="88" width="13" height="13" rx="1.5" fill="#dc2626" stroke="#ef4444" strokeWidth="0.8" />
        <path d="M 153 92 L 160 92 M 156 90 L 156 98 M 153 96 L 160 96" stroke="#ffffff" strokeWidth="1" />

        <text
          x="112"
          y="102"
          textAnchor="middle"
          fill="#ff4d4d"
          fontSize="7"
          fontFamily="serif"
          fontWeight="bold"
          letterSpacing="2"
        >
          太陰暦 • SUNCALC
        </text>
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
        LUNAR EPHEMERIS
      </div>
    </div>
  );
};
