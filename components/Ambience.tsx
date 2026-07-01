"use client";

/**
 * Shader-gradient background — scroll-driven warm colour arc rendered via WebGL.
 *
 * A `waterPlane` shader gradient blends 3 colours that shift as the user scrolls,
 * mirroring the page's emotional journey: blush anticipation → dreamy mauve → grounded warmth.
 * Colours are derived from the same muted-pastel family as the original CSS wash so
 * text/glass-panel contrast (documented in HANDOFF.md) is unaffected.
 */

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";

const ShaderBackground = dynamic(() => import("./ShaderBackground"), {
  ssr: false,
  loading: () => null,
});

type RGB = [number, number, number];

const scrollStops: { progress: number; color1: RGB; color2: RGB; color3: RGB }[] = [
  { progress: 0,    color1: [250, 240, 234], color2: [244, 224, 222], color3: [232, 190, 214] }, // warm blush-cream
  { progress: 0.2,  color1: [248, 220, 210], color2: [238, 200, 206], color3: [222, 172, 206] }, // soft petal pink
  { progress: 0.4,  color1: [238, 206, 216], color2: [220, 182, 208], color3: [206, 160, 210] }, // warm mauve blush
  { progress: 0.6,  color1: [228, 198, 226], color2: [206, 176, 224], color3: [190, 176, 224] }, // dusty mauve (only cool note)
  { progress: 0.75, color1: [236, 208, 234], color2: [220, 192, 230], color3: [204, 168, 226] }, // muted blush-lavender
  { progress: 0.9,  color1: [248, 228, 228], color2: [240, 214, 218], color3: [222, 186, 216] }, // warm parchment blush
  { progress: 1.0,  color1: [250, 238, 234], color2: [244, 222, 224], color3: [228, 192, 216] }, // cream-rose
];

function rgbToHex([r, g, b]: RGB): string {
  const toHex = (c: number) => Math.round(c).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function lerpColor(a: RGB, b: RGB, t: number): RGB {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

function interpolateColors(progress: number): { color1: string; color2: string; color3: string } {
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
  return {
    color1: rgbToHex(lerpColor(lo.color1, hi.color1, t)),
    color2: rgbToHex(lerpColor(lo.color2, hi.color2, t)),
    color3: rgbToHex(lerpColor(lo.color3, hi.color3, t)),
  };
}

export default function Ambience() {
  const reduce = useReducedMotion();
  const [colors, setColors] = useState(() => interpolateColors(0));

  useEffect(() => {
    const onScroll = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      setColors(interpolateColors(window.scrollY / maxScroll));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <ShaderBackground
        color1={colors.color1}
        color2={colors.color2}
        color3={colors.color3}
        animate={reduce ? "off" : "on"}
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
