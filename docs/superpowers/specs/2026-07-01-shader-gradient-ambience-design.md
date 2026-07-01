# Shader Gradient Ambience — Design Spec

## Context

`components/Ambience.tsx` currently renders the site's fixed background: a flat
scroll-driven colour wash (interpolated across 7 hex stops as the user
scrolls) plus 4 blurred, spring-physics parallax orbs, topped with a static
SVG paper-grain texture. The doc comment on the file calls this a
"watercolour-wash" — the wash + orbs are a CSS/Framer-Motion approximation of
a flowing watercolour effect.

We just installed `@shadergradient/react`, `@react-three/fiber`, `three`,
`three-stdlib`, and `camera-controls` (which required upgrading the project
to Next.js 15 / React 19 — see the prior commit). The goal now is to replace
the CSS approximation with an actual WebGL shader gradient, using the
`waterPlane` mesh type, while preserving the site's existing blush-mauve
palette and its signature "scroll = emotional colour journey" concept
(documented in `HANDOFF.md` as warm blush-cream → dusty mauve → warm blush
again).

## Approach

**Full replace.** The flat wash `<div>` and the 4 blurred orb
`<motion.div>`s are removed entirely and replaced by a `ShaderGradient`
(`type: 'waterPlane'`) rendered full-bleed behind everything. The paper-grain
overlay stays, unchanged, layered on top of the canvas — it's cheap and is
what currently sells the "paper/watercolour" texture; no reason to lose it.

This was chosen over layering the shader alongside the existing orbs because
running CSS `blur()` filters and a WebGL canvas simultaneously is
meaningfully heavier, and because the shader's own animated colour blending
is a native replacement for what the orbs were approximating — no need for
both systems fighting for the same visual role.

## Components

### `components/ShaderBackground.tsx` (new)

A small, isolated client component whose only job is to render the WebGL
canvas. This keeps all Three.js/shadergradient-specific code (and its SSR
constraints) out of `Ambience.tsx`.

```ts
"use client";

import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";

type Props = {
  color1: string;
  color2: string;
  color3: string;
  animate: "on" | "off";
};

export default function ShaderBackground({ color1, color2, color3, animate }: Props) {
  return (
    <ShaderGradientCanvas
      style={{ position: "absolute", inset: 0 }}
      pointerEvents="none"
      pixelDensity={1}
      powerPreference="low-power"
    >
      <ShaderGradient
        type="waterPlane"
        animate={animate}
        color1={color1}
        color2={color2}
        color3={color3}
        uSpeed={0.15}
        uStrength={2}
        uDensity={1.2}
        uAmplitude={1}
        uFrequency={5.5}
        grain="off"
        lightType="3d"
        brightness={1.1}
        reflection={0.1}
        cAzimuthAngle={180}
        cPolarAngle={90}
        cDistance={4}
        cameraZoom={1}
        positionY={0}
        rotationX={0}
        rotationY={0}
        rotationZ={0}
      />
    </ShaderGradientCanvas>
  );
}
```

Interface: given 3 hex colours and an animate flag, it renders the gradient.
It has no knowledge of scroll, palette stops, or reduced-motion — those stay
in `Ambience.tsx`. Exact numeric shader constants above (`uSpeed`,
`uStrength`, `uDensity`, `uAmplitude`, `uFrequency`, camera angles/distance)
are starting values; they must be visually tuned in the browser during
implementation (see Testing below) since they're only meaningful rendered,
not read as numbers.

### `components/Ambience.tsx` (modified)

Keeps: the scroll listener, the colour-interpolation state, the paper-grain
overlay `<div>`, the outer fixed/`-z-10`/`overflow-hidden` wrapper.

Removes: the flat wash `<div>`, all 4 `<motion.div>` orbs, the now-unused
`useMotionValue`/`useTransform`/`useSpring` parallax plumbing (nothing left
to parallax).

Adds:
- `next/dynamic` import of `ShaderBackground` with `{ ssr: false }` — three.js
  touches `window`/`self` at module scope, which breaks Next.js SSR unless
  the component is client-only-loaded. Loading fallback: `() => null` (the
  page's own cream `--bg` shows through with no flash).
- `useReducedMotion()` from `framer-motion` (same hook already used in
  `Hero.tsx` and `FadeIn.tsx`) to compute `animate: reduce ? "off" : "on"`.
- Colour interpolation extended from 1 output colour to 3 (see below), passed
  as `color1`/`color2`/`color3` props to `ShaderBackground`.

## Colour mapping

The existing 7 scroll stops (in `scrollStops`) are deliberately muted
pastels (RGB channels roughly in the 200–240 range) chosen for legible
contrast against the `aubergine` text and `.glass` panels — `HANDOFF.md`
explicitly flags re-checking contrast if the scroll background changes. So
rather than feeding the shader raw saturated brand colours (e.g.
`salmon-deep #C45A4A`, which is far more saturated/darker than anything
currently in the wash), each existing stop becomes **`color2`** unchanged,
and two companion colours are derived at the same lightness family:

- **`color1`** — warmer/lighter, blended toward `cream` (`#FAF7F4`) /
  `blush` (`#EDB4A8`)
- **`color3`** — cooler/deeper, blended toward `mauve` (`#9B88B8`) /
  `dusk` (`#C5B8D8`)

This gives the shader's internal noise three closely-related pastels to
blend across per-pixel — organic depth and colour variation without changing
how light the overall background reads, so no contrast re-work is needed
elsewhere.

Implementation: generalize the existing `interpolateColor(progress)` into a
function that interpolates 3 parallel RGB triples and returns
`{ color1, color2, color3 }` as hex strings (add an `rgbToHex` helper — the
shader library expects hex strings, not `rgb(...)`). The stops data structure
becomes `{ progress, color1: RGB, color2: RGB, color3: RGB }[]`, replacing
the current `{ progress, color: RGB }[]`. Same 7 progress breakpoints as
today (0, 0.2, 0.4, 0.6, 0.75, 0.9, 1.0) — only the shape of the values
changes, not the scroll-journey timing.

## Reduced motion

`useReducedMotion()` → `animate: "on" | "off"` passed straight through to
`ShaderGradient`. With reduced motion, the shader renders a static frame —
still the correct scroll-position colour, just no flowing/undulating noise.
Chosen over falling back to the old flat-CSS wash so there's only one
background implementation to maintain.

## Performance

- `pixelDensity={1}` — avoids full device-pixel-ratio cost (2–3x on retina
  displays) for a full-viewport, purely decorative background.
- `powerPreference="low-power"` — prefers battery life over max performance;
  appropriate for a decorative background rather than an interactive 3D
  scene.
- `pointerEvents="none"` on the canvas — matches the parent wrapper's
  existing `pointer-events-none`; this layer is never interactive.
- Low `uSpeed` — slow, subtle flow so it doesn't visually compete with
  foreground text/glass panels.

## Testing

1. `npm run dev`, load the page, confirm the shader gradient renders behind
   all sections (Hero through Footer) with no console errors (particularly
   no SSR/hydration errors from the WebGL canvas).
2. Scroll from top to bottom, confirm the gradient's colours transition
   through the same warm → mauve → warm arc the old wash did, at
   recognizably the same scroll breakpoints.
3. Toggle OS-level "reduce motion" (or emulate via devtools), reload, confirm
   the gradient is static (no flowing animation) but still shows the correct
   colour for the current scroll position.
4. Spot-check text/glass-panel contrast at a few scroll positions (top,
   ~40%, ~60%) to confirm nothing has become harder to read than before.
5. `npm run build` to confirm the dynamic `ssr: false` import doesn't break
   the production build.
