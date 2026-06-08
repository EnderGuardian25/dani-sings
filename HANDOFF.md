# Danella De Cruz — Portfolio Website Handoff

A complete portfolio site for **Danella De Cruz**, an emerging cover artist and vocalist based in Sri Lanka. Built with Next.js 14 App Router, TypeScript, and Tailwind CSS. Aesthetic: ethereal dreamy minimalism — lavender watercolour with glass-morphism panels.

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
champagne: "#5A1238"   // deep wine-berry — accent, WCAG AA on glass (5.9:1) and raw lavender (4.64:1)
champLight:"#9E3D68"   // mid berry-rose — hover accents
aubergine: "#2D1B3D"   // primary text (deep purple)
plum:      "#5C3D7A"   // secondary/muted text
lavender:  "#B8A9D4"   // mid lavender — nav bar tint
lavLight:  "#D4CCE8"   // lighter surface
lavDeep:   "#8E7DB8"   // deeper borders/dividers
lavFrost:  "rgba(212,204,232,0.45)" // glass fill
frost:     "#F7F3FF"   // near-white highlights
```

Custom shadows: `shadow-soft`, `shadow-lift`, `shadow-glass`
Custom letter-spacing: `tracking-wider2` (0.18em)

---

## Global CSS (`app/globals.css`)

- Body background: `#A090C8` (mid lavender)
- `.glass` utility: `rgba(247,243,255,0.22)` fill + `blur(14px)` + `border-radius: 1rem`
  - **IMPORTANT**: `.glass` sets `border-radius: 1rem` via shorthand which beats Tailwind's `rounded-*` utilities. Always override corners with inline `style={{ borderTopLeftRadius: 0, ... }}` if you need to remove a corner.
- `.container-page`: `mx-auto max-w-6xl px-6 md:px-10`
- `.hairline`: horizontal gradient divider
- `.underline-grow`: animated underline on hover (used in Nav)

---

## File Structure

```
app/
  layout.tsx          — fonts (Playfair Display + Inter), metadata, body wrapper
  page.tsx            — async Server Component; fetches social stats; ISR revalidate: 86400
  globals.css         — Tailwind base + .glass + .hairline + .underline-grow

components/
  Ambience.tsx        — "use client" — 4 spring-physics parallax orbs (fixed background)
  Nav.tsx             — "use client" — frosted bar fades in on scroll; links to all sections
  Hero.tsx            — "use client" — staggered Framer Motion entrance animation
  FeaturedCovers.tsx  — "use client" — 4 cover cards in 2-col grid (equal-height via flex)
  About.tsx           — Server Component — bio + live social stats
  Performances.tsx    — "use client" — timeline with connected dots + optional image gallery
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
Fixed `z-index: -10` background layer. Four `rounded-full` blurred orbs with spring-physics parallax on scroll:
- Deep violet (top-left, stable anchor, ζ≈1.30)
- Mid violet (upper body richness, ζ≈1.07)
- Pink bleed (bottom-centre, the "bubbly" star, ζ≈0.69 — underdamped, overshoots)
- Right wisp (side float, ζ≈0.80)

Uses `window.addEventListener('scroll')` → `useMotionValue` → `useSpring` (NOT `useScroll` from Framer Motion — that doesn't fire in Next.js App Router).

### 2. Nav — `components/Nav.tsx`
Fixed top bar. Frosted glass overlay (`bg-lavender/60 backdrop-blur-md`) fades in once `scrollY > 40px`. Links: Home, Portfolio, About, Performances, Contact. Book → CTA.

### 3. Hero — `components/Hero.tsx`
Full viewport height (`min-h-[92vh]`). Staggered entrance with `variants` container/item pattern. Two CTAs: "Explore My Covers" (primary, dark pill) and "Get in Touch" (outline).

### 4. Featured Covers — `components/FeaturedCovers.tsx`
2-column grid of 4 cover cards. Each card:
- Gradient art placeholder (top, `aspect-[4/3]`, `shrink-0`)
- Glass caption panel below (grows with `flex-1 flex-col` so all cards in a row are equal height)
- "View on Instagram →" pinned to the bottom with `mt-auto`

**Equal height fix**: FadeIn wrapper gets `className="h-full"`, `motion.a` is `flex flex-col h-full`.

**Caption border-radius fix**: `.glass` shorthand `border-radius: 1rem` overrides Tailwind utilities. Caption uses:
```tsx
style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, border: "none" }}
```

To add/edit covers — update the `covers` array in the file:
```ts
{ song, artist, caption, postUrl, gradient, accent }
```

### 5. About — `components/About.tsx`
Two-column layout (5/7 split on md+). Left: name/tagline glass panel. Right: bio text + three stats.

**Live stats** are passed in from `page.tsx` as `liveStats?: SocialStats`. Stats shown: Instagram Followers, TikTok Followers, Performing Since 2024. Falls back to `"10K+"` if live fetch fails.

### 6. Recent Performances — `components/Performances.tsx`
Vertical timeline with connected dots. Key implementation details:

**Timeline geometry** (tricky — do not simplify without testing):
- Each row: `div.group.relative.flex` + `pb-12` (except last item uses JS conditional, NOT `last:pb-0` — because FadeIn wrapper makes every item a `:last-child`, which broke the CSS selector)
- A `w-10 shrink-0` ghost spacer keeps the card pushed right
- The dot column is `absolute inset-y-0 left-0 w-10` — spans FULL row height including the `pb-12` gap
- First row: dot has `mt-[1.6rem]` to align with card content
- Rows 2–6: a `h-[1.6rem] w-px` pre-line segment bridges the gap from previous row's line to this dot — this is what keeps the thread unbroken
- Main line is `flex-1` inside the absolute column — fills from dot to row bottom (including pb-12 gap)

**Image gallery** — each performance supports up to 3 photos:
```ts
images: ["/performances/filename.jpg"]  // paths under /public
```
Drop files into `public/performances/`. Gallery auto-adapts: 1=full, 2=2-col, 3=3-col. Empty `images: []` = no gallery rendered. Images use `next/image` with `fill` and `object-cover`.

**Performance type pills**: Live Set (champagne), Showcase (plum), Feature (aubergine), Open Mic (aubergine), Collaboration (champagne).

To add a performance, add an entry to the `performances` array:
```ts
{
  event: "Event Name",
  venue: "Venue Name",
  date: "Month Year",
  location: "City, Country",
  type: "Live Set",          // one of the 5 types above
  link: "https://...",       // optional
  images: [],                // optional, up to 3 paths
}
```

### 7. CTA / Contact — `components/CTA.tsx`
Centred glass panel. Three CTAs:
- **Book a Collaboration** → `mailto:hello@danelladecruz.com`
- **Download Pricing Guide** → `/assets/Danella_De_Cruz_Pricing_Guide.pdf`
- **Email directly** → same mailto

Social links: Instagram (`@danella.decruz`), TikTok (`@danella.decruz`), Spotify (placeholder URL — update to real Spotify artist page).

### 8. Footer — `components/Footer.tsx`
Year hardcoded to `2026`. Update manually when needed.

---

## Live Social Stats

`lib/social-stats.ts` runs **server-side** at build/revalidation time.

**Instagram** — 3-tier waterfall:
1. Official Graph API (requires `IG_USER_ID` + `IG_GRAPH_TOKEN` env vars — see `INSTAGRAM_SETUP.md`)
2. Unofficial scrape fallback (may be rate-limited)
3. Static `"10K+"` fallback

**TikTok** — scrapes `__NEXT_DATA__` JSON for `followerCount` from `tiktok.com/@danella.decruz`.

Both update every **24 hours** via ISR (`export const revalidate = 86400` in `page.tsx`). No cron job needed.

To set up the Instagram API (recommended for reliability):
1. Follow the steps in `INSTAGRAM_SETUP.md`
2. Create `.env.local` from `.env.local.example`
3. Fill in `IG_USER_ID` and `IG_GRAPH_TOKEN`
4. Restart the dev server

---

## Content That Still Needs Real Assets

| Item | Where | What to do |
|---|---|---|
| Pricing Guide PDF | `public/assets/Danella_De_Cruz_Pricing_Guide.pdf` | Replace placeholder with real PDF |
| Performance photos | `public/performances/` | Drop JPG/PNG files here, add paths to `performances` array in `Performances.tsx` |
| Cover art photos | `FeaturedCovers.tsx` | Replace gradient placeholders with real `next/image` thumbnails from Instagram |
| Spotify URL | `CTA.tsx` line 57 | Replace `https://spotify.com` with Danella's actual Spotify artist page |
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
| Timeline line gap | `flex-1` line only fills column content height, not `pb-12` padding gap | Dot column is `absolute inset-y-0` so it spans full row height; pre-line bridges the gap |

---

## WCAG AA Compliance

All text passes WCAG AA (4.5:1 minimum). Key ratios:
- `champagne (#5A1238)` on glass: **5.9:1** ✓
- `champagne (#5A1238)` on raw lavender: **4.64:1** ✓
- `aubergine (#2D1B3D)` at full opacity: **~11:1** ✓
- `aubergine/80` on glass: passes ✓
- `aubergine/90` on footer: passes ✓

Do not reduce `aubergine` opacity below `/80` on glass surfaces or `/70` on raw lavender without re-checking contrast.
