"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const links = [
  { href: "#home",         label: "Home" },
  { href: "#portfolio",    label: "Portfolio" },
  { href: "#about",        label: "About" },
  { href: "#performances", label: "Performances" },
  { href: "#contact",      label: "Contact" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50"
    >
      {/* Frosted bar — opacity-fades in on scroll; bg via inline style to avoid Tailwind arbitrary-value issues */}
      <motion.div
        animate={{ opacity: scrolled ? 1 : 0 }}
        transition={{ duration: 0.55, ease: "easeInOut" }}
        className="pointer-events-none absolute inset-0 border-b border-dusk/30 backdrop-blur-md"
        style={{ background: "rgba(240, 230, 226, 0.75)" }}
      />

      <div className="container-page relative flex h-16 items-center justify-between">
        <a href="#home" className="font-display text-lg tracking-wide text-aubergine">
          Danella<span className="text-salmon-deep">.</span>
        </a>

        <nav className="hidden md:flex items-center gap-9">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="underline-grow font-display text-[17px] tracking-wide text-aubergine transition-colors hover:text-salmon-deep"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <a
          href="#contact"
          className="hidden md:inline-flex items-center font-display text-[16px] italic tracking-wide text-aubergine transition-colors hover:text-salmon-deep"
        >
          Book&nbsp;→
        </a>
        <a
          href="#portfolio"
          className="font-display text-[16px] italic tracking-wide text-aubergine md:hidden"
        >
          Menu
        </a>
      </div>
    </motion.header>
  );
}
