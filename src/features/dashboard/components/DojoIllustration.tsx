import React from 'react';

/**
 * DojoIllustration - Forged Samurai Katana (日本刀 / 鍛錬道場)
 * Red & Black Theme: Gleaming katana with glowing crimson Hamon temper line slicing noise into pure starlight.
 */
export const DojoIllustration: React.FC<{ className?: string; style?: React.CSSProperties }> = ({
  className = '',
  style = {},
}) => {
  return (
    <div
      className={`jrpg-card-art dojo-art ${className}`}
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
          <radialGradient id="dojoGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#dc2626" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#7f1d1d" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#050608" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="bladeSteel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#e4e4e7" />
            <stop offset="70%" stopColor="#71717a" />
            <stop offset="100%" stopColor="#27272a" />
          </linearGradient>
          <linearGradient id="tsukaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#18181b" />
            <stop offset="50%" stopColor="#27272a" />
            <stop offset="100%" stopColor="#09090b" />
          </linearGradient>
          <linearGradient id="redTsuba" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff4d4d" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </linearGradient>
        </defs>

        {/* Ambient Glow */}
        <rect x="0" y="0" width="200" height="150" fill="url(#dojoGlow)" />

        {/* Diagonal Split */}
        <path d="M 0 0 L 115 0 L 85 150 L 0 150 Z" fill="rgba(16, 8, 10, 0.8)" />
        {/* Grainy Noise Dots */}
        {[
          [20, 20], [35, 45], [15, 60], [45, 80], [30, 110], [55, 30],
          [65, 75], [75, 120], [25, 135], [50, 140], [80, 25], [60, 100],
        ].map(([nx, ny], i) => (
          <circle key={i} cx={nx} cy={ny} r="1.2" fill="#71717a" opacity="0.65" />
        ))}

        {/* Restored Stars */}
        <circle cx="130" cy="25" r="2.2" fill="#ff4d4d" />
        <circle cx="165" cy="45" r="2.5" fill="#ffffff" />
        <circle cx="145" cy="110" r="2" fill="#ef4444" />
        <circle cx="180" cy="95" r="1.8" fill="#ff6b6b" />
        <line x1="160" y1="45" x2="170" y2="45" stroke="#ffffff" strokeWidth="0.8" opacity="0.8" />
        <line x1="165" y1="40" x2="165" y2="50" stroke="#ffffff" strokeWidth="0.8" opacity="0.8" />

        {/* Katana Sword */}
        <g transform="translate(18, 128) rotate(-34)">
          <rect x="-12" y="-3.5" width="4" height="7" rx="1" fill="url(#redTsuba)" />

          {/* Tsuka handle */}
          <rect x="-8" y="-3" width="38" height="6" rx="1.5" fill="url(#tsukaGrad)" stroke="#3f3f46" strokeWidth="0.6" />
          {[0, 6, 12, 18, 24].map((tx, idx) => (
            <polygon key={idx} points={`${tx},-3 ${tx + 3},0 ${tx},3 ${tx - 3},0`} fill="url(#redTsuba)" opacity="0.8" />
          ))}

          {/* Tsuba Sword Guard */}
          <rect x="30" y="-8" width="5" height="16" rx="2" fill="url(#redTsuba)" stroke="#991b1b" strokeWidth="0.8" />

          {/* Habaki */}
          <rect x="35" y="-3.2" width="6" height="6.4" fill="url(#redTsuba)" />

          {/* Katana Blade */}
          <path
            d="M 41 -3 L 180 -3 Q 192 -2 195 0 Q 192 1 180 3 L 41 3 Z"
            fill="url(#bladeSteel)"
            stroke="#e4e4e7"
            strokeWidth="0.6"
          />

          {/* Hamon Temper Line (Crimson Glow) */}
          <path
            d="M 41 1 Q 55 -0.5 70 1.5 T 100 1 T 130 1.5 T 160 0.8 L 195 0"
            fill="none"
            stroke="#ff4d4d"
            strokeWidth="1.2"
            filter="drop-shadow(0 0 3px #dc2626)"
          />

          {/* Spine Highlight */}
          <line x1="41" y1="-2.6" x2="180" y2="-2.6" stroke="#ffffff" strokeWidth="0.6" opacity="0.8" />
        </g>

        {/* Slash Energy Cleave Beam (Blood Red) */}
        <line
          x1="30"
          y1="140"
          x2="190"
          y2="20"
          stroke="#ff4d4d"
          strokeWidth="1.4"
          strokeDasharray="6 4"
          opacity="0.9"
        />

        {/* Flying Sakura Petals */}
        <path d="M 120 70 Q 125 65 128 68 Q 125 72 120 70 Z" fill="#ef4444" opacity="0.8" />
        <path d="M 145 92 Q 148 88 150 91 Q 148 95 145 92 Z" fill="#dc2626" opacity="0.7" />
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
        KATANA DENOISE
      </div>
    </div>
  );
};
