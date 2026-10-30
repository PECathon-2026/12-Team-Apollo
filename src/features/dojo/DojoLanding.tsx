import React from 'react';
import { Sparkles, ShieldCheck, Telescope, Activity, Compass, ArrowRight, Upload } from 'lucide-react';

interface DojoLandingProps {
  onBeginRestoration: () => void;
  onLoadSample: () => void;
}

export const DojoLanding: React.FC<DojoLandingProps> = ({ onBeginRestoration, onLoadSample }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Hero Banner */}
      <div
        className="sumi-card"
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '48px 36px',
          background: 'radial-gradient(ellipse at 80% 20%, rgba(229, 185, 89, 0.12) 0%, rgba(7, 8, 11, 0.95) 75%), var(--ink-900)',
          border: '1px solid var(--gold-border)',
          boxShadow: 'var(--shadow-sumi)',
        }}
      >
        {/* Subtle Watermark Kanji Background */}
        <div
          style={{
            position: 'absolute',
            right: '24px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontFamily: 'var(--font-serif)',
            fontSize: '11rem',
            fontWeight: 900,
            color: 'rgba(229, 185, 89, 0.04)',
            userSelect: 'none',
            pointerEvents: 'none',
            lineHeight: 1,
          }}
        >
          修復
        </div>

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '780px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <span className="hanko-seal" style={{ fontSize: '0.8rem', padding: '3px 10px' }}>
              修復道場
            </span>
            <span className="gold-badge">
              <Sparkles size={13} />
              AI & SCIENTIFIC ASTRONOMICAL RESTORATION
            </span>
          </div>

          <h1
            style={{
              fontSize: '2.6rem',
              letterSpacing: '0.06em',
              marginBottom: '14px',
              color: 'var(--washi-white)',
              lineHeight: 1.2,
            }}
          >
            RESTORATION DOJO
            <span
              style={{
                display: 'block',
                fontSize: '1.25rem',
                color: 'var(--gold-moon)',
                fontWeight: 400,
                letterSpacing: '0.12em',
                marginTop: '6px',
              }}
            >
              天体画像修復所 • The Celestial Forge of Pure Light
            </span>
          </h1>

          <p
            style={{
              fontSize: '1.02rem',
              color: 'var(--washi-silk)',
              lineHeight: 1.7,
              marginBottom: '26px',
            }}
          >
            A high-precision image restoration chamber engineered for professional astronomers,
            telescope observers, and amateur astrophotographers. Hone blurred atmospheric exposures,
            deconvolve optical diffraction with point spread function (PSF) mathematics, and strip CMOS/CCD
            sensor noise—strictly preserving real celestial photons without synthetic generative hallucinations.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
            <button
              onClick={onBeginRestoration}
              className="btn-samurai-gold"
              style={{
                padding: '13px 26px',
                fontSize: '0.98rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <Upload size={18} />
              Begin Restoration
              <ArrowRight size={16} />
            </button>

            <button
              onClick={onLoadSample}
              style={{
                padding: '12px 22px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(20, 23, 34, 0.8)',
                border: '1px solid var(--border-ink)',
                color: 'var(--washi-silk)',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--gold-moon)';
                e.currentTarget.style.color = 'var(--gold-moon-bright)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-ink)';
                e.currentTarget.style.color = 'var(--washi-silk)';
              }}
            >
              <Telescope size={16} color="var(--gold-moon)" />
              Inspect Reference Messier Sample
            </button>
          </div>
        </div>
      </div>

      {/* Core Principles Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
        }}
      >
        <div className="sumi-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '4px',
                backgroundColor: 'rgba(214, 60, 60, 0.12)',
                border: '1px solid var(--vermilion)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={20} color="var(--vermilion-bright)" />
            </div>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--washi-white)' }}>
              Scene Preservation First
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--washi-silk)', lineHeight: 1.6 }}>
            Unlike generic text-to-image AI, our models hone genuine incoming photon data. The restoration engine
            never invents, generates, or hallucinates non-existent stars, nebulae, or celestial artifacts.
          </p>
        </div>

        <div className="sumi-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '4px',
                backgroundColor: 'rgba(229, 185, 89, 0.12)',
                border: '1px solid var(--gold-moon)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Activity size={20} color="var(--gold-moon-bright)" />
            </div>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--washi-white)' }}>
              PSF Seeing Deconvolution
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--washi-silk)', lineHeight: 1.6 }}>
            Mathematical point spread function (PSF) deconvolution counteracts atmospheric turbulence
            blur and aperture diffraction, sharpening bloated star profiles into pinpoint stellar cores.
          </p>
        </div>

        <div className="sumi-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '4px',
                backgroundColor: 'rgba(133, 227, 168, 0.12)',
                border: '1px solid var(--bamboo-jade)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Compass size={20} color="#85e3a8" />
            </div>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--washi-white)' }}>
              Scientific FITS & Common Formats
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--washi-silk)', lineHeight: 1.6 }}>
            Full support for standard astrophotography formats (PNG, JPEG, WebP) as well as raw
            astronomical FITS files with asinh dynamic range scaling and metadata preservation.
          </p>
        </div>
      </div>
    </div>
  );
};
