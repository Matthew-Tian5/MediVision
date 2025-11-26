
import React, { useEffect, useRef } from 'react';

export const HexagonCursor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Array<{x: number, y: number, size: number, opacity: number, rotation: number}>>([]);
  
  // Use a ref for mouse position to avoid re-renders
  const mouse = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      
      // Spawn a new particle on move
      particles.current.push({
        x: e.clientX,
        y: e.clientY,
        size: 8 + Math.random() * 8, // Smaller size
        opacity: 0.25, // Much lower initial opacity (was 0.6)
        rotation: Math.random() * Math.PI * 2
      });
    };
    window.addEventListener('mousemove', handleMouseMove);

    const drawHexagon = (x: number, y: number, size: number, rotation: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = rotation + (i * Math.PI) / 3;
        const hx = x + size * Math.cos(angle);
        const hy = y + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        
        // Update physics
        p.opacity -= 0.008; // Slower fade out for longer, subtle trail
        p.size *= 0.96;
        p.rotation += 0.01;

        if (p.opacity <= 0 || p.size < 0.5) {
          particles.current.splice(i, 1);
          continue;
        }

        // Draw
        ctx.strokeStyle = `rgba(0, 113, 227, ${p.opacity})`; // Apple Blue
        ctx.lineWidth = 1;
        drawHexagon(p.x, p.y, p.size, p.rotation);
        ctx.stroke();

        // Optional fill - very subtle
        ctx.fillStyle = `rgba(0, 113, 227, ${p.opacity * 0.02})`;
        ctx.fill();
      }

      requestAnimationFrame(animate);
    };
    
    const animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: 'multiply' }}
    />
  );
};
