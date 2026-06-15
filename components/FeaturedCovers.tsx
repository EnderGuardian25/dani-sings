"use client";

import { motion } from "framer-motion";
import { FaInstagram } from "react-icons/fa";
import FadeIn from "./FadeIn";

type Cover = {
  song: string;
  artist: string;
  caption: string;
  postUrl: string;
  gradient: string;
  accent: string;
};

const covers: Cover[] = [
  {
    song: "සැනසෙන්නම් මා",
    artist: "Senaka Batagoda",
    caption: "One of my all time favorites 🤍 සැනසෙන්නම් මා by Senaka Batagoda.",
    postUrl: "https://www.instagram.com/p/DYKQiL7oTix/",
    gradient: "from-[#E8C4B8] via-[#D4B4C8] to-[#C0A8D4]",
    accent: "#EDB4A8",
  },
  {
    song: "Heal the World",
    artist: "Michael Jackson",
    caption: "Covered this classic 😌 Heal the World by Michael Jackson.",
    postUrl: "https://www.instagram.com/p/DYcQJ9UB37z/",
    gradient: "from-[#D4C0CC] via-[#C8B4D0] to-[#B8A8D8]",
    accent: "#F2EDE8",
  },
  {
    song: "දඟකාර හැඩකාරි",
    artist: "Bathiya & Santhush",
    caption: "දඟකාර හැඩකාරි by Bathiya & Santhush 🤍",
    postUrl: "https://www.instagram.com/p/DZC4UVRhLAm/",
    gradient: "from-[#C8B0C0] via-[#B8A0C8] to-[#A890C0]",
    accent: "#E8E1EF",
  },
  {
    song: "You're Still the One",
    artist: "Shania Twain",
    caption: "A song that never gets old 🙂‍↔️ You're Still the One by Shania Twain.",
    postUrl: "https://www.instagram.com/p/DY3nYsdIzO4/",
    gradient: "from-[#EDD0C4] via-[#DCC0CC] to-[#CCB0D8]",
    accent: "#FAF7F4",
  },
];

export default function FeaturedCovers() {
  return (
    <section id="portfolio" className="relative py-28 md:py-36">
      <div className="container-page">

        <FadeIn>
          <div className="glass mb-14 flex flex-col gap-4 p-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[12px] uppercase tracking-wider2 text-salmon-deep">
                Selected Work
              </p>
              <h2 className="mt-3 font-display text-4xl text-aubergine md:text-5xl">
                Featured Covers
              </h2>
            </div>
            <p className="max-w-sm text-sm text-aubergine/90">
              A small, considered set — each one a song that means something.
              Tap any card to watch on Instagram.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          {covers.map((cover, i) => (
            <FadeIn key={cover.postUrl} delay={i * 0.08} className="h-full">
              <CoverCard cover={cover} />
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.15}>
          <div className="mt-16 text-center">
            <a
              href="https://www.instagram.com/danella.decruz/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-taupe-deep/60 px-7 py-3 text-sm font-medium text-aubergine transition-all duration-300 hover:-translate-y-0.5 hover:bg-blush/40"
            >
              <FaInstagram className="h-4 w-4" />
              See all covers on Instagram
            </a>
          </div>
        </FadeIn>

      </div>
    </section>
  );
}

function CoverCard({ cover }: { cover: Cover }) {
  return (
    <motion.a
      href={cover.postUrl}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="group glass flex h-full flex-col p-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-salmon-deep"
      aria-label={`Watch ${cover.song} by ${cover.artist} on Instagram`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-xl leading-tight text-aubergine">
            {cover.song}
          </p>
          <p className="mt-0.5 text-[12px] uppercase tracking-wider2 text-aubergine/80">
            {cover.artist}
          </p>
        </div>
        <span className="mt-1 shrink-0 text-secondary transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      </div>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-aubergine/85">
        {cover.caption}
      </p>
      <p className="mt-4 text-[11px] uppercase tracking-wider2 text-salmon-deep">
        View on Instagram →
      </p>
    </motion.a>
  );
}
