"use client";

/**
 * Lenis smooth-scroll driver.
 *
 * Runs Lenis against the native window scroll (not a wrapper element), so the
 * existing `window.scrollY` / `scroll` listeners in Nav.tsx and Ambience.tsx keep
 * working unchanged — Lenis animates the real scroll position and still emits
 * native scroll events.
 *
 * Headless: renders nothing. Mounted once near the top of <body> in layout.tsx.
 * Respects `prefers-reduced-motion` — when set, Lenis is not initialised and the
 * browser's default (instant) scrolling is used.
 */

import { useEffect } from "react";
import { useReducedMotion } from "framer-motion";
import Lenis from "lenis";
import { setLenis } from "@/lib/lenis-store";

// Fixed nav bar is h-16 (64px); leave a little breathing room above anchor targets.
const ANCHOR_OFFSET = -80;

export default function SmoothScroll() {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;

    const lenis = new Lenis({
      duration: 1.1,
      // easeOutExpo — quick to respond, long gentle settle. No overshoot.
      easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    // Expose the instance so BookingModal can stop/start page scroll.
    setLenis(lenis);

    let rafId = requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    });

    // Smooth-scroll same-page hash links (nav + in-page CTAs) through Lenis.
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement)?.closest?.(
        'a[href^="#"]'
      ) as HTMLAnchorElement | null;
      if (!anchor) return;

      const hash = anchor.getAttribute("href");
      if (!hash || hash === "#") return;

      const target = document.querySelector(hash);
      if (!target) return;

      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: ANCHOR_OFFSET });
      history.pushState(null, "", hash);
    };

    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(rafId);
      setLenis(null);
      lenis.destroy();
    };
  }, [reduce]);

  return null;
}
