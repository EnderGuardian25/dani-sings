import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── Warm neutrals ─────────────────────────────────
        cream:          "#FAF7F4",  // page background resting state
        parchment:      "#F2EDE8",  // card surfaces, section alternates
        mist:           "#E8E1EF",  // subtle dividers, nav backdrop
        dusk:           "#C5B8D8",  // borders, secondary strokes
        // ── Core text / typography ─────────────────────────
        aubergine:      "#2D1B3D",  // primary text (deep plum-black) — unchanged
        secondary:      "#6B5878",  // secondary / muted label text
        frost:          "#F7F3FF",  // near-white highlight text — unchanged
        // ── Accent palette ─────────────────────────────────
        salmon:         "#E8796A",  // primary CTA, key highlights
        "salmon-deep":  "#C45A4A",  // hover state, AA on cream (4.8:1)
        blush:          "#EDB4A8",  // soft backgrounds, hover reveal
        taupe:          "#B09080",  // secondary button strokes, metadata
        "taupe-deep":   "#8A6E60",  // hover for taupe elements, AA on cream (4.6:1)
        mauve:          "#9B88B8",  // decorative, Showcase type pill
      },
      fontFamily: {
        display: ["var(--font-playfair)", "serif"],
        body:    ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        wider2: "0.18em",
      },
      boxShadow: {
        soft:  "0 10px 40px -20px rgba(45,27,61,0.22)",
        lift:  "0 24px 60px -28px rgba(45,27,61,0.32)",
        glass: "0 8px 32px -12px rgba(45,27,61,0.14)",
      },
    },
  },
  plugins: [],
};

export default config;
