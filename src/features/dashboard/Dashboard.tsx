import React, { useMemo, useState, useEffect } from 'react';
import SunCalc from 'suncalc';
import {
  Satellite,
  Scroll,
  Eye,
  Sword,
  ArrowRight,
  Clock,
  Radio,
} from 'lucide-react';
import { NavSectionId } from '../../types';
import { DashboardBackground } from './components/DashboardBackground';
import { WatchtowerIllustration } from './components/WatchtowerIllustration';
import { CelestialScrollIllustration } from './components/CelestialScrollIllustration';
import { SpiritLensIllustration } from './components/SpiritLensIllustration';
import { DojoIllustration } from './components/DojoIllustration';

interface DashboardProps {
  onSelectOption: (option: Exclude<NavSectionId, 'dashboard'>) => void;
}

interface MinimalCardConfig {
  id: Exclude<NavSectionId, 'dashboard'>;
  gate: string;
  tag: string;
  title: string;
  oneLineDesc: string;
  statusBadge: string;
  launchText: string;
  statLabel: string;
  statValue: string;
  artwork: React.ReactNode;
  icon: React.ReactNode;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectOption }) => {
  const [currentTimeIST, setCurrentTimeIST] = useState<string>('');

  // Live IST Clock
  useEffect(() => {
    const updateTime = () => {
      setCurrentTimeIST(
        new Date().toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute live lunar telemetry via SunCalc
  const moonTelemetry = useMemo(() => {
    const now = new Date();
    const illumination = SunCalc.getMoonIllumination(now);
    const p = illumination.phase;

    let phaseName = 'New Moon';
    if (p >= 0.03 && p < 0.22) {
      phaseName = 'Waxing Crescent';
    } else if (p >= 0.22 && p < 0.28) {
      phaseName = 'First Quarter';
    } else if (p >= 0.28 && p < 0.47) {
      phaseName = 'Waxing Gibbous';
    } else if (p >= 0.47 && p < 0.53) {
      phaseName = 'Full Moon';
    } else if (p >= 0.53 && p < 0.72) {
      phaseName = 'Waning Gibbous';
    } else if (p >= 0.72 && p < 0.78) {
      phaseName = 'Third Quarter';
    } else if (p >= 0.78 && p < 0.97) {
      phaseName = 'Waning Crescent';
    }

    return {
      phaseName,
      illuminationPercent: Math.round(illumination.fraction * 100),
    };
  }, []);

  // 4 Cards: Curated, immersive, prominent mission gateways
  const cards: MinimalCardConfig[] = [
    {
      id: 'watchtower',
      gate: 'GATE 01',
      tag: 'ORBIT',
      title: 'Watchtower',
      oneLineDesc: 'Real-time ISS orbital tracking, feudal citadel visible passes, and dark sky seeing forecast.',
      statusBadge: '● LIVE 418 KM',
      launchText: 'LAUNCH WATCHTOWER',
      statLabel: 'Orbit Alt / Velocity',
      statValue: '~418 km • 27.6k km/h',
      artwork: <WatchtowerIllustration />,
      icon: <Satellite size={22} color="#ff4d4d" />,
    },
    {
      id: 'scroll',
      gate: 'GATE 02',
      tag: 'LUNAR',
      title: 'Celestial Scroll',
      oneLineDesc: 'SunCalc lunar ephemeris, real-time moon phase visualization, and celestial chronicle dispatches.',
      statusBadge: `● ${moonTelemetry.illuminationPercent}% MOON`,
      launchText: 'OPEN SCROLL',
      statLabel: 'Current Phase',
      statValue: `${moonTelemetry.illuminationPercent}% • ${moonTelemetry.phaseName}`,
      artwork: <CelestialScrollIllustration />,
      icon: <Scroll size={22} color="#ff4d4d" />,
    },
    {
      id: 'spirit-lens',
      gate: 'GATE 03',
      tag: 'VISION',
      title: 'Spirit Lens',
      oneLineDesc: 'AI celestial vision detecting deep-sky nebulae, open star clusters, and constellation lore.',
      statusBadge: '● AI CORE READY',
      launchText: 'ACTIVATE LENS',
      statLabel: 'Target Sector',
      statValue: 'Orion M42 • Mōri Clan',
      artwork: <SpiritLensIllustration />,
      icon: <Eye size={22} color="#ff4d4d" />,
    },
    {
      id: 'dojo',
      gate: 'GATE 04',
      tag: 'DOJO',
      title: 'Restoration Dojo',
      oneLineDesc: 'Astronomical image denoising and star sharpness enhancement with interactive split-pane slider.',
      statusBadge: '● +18.4 dB SNR',
      launchText: 'ENTER DOJO',
      statLabel: 'Restoration Gain',
      statValue: '+18.4 dB SNR • 94% Noise Clean',
      artwork: <DojoIllustration />,
      icon: <Sword size={22} color="#ff4d4d" />,
    },
  ];

  return (
    <div className="jrpg-dashboard-container">
      {/* 1. Atmospheric Background Layer with Rotating Rinne-Sharingan Moon */}
      <DashboardBackground />

      {/* 2. Top Header: Fully Opaque, Centered TSUKUYOMI WATCH with Gold Accents */}
      <header className="jrpg-top-hud">
        {/* Left Wing: Live IST Telemetry */}
        <div className="jrpg-hud-wing-left">
          <div className="jrpg-hud-clock">
            <Clock size={14} color="#ffd475" />
            <span>{currentTimeIST || '00:00:00'}</span>
            <span className="tz-tag">IST</span>
          </div>
        </div>

        {/* Center: Fully Centered, Opaque TSUKUYOMI WATCH Emblem */}
        <div className="jrpg-hud-center-title">
          <div className="jrpg-hud-crest">
            <span className="jrpg-crest-kanji">月</span>
          </div>
          <div className="jrpg-hud-title-col">
            <div className="jrpg-hud-title-row">
              <span className="jrpg-hud-game-title">TSUKUYOMI WATCH</span>
              <span className="jrpg-hud-hanko">HUB</span>
            </div>
            <span className="jrpg-hud-subtitle">Orbital Celestial Deck & Astrophotography</span>
          </div>
        </div>

        {/* Right Wing: Live Orbit Beacon */}
        <div className="jrpg-hud-wing-right">
          <div className="jrpg-hud-beacon">
            <Radio size={13} color="#ffd475" />
            <span>LINK OK</span>
          </div>
        </div>
      </header>

      {/* 3. The 4 Centered & Enlarged Mission Gateways Deck */}
      <main className="jrpg-cards-deck">
        {cards.map((card) => (
          <article
            key={card.id}
            className="jrpg-banner-card"
            onClick={() => onSelectOption(card.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectOption(card.id);
              }
            }}
            aria-label={`Enter section ${card.title}`}
          >
            {/* Corner Brackets in Imperial Gold */}
            <div className="card-corner-ornament corner-top-left" />
            <div className="card-corner-ornament corner-top-right" />
            <div className="card-corner-ornament corner-bottom-left" />
            <div className="card-corner-ornament corner-bottom-right" />
            <div className="card-inner-bevel" />

            {/* Left Content Column */}
            <div className="jrpg-card-main-col">
              {/* Header Badges Row */}
              <div className="jrpg-card-header-bar">
                <div className="jrpg-card-badge-cluster">
                  <span className="jrpg-rarity-badge">{card.gate}</span>
                  <span className="jrpg-hanko-box">{card.tag}</span>
                </div>
                <div className="jrpg-card-status-badge">{card.statusBadge}</div>
              </div>

              {/* Title Block */}
              <div className="jrpg-card-title-block">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {card.icon}
                  <h2 className="jrpg-card-japanese-title">
                    {card.title}
                  </h2>
                </div>
              </div>

              {/* Description */}
              <p className="jrpg-card-description">
                {card.oneLineDesc}
              </p>

              {/* Action & Stats Footer Bar */}
              <div className="jrpg-card-action-bar">
                <div className="jrpg-card-stats-preview">
                  <span className="stats-preview-label">{card.statLabel}</span>
                  <span className="stats-preview-value">{card.statValue}</span>
                </div>

                <button
                  type="button"
                  className="jrpg-deploy-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectOption(card.id);
                  }}
                >
                  <span>{card.launchText}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Right Themed Visual Artwork Area */}
            <div className="jrpg-card-artwork-col">
              <div className="artwork-gold-frame">
                {card.artwork}
              </div>
            </div>
          </article>
        ))}
      </main>

      {/* 4. Balanced Command Footer */}
      <footer className="jrpg-dashboard-footer">
        <div className="footer-system-info">
          TSUKUYOMI COMMAND v0.1.0 • CELESTIAL GUIDANCE ACTIVE
        </div>
      </footer>
    </div>
  );
};
