import React, { useState, useRef } from 'react';
import { Scan, UploadCloud, Eye, Info, Sparkles, Filter, Target } from 'lucide-react';
import { CelestialDetection } from '../../types';
import { restoreAstrophoto } from './restorationService';
import { detectCelestialObjects } from './objectDetection';

export interface SpiritLensProps {
  onProcessComplete?: (data: any) => void; 
}

export const SpiritLens: React.FC<SpiritLensProps> = ({ onProcessComplete }) => {
  const [selectedDetection, setSelectedDetection] = useState<CelestialDetection | null>(null);
  const [filterConfidence, setFilterConfidence] = useState<number>(70);
  
  const [imageUrl, setImageUrl] = useState<string>('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // We start with an empty array now, because the AI will fill it!
  const [detections, setDetections] = useState<CelestialDetection[]>([]);

  const visibleDetections = detections.filter(
    (d) => d.confidence * 100 >= filterConfidence
  );

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      setDetections([]); // Clear old detections
      setSelectedDetection(null);
      
      // 1. Show the uploaded image immediately
      const localImageUrl = URL.createObjectURL(file);
      setImageUrl(localImageUrl);
      
      // 2. Call the Backend Restoration API
      console.log("Sending to restoration service...");
      const restoredData = await restoreAstrophoto(file);
      
      // Keep the local image since we aren't doing AI denoising yet
      setImageUrl(localImageUrl); 

      // 3. Use the REAL data returned from Astrometry!
      console.log("Real objects found:", restoredData.realDetections);
      
      // Fallback to fake data ONLY if Astrometry found nothing (so the demo doesn't look empty)
      const finalDetections = restoredData.realDetections?.length > 0 
        ? restoredData.realDetections 
        : await detectCelestialObjects(localImageUrl);

      setDetections(finalDetections);

      // 4. Pass the final data up to Member 1's Dashboard!
      if (onProcessComplete) {
        onProcessComplete({
          originalImageUrl: localImageUrl,
          restoredImageUrl: restoredData.restoredImageUrl || localImageUrl,
          detections: finalDetections
        });
      }

    } catch (error) {
      console.error("AI Pipeline failed:", error);
      alert("Failed to process the celestial image. Ensure the server is running.");
    } finally {
      setIsProcessing(false);
    }
  };
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
            {/* HIDDEN FILE INPUT */}
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              style={{ display: 'none' }} 
            />
            {/* TRIGGER BUTTON */}
            <button 
              className="btn-samurai-gold" 
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
            >
              <UploadCloud size={16} />
              {isProcessing ? 'Processing...' : 'Upload Astrophoto'}
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
                backgroundImage: `url("${imageUrl}")`, // DYNAMIC IMAGE URL HERE
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
                        left: '-2px',
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