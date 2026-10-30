import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Sword,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Columns,
  Eye,
  SlidersHorizontal,
  Target,
} from 'lucide-react';
import { CandidateObjectDetection } from '../../types';
import { DetectionOverlays } from './DetectionOverlays';

interface BeforeAfterViewerProps {
  originalImage: string;
  restoredImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  candidateDetections?: CandidateObjectDetection[];
  imageWidth?: number;
  imageHeight?: number;
}

export type ViewMode = 'slider' | 'side-by-side' | 'restored-only' | 'original-only';

export const BeforeAfterViewer: React.FC<BeforeAfterViewerProps> = ({
  originalImage,
  restoredImage,
  beforeLabel = 'RAW CAPTURE [粗削り]',
  afterLabel = 'RESTORED KATANA CLARITY [研磨済]',
  candidateDetections = [],
  imageWidth = 1200,
  imageHeight = 800,
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('slider');

  // Zoom & Pan state
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Candidate Overlays state
  const [showDetections, setShowDetections] = useState<boolean>(false);
  const [selectedDetection, setSelectedDetection] = useState<CandidateObjectDetection | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Slider Dragging
  const handleSliderMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const clampedPercentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(clampedPercentage);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingSlider) {
      handleSliderMove(e.clientX);
    } else if (isPanning && zoomLevel > 1) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDraggingSlider && e.touches[0]) {
      handleSliderMove(e.touches[0].clientX);
    } else if (isPanning && zoomLevel > 1 && e.touches[0]) {
      setPanOffset({
        x: e.touches[0].clientX - panStart.x,
        y: e.touches[0].clientY - panStart.y,
      });
    }
  };

  const stopAllInteraction = () => {
    setIsDraggingSlider(false);
    setIsPanning(false);
  };

  const handleMouseDownImage = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsPanning(true);
      setPanStart({
        x: e.clientX - panOffset.x,
        y: e.clientY - panOffset.y,
      });
    }
  };

  const handleTouchStartImage = (e: React.TouchEvent) => {
    if (zoomLevel > 1 && e.touches[0]) {
      setIsPanning(true);
      setPanStart({
        x: e.touches[0].clientX - panOffset.x,
        y: e.touches[0].clientY - panOffset.y,
      });
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(4, +(prev + 0.5).toFixed(1)));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(1, +(prev - 0.5).toFixed(1));
      if (next === 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setSliderPosition(50);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const transformStyle: React.CSSProperties = {
    transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
    transformOrigin: 'center center',
    transition: isPanning ? 'none' : 'transform 0.15s ease-out',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Top Toolbar: View Mode Tabs + Zoom & Reset Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          backgroundColor: 'rgba(13, 15, 21, 0.75)',
          padding: '8px 12px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-ink)',
        }}
      >
        {/* Left: View Mode Switches */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {[
            { id: 'slider', label: 'Slider', icon: SlidersHorizontal },
            { id: 'side-by-side', label: 'Side-by-Side', icon: Columns },
            { id: 'restored-only', label: 'Restored', icon: Eye },
            { id: 'original-only', label: 'Original', icon: Eye },
          ].map((mode) => {
            const isSelected = viewMode === mode.id;
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id as ViewMode)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isSelected ? 'rgba(229, 185, 89, 0.15)' : 'transparent',
                  border: isSelected ? '1px solid var(--gold-moon)' : '1px solid transparent',
                  color: isSelected ? 'var(--gold-moon-bright)' : 'var(--washi-muted)',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: isSelected ? 600 : 400,
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={13} />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Zoom & Overlay Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Candidate Detection Toggle */}
          {candidateDetections.length > 0 && (
            <button
              onClick={() => setShowDetections(!showDetections)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 9px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: showDetections ? 'rgba(133, 227, 168, 0.15)' : 'rgba(20, 23, 34, 0.6)',
                border: showDetections ? '1px solid var(--bamboo-jade)' : '1px solid var(--border-ink)',
                color: showDetections ? '#85e3a8' : 'var(--washi-muted)',
                fontSize: '0.76rem',
                cursor: 'pointer',
              }}
              title="Toggle Candidate Celestial Object Overlays"
            >
              <Target size={13} />
              <span>Candidates ({candidateDetections.length})</span>
            </button>
          )}

          {/* Zoom Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', backgroundColor: 'var(--ink-900)', borderRadius: 'var(--radius-sm)', padding: '2px', border: '1px solid var(--border-ink)' }}>
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
              style={{
                background: 'none',
                border: 'none',
                color: zoomLevel <= 1 ? 'var(--washi-dim)' : 'var(--washi-silk)',
                cursor: zoomLevel <= 1 ? 'not-allowed' : 'pointer',
                padding: '4px 6px',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Zoom Out"
            >
              <ZoomOut size={14} />
            </button>

            <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', padding: '0 6px', color: 'var(--gold-moon)' }}>
              {Math.round(zoomLevel * 100)}%
            </span>

            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 4}
              style={{
                background: 'none',
                border: 'none',
                color: zoomLevel >= 4 ? 'var(--washi-dim)' : 'var(--washi-silk)',
                cursor: zoomLevel >= 4 ? 'not-allowed' : 'pointer',
                padding: '4px 6px',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Zoom In"
            >
              <ZoomIn size={14} />
            </button>
          </div>

          {/* Reset Zoom */}
          <button
            onClick={handleResetZoom}
            style={{
              padding: '5px 8px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(20, 23, 34, 0.6)',
              border: '1px solid var(--border-ink)',
              color: 'var(--washi-silk)',
              fontSize: '0.74rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title="Reset Zoom & Pan"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            style={{
              padding: '5px 8px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(20, 23, 34, 0.6)',
              border: '1px solid var(--border-ink)',
              color: 'var(--washi-silk)',
              fontSize: '0.74rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Comparison'}
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div
        ref={containerRef}
        onMouseUp={stopAllInteraction}
        onMouseLeave={stopAllInteraction}
        onMouseMove={handleMouseMove}
        onTouchEnd={stopAllInteraction}
        onTouchMove={handleTouchMove}
        style={{
          position: 'relative',
          width: '100%',
          height: isFullscreen ? 'calc(100vh - 40px)' : '480px',
          overflow: 'hidden',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--gold-border)',
          boxShadow: 'var(--shadow-sumi)',
          backgroundColor: 'var(--ink-950)',
          userSelect: 'none',
          cursor: isPanning ? 'grabbing' : zoomLevel > 1 ? 'grab' : isDraggingSlider ? 'ew-resize' : 'default',
        }}
        onMouseDown={handleMouseDownImage}
        onTouchStart={handleTouchStartImage}
      >
        {/* VIEW MODE 1: INTERACTIVE BLADE SLIDER */}
        {viewMode === 'slider' && (
          <>
            {/* After (Restored) Image in Background */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                ...transformStyle,
              }}
            >
              <img
                src={restoredImage}
                alt="Restored Celestial View"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
              <DetectionOverlays
                detections={candidateDetections}
                imageWidth={imageWidth}
                imageHeight={imageHeight}
                visible={showDetections}
                onToggleVisible={() => setShowDetections(!showDetections)}
                selectedDetection={selectedDetection}
                onSelectDetection={setSelectedDetection}
              />
            </div>

            {/* Restored Label Badge */}
            <div
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(7, 8, 11, 0.88)',
                border: '1px solid var(--bamboo-jade)',
                color: '#85e3a8',
                padding: '4px 10px',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                borderRadius: '4px',
                fontFamily: 'var(--font-mono)',
                pointerEvents: 'none',
                zIndex: 12,
              }}
            >
              {afterLabel}
            </div>

            {/* Before (Original) Image Clipped Layer */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: `${sliderPosition}%`,
                height: '100%',
                overflow: 'hidden',
                borderRight: '2px solid var(--gold-moon-bright)',
                zIndex: 10,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
                  height: '100%',
                  ...transformStyle,
                }}
              >
                <img
                  src={originalImage}
                  alt="Raw Celestial View"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              </div>
            </div>

            {/* Raw Label Badge */}
            <div
              style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                background: 'rgba(7, 8, 11, 0.88)',
                border: '1px solid var(--vermilion)',
                color: 'var(--vermilion-bright)',
                padding: '4px 10px',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                borderRadius: '4px',
                fontFamily: 'var(--font-mono)',
                pointerEvents: 'none',
                zIndex: 12,
              }}
            >
              {beforeLabel}
            </div>

            {/* Draggable Katana Divider Handle */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: `${sliderPosition}%`,
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 20,
              }}
            >
              <div
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setIsDraggingSlider(true);
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  setIsDraggingSlider(true);
                }}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--ink-900)',
                  border: '2px solid var(--gold-moon-bright)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 16px var(--gold-glow), 0 0 6px #000',
                  cursor: 'ew-resize',
                  transition: 'transform 0.1s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <Sword size={18} color="var(--gold-moon-bright)" style={{ transform: 'rotate(-45deg)' }} />
              </div>
            </div>
          </>
        )}

        {/* VIEW MODE 2: SIDE-BY-SIDE */}
        {viewMode === 'side-by-side' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', width: '100%', height: '100%',  }}>
            <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', borderRight: '1px solid var(--border-ink)' }}>
              <div style={{ width: '100%', height: '100%', ...transformStyle }}>
                <img src={originalImage} alt="Raw View" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(7, 8, 11, 0.88)', border: '1px solid var(--vermilion)', color: 'var(--vermilion-bright)', padding: '3px 8px', fontSize: '0.7rem', fontWeight: 700, borderRadius: '4px' }}>
                {beforeLabel}
              </div>
            </div>

            <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '100%', ...transformStyle }}>
                <img src={restoredImage} alt="Restored View" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                <DetectionOverlays
                  detections={candidateDetections}
                  imageWidth={imageWidth}
                  imageHeight={imageHeight}
                  visible={showDetections}
                  onToggleVisible={() => setShowDetections(!showDetections)}
                  selectedDetection={selectedDetection}
                  onSelectDetection={setSelectedDetection}
                />
              </div>
              <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(7, 8, 11, 0.88)', border: '1px solid var(--bamboo-jade)', color: '#85e3a8', padding: '3px 8px', fontSize: '0.7rem', fontWeight: 700, borderRadius: '4px' }}>
                {afterLabel}
              </div>
            </div>
          </div>
        )}

        {/* VIEW MODE 3: RESTORED ONLY */}
        {viewMode === 'restored-only' && (
          <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '100%', ...transformStyle }}>
              <img src={restoredImage} alt="Restored View" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              <DetectionOverlays
                detections={candidateDetections}
                imageWidth={imageWidth}
                imageHeight={imageHeight}
                visible={showDetections}
                onToggleVisible={() => setShowDetections(!showDetections)}
                selectedDetection={selectedDetection}
                onSelectDetection={setSelectedDetection}
              />
            </div>
            <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(7, 8, 11, 0.88)', border: '1px solid var(--bamboo-jade)', color: '#85e3a8', padding: '4px 10px', fontSize: '0.72rem', fontWeight: 700, borderRadius: '4px' }}>
              {afterLabel}
            </div>
          </div>
        )}

        {/* VIEW MODE 4: ORIGINAL ONLY */}
        {viewMode === 'original-only' && (
          <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '100%', ...transformStyle }}>
              <img src={originalImage} alt="Raw View" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(7, 8, 11, 0.88)', border: '1px solid var(--vermilion)', color: 'var(--vermilion-bright)', padding: '4px 10px', fontSize: '0.72rem', fontWeight: 700, borderRadius: '4px' }}>
              {beforeLabel}
            </div>
          </div>
        )}
      </div>

      {/* Guidance Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', color: 'var(--washi-muted)', padding: '0 4px' }}>
        <span>
          {viewMode === 'slider' ? 'Drag the golden katana emblem horizontally to inspect before and after clarity.' : 'Use zoom and pan to inspect stellar profiles across the frame.'}
        </span>
        {zoomLevel > 1 && (
          <span style={{ color: 'var(--gold-moon-bright)' }}>
            Zoom Active: Click and drag image to pan across celestial realm
          </span>
        )}
      </div>
    </div>
  );
};
