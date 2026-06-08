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
    gradient: "from-[#7B6BB5] via-[#9880C8] to-[#C8A0D4]",
    accent: "#E8D0F0",
  },
  {
    song: "Heal the World",
    artist: "Michael Jackson",
    caption: "Covered this classic 😌 Heal the World by Michael Jackson.",
    postUrl: "https://www.instagram.com/p/DYcQJ9UB37z/",
    gradient: "from-[#A090C8] via-[#B8A8D8] to-[#D4C0E8]",
    accent: "#F0E8FF",
  },
  {
    song: "දඟකාර හැඩකාරි",
    artist: "Bathiya & Santhush",
    caption: "දඟකාර හැඩකාරි by Bathiya & Santhush 🤍",
    postUrl: "https://www.instagram.com/p/DZC4UVRhLAm/",
    gradient: "from-[#6858A8] via-[#8870C0] to-[#B090D0]",
    accent: "#DDD0F8",
  },
  {
    song: "You're Still the One",
    artist: "Shania Twain",
    caption: "A song that never gets old 🙂‍↔️ You're Still the One by Shania Twain.",
    postUrl: "https://www.instagram.com/p/DY3nYsdIzO4/",
    gradient: "from-[#9080C0] via-[#C0A0C8] to-[#E0C0D8]",
    accent: "#F4E8F8",
  },
];

export default function FeaturedCovers() {
  return (
    <section id="portfolio" className="relative py-28 md:py-36">
      <div className="container-page">

        <FadeIn>
          <div className="glass mb-14 flex flex-col gap-4 p-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[12px] uppercase tracking-wider2 text-champagne">
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
              className="inline-flex items-center gap-2 rounded-full border border-aubergine/40 px-7 py-3 text-sm font-medium text-aubergine transition-all duration-300 hover:-translate-y-0.5 hover:bg-aubergine/10"
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
      className="group flex h-full flex-col overflow-hidden rounded-2xl shadow-soft ring-1 ring-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-champagne"
      aria-label={`Watch ${cover.song} by ${cover.artist} on Instagram`}
    >
      {/* Placeholder art — full-bleed gradient with decorative music elements */}
      <div className={`relative shrink-0 bg-gradient-to-br ${cover.gradient} aspect-[4/3] w-full overflow-hidden`}>

        {/* Decorative rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-48 w-48 rounded-full border border-white/15" />
          <div className="absolute h-32 w-32 rounded-full border border-white/20" />
          <div className="absolute h-16 w-16 rounded-full border border-white/30" />
          <div className="absolute h-4 w-4 rounded-full bg-white/40" />
        </div>

        {/* Subtle waveform lines */}
        <svg viewBox="0 0 400 80" className="absolute bottom-8 left-0 right-0 w-full opacity-20" aria-hidden>
          <polyline
            points="0,40 30,20 60,50 90,15 120,45 150,25 180,55 210,10 240,50 270,20 300,45 330,30 360,50 400,35"
            fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>

        {/* Instagram badge */}
        <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-1.5 text-[11px] text-white/90 backdrop-blur-sm">
          <FaInstagram className="h-3 w-3" />
          Watch
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-aubergine/0 transition-colors duration-400 group-hover:bg-aubergine/15" />
      </div>

      {/* Caption card — inline style overrides .glass border-radius on the top corners */}
      <div className="glass flex flex-1 flex-col p-5" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, border: "none" }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-xl leading-tight text-aubergine">
              {cover.song}
            </p>
            <p className="mt-0.5 text-[12px] uppercase tracking-wider2 text-aubergine/80">
              {cover.artist}
            </p>
          </div>
          <span className="mt-1 shrink-0 text-aubergine/50 transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </div>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-aubergine/85">
          {cover.caption}
        </p>
        <p className="mt-4 text-[11px] uppercase tracking-wider2 text-champagne">
          View on Instagram →
        </p>
      </div>
    </motion.a>
  );
}
