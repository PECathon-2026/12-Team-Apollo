import React from 'react';

/**
 * DashboardBackground - Pure Red & Black Theme with Rotating Rinne-Sharingan Blood Moon
 * Clouds removed per user request.
 */
export const DashboardBackground: React.FC = () => {
  return (
    <div className="jrpg-dashboard-bg-root" aria-hidden="true">
      {/* 1. Deep Space Ambient Nebula */}
      <div className="jrpg-space-ambient" />

      {/* 2. Rotating Rinne-Sharingan Blood Moon */}
      <div className="jrpg-moon-wrapper">
        <div className="jrpg-moon-aura" />
        <img
          src="/assets/rinnegan-moon.png"
          alt=""
          className="jrpg-rinnegan-moon-disc"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/assets/tsukuyomi-bg.jpg';
          }}
        />
        {/* Crisp SVG Tomoe Rings overlay */}
        <svg
          className="jrpg-moon-vector-overlay"
          viewBox="0 0 500 500"
          width="100%"
          height="100%"
        >
          <circle cx="250" cy="250" r="185" fill="none" stroke="rgba(220, 38, 38, 0.45)" strokeWidth="1.5" />
          <circle cx="250" cy="250" r="125" fill="none" stroke="rgba(220, 38, 38, 0.4)" strokeWidth="1.5" />
          <circle cx="250" cy="250" r="68" fill="none" stroke="rgba(220, 38, 38, 0.4)" strokeWidth="1.5" />
          <circle cx="250" cy="250" r="215" fill="none" stroke="rgba(255, 68, 68, 0.2)" strokeWidth="1" strokeDasharray="6 4" />
        </svg>
      </div>

      {/* 3. Star Dust Field */}
      <div className="jrpg-star-field" />
    </div>
  );
};
