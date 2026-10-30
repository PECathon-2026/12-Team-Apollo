import React, { useMemo, useState, useEffect } from 'react';
import SunCalc from 'suncalc';
import {
  Satellite,
  Scroll,
  Moon,
  Eye,
  Scan,
  Sword,
  ArrowRight,
  Crosshair,
  Zap,
  Clock,
  Radio,
} from 'lucide-react';
import { NavSectionId } from '../../types';

interface DashboardProps {
  onSelectOption: (option: Exclude<NavSectionId, 'dashboard'>) => void;
}

interface OptionCardConfig {
  id: Exclude<NavSectionId, 'dashboard'>;
  indexLabel: string;
  kanjiSeal: string;
  romaji: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  accentColor: string;
  glowColor: string;
  badges: string[];
  launchText: string;
  statsPreview: {
    label: string;
    value: string;
  };
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

  // Compute real-time live lunar telemetry using SunCalc
  const moonTelemetry = useMemo(() => {
    const now = new Date();
    const illumination = SunCalc.getMoonIllumination(now);
    const p = illumination.phase;

    let phaseName = 'New Moon';
    let phaseJapanese = '新月 (Shingetsu)';
    if (p >= 0.03 && p < 0.22) {
      phaseName = 'Waxing Crescent';
      phaseJapanese = '三日月 (Mikazuki)';
    } else if (p >= 0.22 && p < 0.28) {
      phaseName = 'First Quarter';
      phaseJapanese = '上弦の月 (Jōgen)';
    } else if (p >= 0.28 && p < 0.47) {
      phaseName = 'Waxing Gibbous';
      phaseJapanese = '十三夜 (Jūsanya)';
    } else if (p >= 0.47 && p < 0.53) {
      phaseName = 'Full Moon';
      phaseJapanese = '望月 (Mochizuki)';
    } else if (p >= 0.53 && p < 0.72) {
      phaseName = 'Waning Gibbous';
      phaseJapanese = '十六夜 (Izayoi)';
    } else if (p >= 0.72 && p < 0.78) {
      phaseName = 'Third Quarter';
      phaseJapanese = '下弦の月 (Kagen)';
    } else if (p >= 0.78 && p < 0.97) {
      phaseName = 'Waning Crescent';
      phaseJapanese = '有明の月 (Ariake)';
    }

    return {
      phaseName,
      phaseJapanese,
      illuminationPercent: Math.round(illumination.fraction * 100),
    };
  }, []);

  const options: OptionCardConfig[] = [
    {
      id: 'watchtower',
      indexLabel: '選抜一 • OPTION 01',
      kanjiSeal: '望楼',
      romaji: 'Bōrō',
      title: 'Watchtower',
      subtitle: 'ISS Tracking & Feudal Citadel Passes',
      description:
        'Track the International Space Station in real time on a dark orbital canvas, predict overflight passes across ancient samurai watchposts, and locate dark-sky spots scored by Samurai Honor ranking.',
      icon: <Satellite size={28} color="var(--vermilion-bright)" />,
      accentColor: 'var(--vermilion)',
      glowColor: 'var(--vermilion-glow)',
      badges: ['Orbital Citadel Telemetry', 'Castle Pass Predictions', 'Honor Score Calculator', 'Dark Sky Radar'],
      launchText: 'Launch Watchtower • 望楼を起動',
      statsPreview: {
        label: 'Orbit Alt / Velocity',
        value: '~418 km • 27.6k km/h',
      },
    },
    {
      id: 'scroll',
      indexLabel: '選抜二 • OPTION 02',
      kanjiSeal: '天巻',
      romaji: 'Tenkan',
      title: 'Celestial Scroll',
      subtitle: 'SunCalc Ephemeris & Samurai Chronicles',
      description:
        'Unroll the sacred lunar ephemeris powered by astronomical mathematical algorithms. Discover exact moon phases, rise and set times, and legendary samurai tactics calibrated to the night illumination.',
      icon: <Scroll size={28} color="var(--gold-moon-bright)" />,
      accentColor: 'var(--gold-moon)',
      glowColor: 'var(--gold-glow)',
      badges: ['SunCalc Illumination', 'Historical Battle Lore', 'Planetary Alignments', 'Auspicious Eclipses'],
      launchText: 'Unroll Scroll • 天巻を開く',
      statsPreview: {
        label: 'Current Moon Phase',
        value: `${moonTelemetry.illuminationPercent}% • ${moonTelemetry.phaseName}`,
      },
    },
    {
      id: 'spirit-lens',
      indexLabel: '選抜三 • OPTION 03',
      kanjiSeal: '霊鏡',
      romaji: 'Reikyō',
      title: 'Spirit Lens',
      subtitle: 'Deep-Sky AI Vision & Clan Constellations',
      description:
        'Peer through the mystical mirror of computer vision. Automatically identify nebulae, star clusters, and galaxies within raw sky photography, deciphering the ancestral Kamon crests of samurai clans.',
      icon: <Eye size={28} color="#5ad896" />,
      accentColor: '#4e9b72',
      glowColor: 'rgba(78, 155, 114, 0.35)',
      badges: ['AI Bounding Box Vision', 'Samurai Clan Constellations', 'Mōri Mitsuboshi Lore', 'Confidence Tuning'],
      launchText: 'Awaken Spirit Lens • 霊鏡を覗く',
      statsPreview: {
        label: 'Target Constellations',
        value: 'Orion M42 • Mōri Clan',
      },
    },
    {
      id: 'dojo',
      indexLabel: '選抜四 • OPTION 04',
      kanjiSeal: '道場',
      romaji: 'Dōjō',
      title: 'Restoration Dojo',
      subtitle: 'Astrophoto Denoising & Katana Precision',
      description:
        'Hone grainy astrophotography with sword-grade clarity. Apply Sumi-e ink noise reduction, star profile sharpening, and star de-haloing, inspected with an interactive before-and-after Katana blade slider.',
      icon: <Sword size={28} color="var(--katana-steel)" />,
      accentColor: 'var(--katana-steel)',
      glowColor: 'rgba(154, 169, 191, 0.35)',
      badges: ['Interactive Katana Slider', '+18.4 dB SNR Gain', '1,420 Stars Recovered', 'Tamahagane Presets'],
      launchText: 'Enter Dojo • 道場に入門',
      statsPreview: {
        label: 'Restoration Alchemy',
        value: '94% Noise Reduction',
      },
    },
  ];

  return (
    <div className="dashboard-root">
      {/* Standalone Dashboard Brand Header */}
      <header className="standalone-dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: 'var(--ink-850)',
              border: '2px solid var(--gold-moon)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px var(--gold-glow)',
            }}
          >
            <Moon size={22} color="var(--gold-moon-bright)" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  letterSpacing: '0.06em',
                  color: 'var(--washi-white)',
                }}
              >
                TSUKUYOMI WATCH
              </span>
              <span className="hanko-seal" style={{ fontSize: '0.65rem' }}>
                月読の監視
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--washi-muted)' }}>
              Samurai Celestial Guide & Astrophotography Suite
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* IST Clock */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.82rem',
              color: 'var(--washi-silk)',
              background: 'rgba(13, 15, 21, 0.7)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-ink)',
            }}
          >
            <Clock size={14} color="var(--gold-moon)" />
            <span>{currentTimeIST || '00:00:00'}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--washi-muted)' }}>IST</span>
          </div>

          {/* Beacon indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(13, 15, 21, 0.7)',
              border: '1px solid rgba(78, 155, 114, 0.3)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: '#5ad896',
            }}
          >
            <Radio size={13} color="#5ad896" />
            <span>ORBIT LINK OK</span>
          </div>
        </div>
      </header>

      {/* 1. Hero Command Header */}
      <section className="dashboard-hero">
        <div className="dashboard-hero-watermark">月読</div>

        <div className="dashboard-hero-content">
          <div className="dashboard-hero-badge-row">
            <span className="hanko-seal">本陣 • COMMAND HUB</span>
            <span className="gold-badge">
              <Zap size={13} />
              四大選抜 • Four Celestial Gates Active
            </span>
          </div>

          <h1 className="dashboard-hero-title">
            <span>Tsukuyomi Command Deck</span>
            <span className="title-kanji">月読の監視</span>
          </h1>

          <p className="dashboard-hero-subtitle">
            Welcome to the central observatory of Tsukuyomi Watch. Choose from the four specialized samurai
            celestial modules below to begin your mission—tracking orbital citadels, calculating lunar ephemeris,
            identifying clan constellations, or honing raw astrophotographs.
          </p>

          <div className="dashboard-hero-quote">
            "Even in the deepest shadow, the celestial moon cuts the darkness like a blade."
          </div>
        </div>
      </section>

      {/* 2. Live Telemetry Bar */}
      <section className="dashboard-kpi-grid">
        <div className="dashboard-kpi-card">
          <div
            className="dashboard-kpi-icon"
            style={{
              backgroundColor: 'rgba(214, 60, 60, 0.12)',
              border: '1px solid var(--vermilion-border)',
            }}
          >
            <Satellite size={20} color="var(--vermilion-bright)" />
          </div>
          <div className="dashboard-kpi-info">
            <span className="dashboard-kpi-label">Orbital Citadel (ISS)</span>
            <span className="dashboard-kpi-value">418 km • 27.6k km/h</span>
            <span className="dashboard-kpi-subtext">Low Earth Orbit beacon live</span>
          </div>
        </div>

        <div className="dashboard-kpi-card">
          <div
            className="dashboard-kpi-icon"
            style={{
              backgroundColor: 'rgba(229, 185, 89, 0.12)',
              border: '1px solid var(--gold-border)',
            }}
          >
            <Moon size={20} color="var(--gold-moon-bright)" />
          </div>
          <div className="dashboard-kpi-info">
            <span className="dashboard-kpi-label">Lunar Phase (SunCalc)</span>
            <span className="dashboard-kpi-value">
              {moonTelemetry.illuminationPercent}% • {moonTelemetry.phaseName}
            </span>
            <span className="dashboard-kpi-subtext">{moonTelemetry.phaseJapanese}</span>
          </div>
        </div>

        <div className="dashboard-kpi-card">
          <div
            className="dashboard-kpi-icon"
            style={{
              backgroundColor: 'rgba(78, 155, 114, 0.12)',
              border: '1px solid rgba(78, 155, 114, 0.3)',
            }}
          >
            <Scan size={20} color="#5ad896" />
          </div>
          <div className="dashboard-kpi-info">
            <span className="dashboard-kpi-label">Spirit Lens Vision</span>
            <span className="dashboard-kpi-value">AI Model Online</span>
            <span className="dashboard-kpi-subtext">Clan constellation lore ready</span>
          </div>
        </div>

        <div className="dashboard-kpi-card">
          <div
            className="dashboard-kpi-icon"
            style={{
              backgroundColor: 'rgba(154, 169, 191, 0.12)',
              border: '1px solid rgba(154, 169, 191, 0.3)',
            }}
          >
            <Sword size={20} color="var(--katana-steel)" />
          </div>
          <div className="dashboard-kpi-info">
            <span className="dashboard-kpi-label">Restoration Engine</span>
            <span className="dashboard-kpi-value">+18.4 dB SNR Gain</span>
            <span className="dashboard-kpi-subtext">Katana slider pipeline primed</span>
          </div>
        </div>
      </section>

      {/* 3. The 4 Options Selection Hub */}
      <section className="dashboard-options-section">
        <div className="dashboard-section-header">
          <div className="dashboard-section-title">
            <Crosshair size={22} color="var(--gold-moon)" />
            <h2>Choose Out of Four Celestial Options (四大選抜)</h2>
          </div>
          <div className="dashboard-section-hint">
            Select an option card or click its button to enter that operational suite
          </div>
        </div>

        <div className="dashboard-options-grid">
          {options.map((option) => (
            <div
              key={option.id}
              className="dashboard-option-card"
              style={
                {
                  '--card-accent': option.accentColor,
                  '--card-glow': option.glowColor,
                } as React.CSSProperties
              }
              onClick={() => onSelectOption(option.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectOption(option.id);
                }
              }}
              aria-label={`Select Option: ${option.title}`}
            >
              <div>
                <div className="dashboard-option-header">
                  <div className="dashboard-option-icon-box">{option.icon}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="dashboard-option-index-badge">{option.indexLabel}</span>
                    <span className="hanko-seal">{option.kanjiSeal}</span>
                  </div>
                </div>

                <div className="dashboard-option-title-row">
                  <h3 className="dashboard-option-title">{option.title}</h3>
                  <span className="dashboard-option-subtitle">({option.romaji})</span>
                </div>

                <div
                  style={{
                    fontSize: '0.82rem',
                    color: 'var(--gold-moon)',
                    marginBottom: '10px',
                    fontFamily: 'var(--font-serif)',
                  }}
                >
                  {option.subtitle}
                </div>

                <p className="dashboard-option-desc">{option.description}</p>

                <div className="dashboard-option-tags">
                  {option.badges.map((badge, idx) => (
                    <span key={idx} className="dashboard-tag">
                      • {badge}
                    </span>
                  ))}
                </div>
              </div>

              <div className="dashboard-option-footer">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--washi-muted)', textTransform: 'uppercase' }}>
                    {option.statsPreview.label}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      color: 'var(--gold-moon-bright)',
                    }}
                  >
                    {option.statsPreview.value}
                  </span>
                </div>

                <button
                  type="button"
                  className="dashboard-option-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectOption(option.id);
                  }}
                >
                  <span>{option.launchText}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Standalone Dashboard Footer */}
      <footer className="standalone-dashboard-footer">
        <p>"Even in the deepest shadow, the celestial moon cuts the darkness like a blade."</p>
        <p style={{ fontSize: '0.78rem', color: 'var(--washi-muted)', marginTop: '8px', letterSpacing: '0.04em' }}>
          Tsukuyomi Watch v0.1.0 • Choose an operational gate above to commence celestial navigation
        </p>
      </footer>
    </div>
  );
};
