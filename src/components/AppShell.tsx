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
  const [currentTimeIST, setCurrentTimeIST] = useState<string>('');

  // Sync navigation with parent state
  useEffect(() => {
    setActiveSection(activeView);
  }, [activeView]);

  const navItems: NavSectionItem[] = [
    {
      id: 'dashboard',
      label: '← Dashboard',
      labelJapanese: '',
      romaji: 'Deck',
      subtitle: 'Command Hub',
      description: 'Return to the central command hub',
      iconName: 'LayoutDashboard',
    },
    {
      id: 'watchtower',
      label: 'Watchtower',
      labelJapanese: '',
      romaji: 'Citadel',
      subtitle: 'ISS & Orbital Tracking',
      description: 'Track satellites and celestial paths over feudal watchposts',
      iconName: 'Satellite',
    },
    {
      id: 'scroll',
      label: 'Celestial Scroll',
      labelJapanese: '',
      romaji: 'Ephemeris',
      subtitle: 'Lunar Ephemeris',
      description: 'SunCalc lunar illumination and astronomical ephemeris',
      iconName: 'Scroll',
    },
    {
      id: 'spirit-lens',
      label: 'Spirit Lens',
      labelJapanese: '',
      romaji: 'Vision',
      subtitle: 'Deep-Sky AI Vision',
      description: 'Identify nebulae, star clusters, and clan constellations',
      iconName: 'Scan',
    },
    {
      id: 'dojo',
      label: 'Restoration Dojo',
      labelJapanese: '',
      romaji: 'Dojo',
      subtitle: 'Astrophoto Denoising',
      description: 'Katana blade sharpening and noise reduction',
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

  // Update Indian Standard Time clock
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

  const getIcon = (id: NavSectionId, isSelected: boolean): React.ReactNode => {
    const color = isSelected ? '#ff4d4d' : 'var(--washi-muted)';
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
          backgroundColor: 'rgba(7, 5, 8, 0.95)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(220, 38, 38, 0.3)',
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
          title="Return to Dashboard"
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#120508',
              border: '2px solid #ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(220, 38, 38, 0.5)',
              transition: 'transform 0.2s ease',
            }}
          >
            <Moon size={22} color="#ff4d4d" />
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
                COMMAND
              </span>
            </div>

            <div
              style={{
                fontSize: '0.72rem',
                color: 'var(--washi-muted)',
                letterSpacing: '0.04em',
              }}
            >
              Orbital Celestial Deck & Astrophotography
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
            background: 'rgba(18, 6, 8, 0.85)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(220, 38, 38, 0.25)',
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
                  backgroundColor: isSelected ? 'rgba(220, 38, 38, 0.25)' : 'transparent',
                  border: isSelected ? '1px solid #ef4444' : '1px solid transparent',
                  color: isSelected ? '#ffffff' : 'var(--washi-silk)',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '0.86rem',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {getIcon(item.id, isSelected)}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Status Indicators & Mobile Menu Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* IST Clock */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.82rem',
              color: 'var(--washi-silk)',
              background: 'rgba(18, 6, 8, 0.88)',
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(220, 38, 38, 0.3)',
            }}
          >
            <Clock size={14} color="var(--gold-moon)" />
            <span>{currentTimeIST || '00:00:00'}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--washi-muted)' }}>IST</span>
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
                    ? '#22c55e'
                    : backendStatus === 'standby'
                    ? '#ef4444'
                    : '#ef4444',
                boxShadow:
                  backendStatus === 'online'
                    ? '0 0 8px rgba(34, 197, 94, 0.6)'
                    : '0 0 8px rgba(239, 68, 68, 0.6)',
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
              border: '1px solid rgba(220, 38, 38, 0.3)',
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
            backgroundColor: 'rgba(7, 5, 8, 0.98)',
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
                  backgroundColor: isSelected ? 'rgba(220, 38, 38, 0.25)' : 'rgba(18, 6, 8, 0.8)',
                  border: isSelected ? '1px solid #ef4444' : '1px solid rgba(220, 38, 38, 0.25)',
                  color: isSelected ? '#ffffff' : 'var(--washi-white)',
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

      {/* Universal Footer */}
      <footer
        style={{
          borderTop: '1px solid rgba(220, 38, 38, 0.25)',
          padding: '28px 24px',
          backgroundColor: 'rgba(7, 5, 8, 0.95)',
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
              color: '#ff4d4d',
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
