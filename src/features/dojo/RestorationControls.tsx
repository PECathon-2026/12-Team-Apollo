import React from 'react';
import { Sliders, Zap, Cpu, Sparkles, Shield } from 'lucide-react';
import { RestorationPreset, RestorationParameters } from '../../types';

interface RestorationControlsProps {
  parameters: RestorationParameters;
  onChangeParameters: (params: RestorationParameters) => void;
  selectedMode: 'scientific' | 'ai' | 'demo';
  onChangeMode: (mode: 'scientific' | 'ai' | 'demo') => void;
  disabled?: boolean;
}

export const RestorationControls: React.FC<RestorationControlsProps> = ({
  parameters,
  onChangeParameters,
  selectedMode,
  onChangeMode,
  disabled = false,
}) => {
  const presets: { id: RestorationPreset; name: string; desc: string; defaults: Partial<RestorationParameters> }[] = [
    {
      id: 'samurai_clarity',
      name: 'Samurai Clarity (侍の明瞭)',
      desc: 'Balanced stellar sharpening and contrast honing',
      defaults: { noiseReductionLevel: 75, sharpness: 85, contrastBoost: 60, starDehalo: true, backgroundBlackLevel: 45, colorSaturation: 65 },
    },
    {
      id: 'ink_denoise',
      name: 'Sumi-e Deep Denoise (墨流し)',
      desc: 'Aggressive sensor read-noise & atmospheric grain reduction',
      defaults: { noiseReductionLevel: 90, sharpness: 65, contrastBoost: 50, starDehalo: true, backgroundBlackLevel: 50, colorSaturation: 60 },
    },
    {
      id: 'nebula_deep_ink',
      name: 'Nebula Veil (星雲の衣)',
      desc: 'Optimized for faint hydrogen emission & cosmic dust bands',
      defaults: { noiseReductionLevel: 70, sharpness: 75, contrastBoost: 80, starDehalo: false, backgroundBlackLevel: 40, colorSaturation: 75 },
    },
    {
      id: 'lunar_sharp',
      name: 'Lunar Edge (月面研磨)',
      desc: 'High-frequency deconvolution for crater rims & surfaces',
      defaults: { noiseReductionLevel: 50, sharpness: 95, contrastBoost: 70, starDehalo: true, backgroundBlackLevel: 35, colorSaturation: 50 },
    },
    {
      id: 'solar_veil',
      name: 'Solar Void (黒点抽出)',
      desc: 'Deep dynamic range balancing for solar granulation',
      defaults: { noiseReductionLevel: 65, sharpness: 80, contrastBoost: 65, starDehalo: true, backgroundBlackLevel: 55, colorSaturation: 60 },
    },
  ];

  const handlePresetSelect = (pId: RestorationPreset) => {
    const selected = presets.find((p) => p.id === pId);
    if (selected) {
      onChangeParameters({
        ...parameters,
        preset: pId,
        ...selected.defaults,
      });
    }
  };

  const updateParam = (key: keyof RestorationParameters, value: any) => {
    onChangeParameters({
      ...parameters,
      [key]: value,
    });
  };

  return (
    <div className="sumi-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={18} color="var(--gold-moon)" />
          <h3 style={{ fontSize: '1.05rem', color: 'var(--washi-white)' }}>Sumi Alchemy Controls</h3>
        </div>
        <span className="hanko-seal" style={{ fontSize: '0.68rem' }}>鍛錬</span>
      </div>

      {/* Engine Mode Selection */}
      <div style={{ marginBottom: '18px' }}>
        <label
          style={{
            display: 'block',
            fontSize: '0.74rem',
            color: 'var(--washi-muted)',
            marginBottom: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Restoration Engine Mode
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
          {[
            { id: 'scientific', label: 'Scientific PSF', icon: Shield, note: 'Recommended' },
            { id: 'ai', label: 'Neural AI Model', icon: Cpu, note: 'Pretrained' },
            { id: 'demo', label: 'Demonstration', icon: Sparkles, note: 'Simulation' },
          ].map((mode) => {
            const isSelected = selectedMode === mode.id;
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => onChangeMode(mode.id as any)}
                disabled={disabled}
                style={{
                  padding: '8px 4px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isSelected ? 'rgba(229, 185, 89, 0.15)' : 'rgba(20, 23, 34, 0.6)',
                  border: isSelected ? '1px solid var(--gold-moon)' : '1px solid var(--border-ink)',
                  color: isSelected ? 'var(--gold-moon-bright)' : 'var(--washi-muted)',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  fontSize: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '2px' }}>
                  <Icon size={13} />
                  <span style={{ fontWeight: 600 }}>{mode.label}</span>
                </div>
                <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>{mode.note}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Katana Presets */}
      <div style={{ marginBottom: '18px' }}>
        <label
          style={{
            display: 'block',
            fontSize: '0.74rem',
            color: 'var(--washi-muted)',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Katana Presets
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {presets.map((item) => {
            const isSelected = parameters.preset === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handlePresetSelect(item.id)}
                disabled={disabled}
                style={{
                  textAlign: 'left',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: isSelected ? 'rgba(229, 185, 89, 0.12)' : 'rgba(13, 15, 21, 0.6)',
                  border: isSelected ? '1px solid var(--gold-moon)' : '1px solid var(--border-ink)',
                  color: isSelected ? 'var(--gold-moon-bright)' : 'var(--washi-silk)',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{item.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--washi-muted)', marginTop: '2px' }}>
                  {item.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fine-Tuning Parameter Sliders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
            <span style={{ color: 'var(--washi-silk)' }}>Ink Denoise Level</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold-moon)' }}>
              {parameters.noiseReductionLevel}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={parameters.noiseReductionLevel}
            onChange={(e) => updateParam('noiseReductionLevel', Number(e.target.value))}
            disabled={disabled}
            style={{ width: '100%', accentColor: 'var(--gold-moon)' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
            <span style={{ color: 'var(--washi-silk)' }}>Blade Sharpness (PSF Deconv)</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold-moon)' }}>
              {parameters.sharpness}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={parameters.sharpness}
            onChange={(e) => updateParam('sharpness', Number(e.target.value))}
            disabled={disabled}
            style={{ width: '100%', accentColor: 'var(--gold-moon)' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
            <span style={{ color: 'var(--washi-silk)' }}>Deep Void Contrast</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold-moon)' }}>
              {parameters.contrastBoost}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={parameters.contrastBoost}
            onChange={(e) => updateParam('contrastBoost', Number(e.target.value))}
            disabled={disabled}
            style={{ width: '100%', accentColor: 'var(--gold-moon)' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
            <span style={{ color: 'var(--washi-silk)' }}>Sky Glow Black Level</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold-moon)' }}>
              {parameters.backgroundBlackLevel}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={parameters.backgroundBlackLevel}
            onChange={(e) => updateParam('backgroundBlackLevel', Number(e.target.value))}
            disabled={disabled}
            style={{ width: '100%', accentColor: 'var(--gold-moon)' }}
          />
        </div>

        {/* Star Dehalo Toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(13, 15, 21, 0.7)',
            border: '1px solid var(--border-ink)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--washi-white)', fontWeight: 600 }}>
              Star Dehalo Mask
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--washi-muted)' }}>
              Suppresses optical blooming around bright stellar cores
            </div>
          </div>
          <input
            type="checkbox"
            checked={parameters.starDehalo}
            onChange={(e) => updateParam('starDehalo', e.target.checked)}
            disabled={disabled}
            style={{ width: '18px', height: '18px', accentColor: 'var(--gold-moon)', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Sensei's Guidance Box */}
      <div
        style={{
          marginTop: '16px',
          padding: '10px 12px',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(7, 8, 11, 0.8)',
          border: '1px dashed rgba(229, 185, 89, 0.25)',
          fontSize: '0.74rem',
          color: 'var(--washi-parchment)',
          display: 'flex',
          gap: '8px',
          alignItems: 'flex-start',
        }}
      >
        <Zap size={14} color="var(--gold-moon)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ color: 'var(--gold-moon-bright)' }}>Sensei&apos;s Wisdom:</strong> For urban telescope
          exposures with high light pollution, set Sky Glow Black Level to 50% and activate Star Dehalo to prevent halo
          washout.
        </div>
      </div>
    </div>
  );
};
