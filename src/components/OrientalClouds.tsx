import React from 'react';

/**
 * OrientalClouds - Traditional Japanese Red & Gold Swirl Clouds (Kumo / 雲)
 * Looms slowly and occasionally across the moon and sky with gentle drifting animation.
 */
export const OrientalClouds: React.FC = () => {
  return (
    <div className="oriental-clouds-container" aria-hidden="true">
      {/* Cloud 1: Large billow gliding across the upper moon from the right */}
      <div className="oriental-cloud cloud-track-1">
        <svg viewBox="0 0 520 160" className="cloud-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cloudGradA" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#b91c1c" stopOpacity="0.82" />
              <stop offset="45%" stopColor="#dc2626" stopOpacity="0.78" />
              <stop offset="85%" stopColor="#881337" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#450a0a" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="goldStrokeA" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e5b959" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#ffd475" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.85" />
            </linearGradient>
            <filter id="cloudSoftGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="12" floodColor="#991b1b" floodOpacity="0.45" />
            </filter>
          </defs>
          <g filter="url(#cloudSoftGlow)">
            {/* Billowing cloud silhouette */}
            <path
              d="M 60 115 C 30 115 12 95 12 72 C 12 48 35 32 62 36 C 72 16 102 4 132 14 C 158 0 198 0 224 18 C 250 4 290 4 316 24 C 342 8 382 14 402 36 C 428 28 458 42 458 68 C 458 92 432 112 402 112 C 368 112 346 102 326 116 C 294 132 244 132 214 116 C 182 132 132 132 102 116 Z"
              fill="url(#cloudGradA)"
              stroke="url(#goldStrokeA)"
              strokeWidth="2.2"
            />
            {/* Traditional Japanese Swirls (Uzu) */}
            <path d="M 52 68 A 18 18 0 1 1 70 86 A 9 9 0 1 1 61 77" fill="none" stroke="#ffd475" strokeWidth="1.8" opacity="0.85" />
            <path d="M 215 36 A 22 22 0 1 1 237 58 A 11 11 0 1 1 226 47" fill="none" stroke="#ffd475" strokeWidth="1.8" opacity="0.85" />
            <path d="M 386 62 A 20 20 0 1 1 406 82 A 10 10 0 1 1 396 72" fill="none" stroke="#ffd475" strokeWidth="1.8" opacity="0.85" />
            {/* Horizontal flow line */}
            <path d="M 80 100 Q 160 90 240 100 T 400 100" fill="none" stroke="rgba(255, 212, 117, 0.4)" strokeWidth="1.5" />
          </g>
        </svg>
      </div>

      {/* Cloud 2: Flowing trailing cloud drifting from the left */}
      <div className="oriental-cloud cloud-track-2">
        <svg viewBox="0 0 440 130" className="cloud-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cloudGradB" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#991b1b" stopOpacity="0.78" />
              <stop offset="50%" stopColor="#dc2626" stopOpacity="0.82" />
              <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.88" />
            </linearGradient>
            <linearGradient id="goldStrokeB" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffd475" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#e5b959" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          <path
            d="M 25 65 C 25 45 45 30 70 34 C 85 18 115 12 140 24 C 165 10 200 12 222 28 C 248 14 288 20 304 40 C 330 32 360 48 360 68 C 360 88 340 104 314 98 C 288 108 248 104 228 92 C 196 106 154 104 130 90 C 98 100 52 94 38 80 C 28 76 25 70 25 65 Z"
            fill="url(#cloudGradB)"
            stroke="url(#goldStrokeB)"
            strokeWidth="2"
          />
          {/* Swirls */}
          <path d="M 64 58 A 14 14 0 1 1 78 72 A 7 7 0 1 1 71 65" fill="none" stroke="#ffd475" strokeWidth="1.6" opacity="0.8" />
          <path d="M 276 52 A 16 16 0 1 1 292 68 A 8 8 0 1 1 284 60" fill="none" stroke="#ffd475" strokeWidth="1.6" opacity="0.8" />
          <path d="M 45 74 C 95 66 165 68 235 72 C 285 75 325 68 350 72" fill="none" stroke="rgba(255, 212, 117, 0.35)" strokeWidth="1.4" />
        </svg>
      </div>

      {/* Cloud 3: Wide misty banner that occasionally crosses near the bottom of the moon */}
      <div className="oriental-cloud cloud-track-3">
        <svg viewBox="0 0 580 140" className="cloud-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cloudGradC" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7f1d1d" stopOpacity="0" />
              <stop offset="25%" stopColor="#b91c1c" stopOpacity="0.75" />
              <stop offset="70%" stopColor="#dc2626" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#881337" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M 50 75 Q 110 50 170 65 Q 240 35 310 55 Q 380 30 450 60 Q 510 45 560 75 Q 490 100 420 85 Q 350 110 270 90 Q 190 105 120 85 Z"
            fill="url(#cloudGradC)"
            stroke="rgba(255, 212, 117, 0.6)"
            strokeWidth="1.6"
          />
          <path d="M 160 68 A 12 12 0 1 1 172 80 A 6 6 0 1 1 166 74" fill="none" stroke="#ffd475" strokeWidth="1.4" opacity="0.7" />
          <path d="M 370 62 A 14 14 0 1 1 384 76 A 7 7 0 1 1 377 69" fill="none" stroke="#ffd475" strokeWidth="1.4" opacity="0.7" />
        </svg>
      </div>
    </div>
  );
};
