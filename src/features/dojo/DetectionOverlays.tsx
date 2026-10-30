import React from 'react';
import { X, Sparkles } from 'lucide-react';
import { CandidateObjectDetection } from '../../types';

interface DetectionOverlaysProps {
  detections: CandidateObjectDetection[];
  imageWidth: number;
  imageHeight: number;
  visible: boolean;
  onToggleVisible: () => void;
  selectedDetection: CandidateObjectDetection | null;
  onSelectDetection: (det: CandidateObjectDetection | null) => void;
}

export const DetectionOverlays: React.FC<DetectionOverlaysProps> = ({
  detections,
  imageWidth,
  imageHeight,
  visible,
  selectedDetection,
  onSelectDetection,
}) => {
  return (
    <>
      {/* Overlay Reticles Layer */}
      {visible && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 15,
          }}
        >
          {detections.map((det) => {
            const isSelected = selectedDetection?.id === det.id;
            const isStar = det.type === 'candidate_star';
            const color = isStar ? 'var(--gold-moon-bright)' : 'var(--vermilion-bright)';

            return (
              <div
                key={det.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectDetection(det);
                }}
                style={{
                  position: 'absolute',
                  left: `${det.xPercent}%`,
                  top: `${det.yPercent}%`,
                  width: `${Math.max(22, det.radiusPixels * 2)}px`,
                  height: `${Math.max(22, det.radiusPixels * 2)}px`,
                  transform: 'translate(-50%, -50%)',
                  borderRadius: '50%',
                  border: `1.5px dashed ${color}`,
                  backgroundColor: isSelected ? 'rgba(229, 185, 89, 0.25)' : 'rgba(0, 0, 0, 0.15)',
                  boxShadow: isSelected ? `0 0 14px ${color}` : `0 0 4px ${color}`,
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title={`${det.label} (Click to inspect)`}
              >
                {/* Center Crosshair */}
                <div
                  style={{
                    width: '3px',
                    height: '3px',
                    borderRadius: '50%',
                    backgroundColor: color,
                  }}
                />

                {/* Candidate Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '-18px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(7, 8, 11, 0.92)',
                    color: color,
                    border: `1px solid ${color}`,
                    borderRadius: '3px',
                    padding: '1px 5px',
                    fontSize: '0.62rem',
                    fontFamily: 'var(--font-mono)',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                  }}
                >
                  {isStar ? '★ Candidate' : '✦ Extended'}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Detection Detail Popover / Modal */}
      {selectedDetection && (
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            width: '320px',
            maxWidth: 'calc(100% - 40px)',
            backgroundColor: 'rgba(7, 8, 11, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--gold-border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            boxShadow: 'var(--shadow-sumi)',
            zIndex: 25,
            fontSize: '0.82rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="hanko-seal" style={{ fontSize: '0.65rem' }}>候補</span>
              <span style={{ fontWeight: 700, color: 'var(--gold-moon-bright)', fontSize: '0.9rem' }}>
                {selectedDetection.label}
              </span>
            </div>
            <button
              onClick={() => onSelectDetection(null)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--washi-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={15} />
            </button>
          </div>

          <div style={{ fontSize: '0.74rem', color: 'var(--washi-muted)', marginBottom: '10px' }}>
            {selectedDetection.japaneseLabel} • Candidate Astronomical Marker
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '10px' }}>
            <div className="metric-pill" style={{ padding: '6px 8px' }}>
              <span className="label">Relative Position</span>
              <span className="value">{selectedDetection.xPercent}% / {selectedDetection.yPercent}%</span>
            </div>
            <div className="metric-pill" style={{ padding: '6px 8px' }}>
              <span className="label">Pixel Coords</span>
              <span className="value">
                {Math.round((selectedDetection.xPercent / 100) * imageWidth)}, {Math.round((selectedDetection.yPercent / 100) * imageHeight)} px
              </span>
            </div>
            <div className="metric-pill" style={{ padding: '6px 8px' }}>
              <span className="label">Aperture Radius</span>
              <span className="value">~{selectedDetection.radiusPixels} px</span>
            </div>
            <div className="metric-pill" style={{ padding: '6px 8px' }}>
              <span className="label">Peak Flux / Level</span>
              <span className="value">{selectedDetection.peakBrightness} / 255</span>
            </div>
          </div>

          <p style={{ fontSize: '0.76rem', color: 'var(--washi-silk)', lineHeight: 1.5, marginBottom: '8px' }}>
            {selectedDetection.notes}
          </p>

          <div
            style={{
              padding: '6px 8px',
              borderRadius: '3px',
              backgroundColor: 'rgba(229, 185, 89, 0.08)',
              border: '1px solid rgba(229, 185, 89, 0.2)',
              fontSize: '0.68rem',
              color: 'var(--washi-parchment)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Sparkles size={12} color="var(--gold-moon)" style={{ flexShrink: 0 }} />
            <span>Honest Science Notice: Candidate classification requires photometric calibration for catalog confirmation.</span>
          </div>
        </div>
      )}
    </>
  );
};
