/**
 * Module-level handle to the live Lenis instance so components outside
 * SmoothScroll (e.g. BookingModal) can stop/start page scrolling.
 * Set by SmoothScroll.tsx on mount, cleared on unmount.
 */

import type Lenis from "lenis";

let instance: Lenis | null = null;

export function setLenis(lenis: Lenis | null) {
  instance = lenis;
}

export function getLenis(): Lenis | null {
  return instance;
}
