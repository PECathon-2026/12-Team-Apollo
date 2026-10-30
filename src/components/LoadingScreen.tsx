import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, RefreshCw } from 'lucide-react';
import { TsukuyomiMoon } from './TsukuyomiMoon';

export interface LoadingScreenProps {
  onComplete?: () => void;
  minDurationMs?: number; // e.g. 2600ms
  subtitle?: string;
}

const ASTRONOMY_FACTS = [
  {
    title: 'Venusian Time Warp',
    japanese: '金星の逆転時間',
    fact: 'A day on Venus is longer than its entire year. It takes 243 Earth days to complete a single rotation on its axis, but only 225 Earth days to orbit the Sun.',
    category: 'Planetary Dynamics',
  },
  {
    title: 'The Relentless Neutron Spin',
    japanese: '中性子星の超高速自転',
    fact: 'Neutron stars can spin at over 600 rotations per second. They pack 1.5 times the mass of our entire Sun into a sphere merely 20 kilometers in diameter.',
    category: 'Stellar Remnants',
  },
  {
    title: '16 Sunrises in One Orbit',
    japanese: '軌道城郭の十六の夜明け',
    fact: 'The International Space Station races across the void at 27,600 km/h, orbiting the Earth once every 92 minutes. Astronauts aboard witness 16 sunrises and sunsets every 24 hours.',
    category: 'Orbital Citadel',
  },
  {
    title: 'Lunar Footprints of Eternity',
    japanese: '月面の永遠の足跡',
    fact: 'Footprints left on the Moon by Apollo astronauts will remain preserved for over 100 million years because there is no atmospheric wind or liquid water to erode them.',
    category: 'Lunar Ephemeris',
  },
  {
    title: 'Starlight from the Dawn of Man',
    japanese: 'アンドロメダの古代光',
    fact: 'Light from the Andromeda Galaxy currently striking your eyes traveled for 2.5 million years across the deep cosmos—it departed before modern humans walked the Earth.',
    category: 'Deep Space Sight',
  },
  {
    title: 'Cosmic Cold Welding',
    japanese: '真空冷間圧接の神秘',
    fact: 'If two clean pieces of the same metal touch in the absolute vacuum of space, they fuse permanently together into a single blade, with no heat required.',
    category: 'Space Physics',
  },
  {
    title: 'The Methane Seas of Titan',
    japanese: 'タイタンの液化メタンの海',
    fact: 'Saturn’s moon Titan holds deep seas and rivers of liquid methane and ethane, with clouds raining liquid natural gas onto shorelines of rock-hard frozen water-ice.',
    category: 'Celestial Moons',
  },
  {
    title: 'Solar Scale of the Gods',
    japanese: '太陽の偉大なる規模',
    fact: 'One million Earths could fit inside the Sun, yet our star is merely an ordinary yellow dwarf among 200 billion stars spiraling in the Milky Way.',
    category: 'Solar Realm',
  },
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  onComplete,
  minDurationMs = 2800,
  subtitle = 'Synchronizing celestial ephemeris...',
}) => {
  const [factIndex, setFactIndex] = useState(() =>
    Math.floor(Math.random() * ASTRONOMY_FACTS.length)
  );
  const [progress, setProgress] = useState(0);

  // Animate progress bar
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(Math.round((elapsed / minDurationMs) * 100), 100);
      setProgress(pct);

      if (elapsed >= minDurationMs) {
        clearInterval(interval);
        if (onComplete) {
          onComplete();
        }
      }
    }, 40);

    return () => clearInterval(interval);
  }, [minDurationMs, onComplete]);

  const currentFact = ASTRONOMY_FACTS[factIndex];

  const handleNextFact = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFactIndex((prev) => (prev + 1) % ASTRONOMY_FACTS.length);
  };

  return (
    <div className="celestial-loading-backdrop">
      <div className="celestial-loading-container">
        {/* Rotating Tsukuyomi Blood Moon */}
        <div className="loading-moon-wrapper">
          <TsukuyomiMoon size={220} rotationSpeed={50} showOrbs={true} glow={true} />
        </div>

        {/* Japanese Title Badge */}
        <div className="loading-title-group">
          <div className="loading-crest-row">
            <span className="hanko-seal">月読の眼 • TSUKUYOMI ALIGNMENT</span>
            <span className="gold-badge">
              <Sparkles size={12} />
              {currentFact.category}
            </span>
          </div>
          <h2 className="loading-status-title">{subtitle}</h2>
        </div>

        {/* Astronomy Fact Box */}
        <div className="astronomy-fact-card">
          <div className="fact-card-header">
            <div className="fact-header-left">
              <span className="fact-prefix">DID YOU KNOW? • 天文秘話</span>
              <h3 className="fact-title">
                {currentFact.title} <span className="fact-kanji">({currentFact.japanese})</span>
              </h3>
            </div>
            <button
              type="button"
              className="fact-refresh-btn"
              onClick={handleNextFact}
              title="Next Astronomy Fact"
            >
              <RefreshCw size={14} />
              <span>Next Fact</span>
            </button>
          </div>

          <p className="fact-text">"{currentFact.fact}"</p>

          {/* Animated Progress Bar */}
          <div className="loading-progress-container">
            <div className="loading-progress-bar" style={{ width: `${progress}%` }} />
          </div>
          <div className="loading-progress-label">
            <span>Calibrating Celestial Gateways</span>
            <span>{progress}%</span>
          </div>
        </div>

        {/* Skip / Proceed Button */}
        {onComplete && (
          <button
            type="button"
            className="btn-samurai-gold loading-enter-btn"
            onClick={onComplete}
          >
            <span>Enter Observatory • 参上</span>
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};
