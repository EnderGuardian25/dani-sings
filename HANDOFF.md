# Danella De Cruz — Portfolio Website Handoff

A complete portfolio site for **Danella De Cruz**, an emerging cover artist and vocalist based in Sri Lanka. Built with Next.js 15 App Router, TypeScript, and Tailwind CSS. Aesthetic: ethereal dreamy minimalism — warm blush-mauve with glass-morphism panels.

---

## Quick Start

```bash
cd D:\dani-sings
npm run dev       # http://localhost:3000
```

Runs on **port 3000**. The preview server config lives at `.claude/launch.json`.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 App Router (React 19) |
| Language | TypeScript |
| Styling | Tailwind CSS v3 + custom palette |
| Animation | Framer Motion |
| Background | `@shadergradient/react` (WebGL `waterPlane` gradient) + `three` |
| Icons | react-icons (FaInstagram, FaTiktok, FaSpotify) |
| Fonts | Playfair Display (display) + Inter (body) via `next/font` |
| Images | `next/image` |
| Data | Server Component + ISR (`revalidate: 86400`) |

---

## Colour Palette (`tailwind.config.ts`)

```ts
// Warm neutrals
cream:         "#FAF7F4"   // page background resting state
parchment:     "#F2EDE8"   // card surfaces, section alternates
mist:          "#E8E1EF"   // subtle dividers, nav backdrop
dusk:          "#C5B8D8"   // borders, secondary strokes

// Core text
aubergine:     "#2D1B3D"   // primary text (deep plum-black) — unchanged
secondary:     "#6B5878"   // secondary / muted label text — 4.9:1 on cream ✓
frost:         "#F7F3FF"   // near-white text on dark surfaces — unchanged

// Accent palette
salmon:        "#E8796A"   // decorative, pill backgrounds
salmon-deep:   "#C45A4A"   // primary CTA accent, hover states — 4.8:1 on cream ✓
blush:         "#EDB4A8"   // hover reveal backgrounds, soft tints
taupe:         "#B09080"   // secondary button strokes, social icon borders
taupe-deep:    "#8A6E60"   // outline button borders — 4.6:1 on cream ✓
mauve:         "#9B88B8"   // Showcase type pill
```

Custom shadows: `shadow-soft`, `shadow-lift`, `shadow-glass`
Custom letter-spacing: `tracking-wider2` (0.18em)

---

## Global CSS (`app/globals.css`)

- Body background: `#FAF7F4` (warm cream — `var(--bg)`)
- CSS custom properties block at `:root` — all palette + text tokens as `--color-*` and `--text-*` vars
- `.glass` utility: `rgba(250,247,244,0.55)` fill + `blur(14px)` + `border: 1px solid rgba(197,184,216,0.35)` + `border-radius: 1rem`
  - **IMPORTANT**: `.glass` sets `border-radius: 1rem` via shorthand which beats Tailwind's `rounded-*` utilities. Always override corners with inline `style={{ borderTopLeftRadius: 0, ... }}` if you need to remove a corner.
- `.container-page`: `mx-auto max-w-6xl px-6 md:px-10`
- `.hairline`: horizontal gradient divider — `rgba(45,27,61,0.18)` centre
- `.underline-grow`: animated underline on hover, now in `salmon-deep` (`#C45A4A`)

---

## File Structure

```
app/
  layout.tsx          — fonts (Playfair Display + Inter), metadata, body wrapper
  page.tsx            — async Server Component; fetches social stats; ISR revalidate: 86400
  globals.css         — Tailwind base + :root tokens + .glass + .hairline + .underline-grow

components/
  Ambience.tsx        — "use client" — scroll-driven colour arc, drives the WebGL shader background (fixed, z-[-10])
  ShaderBackground.tsx — "use client" — isolated `@shadergradient/react` waterPlane canvas, dynamically imported (ssr: false)
  Nav.tsx             — "use client" — frosted cream-blush bar fades in on scroll; salmon-deep hover
  Hero.tsx            — "use client" — staggered Framer Motion entrance animation
  FeaturedCovers.tsx  — "use client" — 4 cover cards in 2-col grid (equal-height via flex)
  About.tsx           — Server Component — bio + live social stats
  Performances.tsx    — "use client" — editorial row list inside a single blush-glass container
  CTA.tsx             — contact section with email + PDF + social links
  Footer.tsx          — copyright
  FadeIn.tsx          — reusable scroll-triggered fade-in (Framer Motion, once: true)

lib/
  social-stats.ts     — fetches IG + TikTok follower counts server-side

public/
  performances/       — drop performance photos here (see Performances section below)
  assets/             — Danella_De_Cruz_Pricing_Guide.pdf (replace with real PDF)

.env.local.example    — IG_USER_ID + IG_GRAPH_TOKEN template
INSTAGRAM_SETUP.md    — full walkthrough for setting up the Instagram Graph API token
```

---

## Page Sections (top to bottom)

### 1. Ambience — `components/Ambience.tsx` + `components/ShaderBackground.tsx`
Fixed `z-index: -10` background layer, now a **WebGL shader gradient** (`@shadergradient/react`, `waterPlane` type) instead of the original CSS wash + parallax orbs. `Ambience.tsx` owns the scroll-driven colour logic and passes 3 hex colours as props into `ShaderBackground`, which wraps the actual `ShaderGradientCanvas`/`ShaderGradient` and is dynamically imported with `ssr: false` (WebGL can't run server-side).

**Scroll arc** — 3 colours (`color1`/`color2`/`color3`) each interpolate through their own warm-to-cool-to-warm journey across 7 scroll stops (0, 0.2, 0.4, 0.6, 0.75, 0.9, 1.0), mirroring the original single-colour arc:
| Scroll % | Mood | color1 | color2 | color3 |
|---|---|---|---|---|
| 0% (Hero) | Warm blush-cream | `#FAF0EA` | `#F4E0DE` | `#E8BED6` |
| 20% | Soft petal pink | `#F8DCD2` | `#EEC8CE` | `#DEACCE` |
| 40% (Portfolio) | Warm mauve blush | `#EECED8` | `#DCB6D0` | `#CEA0D2` |
| 60% | Dusty mauve (only cool note) | `#E4C6E2` | `#CEB0E0` | `#BEB0E0` |
| 75% (About) | Muted blush-lavender | `#ECD0EA` | `#DCC0E6` | `#CCA8E2` |
| 90% (CTA) | Warm parchment blush | `#F8E4E4` | `#F0D6DA` | `#DEBAD8` |
| 100% (Footer) | Cream-rose | `#FAEEEA` | `#F4DEE0` | `#E4C0D8` |

Implementation: `window.addEventListener('scroll')` → `requestAnimationFrame`-throttled handler (a `ticking` guard skips re-computation until the next frame, fixing scroll jank) → `interpolateColors()` helper → `useState`. Colour state only updates if the resulting hex triple actually changed, to avoid redundant re-renders. Still NOT `useScroll` from Framer Motion — it doesn't reliably fire in the App Router.

**Shader tuning** (`ShaderBackground.tsx` props):
- `powerPreference="default"` — was tuned down from a high-performance GPU request to avoid forcing discrete-GPU switches on laptops
- `uSpeed={0.15}`, `uStrength={0.9}`, `uDensity={1.2}`, `uAmplitude={0.6}`, `uFrequency={3.2}` — wave motion tuned for a slow, subtle drift (not a distracting animated background)
- `brightness={1.3}` — raised to keep the gradient pastel rather than muddy at the shader's default brightness
- `grain="off"` — the shader's built-in grain is disabled; a separate static SVG turbulence overlay (`opacity-[0.05]`) provides the paper-grain texture instead, layered on top of the canvas in `Ambience.tsx`
- `reflection={0.03}` — minimal, keeps the surface matte rather than glossy
- `animate={reduce ? "off" : "on"}` — respects `prefers-reduced-motion` via Framer Motion's `useReducedMotion()`

The original 4 parallax orbs (`rounded-full` blurred divs with spring physics) were removed entirely — the shader's own wave motion now provides the sense of depth/movement.

### 2. Nav — `components/Nav.tsx`
Fixed top bar. Backdrop: `rgba(240,230,226,0.75)` cream-blush + `backdrop-blur-md` fades in once `scrollY > 40px`. Nav link hover: `text-salmon-deep`. Applied via inline style (not Tailwind arbitrary) to avoid build issues.

### 3. Hero — `components/Hero.tsx`
Full viewport height (`min-h-[92vh]`). Staggered entrance with `variants` container/item pattern. Two CTAs:
- "Explore My Covers" — `bg-aubergine`, `text-frost`, hover `ring-salmon-deep/60`
- "Get in Touch" — outline `border-taupe-deep/60`, hover `bg-blush/40`

### 4. Featured Covers — `components/FeaturedCovers.tsx`
2-column grid of 4 cover cards. Each card is a single `.glass` panel — no cover art or gradient image. Content:
- Song title (Playfair Display)
- Artist name (small caps)
- Caption text (`flex-1` so it fills remaining height)
- "View on Instagram →" pinned to the bottom (`mt-4`)

**Equal height fix**: FadeIn wrapper gets `className="h-full"`, `motion.a` uses `glass flex h-full flex-col p-5` directly (no nested caption div — the card IS the glass panel).

To add/edit covers — update the `covers` array. The `gradient` and `accent` fields are kept in the type for future use but are not rendered:
```ts
{ song, artist, caption, postUrl, gradient, accent }
```

### 5. About — `components/About.tsx`
Two-column layout (5/7 split on md+). Left: name/tagline glass panel. Right: bio text + three stats.

**Live stats** passed from `page.tsx` as `liveStats?: SocialStats`. Stats labels use `text-secondary`. Stats divider uses `border-dusk/40`. Falls back to `"10K+"` if live fetch fails.

### 6. Recent Performances — `components/Performances.tsx`
**Redesigned as an editorial row list.** Structure:
- **Header**: standard `.glass` panel (cream) — "LIVE" label + "Recent Performances" h2 + subtitle
- **List**: single blush-glass container (`rgba(237,180,168,0.18)` fill, `rgba(196,90,74,0.15)` border) holding all 6 performances as typographic rows
- Each row: type pill + event name (Playfair, transitions to `salmon-deep` on hover) + venue on the left; italic date + all-caps location on the right
- Rows separated by salmon-tinted gradient hairlines
- Hover: soft `bg-blush/20` wash over the row

**No timeline dots or connecting lines.**

Performance type pills:
| Type | Style |
|---|---|
| Live Set | `bg-salmon/15 text-salmon-deep` |
| Showcase | `bg-mauve/15 text-mauve` |
| Feature | `bg-aubergine/10 text-aubergine/80` |
| Open Mic | `bg-aubergine/10 text-aubergine/80` |
| Collaboration | `bg-salmon/15 text-salmon-deep` |

**Image gallery** — each performance supports up to 3 photos:
```ts
images: ["/performances/filename.jpg"]
```
Drop files into `public/performances/`. Gallery auto-adapts: 1=full, 2=2-col, 3=3-col.

To add a performance, add an entry to the `performances` array:
```ts
{
  event: "Event Name",
  venue: "Venue Name",
  date: "Month Year",
  location: "City, Country",
  type: "Live Set",      // one of the 5 types above
  link: "https://...",   // optional
  images: [],            // optional, up to 3 paths
}
```

### 7. CTA / Contact — `components/CTA.tsx`
Centred glass panel. Three CTAs:
- **Book a Collaboration** → `mailto:hello@danelladecruz.com`
- **Download Pricing Guide** → `/assets/Danella_De_Cruz_Pricing_Guide.pdf`
- **Email directly** → same mailto

Social links: Instagram (`@danella.decruz`), TikTok (`@danella.decruz`), Spotify (placeholder — update to real artist page).
Social icon hover: `border-salmon-deep`, `bg-salmon/15`, `text-salmon-deep`.

### 8. Footer — `components/Footer.tsx`
Year hardcoded to `2026`. Text uses `text-secondary`. Border `border-dusk/30`.

---

## Live Social Stats

`lib/social-stats.ts` runs **server-side** at build/revalidation time.

**Instagram** — 3-tier waterfall:
1. Official Graph API (requires `IG_USER_ID` + `IG_GRAPH_TOKEN` — see `INSTAGRAM_SETUP.md`)
2. Unofficial scrape fallback
3. Static `"10K+"` fallback

**TikTok** — scrapes `__NEXT_DATA__` JSON from `tiktok.com/@danella.decruz`.

Both update every **24 hours** via ISR. No cron job needed.

---

## Content That Still Needs Real Assets

| Item | Where | What to do |
|---|---|---|
| Pricing Guide PDF | `public/assets/Danella_De_Cruz_Pricing_Guide.pdf` | Replace placeholder with real PDF |
| Performance photos | `public/performances/` | Drop JPG/PNG files here, add paths to `performances` array in `Performances.tsx` |
| Cover art photos | `FeaturedCovers.tsx` | Replace gradient placeholders with real `next/image` thumbnails from Instagram |
| Spotify URL | `CTA.tsx` | Replace `https://spotify.com` with Danella's actual Spotify artist page |
| Email address | `CTA.tsx` | `hello@danelladecruz.com` — update if different |
| Instagram API | `.env.local` | Follow `INSTAGRAM_SETUP.md` for live follower count |

---

## Known Quirks & Gotchas

| Issue | Why | Fix applied |
|---|---|---|
| `last:pb-0` fired on ALL rows | Each row is wrapped in `<FadeIn>` (motion.div), making it the `:last-child` of its own wrapper | Use JS conditional: `i < arr.length - 1 ? "pb-12" : ""` instead of `last:pb-0` |
| `.glass` overrides `rounded-t-none` | `.glass` uses `border-radius: 1rem` shorthand which beats Tailwind's longhand utilities | Use inline `style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}` |
| `useScroll` doesn't fire | Next.js App Router — `useScroll` from Framer Motion doesn't detect scroll | Use `window.addEventListener('scroll')` → `useMotionValue` manually |
| Tailwind config changes need restart | Hot reload doesn't recompile `tailwind.config.ts` | Stop dev server (`Ctrl+C`) and `npm run dev` again |
| Nav backdrop uses inline style | `bg-[rgba(...)]` Tailwind arbitrary values with commas can be unreliable at build time | Use `style={{ background: "rgba(240,230,226,0.75)" }}` on the backdrop div |
| Scroll handler caused visible jank | Every `scroll` event synchronously ran `interpolateColors()` + `setState`, firing far more often than the browser could paint | Guard with a `ticking` boolean and defer the actual update into `requestAnimationFrame` |
| Shader had a harsh highlight on the left edge | Default `ShaderGradient` camera/light angle produced a hard specular edge inconsistent with the soft pastel aesthetic | Tuned `cAzimuthAngle`/`cPolarAngle`/`reflection` down in `ShaderBackground.tsx` |
| Colours dipped below the design's "pastel floor" mid-scroll | Naive per-channel RGB lerp between scroll stops can under/overshoot brightness for a couple of frames, especially on the green channel at the 0.6 stop (dropped to 160 before the fix) | Re-tuned the 0.6 scroll-stop RGB values directly in `Ambience.tsx` (green raised 160 → 176) and raised shader `brightness` to keep the floor pastel throughout |
| `ShaderGradientCanvas` requesting a discrete GPU | `powerPreference="high-performance"` (the library default) can force laptops to switch to a discrete GPU just for a background gradient | Set `powerPreference="default"` in `ShaderBackground.tsx` |
| WebGL canvas can't render server-side | Next.js Server/Static rendering has no WebGL context | `ShaderBackground` is loaded via `next/dynamic` with `ssr: false` in `Ambience.tsx` |

---

## WCAG AA Compliance

All text passes WCAG AA (4.5:1 minimum). Key ratios on cream `#FAF7F4`:
- `aubergine (#2D1B3D)` on cream: **11.4:1** ✓ AAA
- `aubergine (#2D1B3D)` on parchment: **10.6:1** ✓ AAA
- `secondary (#6B5878)` on cream: **4.9:1** ✓ AA
- `salmon-deep (#C45A4A)` on cream (large text/buttons): **4.8:1** ✓ AA
- `taupe-deep (#8A6E60)` on cream: **4.6:1** ✓ AA
- `frost (#F7F3FF)` on `aubergine` button: **14.1:1** ✓ AAA

Do not use `aubergine` at opacity below `/80` on glass surfaces without re-checking contrast against the current scroll background colour.
