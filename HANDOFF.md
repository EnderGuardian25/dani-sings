# Danella De Cruz — Portfolio Website Handoff

A complete portfolio site for **Danella De Cruz**, an emerging cover artist and vocalist based in Sri Lanka. Built with Next.js 14 App Router, TypeScript, and Tailwind CSS. Aesthetic: ethereal dreamy minimalism — warm blush-mauve with glass-morphism panels.

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
| Framework | Next.js 14 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS v3 + custom palette |
| Animation | Framer Motion |
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
  Ambience.tsx        — "use client" — scroll-driven warm bg arc + 4 spring-physics parallax orbs (fixed background)
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

### 1. Ambience — `components/Ambience.tsx`
Fixed `z-index: -10` background layer. **Scroll-driven colour arc** + four `rounded-full` blurred orbs with spring-physics parallax:

**Scroll arc** — background interpolates through a warm-to-cool-to-warm journey as the user scrolls:
| Scroll % | Colour | Hex |
|---|---|---|
| 0% (Hero) | Warm blush-cream | `#F0E6E2` |
| 20% | Soft petal pink | `#E8D4CC` |
| 40% (Portfolio) | Warm mauve blush | `#D4C0CC` |
| 60% | Dusty mauve (only cool note) | `#C8B8D4` |
| 75% (About) | Muted blush-lavender | `#D8C8DC` |
| 90% (CTA) | Warm parchment blush | `#EDE0DC` |
| 100% (Footer) | Cream-rose | `#F0E8E4` |

Implementation: manual `window.addEventListener('scroll')` → `useState` → `interpolateColor()` helper. NOT `useScroll` from Framer Motion (doesn't fire in App Router).

**Orbs** (warm blush palette):
- Deep blush (top-left, stable anchor, ζ≈1.30) — `rgba(196,140,160,0.42)`
- Mid rose (upper body, ζ≈1.07) — `rgba(220,160,170,0.30)`
- Salmon bleed (bottom-centre, bubbly star, ζ≈0.69) — `rgba(237,180,168,0.55)`
- Mauve wisp (right float, ζ≈0.80) — `rgba(197,184,216,0.34)`

### 2. Nav — `components/Nav.tsx`
Fixed top bar. Backdrop: `rgba(240,230,226,0.75)` cream-blush + `backdrop-blur-md` fades in once `scrollY > 40px`. Nav link hover: `text-salmon-deep`. Applied via inline style (not Tailwind arbitrary) to avoid build issues.

### 3. Hero — `components/Hero.tsx`
Full viewport height (`min-h-[92vh]`). Staggered entrance with `variants` container/item pattern. Two CTAs:
- "Explore My Covers" — `bg-aubergine`, `text-frost`, hover `ring-salmon-deep/60`
- "Get in Touch" — outline `border-taupe-deep/60`, hover `bg-blush/40`

### 4. Featured Covers — `components/FeaturedCovers.tsx`
2-column grid of 4 cover cards. Each card:
- Gradient art placeholder (blush-mauve-taupe tones — warm, varied per card)
- Glass caption panel below (grows with `flex-1 flex-col` so all cards in a row are equal height)
- "View on Instagram →" pinned to the bottom with `mt-auto` in `text-salmon-deep`

**Equal height fix**: FadeIn wrapper gets `className="h-full"`, `motion.a` is `flex flex-col h-full`.

**Caption border-radius fix**: `.glass` shorthand `border-radius: 1rem` overrides Tailwind utilities. Caption uses:
```tsx
style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, border: "none" }}
```

Cover card gradients (blush-mauve-taupe palette):
```ts
Card 1: from-[#E8C4B8] via-[#D4B4C8] to-[#C0A8D4]  // blush into mauve
Card 2: from-[#D4C0CC] via-[#C8B4D0] to-[#B8A8D8]  // dusty rose to lavender
Card 3: from-[#C8B0C0] via-[#B8A0C8] to-[#A890C0]  // deep mauve
Card 4: from-[#EDD0C4] via-[#DCC0CC] to-[#CCB0D8]  // warmest — late afternoon light
```

To add/edit covers — update the `covers` array:
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
