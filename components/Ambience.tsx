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
  { progress: 0,    color1: [250, 244, 240], color2: [240, 230, 226], color3: [225, 205, 214] }, // warm blush-cream
  { progress: 0.2,  color1: [245, 228, 220], color2: [232, 212, 204], color3: [214, 190, 202] }, // soft petal pink
  { progress: 0.4,  color1: [232, 214, 220], color2: [212, 192, 204], color3: [196, 172, 196] }, // warm mauve blush
  { progress: 0.6,  color1: [222, 206, 224], color2: [200, 184, 212], color3: [180, 160, 200] }, // dusty mauve (only cool note)
  { progress: 0.75, color1: [230, 216, 232], color2: [216, 200, 220], color3: [194, 176, 208] }, // muted blush-lavender
  { progress: 0.9,  color1: [246, 236, 230], color2: [237, 224, 220], color3: [216, 198, 208] }, // warm parchment blush
  { progress: 1.0,  color1: [250, 244, 240], color2: [240, 232, 228], color3: [220, 202, 210] }, // cream-rose
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
