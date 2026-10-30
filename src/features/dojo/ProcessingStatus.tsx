import React, { useEffect, useState } from 'react';
import { RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ProcessingStatusProps {
  isProcessing: boolean;
  error: string | null;
  onRetry: () => void;
  onFallbackToDemo?: () => void;
}

const STAGES = [
  { label: 'Reading & validating celestial frame...', detail: 'Extracting image metadata and astronomical headers' },
  { label: 'Measuring background noise & PSF seeing blur...', detail: 'Sampling dark sky patches for Poisson/Gaussian noise variance' },
  { label: 'Applying multi-scale wavelet denoising...', detail: 'Slicing sensor grain while preserving subtle nebulosity' },
  { label: 'Executing Point Spread Function deconvolution...', detail: 'Honing bloated star profiles with katana edge precision' },
  { label: 'Detecting candidate celestial objects...', detail: 'Centroiding stellar flux peaks and extended emission regions' },
  { label: 'Assembling restored view & computing metrics...', detail: 'Finalizing SNR gain and image balance' },
];

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  isProcessing,
  error,
  onRetry,
  onFallbackToDemo,
}) => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  useEffect(() => {
    if (!isProcessing) {
      setCurrentStageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStageIndex((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 550);

    return () => clearInterval(interval);
  }, [isProcessing]);

  if (error) {
    return (
      <div
        className="sumi-card"
        style={{
          padding: '28px',
          border: '1px solid var(--vermilion)',
          backgroundColor: 'rgba(214, 60, 60, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '14px',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'rgba(214, 60, 60, 0.15)',
            border: '1px solid var(--vermilion)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AlertCircle size={26} color="var(--vermilion-bright)" />
        </div>

        <h3 style={{ fontSize: '1.2rem', color: 'var(--vermilion-bright)' }}>
          Celestial Restoration Encountered an Obstacle
        </h3>

        <p style={{ maxWidth: '580px', fontSize: '0.9rem', color: 'var(--washi-silk)', lineHeight: 1.6 }}>
          {error}
        </p>

        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button onClick={onRetry} className="btn-samurai-gold" style={{ padding: '8px 18px', fontSize: '0.86rem' }}>
            <RefreshCw size={14} />
            Retry Restoration
          </button>

          {onFallbackToDemo && (
            <button
              onClick={onFallbackToDemo}
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(20, 23, 34, 0.8)',
                border: '1px solid var(--border-ink)',
                color: 'var(--washi-silk)',
                fontSize: '0.86rem',
                cursor: 'pointer',
              }}
            >
              Run in Demonstration Mode
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!isProcessing) return null;

  return (
    <div
      className="sumi-card"
      style={{
        padding: '32px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '20px',
        border: '1px solid var(--gold-border)',
        boxShadow: 'var(--shadow-sumi)',
      }}
    >
      {/* Animated Katana / Orb Forge */}
      <div style={{ position: 'relative', width: '70px', height: '70px' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2px solid rgba(229, 185, 89, 0.2)',
            borderTopColor: 'var(--gold-moon-bright)',
            animation: 'spin 1.2s linear infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: '8px',
            borderRadius: '50%',
            border: '2px dashed rgba(214, 60, 60, 0.4)',
            borderBottomColor: 'var(--vermilion-bright)',
            animation: 'spin 2s linear infinite reverse',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: '16px',
            borderRadius: '50%',
            backgroundColor: 'var(--ink-850)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px var(--gold-glow)',
          }}
        >
          <span className="hanko-seal" style={{ fontSize: '0.65rem', padding: '2px 4px' }}>
            鍛
          </span>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '1.25rem', color: 'var(--washi-white)', marginBottom: '6px' }}>
          Forging Celestial Clarity
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--gold-moon)', fontFamily: 'var(--font-mono)' }}>
          Stage {currentStageIndex + 1} of {STAGES.length}: {STAGES[currentStageIndex].label}
        </p>
        <p style={{ fontSize: '0.76rem', color: 'var(--washi-muted)', marginTop: '4px' }}>
          {STAGES[currentStageIndex].detail}
        </p>
      </div>

      {/* Progress Bars / Steps */}
      <div style={{ display: 'flex', gap: '6px', width: '100%', maxWidth: '420px' }}>
        {STAGES.map((_, idx) => (
          <div
            key={idx}
            style={{
              flex: 1,
              height: '4px',
              borderRadius: '2px',
              backgroundColor:
                idx < currentStageIndex
                  ? 'var(--gold-moon-bright)'
                  : idx === currentStageIndex
                  ? 'var(--gold-moon)'
                  : 'rgba(255, 255, 255, 0.1)',
              transition: 'background-color 0.3s ease',
              boxShadow: idx <= currentStageIndex ? '0 0 6px var(--gold-glow)' : 'none',
            }}
          />
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: 'var(--washi-silk)' }}>
        <CheckCircle2 size={13} color="#85e3a8" />
        <span>Astronomical scene fidelity is strictly protected (zero synthetic generation)</span>
      </div>
    </div>
  );
};
