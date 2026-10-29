import React, { useState, useRef, useCallback } from 'react';
import { Sword } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage?: string;
  afterImage?: string;
  beforeLabel?: string;
  afterLabel?: string;
  initialPosition?: number;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage = 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=40', // Grainy night sky
  afterImage = 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=90',  // Crystal clear night sky
  beforeLabel = 'RAW CAPTURE [粗削り]',
  afterLabel = 'RESTORED KATANA CLARITY [研磨済]',
  initialPosition = 50,
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(initialPosition);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const clampedPercentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(clampedPercentage);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={() => setIsDragging(true)}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onMouseMove={handleMouseMove}
      onTouchStart={() => setIsDragging(true)}
      onTouchEnd={() => setIsDragging(false)}
      onTouchMove={handleTouchMove}
      style={{
        position: 'relative',
        width: '100%',
        height: '420px',
        overflow: 'hidden',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--gold-border)',
        boxShadow: 'var(--shadow-sumi)',
        cursor: isDragging ? 'ew-resize' : 'default',
        userSelect: 'none',
        backgroundColor: 'var(--ink-950)',
      }}
    >
      {/* "After" Image (Full background) */}
      <img
        src={afterImage}
        alt="Restored Celestial View"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'contrast(1.2) brightness(1.1) saturate(1.2)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: 'rgba(7, 8, 11, 0.85)',
          border: '1px solid var(--bamboo-jade)',
          color: '#85e3a8',
          padding: '4px 10px',
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          borderRadius: '4px',
          fontFamily: 'var(--font-mono)',
          pointerEvents: 'none',
        }}
      >
        {afterLabel}
      </div>

      {/* "Before" Image (Clipped on top) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${sliderPosition}%`,
          height: '100%',
          overflow: 'hidden',
          borderRight: '2px solid var(--gold-moon-bright)',
        }}
      >
        <img
          src={beforeImage}
          alt="Raw Celestial View"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
            height: '100%',
            maxWidth: 'none',
            objectFit: 'cover',
            filter: 'contrast(0.8) brightness(0.7) blur(0.6px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            background: 'rgba(7, 8, 11, 0.85)',
            border: '1px solid var(--vermilion)',
            color: 'var(--vermilion-bright)',
            padding: '4px 10px',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            borderRadius: '4px',
            fontFamily: 'var(--font-mono)',
            pointerEvents: 'none',
          }}
        >
          {beforeLabel}
        </div>
      </div>

      {/* Slider Katana Handle Divider */}
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
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--ink-900)',
            border: '2px solid var(--gold-moon)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 14px var(--gold-glow), 0 0 4px #000',
            cursor: 'ew-resize',
            pointerEvents: 'auto',
          }}
        >
          <Sword size={16} color="var(--gold-moon-bright)" style={{ transform: 'rotate(-45deg)' }} />
        </div>
      </div>
    </div>
  );
};
