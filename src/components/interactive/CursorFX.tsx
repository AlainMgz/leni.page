import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  alpha: number;
}

// Tight violet/indigo palette — subtle shade variations only
const COLORS = [
  '139,92,246',   // violet
  '124,82,230',   // violet darker
  '155,110,250',  // violet lighter
  '109,72,216',   // indigo deep
];

export default function CursorFX() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const lastEmit = useRef<number>(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    const onMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastEmit.current < 25) return;
      lastEmit.current = now;

      const count = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < count; i++) {
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        particles.current.push({
          x: e.clientX + (Math.random() - 0.5) * 4,
          y: e.clientY + (Math.random() - 0.5) * 4,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4 - 0.2,
          life: 1,
          maxLife: 0.5 + Math.random() * 0.5,
          size: 1.8 + Math.random() * 1,
          alpha: 0,
        });
      }

      if (particles.current.length > 100) {
        particles.current = particles.current.slice(-100);
      }
    };

    window.addEventListener('mousemove', onMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.current = particles.current.filter(p => p.life > 0);

      for (const p of particles.current) {
        p.x   += p.vx;
        p.y   += p.vy;
        p.vy  += 0.008;
        p.life -= 1 / (p.maxLife * 60);

        const alpha = Math.max(0, p.life * 0.45);
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * Math.max(0, p.life), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},${alpha.toFixed(3)})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="cursor-canvas"
    />
  );
}
