import React from 'react';

/**
 * SpiritLensIllustration - Mystical Sacred Mirror (霊鏡 / 八咫鏡)
 * Red & Black Theme: Crimson-runed mirror peering into deep black space with red AI targeting reticle.
 */
export const SpiritLensIllustration: React.FC<{ className?: string; style?: React.CSSProperties }> = ({
  className = '',
  style = {},
}) => {
  return (
    <div
      className={`jrpg-card-art spirit-lens-art ${className}`}
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
          <radialGradient id="nebulaGlow" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#dc2626" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#7f1d1d" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#050608" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="bronzeMirrorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff4d4d" />
            <stop offset="50%" stopColor="#b91c1c" />
            <stop offset="100%" stopColor="#450a0a" />
          </linearGradient>
          <radialGradient id="lensReflect" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#fca5a5" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#dc2626" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#180407" stopOpacity="0.95" />
          </radialGradient>
        </defs>

        {/* Ambient Nebula Cloud */}
        <rect x="0" y="0" width="200" height="150" fill="url(#nebulaGlow)" />

        {/* Star clusters in deep space */}
        <circle cx="28" cy="35" r="1.2" fill="#fca5a5" opacity="0.8" />
        <circle cx="170" cy="40" r="1.5" fill="#ef4444" opacity="0.9" />
        <circle cx="35" cy="115" r="1" fill="#fff" opacity="0.6" />
        <circle cx="165" cy="120" r="1.2" fill="#fff" opacity="0.7" />

        {/* The Sacred Mirror Disc (Yata no Kagami - 八咫鏡) */}
        <g transform="translate(100, 75)">
          <circle cx="0" cy="0" r="48" fill="#180508" stroke="url(#bronzeMirrorGrad)" strokeWidth="2.5" />
          <circle cx="0" cy="0" r="44" fill="none" stroke="#ef4444" strokeWidth="0.8" strokeDasharray="3 2" />

          {/* Runic notches */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const bx = Math.cos(rad) * 46;
            const by = Math.sin(rad) * 46;
            return <circle key={i} cx={bx} cy={by} r="1.8" fill="#ff4d4d" />;
          })}

          {/* Mirror Lens */}
          <circle cx="0" cy="0" r="40" fill="url(#lensReflect)" stroke="#991b1b" strokeWidth="1.2" />

          {/* Orion's 3 Stars (Mōri Clan Kamon - 三ツ星) */}
          <g transform="translate(0, 0)">
            <circle cx="-16" cy="4" r="2.8" fill="#ffffff" />
            <circle cx="0" cy="0" r="3.2" fill="#ffffff" />
            <circle cx="16" cy="-4" r="2.8" fill="#ffffff" />
            <line x1="-16" y1="4" x2="16" y2="-4" stroke="#ff4d4d" strokeWidth="0.8" strokeDasharray="2 1" />

            {/* AI Vision Reticle (Crimson) */}
            <rect
              x="-26"
              y="-14"
              width="52"
              height="28"
              fill="rgba(220, 38, 38, 0.12)"
              stroke="#ef4444"
              strokeWidth="0.9"
              strokeDasharray="4 3"
            />

            {/* Corner brackets */}
            <path d="M -26 -9 L -26 -14 L -21 -14" fill="none" stroke="#ff4d4d" strokeWidth="1.8" />
            <path d="M 21 -14 L 26 -14 L 26 -9" fill="none" stroke="#ff4d4d" strokeWidth="1.8" />
            <path d="M -26 9 L -26 14 L -21 14" fill="none" stroke="#ff4d4d" strokeWidth="1.8" />
            <path d="M 21 14 L 26 14 L 26 9" fill="none" stroke="#ff4d4d" strokeWidth="1.8" />

            {/* Reticle Crosshairs */}
            <line x1="0" y1="-20" x2="0" y2="-15" stroke="#ef4444" strokeWidth="1.2" />
            <line x1="0" y1="15" x2="0" y2="20" stroke="#ef4444" strokeWidth="1.2" />
            <line x1="-32" y1="0" x2="-27" y2="0" stroke="#ef4444" strokeWidth="1.2" />
            <line x1="27" y1="0" x2="32" y2="0" stroke="#ef4444" strokeWidth="1.2" />

            {/* AI match label */}
            <text x="0" y="-17" textAnchor="middle" fill="#ff4d4d" fontSize="5.5" fontFamily="monospace" fontWeight="bold">
              AI MATCH: 98.4%
            </text>
          </g>
        </g>
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
        AI SPIRIT EYE
      </div>
    </div>
  );
};
