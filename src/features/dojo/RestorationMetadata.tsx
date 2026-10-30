import React from 'react';
import { Activity, ShieldCheck, Clock, Layers, } from 'lucide-react';
import { RestorationResult } from '../../types';

interface RestorationMetadataProps {
  result: RestorationResult;
}

export const RestorationMetadata: React.FC<RestorationMetadataProps> = ({ result }) => {
  const metadata = result.metadata;
  const metrics = result.metrics;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Metrics Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
        }}
      >
        <div className="metric-pill">
          <span className="label">SNR Gain</span>
          <span className="value">+{metrics.snrImprovementDb} dB</span>
        </div>
        <div className="metric-pill">
          <span className="label">Stars Sharpened</span>
          <span className="value">{metrics.starsRecoveredCount.toLocaleString()}</span>
        </div>
        <div className="metric-pill">
          <span className="label">Background Denoise</span>
          <span className="value">{metrics.backgroundNoiseReducedPercent}%</span>
        </div>
        <div className="metric-pill">
          <span className="label">Processing Duration</span>
          <span className="value">{metrics.processingTimeMs} ms</span>
        </div>
      </div>

      {/* Detailed Operations Panel */}
      <div
        className="sumi-card"
        style={{
          padding: '18px 20px',
          backgroundColor: 'rgba(13, 15, 21, 0.7)',
          border: '1px solid var(--border-ink)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Activity size={16} color="var(--gold-moon)" />
          <h4 style={{ fontSize: '0.96rem', color: 'var(--washi-white)' }}>
            Restoration Diagnostics & Scientific Profile
          </h4>
          {metadata?.isDemonstration && (
            <span
              style={{
                marginLeft: 'auto',
                fontSize: '0.68rem',
                backgroundColor: 'rgba(229, 185, 89, 0.15)',
                color: 'var(--gold-moon-bright)',
                padding: '2px 8px',
                borderRadius: '3px',
                border: '1px solid var(--gold-border)',
                fontWeight: 700,
              }}
            >
              DEMONSTRATION RUN
            </span>
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px',
            marginBottom: '14px',
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--washi-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Restoration Method
            </div>
            <div style={{ fontSize: '0.86rem', color: 'var(--washi-white)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <Layers size={14} color="var(--gold-moon)" />
              {metadata?.methodLabel || 'Astronomical PSF Deconvolution & Wavelet Denoising'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--washi-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Image Dimensions
            </div>
            <div style={{ fontSize: '0.86rem', color: 'var(--washi-white)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              {metadata?.originalDimensions.width || 1200} × {metadata?.originalDimensions.height || 800} px
              <span style={{ fontSize: '0.75rem', color: 'var(--washi-muted)', marginLeft: '6px' }}>
                (Preserved 1:1)
              </span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--washi-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Execution Timestamp
            </div>
            <div style={{ fontSize: '0.86rem', color: 'var(--washi-white)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <Clock size={13} color="var(--gold-moon)" />
              {new Date(result.completedAt).toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Algorithm Summary */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--washi-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
            What the Engine Improved
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--washi-silk)', lineHeight: 1.55 }}>
            {metadata?.algorithmSummary ||
              'Point Spread Function (PSF) deconvolution sharpened atmospheric seeing and aperture diffraction. High-frequency wavelet noise filtering separated CMOS sensor thermal grain while preserving faint extended emission nebulosity and stellar centroids.'}
          </p>
        </div>

        {/* Sensei Notes & Scientific Caveat */}
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(7, 8, 11, 0.75)',
            border: '1px solid rgba(229, 185, 89, 0.2)',
            fontSize: '0.75rem',
            color: 'var(--washi-parchment)',
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-start',
          }}
        >
          <ShieldCheck size={16} color="var(--gold-moon)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 600, color: 'var(--gold-moon-bright)', marginBottom: '2px' }}>
              Scientific Integrity & Limitations
            </div>
            <div>
              {metadata?.metricsExplanation ||
                'Signal-to-Noise Ratio (SNR) gain is mathematically estimated by measuring variance reduction across dark sky background pixels against unsharp Laplacian gradients. No synthetic astronomical objects were added.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
