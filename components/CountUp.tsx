"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

type Props = {
  /** Final display value, e.g. "8.8K+", "6.6K+", "2025". */
  value: string;
  /** Number to count up from (default 0). e.g. 2000 for a year roll. */
  from?: number;
  duration?: number;
  className?: string;
};

/**
 * Counts a stat up when it first scrolls into view.
 *
 * Server-renders the final value (SEO / no-JS safe), then once mounted holds
 * the start value until the element enters the viewport and rolls up to the
 * target. The rolling text is written straight to the DOM node (`textContent`)
 * from the animation's onUpdate — no React re-render per frame.
 *
 * Handles values with a prefix/suffix around the number ("8.8K+" → animates
 * 0.0 → 8.8 keeping "K+") and preserves the decimal places of the target.
 * Respects prefers-reduced-motion by simply showing the final value.
 */
export default function CountUp({ value, from = 0, duration = 1.6, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node || reduce) return;

    // "8.8K+" → prefix "", number "8.8", suffix "K+"
    const match = value.match(/^([^\d]*)(\d+(?:\.\d+)?)(.*)$/);
    if (!match) return;

    const target = parseFloat(match[2]);
    const decimals = (match[2].split(".")[1] ?? "").length;
    const start = Math.min(from, target);
    const fmt = (v: number) => `${match[1]}${v.toFixed(decimals)}${match[3]}`;

    if (!inView) {
      node.textContent = fmt(start);
      return;
    }
    const controls = animate(start, target, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        node.textContent = fmt(v);
      },
    });
    return () => controls.stop();
  }, [inView, reduce, value, from, duration]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
