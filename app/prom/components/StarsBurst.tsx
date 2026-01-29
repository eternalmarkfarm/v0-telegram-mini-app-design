"use client";

import { useEffect, useRef } from "react";

type StarsBurstProps = {
  className?: string;
  starClassName?: string;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ax: number;
  ay: number;
  t: number;
  life: number;
  size: number;
  rot: number;
  spin: number;
  hue: number;
  sat: number;
  light: number;
};

export default function StarsBurst({ className, starClassName }: StarsBurstProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const CFG = {
      spawnPerSec: 12,
      burstCount: 26,
      speedMin: 28,
      speedMax: 90,
      sizeMin: 4,
      sizeMax: 10,
      lifeMin: 0.8,
      lifeMax: 1.4,
      originJitter: 10,
      gravity: 60,
      spinMin: -4,
      spinMax: 4,
    };

    let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    let w = 0;
    let h = 0;
    const particles: Particle[] = [];
    let last = performance.now();
    let spawnAcc = 0;
    let rafId = 0;

    const resize = () => {
      const rect = root.getBoundingClientRect();
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(root);
    resize();

    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

    const addParticle = (x: number, y: number, burst = false) => {
      const ang = rand(-Math.PI * 0.15, Math.PI * 1.15);
      const spd = burst ? rand(CFG.speedMin * 1.05, CFG.speedMax * 1.25) : rand(CFG.speedMin, CFG.speedMax);
      const vx = Math.cos(ang) * spd;
      const vy = Math.sin(ang) * spd * -1;
      const life = rand(CFG.lifeMin, CFG.lifeMax);
      const size = rand(CFG.sizeMin, CFG.sizeMax);
      const rot = rand(0, Math.PI * 2);
      const spin = rand(CFG.spinMin, CFG.spinMax);
      const hue = rand(42, 52);
      const sat = rand(90, 100);
      const light = rand(55, 62);

      particles.push({
        x,
        y,
        vx,
        vy,
        ax: 0,
        ay: CFG.gravity,
        t: 0,
        life,
        size,
        rot,
        spin,
        hue,
        sat,
        light,
      });
    };

    const starPath = (rOuter: number, rInner: number, points = 5) => {
      const step = Math.PI / points;
      ctx.beginPath();
      for (let i = 0; i < 2 * points; i++) {
        const r = i % 2 === 0 ? rOuter : rInner;
        const a = i * step - Math.PI / 2;
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    };

    const drawParticle = (p: Particle) => {
      const k = p.t / p.life;
      const easeOut = 1 - Math.pow(1 - clamp(k, 0, 1), 3);
      const a = k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 0.85;
      const alpha = clamp(a, 0, 1) * 0.95;
      const s = p.size * (0.85 + 0.35 * Math.sin(easeOut * Math.PI));

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.shadowBlur = 10;
      ctx.shadowColor = `hsla(${p.hue} ${p.sat}% ${p.light}% / ${alpha})`;
      ctx.fillStyle = `hsla(${p.hue} ${p.sat}% ${p.light}% / ${alpha})`;
      ctx.strokeStyle = `hsla(${p.hue} ${p.sat}% ${p.light}% / ${alpha})`;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      starPath(s, s * 0.45, 5);
      ctx.fill();
      ctx.lineWidth = Math.max(1, s * 0.25);
      ctx.stroke();
      ctx.restore();
    };

    const tick = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;

      const cx = w * 0.5;
      const cy = h * 0.52;

      spawnAcc += CFG.spawnPerSec * dt;
      while (spawnAcc >= 1) {
        spawnAcc -= 1;
        addParticle(cx + rand(-CFG.originJitter, CFG.originJitter), cy + rand(-CFG.originJitter, CFG.originJitter), false);
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.t += dt;
        if (p.t >= p.life) {
          particles.splice(i, 1);
          continue;
        }
        p.vx += p.ax * dt;
        p.vy += p.ay * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.spin * dt;
      }

      ctx.clearRect(0, 0, w, h);
      for (const p of particles) drawParticle(p);

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    const handlePointer = () => {
      const cx = w * 0.5;
      const cy = h * 0.52;
      for (let i = 0; i < CFG.burstCount; i++) {
        addParticle(
          cx + rand(-CFG.originJitter * 1.2, CFG.originJitter * 1.2),
          cy + rand(-CFG.originJitter * 1.2, CFG.originJitter * 1.2),
          true,
        );
      }
    };

    root.addEventListener("pointerdown", handlePointer, { passive: true });

    return () => {
      root.removeEventListener("pointerdown", handlePointer);
      resizeObserver.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div ref={rootRef} className={`relative grid place-items-center overflow-visible ${className ?? ""}`}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full pointer-events-none" />
      <svg
        className={`relative z-10 drop-shadow-[0_6px_18px_rgba(0,0,0,0.12)] ${starClassName ?? "h-20 w-20"}`}
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <g transform="translate(7 7) scale(0.86)">
          <path
            d="M50 6 L62 36 L94 38 L69 58 L77 90 L50 72 L23 90 L31 58 L6 38 L38 36 Z"
            fill="#FFC83D"
            stroke="#FFC83D"
            strokeWidth="12"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}
