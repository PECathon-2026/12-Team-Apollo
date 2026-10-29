import React, { useState, useEffect } from 'react';
import {
  Satellite,
  Scroll,
  Scan,
  Sword,
  Moon,
  Clock,
  Radio,
  Menu,
  X,
} from 'lucide-react';
import { NavSectionId, NavSectionItem } from '../types';
import { Watchtower } from '../features/watchtower/Watchtower';
import { CelestialScroll } from '../features/scroll/CelestialScroll';
import { SpiritLens } from '../features/spirit-lens/SpiritLens';
import { DojoDashboard } from '../features/dojo/DojoDashboard';

export const AppShell: React.FC = () => {
  const [activeSection, setActiveSection] = useState<NavSectionId>('watchtower');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'standby'>('checking');
  const [currentTimeJST, setCurrentTimeJST] = useState<string>('');

  const navItems: NavSectionItem[] = [
    {
      id: 'watchtower',
      label: 'Watchtower',
      labelJapanese: '望楼',
      romaji: 'Bōrō',
      subtitle: 'ISS & Orbital Citadel',
      description: 'Track satellites and celestial paths over feudal watchposts',
      iconName: 'Satellite',
    },
    {
      id: 'scroll',
      label: 'Celestial Scroll',
      labelJapanese: '天巻',
      romaji: 'Tenkan',
      subtitle: 'Lunar Ephemeris & Lore',
      description: 'SunCalc lunar illumination and ancient samurai chronicles',
      iconName: 'Scroll',
    },
    {
      id: 'spirit-lens',
      label: 'Spirit Lens',
      labelJapanese: '霊鏡',
      romaji: 'Reikyō',
      subtitle: 'Deep-Sky Object Sight',
      description: 'Identify nebulae, star clusters, and clan constellations',
      iconName: 'Scan',
    },
    {
      id: 'dojo',
      label: 'Restoration Dojo',
      labelJapanese: '道場',
      romaji: 'Dōjō',
      subtitle: 'Astrophoto Denoising',
      description: 'Katana blade sharpening and ink-wash noise reduction',
      iconName: 'Sword',
    },
  ];

  // Check backend health
  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          setBackendStatus('online');
        } else {
          setBackendStatus('standby');
        }
      } catch {
        setBackendStatus('standby');
      }
    };

    checkServer();
    const interval = setInterval(checkServer, 20000);
    return () => clearInterval(interval);
  }, []);

  // Update clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeJST(
        now.toLocaleTimeString('ja-JP', {
          timeZone: 'Asia/Tokyo',
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

  const renderActiveFeature = () => {
    switch (activeSection) {
      case 'watchtower':
        return <Watchtower />;
      case 'scroll':
        return <CelestialScroll />;
      case 'spirit-lens':
        return <SpiritLens />;
      case 'dojo':
        return <DojoDashboard />;
      default:
        return <Watchtower />;
    }
  };

  const getIcon = (id: NavSectionId, isSelected: boolean) => {
    const color = isSelected ? 'var(--gold-moon-bright)' : 'var(--washi-muted)';
    switch (id) {
      case 'watchtower':
        return <Satellite size={18} color={color} />;
      case 'scroll':
        return <Scroll size={18} color={color} />;
      case 'spirit-lens':
        return <Scan size={18} color={color} />;
      case 'dojo':
        return <Sword size={18} color={color} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: 'rgba(7, 8, 11, 0.92)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(229, 185, 89, 0.16)',
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
        }}
      >
        {/* Brand / Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
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
            <div style={{ fontSize: '0.72rem', color: 'var(--washi-muted)', letterSpacing: '0.04em' }}>
              Samurai Celestial Guide & Astrophotography Suite
            </div>
          </div>
        </div>

        {/* Center / Desktop Navigation Tabs */}
        <nav
          style={{
            display: 'none',
            gap: '6px',
            background: 'rgba(20, 23, 34, 0.7)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-ink)',
          }}
          className="desktop-nav"
        >
          {navItems.map((item) => {
            const isSelected = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isSelected ? 'rgba(229, 185, 89, 0.15)' : 'transparent',
                  border: isSelected ? '1px solid var(--gold-moon)' : '1px solid transparent',
                  color: isSelected ? 'var(--gold-moon-bright)' : 'var(--washi-muted)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '0.86rem',
                  fontWeight: isSelected ? 700 : 500,
                  transition: 'all 0.2s ease',
                }}
              >
                {getIcon(item.id, isSelected)}
                <span>{item.label}</span>
                <span style={{ fontSize: '0.72rem', opacity: 0.75 }}>[{item.labelJapanese}]</span>
              </button>
            );
          })}
        </nav>

        {/* Right Status / Telemetry Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Real-time Clock */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              color: 'var(--washi-silk)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(13, 15, 21, 0.6)',
              border: '1px solid var(--border-ink)',
            }}
          >
            <Clock size={14} color="var(--gold-moon)" />
            <span>{currentTimeJST || '00:00:00'} JST</span>
          </div>

          {/* Backend Connection Indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              color: backendStatus === 'online' ? '#85e3a8' : 'var(--washi-muted)',
            }}
          >
            <Radio size={14} color={backendStatus === 'online' ? '#55f58c' : '#a89d8d'} />
            <span style={{ display: 'none' }} className="status-label">
              {backendStatus === 'online' ? 'API Online' : 'API Standby'}
            </span>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              backgroundColor: 'rgba(20, 23, 34, 0.8)',
              border: '1px solid var(--gold-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--washi-white)',
              cursor: 'pointer',
            }}
            className="mobile-nav-toggle"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 'var(--header-height)',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(7, 8, 11, 0.96)',
            backdropFilter: 'blur(20px)',
            zIndex: 99,
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {navItems.map((item) => {
            const isSelected = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setMobileMenuOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isSelected ? 'rgba(229, 185, 89, 0.15)' : 'rgba(20, 23, 34, 0.6)',
                  border: isSelected ? '1px solid var(--gold-moon)' : '1px solid var(--border-ink)',
                  color: isSelected ? 'var(--gold-moon-bright)' : 'var(--washi-white)',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {getIcon(item.id, isSelected)}
                  <div>
                    <div>{item.label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--washi-muted)' }}>{item.subtitle}</div>
                  </div>
                </div>
                <span className="hanko-seal">{item.labelJapanese}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: 'var(--max-content-width)',
          margin: '0 auto',
          padding: '28px 24px 60px 24px',
        }}
      >
        {renderActiveFeature()}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid rgba(229, 185, 89, 0.12)',
          backgroundColor: 'var(--ink-950)',
          padding: '28px 24px',
          marginTop: 'auto',
        }}
      >
        <div
          style={{
            maxWidth: 'var(--max-content-width)',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: '0.88rem',
              color: 'var(--washi-parchment)',
              letterSpacing: '0.04em',
            }}
          >
            "Even in the deepest shadow, the celestial moon cuts the darkness like a blade."
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '0.78rem', color: 'var(--washi-muted)' }}>
            <span>Tsukuyomi Watch v0.1.0 • Hackathon Prototype</span>
            <span>•</span>
            <span>React + TypeScript + Vite + Express</span>
          </div>
        </div>
      </footer>

      {/* Responsive Inline CSS overrides for navigation breakpoints */}
      <style>{`
        @media (min-width: 860px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-nav-toggle {
            display: none !important;
          }
          .status-label {
            display: inline !important;
          }
        }
        @keyframes pulse {
          0% { transform: scale(0.9); opacity: 0.8; }
          50% { transform: scale(1.4); opacity: 0.2; }
          100% { transform: scale(0.9); opacity: 0.8; }
        }
        .spin-animation {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
