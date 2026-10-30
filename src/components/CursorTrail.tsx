import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
  glowColor: string;
  isStar: boolean;
  rotation: number;
  rotationSpeed: number;
}

// Tsukuyomi Watch palette: Antique Celestial Gold, Moonlit Silver/Washi, and Restrained Vermilion
const TSUSKUYOMI_PARTICLE_COLORS = [
  { fill: '#f7d774', glow: 'rgba(247, 215, 116, 0.45)' }, // Celestial Gold
  { fill: '#e5c158', glow: 'rgba(229, 193, 88, 0.4)' },  // Moon Gold
  { fill: '#ffd700', glow: 'rgba(255, 215, 0, 0.45)' },  // Pure Gold
  { fill: '#fff8db', glow: 'rgba(255, 248, 219, 0.5)' }, // Moonlit Washi
  { fill: '#ffffff', glow: 'rgba(255, 255, 255, 0.45)' }, // Star Diamond White
  { fill: '#c53d34', glow: 'rgba(197, 61, 52, 0.35)' },  // Restrained Vermilion
  { fill: '#d9534f', glow: 'rgba(217, 83, 79, 0.35)' },  // Cinnabar Glint
];

/**
 * Ultra-smooth, zero-lag celestial cursor trail.
 * Avoids expensive canvas shadowBlur to guarantee high 60-120 FPS performance.
 */
export const CursorTrail: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let lastX = -1;
    let lastY = -1;
    let lastTime = 0;

    const addParticles = (x: number, y: number, count: number) => {
      // Keep maximum particle count bounded to ensure zero lag
      if (particles.length > 55) {
        particles.splice(0, particles.length - 45);
      }

      for (let i = 0; i < count; i++) {
        const palette =
          TSUSKUYOMI_PARTICLE_COLORS[
            Math.floor(Math.random() * TSUSKUYOMI_PARTICLE_COLORS.length)
          ];
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.4 + 0.3;
        const isStar = Math.random() > 0.6;
        const size = Math.random() * 2.8 + 1.2;

        particles.push({
          x: x + (Math.random() - 0.5) * 4,
          y: y + (Math.random() - 0.5) * 4,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed + 0.25, // Gentle celestial falling drift
          size,
          alpha: 0.95,
          decay: Math.random() * 0.028 + 0.022, // Fades smoothly in ~35-45 frames
          color: palette.fill,
          glowColor: palette.glow,
          isStar,
          rotation: Math.random() * Math.PI,
          rotationSpeed: (Math.random() - 0.5) * 0.15,
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      const x = e.clientX;
      const y = e.clientY;

      if (lastX === -1) {
        lastX = x;
        lastY = y;
        lastTime = now;
        return;
      }

      // Throttle by distance & minimum time (12ms) to prevent event storm
      const dist = Math.hypot(x - lastX, y - lastY);
      if (dist < 8 && now - lastTime < 16) return;

      const emitCount = Math.min(Math.floor(dist / 14) + 1, 3);
      addParticles(x, y, emitCount);

      lastX = x;
      lastY = y;
      lastTime = now;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        addParticles(touch.clientX, touch.clientY, 2);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Draw diamond 4-point Japanese stardust sparkle without expensive shadow blur
    const drawDiamondStar = (cx: number, cy: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 1.6);
      ctx.quadraticCurveTo(cx, cy, cx + r * 1.6, cy);
      ctx.quadraticCurveTo(cx, cy, cx, cy + r * 1.6);
      ctx.quadraticCurveTo(cx, cy, cx - r * 1.6, cy);
      ctx.quadraticCurveTo(cx, cy, cx, cy - r * 1.6);
      ctx.closePath();
      ctx.fill();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const len = particles.length;
      for (let i = len - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        p.size *= 0.98;
        p.rotation += p.rotationSpeed;

        if (p.alpha <= 0.02 || p.size <= 0.4) {
          particles.splice(i, 1);
          continue;
        }

        const alpha = Math.max(0, p.alpha);

        // Faint outer celestial aura (fast circular halo, NO shadowBlur!)
        ctx.globalAlpha = alpha * 0.22;
        ctx.fillStyle = p.glowColor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Inner bright stardust core
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;

        if (p.isStar) {
          drawDiamondStar(p.x, p.y, p.size);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 99999,
      }}
    />
  );
};
