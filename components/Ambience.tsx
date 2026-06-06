"use client";

/**
 * Watercolour-wash background — orbs with spring-physics parallax.
 * Each orb lags behind scroll and overshoots slightly when scrolling stops,
 * giving a bubbly, momentum-draining feel.
 *
 * Spring tuning:
 *   stiffness — how snappily it chases the target   (lower = more lag)
 *   damping   — how quickly oscillation dies        (lower = more bounce)
 *   mass      — virtual inertia                     (higher = more delay)
 *   ζ < 1 (underdamped) → overshoot + settle = the "bubbly" effect
 */

import { useEffect } from "react";
import { useMotionValue, useTransform, useSpring, motion } from "framer-motion";

export default function Ambience() {
  const scrollY = useMotionValue(0);

  useEffect(() => {
    const onScroll = () => scrollY.set(window.scrollY);
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

  // ── Spring-smoothed positions (each orb has its own weight / bounce) ────
  //   ζ = damping / (2 × √(stiffness × mass))   |  ζ < 1 → underdamped (bouncy)
  //
  //   Deep violet  ζ ≈ 1.30 — overdamped, stable anchor at the top
  //   Mid violet   ζ ≈ 1.07 — just barely damped, subtle settle
  //   Pink bleed   ζ ≈ 0.69 — clearly underdamped, the main bubbly star
  //   Right wisp   ζ ≈ 0.80 — gently underdamped, follows with a float
  const yViolet = useSpring(yVioletRaw, { stiffness: 80,  damping: 23, mass: 0.9 });
  const yMid    = useSpring(yMidRaw,    { stiffness: 70,  damping: 18, mass: 1.0 });
  const yPink   = useSpring(yPinkRaw,   { stiffness: 50,  damping: 12, mass: 1.5 });
  const xPink   = useSpring(xPinkRaw,   { stiffness: 50,  damping: 12, mass: 1.5 });
  const yWisp   = useSpring(yWispRaw,   { stiffness: 60,  damping: 14, mass: 1.2 });
  const xWisp   = useSpring(xWispRaw,   { stiffness: 60,  damping: 14, mass: 1.2 });

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">

      {/* ── Base fill: rich saturated lavender ── */}
      <div className="absolute inset-0" style={{ background: "#A090C8" }} />

      {/* ── Deep violet orb — stable anchor, top-left ── */}
      <motion.div
        className="absolute rounded-full"
        style={{
          y: yViolet,
          width: "90%",
          height: "80%",
          left: "-22%",
          top: "-28%",
          background: "rgba(72, 48, 140, 0.72)",
          filter: "blur(100px)",
        }}
      />

      {/* ── Mid-violet orb — upper body richness ── */}
      <motion.div
        className="absolute rounded-full"
        style={{
          y: yMid,
          width: "65%",
          height: "55%",
          left: "12%",
          top: "-12%",
          background: "rgba(105, 84, 168, 0.40)",
          filter: "blur(90px)",
        }}
      />

      {/* ── Pink bleed orb — the bubbly parallax star ── */}
      <motion.div
        className="absolute rounded-full"
        style={{
          y: yPink,
          x: xPink,
          width: "82%",
          height: "72%",
          left: "22%",
          bottom: "-18%",
          background: "rgba(215, 158, 198, 0.62)",
          filter: "blur(110px)",
        }}
      />

      {/* ── Secondary pink wisp — right side float ── */}
      <motion.div
        className="absolute rounded-full"
        style={{
          y: yWisp,
          x: xWisp,
          width: "46%",
          height: "62%",
          right: "-8%",
          top: "28%",
          background: "rgba(220, 168, 208, 0.40)",
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
