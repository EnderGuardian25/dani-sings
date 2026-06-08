"use client";

/**
 * Watercolour-wash background — scroll-driven warm colour arc + spring-physics parallax orbs.
 *
 * Background interpolates through a warm-to-cool-to-warm arc as the user scrolls,
 * mirroring the page's emotional journey: blush anticipation → dreamy mauve → grounded warmth.
 *
 * Orb spring tuning:
 *   ζ < 1 (underdamped) → overshoot + settle = the "bubbly" effect
 *   Deep blush  ζ ≈ 1.30 — overdamped, stable anchor
 *   Mid rose    ζ ≈ 1.07 — just barely damped
 *   Salmon bleed ζ ≈ 0.69 — the main bubbly star
 *   Mauve wisp  ζ ≈ 0.80 — gentle float
 */

import { useEffect, useState } from "react";
import { useMotionValue, useTransform, useSpring, motion } from "framer-motion";

type RGB = [number, number, number];

const scrollStops: { progress: number; color: RGB }[] = [
  { progress: 0,    color: [240, 230, 226] }, // warm blush-cream
  { progress: 0.2,  color: [232, 212, 204] }, // soft petal pink
  { progress: 0.4,  color: [212, 192, 204] }, // warm mauve blush
  { progress: 0.6,  color: [200, 184, 212] }, // dusty mauve (only cool note)
  { progress: 0.75, color: [216, 200, 220] }, // muted blush-lavender
  { progress: 0.9,  color: [237, 224, 220] }, // warm parchment blush
  { progress: 1.0,  color: [240, 232, 228] }, // cream-rose
];

function interpolateColor(progress: number): string {
  const clamped = Math.max(0, Math.min(1, progress));
  let lo = scrollStops[0];
  let hi = scrollStops[scrollStops.length - 1];
  for (let i = 0; i < scrollStops.length - 1; i++) {
    if (clamped >= scrollStops[i].progress && clamped <= scrollStops[i + 1].progress) {
      lo = scrollStops[i];
      hi = scrollStops[i + 1];
      break;
    }
  }
  const range = hi.progress - lo.progress;
  const t = range === 0 ? 0 : (clamped - lo.progress) / range;
  const r = Math.round(lo.color[0] + (hi.color[0] - lo.color[0]) * t);
  const g = Math.round(lo.color[1] + (hi.color[1] - lo.color[1]) * t);
  const b = Math.round(lo.color[2] + (hi.color[2] - lo.color[2]) * t);
  return `rgb(${r},${g},${b})`;
}

export default function Ambience() {
  const scrollY = useMotionValue(0);
  const [bgColor, setBgColor] = useState(() => interpolateColor(0));

  useEffect(() => {
    const onScroll = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollY.set(window.scrollY);
      setBgColor(interpolateColor(window.scrollY / maxScroll));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollY]);

  // ── Raw scroll targets ──────────────────────────────────────────────────
  const yVioletRaw = useTransform(scrollY, (v) => v *  0.04);
  const yMidRaw    = useTransform(scrollY, (v) => v * -0.03);
  const yPinkRaw   = useTransform(scrollY, (v) => v * -0.12);
  const xPinkRaw   = useTransform(scrollY, (v) => v * -0.02);
  const yWispRaw   = useTransform(scrollY, (v) => v * -0.08);
  const xWispRaw   = useTransform(scrollY, (v) => v *  0.015);

  // ── Spring-smoothed positions ───────────────────────────────────────────
  const yViolet = useSpring(yVioletRaw, { stiffness: 80,  damping: 23, mass: 0.9 });
  const yMid    = useSpring(yMidRaw,    { stiffness: 70,  damping: 18, mass: 1.0 });
  const yPink   = useSpring(yPinkRaw,   { stiffness: 50,  damping: 12, mass: 1.5 });
  const xPink   = useSpring(xPinkRaw,   { stiffness: 50,  damping: 12, mass: 1.5 });
  const yWisp   = useSpring(yWispRaw,   { stiffness: 60,  damping: 14, mass: 1.2 });
  const xWisp   = useSpring(xWispRaw,   { stiffness: 60,  damping: 14, mass: 1.2 });

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">

      {/* ── Scroll-driven warm background wash ── */}
      <div
        className="absolute inset-0"
        style={{ background: bgColor, transition: "background 120ms linear" }}
      />

      {/* ── Deep blush orb — stable anchor, top-left ── */}
      <motion.div
        className="absolute rounded-full"
        style={{
          y: yViolet,
          width: "90%",
          height: "80%",
          left: "-22%",
          top: "-28%",
          background: "rgba(196, 140, 160, 0.42)",
          filter: "blur(100px)",
        }}
      />

      {/* ── Mid rose orb — upper body warmth ── */}
      <motion.div
        className="absolute rounded-full"
        style={{
          y: yMid,
          width: "65%",
          height: "55%",
          left: "12%",
          top: "-12%",
          background: "rgba(220, 160, 170, 0.30)",
          filter: "blur(90px)",
        }}
      />

      {/* ── Salmon bleed orb — the bubbly parallax star ── */}
      <motion.div
        className="absolute rounded-full"
        style={{
          y: yPink,
          x: xPink,
          width: "82%",
          height: "72%",
          left: "22%",
          bottom: "-18%",
          background: "rgba(237, 180, 168, 0.55)",
          filter: "blur(110px)",
        }}
      />

      {/* ── Mauve wisp — right side float ── */}
      <motion.div
        className="absolute rounded-full"
        style={{
          y: yWisp,
          x: xWisp,
          width: "46%",
          height: "62%",
          right: "-8%",
          top: "28%",
          background: "rgba(197, 184, 216, 0.34)",
          filter: "blur(90px)",
        }}
      />

      {/* ── Paper grain — subtle watercolour texture, static ── */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />
    </div>
  );
}
