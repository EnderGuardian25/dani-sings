"use client";

import Image from "next/image";
import FadeIn from "./FadeIn";

/**
 * To add real photos to a performance, drop image files into
 *   public/performances/
 * and fill the `images` array with the filename, e.g.:
 *   images: ["/performances/loft-may25-1.jpg", "/performances/loft-may25-2.jpg"]
 * Up to 3 images per entry are displayed. Leave the array empty (or omit it)
 * and the image row is hidden — no broken placeholders.
 */

type Performance = {
  event: string;
  venue: string;
  date: string;
  location: string;
  type: "Live Set" | "Feature" | "Showcase" | "Collaboration" | "Open Mic";
  link?: string;
  images?: string[]; // paths under /public — up to 3
};

const performances: Performance[] = [
  {
    event: "Acoustic Evening at The Loft",
    venue: "The Loft Sessions",
    date: "May 2025",
    location: "Colombo, Sri Lanka",
    type: "Live Set",
    images: [], // ← drop up to 3 image paths here
  },
  {
    event: "Indie Showcase — Spring Edition",
    venue: "Stage 44",
    date: "March 2025",
    location: "Colombo, Sri Lanka",
    type: "Showcase",
    images: [],
  },
  {
    event: "Valentine's Night Live",
    venue: "The Grand Ballroom",
    date: "February 2025",
    location: "Colombo, Sri Lanka",
    type: "Feature",
    images: [],
  },
  {
    event: "New Year's Eve Open Mic",
    venue: "Barefoot Garden Café",
    date: "December 2024",
    location: "Colombo, Sri Lanka",
    type: "Open Mic",
    images: [],
  },
  {
    event: "Cover Night — Vol. 3",
    venue: "Café Uga Escape",
    date: "October 2024",
    location: "Negombo, Sri Lanka",
    type: "Live Set",
    images: [],
  },
  {
    event: "Arts & Music Festival",
    venue: "Nelum Pokuna Amphitheatre",
    date: "August 2024",
    location: "Colombo, Sri Lanka",
    type: "Showcase",
    images: [],
  },
];

const typePill: Record<Performance["type"], string> = {
  "Live Set":      "bg-champagne/15 text-champagne",
  "Feature":       "bg-aubergine/10 text-aubergine/80",
  "Showcase":      "bg-plum/10      text-plum",
  "Collaboration": "bg-champagne/10 text-champagne",
  "Open Mic":      "bg-aubergine/10 text-aubergine/80",
};

export default function Performances() {
  return (
    <section id="performances" className="relative py-28 md:py-36">
      <div className="hairline mx-auto mb-24 w-2/3 max-w-3xl" />
      <div className="container-page">

        {/* Section header */}
        <FadeIn>
          <div className="glass mb-14 flex flex-col gap-4 p-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[12px] uppercase tracking-wider2 text-champagne">
                Live
              </p>
              <h2 className="mt-3 font-display text-4xl text-aubergine md:text-5xl">
                Recent Performances
              </h2>
            </div>
            <p className="max-w-xs text-sm text-aubergine/80">
              A record of stages, rooms, and evenings — each one a song shared
              with a room full of people.
            </p>
          </div>
        </FadeIn>

        {/* Timeline list */}
        <div className="space-y-0">
          {performances.map((p, i) => {
            const imgs = (p.images ?? []).slice(0, 3);
            return (
              <FadeIn key={i} delay={i * 0.07}>
                {/* Timeline row */}
                <div className={`group relative flex ${i < performances.length - 1 ? "pb-12" : ""}`}>

                  {/* Ghost spacer — keeps the card pushed right without affecting the line */}
                  <div className="w-10 shrink-0" aria-hidden="true" />

                  {/* Dot column — absolutely positioned so it spans card height + pb gap */}
                  <div className="absolute inset-y-0 left-0 flex w-10 flex-col items-center">
                    {i === 0 ? (
                      /* First row: dot sits at the card's first content row */
                      <div className="mt-[1.6rem] h-[10px] w-[10px] shrink-0 rounded-full bg-champagne ring-2 ring-champagne/25" />
                    ) : (
                      /* Later rows: bridge the gap from the prev row's line-end to this dot */
                      <>
                        <div className="h-[1.6rem] w-px bg-aubergine/15" />
                        <div className="h-[10px] w-[10px] shrink-0 rounded-full bg-champagne ring-2 ring-champagne/25" />
                      </>
                    )}
                    {/* Line from dot to bottom of row — spans the pb-12 gap too */}
                    {i < performances.length - 1 && (
                      <div className="mt-2 w-px flex-1 bg-aubergine/15" />
                    )}
                  </div>

                  {/* Card */}
                  <div className="glass mb-0 flex-1 overflow-hidden transition-shadow duration-300 group-hover:shadow-lift">

                    {/* Main info row */}
                    <div className="flex flex-col gap-3 p-6 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex flex-col gap-1.5">
                        <span className={`inline-block w-fit rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${typePill[p.type]}`}>
                          {p.type}
                        </span>
                        <p className="font-display text-xl text-aubergine">
                          {p.event}
                        </p>
                        <p className="text-sm text-aubergine/80">{p.venue}</p>
                      </div>

                      <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
                        <p className="font-display text-base text-aubergine">{p.date}</p>
                        <p className="text-[12px] uppercase tracking-wider2 text-aubergine/80">
                          {p.location}
                        </p>
                        {p.link && (
                          <a
                            href={p.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 text-[11px] uppercase tracking-wider2 text-champagne hover:underline"
                          >
                            View event →
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Image gallery — only rendered when images are provided */}
                    {imgs.length > 0 && (
                      <div
                        className={`grid gap-1 px-6 pb-6 ${
                          imgs.length === 1
                            ? "grid-cols-1"
                            : imgs.length === 2
                            ? "grid-cols-2"
                            : "grid-cols-3"
                        }`}
                      >
                        {imgs.map((src, j) => (
                          <div
                            key={j}
                            className="relative aspect-[4/3] overflow-hidden rounded-lg"
                          >
                            <Image
                              src={src}
                              alt={`${p.event} — photo ${j + 1}`}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                              sizes="(max-width: 768px) 50vw, 300px"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>

        {/* Booking nudge */}
        <FadeIn delay={0.15}>
          <div className="mt-14 text-center">
            <p className="mb-4 text-sm text-aubergine/80">
              Interested in booking Danella for your event?
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full border border-aubergine/40 px-7 py-3 text-sm font-medium text-aubergine transition-all duration-300 hover:-translate-y-0.5 hover:bg-aubergine/10"
            >
              Get in Touch
            </a>
          </div>
        </FadeIn>

      </div>
    </section>
  );
}
