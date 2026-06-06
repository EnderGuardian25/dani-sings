import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── Lavender palette ──────────────────────────────
        lavender:  "#B8A9D4",  // base background
        lavLight:  "#D4CCE8",  // lighter surface / card fill
        lavDeep:   "#8E7DB8",  // deeper borders / dividers
        lavFrost:  "rgba(212,204,232,0.45)", // glass panel fill
        // ── Accent ───────────────────────────────────────
        champagne: "#5A1238",  // deep wine-berry — AA on BOTH glass (5.9:1) and raw lavender (4.64:1)
        champLight:"#9E3D68",  // mid berry-rose for hover / subtle accents
        // ── Typography ───────────────────────────────────
        aubergine: "#2D1B3D",  // primary text (deep purple)
        plum:      "#5C3D7A",  // secondary / muted text
        frost:     "#F7F3FF",  // near-white highlight text / cream
      },
      fontFamily: {
        display: ["var(--font-playfair)", "serif"],
        body:    ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        wider2: "0.18em",
      },
      boxShadow: {
        soft: "0 10px 40px -20px rgba(45,27,61,0.22)",
        lift: "0 24px 60px -28px rgba(45,27,61,0.32)",
        glass:"0 8px 32px -12px rgba(45,27,61,0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
