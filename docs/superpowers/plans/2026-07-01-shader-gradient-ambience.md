# Shader Gradient Ambience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `components/Ambience.tsx`'s flat CSS colour wash + 4 blurred parallax orbs with a WebGL `waterPlane` shader gradient from `@shadergradient/react`, reusing the site's existing blush-mauve palette and scroll-driven colour journey.

**Architecture:** A new isolated client component (`components/ShaderBackground.tsx`) wraps `ShaderGradientCanvas`/`ShaderGradient` and knows nothing about scroll or the palette — it just renders 3 hex colours + an animate flag. `components/Ambience.tsx` keeps its existing scroll-listener/colour-interpolation responsibility, extended from 1 output colour to 3, and dynamically imports `ShaderBackground` with `ssr: false` (three.js touches `window`/`self` at module scope, which breaks Next.js SSR otherwise).

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript (strict), `@shadergradient/react` 2.4.20, `@react-three/fiber` 9.6.1, `three` 0.185.0, Framer Motion 12 (`useReducedMotion`, already used elsewhere in the codebase).

## Global Constraints

- No test framework exists in this repo (no jest/vitest/playwright config, no `*.test.*` files) — verification is via `next build` (type-checking + SSR-safety) and manual browser checks in `npm run dev`, matching this repo's existing verification pattern.
- Preserve the existing 7 scroll breakpoints (`0, 0.2, 0.4, 0.6, 0.75, 0.9, 1.0`) and their timing — only the *shape* of the stop data changes (1 colour → 3 colours per stop).
- Derived colours must stay in the same muted-pastel lightness family as the original wash (roughly RGB 170–250 per channel) — do not introduce saturated brand colours (e.g. `salmon-deep #C45A4A`) directly into the background, per the spec's contrast-preservation requirement.
- Reuse `useReducedMotion` from `framer-motion` (the same hook already used in `Hero.tsx`/`FadeIn.tsx`) rather than a new reduced-motion mechanism.

---

### Task 1: Create `ShaderBackground.tsx`

**Files:**
- Create: `components/ShaderBackground.tsx`

**Interfaces:**
- Consumes: `ShaderGradientCanvas`, `ShaderGradient` from `@shadergradient/react` (already installed, v2.4.20).
- Produces: default-exported React component `ShaderBackground(props: { color1: string; color2: string; color3: string; animate: "on" | "off" })` — Task 2 imports this via `next/dynamic`.

- [ ] **Step 1: Write the component**

```tsx
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

- [ ] **Step 2: Verify it type-checks**

Run: `npx tsc --noEmit`
Expected: no errors referencing `components/ShaderBackground.tsx` (this file isn't imported anywhere yet, so it won't affect the build, but `tsc --noEmit` still checks every file in the project).

- [ ] **Step 3: Commit**

```bash
git add components/ShaderBackground.tsx
git commit -m "Add isolated ShaderBackground WebGL component"
```

---

### Task 2: Rewrite `Ambience.tsx` to use the shader background

**Files:**
- Modify: `components/Ambience.tsx` (full rewrite — replace entire file contents)

**Interfaces:**
- Consumes: `ShaderBackground` from Task 1 (`components/ShaderBackground.tsx`), dynamically imported.
- Produces: default-exported `Ambience()` component — unchanged external usage (it's already rendered wherever it currently is, e.g. `app/layout.tsx` or `app/page.tsx`; no caller changes needed since the export signature doesn't change).

- [ ] **Step 1: Confirm current usage is unaffected**

Run: `grep -rn "Ambience" app/ --include="*.tsx"`
Expected: shows the existing `import Ambience from "@/components/Ambience"` / `<Ambience />` call site(s), confirming the component is used with no props — the rewrite below preserves that (still zero props).

- [ ] **Step 2: Replace the full contents of `components/Ambience.tsx`**

```tsx
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
```

- [ ] **Step 3: Start the dev server and check for console errors**

Run: `npm run dev` (leave running), open `http://localhost:3000` in a browser.
Expected: page loads, no red errors in the browser console (particularly no SSR/hydration mismatch errors from the WebGL canvas), and a flowing gradient is visible behind the Hero section in place of the old flat wash/orbs.

- [ ] **Step 4: Manually verify the scroll colour journey**

In the browser, scroll slowly from the very top of the page to the very bottom.
Expected: the shader's blended colours shift through the same warm blush-cream → soft petal pink → warm mauve blush → dusty mauve → muted blush-lavender → warm parchment blush → cream-rose arc the old wash used, at recognizably the same scroll positions (0%, 20%, 40%, 60%, 75%, 90%, 100% of scrollable height).

- [ ] **Step 5: Manually verify reduced-motion behaviour**

In Chrome DevTools: Rendering tab → "Emulate CSS media feature prefers-reduced-motion" → "reduce". Reload the page.
Expected: the shader gradient shows a static (non-flowing) frame, but still displays the colour matching the current scroll position — no undulating/flowing motion.

- [ ] **Step 6: Spot-check text contrast**

At 3 scroll positions — top (0%), ~40% (Portfolio section), ~60% (dusty mauve) — visually confirm body text (`aubergine`) and `.glass` panel text remain clearly legible against the shader background, matching the legibility of the previous flat wash.

- [ ] **Step 7: Verify the production build**

Run: `npm run build`
Expected: build completes successfully with no type errors and no SSR errors related to `ShaderBackground`/`three`/`@react-three/fiber` (confirms the `dynamic(..., { ssr: false })` import correctly keeps WebGL code out of server rendering).

- [ ] **Step 8: Commit**

```bash
git add components/Ambience.tsx
git commit -m "Replace CSS wash + orbs with waterPlane shader gradient in Ambience"
```

---

## Self-Review Notes

- **Spec coverage:** Full-replace scope (Task 2 removes wash + orbs) ✓; `waterPlane` type ✓; isolated `ShaderBackground.tsx` with `{color1,color2,color3,animate}` interface ✓; `next/dynamic` + `ssr:false` ✓; paper grain retained ✓; colour derivation preserving lightness family ✓; `useReducedMotion` → `animate` prop ✓; performance props (`pixelDensity`, `powerPreference`, `pointerEvents`) ✓; all 5 testing steps from the spec map onto Task 2 Steps 3–7 ✓.
- **Placeholder scan:** No TBD/TODO; all code blocks are complete, runnable files, not fragments.
- **Type consistency:** `ShaderBackground` props (`color1, color2, color3: string`, `animate: "on" | "off"`) match exactly between Task 1's definition and Task 2's usage. `interpolateColors` return shape (`{color1, color2, color3}` as hex strings) matches what `Ambience` passes to `ShaderBackground`.

---

Plan complete and saved to `docs/superpowers/plans/2026-07-01-shader-gradient-ambience.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
