import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Satellite,
  Scroll,
  Scan,
  Sword,
  Moon,
  Clock,
  Menu,
  X,
} from 'lucide-react';
import { NavSectionId, NavSectionItem } from '../types';

interface AppShellProps {
  activeView: NavSectionId;
  onViewChange: (view: NavSectionId) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  activeView,
  onViewChange,
  children,
}) => {
  const [activeSection, setActiveSection] = useState<NavSectionId>(activeView);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'standby'>('checking');
  const [currentTimeJST, setCurrentTimeJST] = useState<string>('');

  // Sync navigation with parent state
  useEffect(() => {
    setActiveSection(activeView);
  }, [activeView]);

  const navItems: NavSectionItem[] = [
    {
      id: 'dashboard',
      label: '← Dashboard',
      labelJapanese: '本陣',
      romaji: 'Honjin',
      subtitle: 'Command Hub',
      description: 'Return to the central celestial command hub',
      iconName: 'LayoutDashboard',
    },
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
    let mounted = true;

    const checkServer = async () => {
      try {
        const res = await fetch('/api/health');
        if (mounted) {
          setBackendStatus(res.ok ? 'online' : 'standby');
        }
      } catch {
        if (mounted) {
          setBackendStatus('standby');
        }
      }
    };

    void checkServer();
    const interval = setInterval(() => {
      void checkServer();
    }, 20000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Update Japan Standard Time clock
  useEffect(() => {
    const updateTime = () => {
      setCurrentTimeJST(
        new Date().toLocaleTimeString('ja-JP', {
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

  const getIcon = (id: NavSectionId, isSelected: boolean): React.ReactNode => {
    const color = isSelected ? 'var(--gold-moon-bright)' : 'var(--washi-muted)';
    switch (id) {
      case 'dashboard':
        return <LayoutDashboard size={18} color={color} />;
      case 'watchtower':
        return <Satellite size={18} color={color} />;
      case 'scroll':
        return <Scroll size={18} color={color} />;
      case 'spirit-lens':
        return <Scan size={18} color={color} />;
      case 'dojo':
        return <Sword size={18} color={color} />;
      default:
        return null;
    }
  };

  const handleNavigation = (view: NavSectionId) => {
    setActiveSection(view);
    onViewChange(view);
    setMobileMenuOpen(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: 'rgba(7, 8, 11, 0.94)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(229, 185, 89, 0.16)',
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
        }}
      >
        {/* Brand / Logo - Clickable to return to Dashboard */}
        <div
          onClick={() => handleNavigation('dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            cursor: 'pointer',
            userSelect: 'none',
          }}
          title="Return to Dashboard (本陣へ戻る)"
        >
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
              transition: 'transform 0.2s ease',
            }}
          >
            <Moon size={22} color="var(--gold-moon-bright)" />
          </div>

          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
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

            <div
              style={{
                fontSize: '0.72rem',
                color: 'var(--washi-muted)',
                letterSpacing: '0.04em',
              }}
            >
              Samurai Celestial Guide & Astrophotography Suite
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav
          className="desktop-nav"
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(13, 15, 21, 0.65)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(229, 185, 89, 0.12)',
          }}
        >
          {navItems.map((item) => {
            const isSelected = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                aria-current={isSelected ? 'page' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isSelected ? 'rgba(229, 185, 89, 0.15)' : 'transparent',
                  border: isSelected ? '1px solid var(--gold-border)' : '1px solid transparent',
                  color: isSelected ? 'var(--gold-moon-bright)' : 'var(--washi-silk)',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '0.86rem',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {getIcon(item.id, isSelected)}
                <span>{item.label}</span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: isSelected ? 'var(--gold-moon)' : 'var(--washi-muted)',
                    marginLeft: '2px',
                  }}
                >
                  {item.labelJapanese}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Status Indicators & Mobile Menu Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* JST Clock */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.82rem',
              color: 'var(--washi-silk)',
              background: 'rgba(13, 15, 21, 0.7)',
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-ink)',
            }}
          >
            <Clock size={14} color="var(--gold-moon)" />
            <span>{currentTimeJST || '00:00:00'}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--washi-muted)' }}>JST</span>
          </div>

          {/* Backend Status Dot */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              color: 'var(--washi-silk)',
            }}
            title={
              backendStatus === 'online'
                ? 'Telemetry Backend connected'
                : 'Using simulated fallback telemetry'
            }
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor:
                  backendStatus === 'online'
                    ? '#4e9b72'
                    : backendStatus === 'standby'
                    ? '#d63c3c'
                    : 'var(--gold-moon)',
                boxShadow:
                  backendStatus === 'online'
                    ? '0 0 8px rgba(78, 155, 114, 0.6)'
                    : '0 0 8px rgba(214, 60, 60, 0.6)',
              }}
            />
            <span
              className="status-label"
              style={{
                display: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--washi-muted)',
              }}
            >
              {backendStatus === 'online' ? 'LINK OK' : 'LOCAL'}
            </span>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="mobile-nav-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: '1px solid var(--border-ink)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px',
              color: 'var(--washi-white)',
              cursor: 'pointer',
            }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <nav
          style={{
            position: 'fixed',
            top: 'var(--header-height)',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(7, 8, 11, 0.98)',
            backdropFilter: 'blur(20px)',
            zIndex: 99,
            display: 'flex',
            flexDirection: 'column',
            padding: '24px',
            gap: '12px',
            overflowY: 'auto',
          }}
        >
          {navItems.map((item) => {
            const isSelected = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                aria-current={isSelected ? 'page' : undefined}
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
                    <div style={{ fontSize: '0.75rem', color: 'var(--washi-muted)' }}>
                      {item.subtitle}
                    </div>
                  </div>
                </div>
                <span className="hanko-seal">{item.labelJapanese}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: 'var(--max-content-width)',
          margin: '0 auto',
          padding: '28px 24px 60px 24px',
          boxSizing: 'border-box',
        }}
      >
        {children}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid rgba(229, 185, 89, 0.12)',
          backgroundColor: 'rgba(7, 8, 11, 0.9)',
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
              color: 'var(--gold-moon-dim)',
              letterSpacing: '0.04em',
            }}
          >
            "Even in the deepest shadow, the celestial moon cuts the darkness like a blade."
          </div>

          <div
            style={{
              display: 'flex',
              gap: '16px',
              fontSize: '0.78rem',
              color: 'var(--washi-muted)',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <span>Tsukuyomi Watch v0.1.0 • Celestial Command Deck</span>
            <span>•</span>
            <span>React + TypeScript + Vite + Express</span>
          </div>
        </div>
      </footer>

      {/* Responsive Inline CSS overrides for navigation breakpoints */}
      <style>{`
        @media (min-width: 960px) {
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
      `}</style>
    </div>
  );
};
