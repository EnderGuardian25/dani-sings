"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Hero() {
  const reduce = useReducedMotion();

  return (
    <section
      id="home"
      className="relative isolate flex min-h-[92vh] flex-col pt-16"
    >
      <div className="container-page relative z-10 flex flex-1 items-center">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-3xl py-16"
        >
          <motion.p
            variants={item}
            className="text-[12px] uppercase tracking-wider2 text-salmon-deep"
          >
            Cover Artist · Vocalist
          </motion.p>

          <motion.h1
            variants={item}
            className="mt-6 font-display text-5xl leading-[1.05] text-aubergine sm:text-6xl md:text-7xl"
          >
            Danella
            <br />
            <span className="italic text-aubergine/80">De Cruz</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-8 max-w-xl text-base leading-relaxed text-aubergine md:text-lg"
          >
            A quiet space for atmospheric covers and considered vocal work.
            Each piece is recorded with intention — soft edges, honest tone,
            and a love for the songs that shaped me.
          </motion.p>

          <motion.div variants={item} className="mt-10 flex flex-wrap gap-4">
            <a
              href="#portfolio"
              className="group inline-flex items-center gap-2 rounded-full bg-aubergine px-7 py-3 text-sm font-medium text-frost shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift hover:ring-1 hover:ring-salmon-deep/60"
            >
              Explore My Covers
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full border border-taupe-deep/60 px-7 py-3 text-sm font-medium text-aubergine transition-all duration-300 hover:-translate-y-0.5 hover:bg-blush/40"
            >
              Get in Touch
            </a>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        className="container-page relative z-10 pb-10"
      >
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-wider2 text-aubergine/90">
          <span className="h-px w-10 bg-aubergine/40" />
          Scroll
        </div>
      </motion.div>
    </section>
  );
}
