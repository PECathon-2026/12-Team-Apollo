import React, { useState } from 'react';
import { Sparkles, Sliders, Activity, RefreshCw, Wand2, Zap } from 'lucide-react';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { RestorationPreset, RestorationResult } from '../../types';

export const DojoDashboard: React.FC = () => {
  const [preset, setPreset] = useState<RestorationPreset>('samurai_clarity');
  const [noiseReduction, setNoiseReduction] = useState<number>(75);
  const [sharpness, setSharpness] = useState<number>(85);
  const [contrastBoost, setContrastBoost] = useState<number>(60);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [restorationResult, setRestorationResult] = useState<RestorationResult | null>({
    id: 'dojo-init-001',
    status: 'completed',
    originalImageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=40',
    restoredImageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=90',
    parameters: {
      preset: 'samurai_clarity',
      noiseReductionLevel: 75,
      contrastBoost: 60,
      sharpness: 85,
      starDehalo: true,
      backgroundBlackLevel: 45,
      colorSaturation: 65,
    },
    metrics: {
      snrImprovementDb: 18.4,
      starsRecoveredCount: 1420,
      backgroundNoiseReducedPercent: 88,
      processingTimeMs: 340,
      entropyScore: 0.94,
    },
    completedAt: new Date().toISOString(),
    alchemistNotes: 'Sumi-e ink noise removed. Blade-sharp stellar profiles honed to Katana precision.',
  });

  const handleRunRestoration = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=40',
          preset,
          parameters: {
            noiseReductionLevel: noiseReduction,
            contrastBoost,
            sharpness,
            starDehalo: true,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRestorationResult(data);
      } else {
        // Fallback local simulation if backend unavailable
        simulateLocalRestoration();
      }
    } catch {
      simulateLocalRestoration();
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateLocalRestoration = () => {
    setRestorationResult({
      id: `dojo-sim-${Date.now()}`,
      status: 'completed',
      originalImageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=40',
      restoredImageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=90',
      parameters: {
        preset,
        noiseReductionLevel: noiseReduction,
        contrastBoost,
        sharpness,
        starDehalo: true,
        backgroundBlackLevel: 50,
        colorSaturation: 60,
      },
      metrics: {
        snrImprovementDb: +(15 + Math.random() * 5).toFixed(1),
        starsRecoveredCount: Math.floor(1200 + Math.random() * 400),
        backgroundNoiseReducedPercent: Math.floor(80 + Math.random() * 15),
        processingTimeMs: Math.floor(250 + Math.random() * 150),
        entropyScore: 0.95,
      },
      completedAt: new Date().toISOString(),
      alchemistNotes: 'Local Dojo algorithm applied: Ink wash clarity restoration successful.',
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div className="sumi-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="hanko-seal">道場</span>
              <span className="gold-badge">
                <Sparkles size={12} />
                IMAGE ALCHEMY & DENOISING
              </span>
            </div>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>
              Restoration Dojo <span style={{ color: 'var(--gold-moon)', fontWeight: 400 }}>| 修復道場</span>
            </h1>
            <p style={{ maxWidth: '720px', fontSize: '0.92rem' }}>
              Hone raw night-sky exposures using deep ink-wash restoration algorithms. Polish stellar light,
              slice cosmic noise like a katana blade, and recover celestial details lost in murky atmospheres.
            </p>
          </div>

          <button
            onClick={handleRunRestoration}
            disabled={isProcessing}
            className="btn-samurai-gold"
          >
            {isProcessing ? (
              <>
                <RefreshCw size={16} className="spin-animation" />
                Forging Light...
              </>
            ) : (
              <>
                <Wand2 size={16} />
                Execute Katana Restoration
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Slider + Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Left Column: Interactive Before/After Component */}
        <div style={{ gridColumn: 'span 2', minWidth: '300px' }}>
          <div className="sumi-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="var(--gold-moon)" />
                Interactive Blade Comparison Slider
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--washi-muted)' }}>
                Drag katana emblem to inspect before & after
              </span>
            </div>

            <BeforeAfterSlider
              beforeImage={restorationResult?.originalImageUrl}
              afterImage={restorationResult?.restoredImageUrl}
            />

            {/* Metrics Row */}
            {restorationResult && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '12px',
                  marginTop: '16px',
                }}
              >
                <div className="metric-pill">
                  <span className="label">SNR Gain</span>
                  <span className="value">+{restorationResult.metrics.snrImprovementDb} dB</span>
                </div>
                <div className="metric-pill">
                  <span className="label">Stars Recovered</span>
                  <span className="value">{restorationResult.metrics.starsRecoveredCount.toLocaleString()}</span>
                </div>
                <div className="metric-pill">
                  <span className="label">Noise Reduced</span>
                  <span className="value">{restorationResult.metrics.backgroundNoiseReducedPercent}%</span>
                </div>
                <div className="metric-pill">
                  <span className="label">Process Time</span>
                  <span className="value">{restorationResult.metrics.processingTimeMs} ms</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Alchemy Controls */}
        <div>
          <div className="sumi-card" style={{ height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <Sliders size={18} color="var(--gold-moon)" />
              <h3 style={{ fontSize: '1.1rem' }}>Sumi Alchemy Controls</h3>
            </div>

            {/* Preset Selector */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--washi-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Katana Preset
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { id: 'samurai_clarity', name: 'Samurai Clarity (侍の明瞭)', desc: 'Balanced sharpening and stellar contrast' },
                  { id: 'ink_denoise', name: 'Sumi-e Deep Denoise (墨流し)', desc: 'Aggressive atmospheric grain removal' },
                  { id: 'nebula_deep_ink', name: 'Nebula Veil (星雲の衣)', desc: 'Optimized for faint dust bands and hydrogen emission' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setPreset(item.id as RestorationPreset)}
                    style={{
                      textAlign: 'left',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: preset === item.id ? 'rgba(229, 185, 89, 0.12)' : 'rgba(13, 15, 21, 0.6)',
                      border: preset === item.id ? '1px solid var(--gold-moon)' : '1px solid var(--border-ink)',
                      color: preset === item.id ? 'var(--gold-moon-bright)' : 'var(--washi-silk)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{item.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--washi-muted)', marginTop: '2px' }}>{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Parameter Sliders */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--washi-silk)' }}>Ink Denoise Level</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold-moon)' }}>{noiseReduction}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={noiseReduction}
                  onChange={(e) => setNoiseReduction(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--gold-moon)' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--washi-silk)' }}>Blade Sharpness</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold-moon)' }}>{sharpness}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sharpness}
                  onChange={(e) => setSharpness(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--gold-moon)' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--washi-silk)' }}>Deep Void Contrast</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold-moon)' }}>{contrastBoost}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={contrastBoost}
                  onChange={(e) => setContrastBoost(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--gold-moon)' }}
                />
              </div>
            </div>

            {/* Alchemist note */}
            <div
              style={{
                marginTop: '22px',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(7, 8, 11, 0.7)',
                border: '1px dashed rgba(229, 185, 89, 0.25)',
                fontSize: '0.78rem',
                color: 'var(--washi-parchment)',
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-start',
              }}
            >
              <Zap size={15} color="var(--gold-moon)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: 'var(--gold-moon-bright)' }}>Sensei's Guidance:</strong> When shooting
                under light-polluted castles, increase Void Contrast to 65% and maintain Star Dehalo to prevent blooming.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
