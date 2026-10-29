import React, { useState } from 'react';
import { Scan, UploadCloud, Eye, Info, Sparkles, Filter, Target } from 'lucide-react';
import { CelestialDetection } from '../../types';

export const SpiritLens: React.FC = () => {
  const [selectedDetection, setSelectedDetection] = useState<CelestialDetection | null>(null);
  const [filterConfidence, setFilterConfidence] = useState<number>(70);

  const mockDetections: CelestialDetection[] = [
    {
      id: 'det-01',
      label: "Orion's Belt (Mitsuboshi)",
      japaneseLabel: '三つ星 (Mitsuboshi)',
      celestialClass: 'constellation',
      confidence: 0.98,
      bbox: { x: 0.42, y: 0.44, width: 0.22, height: 0.14 },
      colorHex: '#e5b959',
      distanceLightYears: 1200,
      astronomicalNotes: 'Alnitak, Alnilam, and Mintaka - supergiant stars illuminating Orion.',
      samuraiConstellationLore: 'Adopted as the samurai crest (Kamon) of the legendary Mōri clan, symbolizing unshakeable martial brotherhood.',
    },
    {
      id: 'det-02',
      label: 'Orion Nebula (M42)',
      japaneseLabel: 'オリオン大星雲',
      celestialClass: 'nebula',
      confidence: 0.94,
      bbox: { x: 0.46, y: 0.62, width: 0.16, height: 0.18 },
      colorHex: '#d63c3c',
      distanceLightYears: 1344,
      astronomicalNotes: 'Massive diffuse stellar nursery glowing with ionized hydrogen emission.',
      samuraiConstellationLore: 'Regarded in samurai lore as the scabbard jewel of the warrior god, glowing with ethereal fire.',
    },
    {
      id: 'det-03',
      label: 'Pleiades Cluster (Subaru)',
      japaneseLabel: '昴 (Subaru)',
      celestialClass: 'star_cluster',
      confidence: 0.91,
      bbox: { x: 0.14, y: 0.18, width: 0.18, height: 0.2 },
      colorHex: '#85e3a8',
      distanceLightYears: 444,
      astronomicalNotes: 'Open star cluster containing over 1,000 stars dominated by luminous blue B-types.',
      samuraiConstellationLore: 'Mentioned in the Kojiki as the gathered beads of the celestial hair ornaments worn by Amaterasu.',
    },
    {
      id: 'det-04',
      label: 'Mars (Fire Star)',
      japaneseLabel: '火星 (Kasei)',
      celestialClass: 'planet',
      confidence: 0.89,
      bbox: { x: 0.78, y: 0.28, width: 0.1, height: 0.1 },
      colorHex: '#ff5252',
      astronomicalNotes: 'Apparent magnitude -1.8, reddish iron oxide hue.',
      samuraiConstellationLore: 'The star of tactical conquest and battle fury. Ancient generals calibrated siege timing to its ascent.',
    },
  ];

  const visibleDetections = mockDetections.filter(
    (d) => d.confidence * 100 >= filterConfidence
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div className="sumi-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="hanko-seal">霊鏡</span>
              <span className="gold-badge">
                <Scan size={12} />
                CELESTIAL VISION & OBJECT DETECTION
              </span>
            </div>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>
              Spirit Lens <span style={{ color: 'var(--gold-moon)', fontWeight: 400 }}>| 霊鏡星眼</span>
            </h1>
            <p style={{ maxWidth: '720px', fontSize: '0.92rem' }}>
              Peer through the sacred lens to identify deep-sky nebulae, martial constellations, and wandering planets.
              Overlay automated computer-vision bounding envelopes with ancient samurai celestial lore.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-samurai-gold">
              <UploadCloud size={16} />
              Upload Astrophoto
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Canvas + Detection Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Left Column: Image Canvas with Detection Overlays */}
        <div style={{ gridColumn: 'span 2', minWidth: '300px' }}>
          <div className="sumi-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={18} color="var(--gold-moon)" />
                Detected Sky Sector: Orion & Taurus Region
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--washi-muted)' }}>
                Click bounding boxes to inspect lore
              </span>
            </div>

            {/* Simulated Astrophotography Frame with Interactive Overlays */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '460px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '1px solid var(--gold-border)',
                backgroundImage: 'url("https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                boxShadow: 'var(--shadow-sumi)',
              }}
            >
              {/* Scanline Sweep Animation Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'radial-gradient(ellipse at center, transparent 40%, rgba(7, 8, 11, 0.6) 100%)',
                  pointerEvents: 'none',
                }}
              />

              {/* Render Bounding Boxes */}
              {visibleDetections.map((det) => {
                const isSelected = selectedDetection?.id === det.id;
                return (
                  <div
                    key={det.id}
                    onClick={() => setSelectedDetection(det)}
                    style={{
                      position: 'absolute',
                      left: `${det.bbox.x * 100}%`,
                      top: `${det.bbox.y * 100}%`,
                      width: `${det.bbox.width * 100}%`,
                      height: `${det.bbox.height * 100}%`,
                      border: `2px solid ${det.colorHex}`,
                      borderRadius: '4px',
                      backgroundColor: isSelected ? 'rgba(229, 185, 89, 0.25)' : 'rgba(0, 0, 0, 0.2)',
                      boxShadow: isSelected ? `0 0 16px ${det.colorHex}` : `0 0 6px ${det.colorHex}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      zIndex: isSelected ? 20 : 10,
                    }}
                  >
                    {/* Bounding Box Tag */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '-24px',
                        left: '0',
                        backgroundColor: 'rgba(7, 8, 11, 0.9)',
                        color: det.colorHex,
                        border: `1px solid ${det.colorHex}`,
                        padding: '1px 6px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        borderRadius: '3px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {det.japaneseLabel} ({(det.confidence * 100).toFixed(0)}%)
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Filter Slider */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--washi-silk)' }}>
                <Filter size={15} color="var(--gold-moon)" />
                <span>Detection Confidence Threshold:</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold-moon-bright)', fontWeight: 700 }}>
                  {filterConfidence}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                value={filterConfidence}
                onChange={(e) => setFilterConfidence(Number(e.target.value))}
                style={{ width: '200px', accentColor: 'var(--gold-moon)' }}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Object & Lore Inspector */}
        <div>
          <div className="sumi-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <Info size={18} color="var(--gold-moon)" />
              <h3 style={{ fontSize: '1.1rem' }}>Celestial Lore Codex</h3>
            </div>

            {selectedDetection ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                <div>
                  <span className="hanko-seal" style={{ marginBottom: '6px' }}>{selectedDetection.celestialClass}</span>
                  <h4 style={{ fontSize: '1.25rem', color: 'var(--gold-moon-bright)', fontFamily: 'var(--font-serif)', marginTop: '4px' }}>
                    {selectedDetection.label}
                  </h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--washi-muted)' }}>
                    {selectedDetection.japaneseLabel}
                  </div>
                </div>

                <div className="metric-pill">
                  <span className="label">Confidence Score</span>
                  <span className="value">{(selectedDetection.confidence * 100).toFixed(1)}%</span>
                </div>

                {selectedDetection.distanceLightYears && (
                  <div className="metric-pill">
                    <span className="label">Distance</span>
                    <span className="value">{selectedDetection.distanceLightYears.toLocaleString()} Light Years</span>
                  </div>
                )}

                <div>
                  <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--washi-muted)', letterSpacing: '0.08em', marginBottom: '4px' }}>
                    Astronomical Profile
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--washi-silk)' }}>
                    {selectedDetection.astronomicalNotes}
                  </p>
                </div>

                <div
                  style={{
                    marginTop: 'auto',
                    padding: '14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(214, 60, 60, 0.08)',
                    border: '1px solid var(--vermilion-border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--vermilion-bright)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                    <Sparkles size={13} />
                    Samurai Lore & Clan Crest
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--washi-white)' }}>
                    {selectedDetection.samuraiConstellationLore}
                  </p>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                  textAlign: 'center',
                  padding: '30px 10px',
                  color: 'var(--washi-muted)',
                }}
              >
                <Eye size={36} color="var(--gold-moon-dim)" style={{ marginBottom: '12px' }} />
                <p style={{ fontSize: '0.88rem' }}>
                  Select any highlighted target in the spirit view to inspect its astronomical metrics and feudal samurai legend.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
