import React from 'react';

interface TsukuyomiMoonProps {
  size?: number;
  rotationSpeed?: number; // in seconds
  showOrbs?: boolean;
  glow?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * TsukuyomiMoon - The iconic Blood Moon Rinne-Sharingan
 * Features concentric orbital rings, 9 tomoe magatama, lunar surface texture,
 * and floating truth-seeking orbs (Gudōdama).
 */
export const TsukuyomiMoon: React.FC<TsukuyomiMoonProps> = ({
  size = 320,
  rotationSpeed = 90,
  showOrbs = true,
  glow = true,
  className = '',
  style = {},
}) => {
  // Tomoe comma path centered at (0, 0) curving upward
  const tomoePath =
    'M 0,-8 C 4.4,-8 8,-4.4 8,0 C 8,4.4 4.4,8 0,8 C -4.4,8 -8,4.4 -8,0 C -8,-2.8 -6,-5 -3.5,-6.5 C 1.5,-9.5 8,-16 13,-22 C 7,-17 2,-11.5 0,-8 Z';

  // Ring radii
  const r1 = 44; // Inner ring
  const r2 = 82; // Middle ring
  const r3 = 120; // Outer ring

  // Angles for the 9 tomoe (3 per ring, staggered)
  const innerAngles = [0, 120, 240];
  const middleAngles = [40, 160, 280];
  const outerAngles = [80, 200, 320];

  // Truth-seeking orbs positioned along the lower crescent
  const orbs = [
    { x: 130, y: 310, r: 12 },
    { x: 160, y: 340, r: 13 },
    { x: 200, y: 355, r: 15 },
    { x: 240, y: 340, r: 13 },
    { x: 270, y: 310, r: 12 },
    { x: 105, y: 260, r: 11 },
    { x: 295, y: 260, r: 11 },
  ];

  return (
    <div
      className={`tsukuyomi-moon-container ${className}`}
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        filter: glow ? 'drop-shadow(0 0 45px rgba(220, 38, 38, 0.65)) drop-shadow(0 0 15px rgba(255, 68, 68, 0.4))' : 'none',
        ...style,
      }}
    >
      <svg
        viewBox="0 0 400 400"
        width={size}
        height={size}
        style={{
          overflow: 'visible',
        }}
      >
        <defs>
          {/* Blood Moon Radial Gradient */}
          <radialGradient id="bloodMoonGradient" cx="46%" cy="42%" r="58%">
            <stop offset="0%" stopColor="#ff6363" />
            <stop offset="30%" stopColor="#e52b2b" />
            <stop offset="65%" stopColor="#b31212" />
            <stop offset="90%" stopColor="#750808" />
            <stop offset="100%" stopColor="#450303" />
          </radialGradient>

          {/* Lunar Mare Texture Pattern */}
          <radialGradient id="marePatch1" cx="35%" cy="35%" r="35%">
            <stop offset="0%" stopColor="#300000" stopOpacity="0.45" />
            <stop offset="70%" stopColor="#500000" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#750808" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="marePatch2" cx="65%" cy="60%" r="30%">
            <stop offset="0%" stopColor="#250000" stopOpacity="0.5" />
            <stop offset="60%" stopColor="#450303" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#750808" stopOpacity="0" />
          </radialGradient>

          {/* Truth-Seeking Orb 3D Sphere Gradient */}
          <radialGradient id="orbGradient" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#4a4a52" />
            <stop offset="25%" stopColor="#232328" />
            <stop offset="70%" stopColor="#0a0a0d" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>

          {/* Subtle Outer Atmosphere Rim Glow */}
          <filter id="moonAtmosphere" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ROTATING MOON DISC */}
        <g
          className="tsukuyomi-rotating-disc"
          style={{
            transformOrigin: '200px 200px',
            animation: `tsukuyomiSpin ${rotationSpeed}s linear infinite`,
          }}
        >
          {/* Main Moon Disc */}
          <circle
            cx="200"
            cy="200"
            r="146"
            fill="url(#bloodMoonGradient)"
            stroke="#1a0202"
            strokeWidth="3.5"
          />

          {/* Organic Lunar Surface Patches (Craters / Maria) */}
          <circle cx="165" cy="170" r="75" fill="url(#marePatch1)" />
          <circle cx="230" cy="225" r="65" fill="url(#marePatch2)" />
          <ellipse cx="210" cy="140" rx="40" ry="25" fill="#4a0404" opacity="0.25" />
          <ellipse cx="145" cy="240" rx="45" ry="30" fill="#4a0404" opacity="0.3" />

          {/* Outer Perimeter Rim Ring */}
          <circle cx="200" cy="200" r="144" fill="none" stroke="#0a0a0e" strokeWidth="3" opacity="0.85" />

          {/* Concentric Rings */}
          <circle cx="200" cy="200" r={r3} fill="none" stroke="#0a0a0e" strokeWidth="2.8" opacity="0.9" />
          <circle cx="200" cy="200" r={r2} fill="none" stroke="#0a0a0e" strokeWidth="2.8" opacity="0.9" />
          <circle cx="200" cy="200" r={r1} fill="none" stroke="#0a0a0e" strokeWidth="2.8" opacity="0.9" />

          {/* Central Pupil */}
          <circle cx="200" cy="200" r="16" fill="#07080b" />
          <circle cx="200" cy="200" r="6" fill="#141722" opacity="0.7" />

          {/* INNER RING TOMOE (3) */}
          {innerAngles.map((angle, idx) => (
            <g key={`inner-${idx}`} transform={`rotate(${angle} 200 200)`}>
              <g transform={`translate(${200 + r1}, 200) scale(0.92)`}>
                <path d={tomoePath} fill="#07080b" />
              </g>
            </g>
          ))}

          {/* MIDDLE RING TOMOE (3) */}
          {middleAngles.map((angle, idx) => (
            <g key={`middle-${idx}`} transform={`rotate(${angle} 200 200)`}>
              <g transform={`translate(${200 + r2}, 200) scale(1.05)`}>
                <path d={tomoePath} fill="#07080b" />
              </g>
            </g>
          ))}

          {/* OUTER RING TOMOE (3) */}
          {outerAngles.map((angle, idx) => (
            <g key={`outer-${idx}`} transform={`rotate(${angle} 200 200)`}>
              <g transform={`translate(${200 + r3}, 200) scale(1.18)`}>
                <path d={tomoePath} fill="#07080b" />
              </g>
            </g>
          ))}
        </g>

        {/* STATIC FLOATING TRUTH-SEEKING ORBS (GUDŌDAMA) */}
        {showOrbs &&
          orbs.map((orb, i) => (
            <g key={`orb-${i}`} className={`floating-orb orb-${i}`}>
              <circle
                cx={orb.x}
                cy={orb.y}
                r={orb.r}
                fill="url(#orbGradient)"
                stroke="rgba(220, 38, 38, 0.5)"
                strokeWidth="1.2"
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(220, 38, 38, 0.4))',
                }}
              />
              {/* Highlight gleam */}
              <circle
                cx={orb.x - orb.r * 0.3}
                cy={orb.y - orb.r * 0.3}
                r={orb.r * 0.28}
                fill="rgba(255, 255, 255, 0.25)"
              />
            </g>
          ))}
      </svg>
    </div>
  );
};
