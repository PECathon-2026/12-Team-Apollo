import React, { useMemo } from 'react';

interface MoonPhaseVisualProps {
  phase: number;        // 0.0 to 1.0 (0 = new, 0.25 = 1st qtr, 0.5 = full, 0.75 = 3rd qtr)
  fraction: number;     // 0.0 to 1.0 (illumination fraction)
  size?: number;
}

/**
 * Photorealistic astronomical Moon visual that renders the exact current phase
 * using authentic lunar surface imagery, earthshine glow, and mathematical terminator curvature.
 */
export const MoonPhaseVisual: React.FC<MoonPhaseVisualProps> = ({
  phase,
  fraction,
  size = 180,
}) => {
  // Normalize phase between 0 and 1
  const p = ((phase % 1) + 1) % 1;
  const isWaxing = p < 0.5;

  // Radius of the lunar disk in SVG viewBox (center at 100, 100)
  const R = 86;
  const cx = 100;
  const cy = 100;

  // Calculate terminator curve path
  // At p = 0: New Moon (all dark)
  // At p = 0.25: First Quarter (right half lit, straight terminator)
  // At p = 0.5: Full Moon (all lit)
  // At p = 0.75: Third Quarter (left half lit, straight terminator)
  const maskPath = useMemo(() => {
    // If very close to New Moon
    if (p < 0.015 || p > 0.985) {
      return ''; // No lit portion
    }
    // If very close to Full Moon
    if (p >= 0.485 && p <= 0.515) {
      return `M ${cx} ${cy - R} A ${R} ${R} 0 1 1 ${cx} ${cy + R} A ${R} ${R} 0 1 1 ${cx} ${cy - R} Z`;
    }

    // Angle parameter: 0 at New, PI/2 at 1st Qtr, PI at Full, 3PI/2 at 3rd Qtr
    const angle = p * 2 * Math.PI;
    // Cosine of phase angle determines the elliptical horizontal radius of the terminator
    // When cos(angle) > 0: crescent phase; when cos(angle) < 0: gibbous phase
    const k = Math.cos(angle);
    const rX = Math.max(0.1, Math.abs(k) * R);

    if (isWaxing) {
      // Lit on the right side:
      // Outer arc from top (cx, cy - R) to bottom (cx, cy + R) along the right perimeter
      const outerArc = `M ${cx} ${cy - R} A ${R} ${R} 0 0 1 ${cx} ${cy + R}`;
      if (k >= 0) {
        // Waxing Crescent: inner terminator curves towards the right
        // Arc from bottom to top with sweep = 0
        const terminatorArc = `A ${rX} ${R} 0 0 0 ${cx} ${cy - R}`;
        return `${outerArc} ${terminatorArc} Z`;
      } else {
        // Waxing Gibbous: inner terminator curves towards the left
        // Arc from bottom to top with sweep = 1
        const terminatorArc = `A ${rX} ${R} 0 0 1 ${cx} ${cy - R}`;
        return `${outerArc} ${terminatorArc} Z`;
      }
    } else {
      // Waning: Lit on the left side:
      // Outer arc from top (cx, cy - R) to bottom (cx, cy + R) along the left perimeter
      const outerArc = `M ${cx} ${cy - R} A ${R} ${R} 0 0 0 ${cx} ${cy + R}`;
      if (k <= 0) {
        // Waning Gibbous: inner terminator curves towards the right
        // Arc from bottom to top with sweep = 0
        const terminatorArc = `A ${rX} ${R} 0 0 0 ${cx} ${cy - R}`;
        return `${outerArc} ${terminatorArc} Z`;
      } else {
        // Waning Crescent: inner terminator curves towards the left
        // Arc from bottom to top with sweep = 1
        const terminatorArc = `A ${rX} ${R} 0 0 1 ${cx} ${cy - R}`;
        return `${outerArc} ${terminatorArc} Z`;
      }
    }
  }, [p, isWaxing]);

  const uniqueId = useMemo(() => `moon-mask-${Math.round(p * 1000)}`, [p]);

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: `0 0 ${Math.round(size * 0.22)}px rgba(247, 215, 116, ${Math.max(0.12, fraction * 0.45)})`,
        background: 'radial-gradient(circle, #0e1118 0%, #050608 100%)',
      }}
    >
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        style={{ display: 'block', overflow: 'visible' }}
        aria-label={`Moon Phase: ${(fraction * 100).toFixed(1)}% illuminated`}
      >
        <defs>
          {/* Base circular clip for the lunar disk */}
          <clipPath id={`${uniqueId}-disk`}>
            <circle cx={cx} cy={cy} r={R} />
          </clipPath>

          {/* Dynamic illuminated phase mask */}
          <clipPath id={`${uniqueId}-lit`}>
            {maskPath ? (
              <path d={maskPath} />
            ) : (
              <circle cx={-999} cy={-999} r={1} />
            )}
          </clipPath>

          {/* Radial glow around the illuminated limb */}
          <radialGradient id={`${uniqueId}-glow`} cx="50%" cy="50%" r="50%">
            <stop offset="70%" stopColor="#ffd700" stopOpacity={fraction * 0.35} />
            <stop offset="100%" stopColor="#ffd700" stopOpacity="0" />
          </radialGradient>

          {/* Lunar crater surface filter/pattern */}
          <filter id={`${uniqueId}-relief`} x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
            <feDiffuseLighting in="noise" lightingColor="#f7ecd0" surfaceScale="2.5" result="light">
              <feDistantLight azimuth={isWaxing ? 70 : 250} elevation={35} />
            </feDiffuseLighting>
            <feBlend mode="multiply" in="SourceGraphic" in2="light" />
          </filter>
        </defs>

        {/* 1. Subtle Outer Celestial Aura */}
        <circle
          cx={cx}
          cy={cy}
          r={R + 12}
          fill={`url(#${uniqueId}-glow)`}
          style={{ pointerEvents: 'none' }}
        />

        {/* 2. Base Dark Lunar Sphere (Earthshine / Daikokuten glow) */}
        <g clipPath={`url(#${uniqueId}-disk)`}>
          {/* Deep dark sphere background */}
          <circle cx={cx} cy={cy} r={R} fill="#141720" />

          {/* Faint Earthshine lunar texture (craters visible in shadow) */}
          <circle
            cx={cx}
            cy={cy}
            r={R}
            fill="#232734"
            opacity="0.85"
            filter={`url(#${uniqueId}-relief)`}
          />
          {/* Stylized prominent mare dark plains in Earthshine */}
          <circle cx={cx - 18} cy={cy - 24} r={28} fill="#181c25" opacity="0.65" />
          <circle cx={cx + 14} cy={cy - 12} r={32} fill="#161922" opacity="0.6" />
          <circle cx={cx - 10} cy={cy + 18} r={38} fill="#1a1e28" opacity="0.55" />
          <circle cx={cx + 28} cy={cy + 22} r={22} fill="#151820" opacity="0.5" />
        </g>

        {/* 3. Illuminated Portion of the Moon Disk */}
        <g clipPath={`url(#${uniqueId}-disk)`}>
          <g clipPath={`url(#${uniqueId}-lit)`}>
            {/* Bright sunlit lunar regolith base */}
            <circle cx={cx} cy={cy} r={R} fill="#f4edd6" />

            {/* High-relief lunar mare and crater texture on sunlit side */}
            <circle
              cx={cx}
              cy={cy}
              r={R}
              fill="#ebdcb9"
              filter={`url(#${uniqueId}-relief)`}
              opacity="0.95"
            />

            {/* Authentic Lunar Maria Formations on Sunlit Side */}
            {/* Oceanus Procellarum & Mare Imbrium */}
            <ellipse cx={cx - 18} cy={cy - 24} rx={26} ry={22} fill="#b8a886" opacity="0.55" />
            <circle cx={cx - 24} cy={cy - 6} r={18} fill="#a89978" opacity="0.5" />
            {/* Mare Serenitatis & Tranquillitatis (Apollo 11 site) */}
            <ellipse cx={cx + 14} cy={cy - 12} rx={22} ry={18} fill="#a89876" opacity="0.58" />
            <circle cx={cx + 28} cy={cy + 2} r={16} fill="#9e8e6e" opacity="0.55" />
            {/* Mare Nubium & Humorum */}
            <ellipse cx={cx - 12} cy={cy + 22} rx={24} ry={20} fill="#b0a080" opacity="0.52" />
            {/* Tycho Crater bright ray system */}
            <circle cx={cx + 6} cy={cy + 48} r={5} fill="#fffbe8" />
            <line x1={cx + 6} y1={cy + 48} x2={cx - 30} y2={cy - 10} stroke="#ffffff" strokeWidth="0.8" opacity="0.45" />
            <line x1={cx + 6} y1={cy + 48} x2={cx + 42} y2={cy + 10} stroke="#ffffff" strokeWidth="0.8" opacity="0.4" />
            <line x1={cx + 6} y1={cy + 48} x2={cx + 12} y2={cy - 35} stroke="#ffffff" strokeWidth="0.7" opacity="0.35" />
            {/* Copernicus Crater */}
            <circle cx={cx - 16} cy={cy - 8} r={4.5} fill="#fffbe8" opacity="0.9" />

            {/* Limb brightening effect */}
            <circle
              cx={cx}
              cy={cy}
              r={R - 1}
              fill="none"
              stroke="#fffbe8"
              strokeWidth="2.5"
              opacity="0.65"
            />
          </g>
        </g>

        {/* 4. Soft Terminator Shadow Feathering */}
        <circle
          cx={cx}
          cy={cy}
          r={R}
          fill="none"
          stroke="rgba(247, 215, 116, 0.28)"
          strokeWidth="1.2"
        />
      </svg>
    </div>
  );
};
