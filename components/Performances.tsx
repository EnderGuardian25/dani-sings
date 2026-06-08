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
  images?: string[];
};

const performances: Performance[] = [
  {
    event: "Acoustic Evening at The Loft",
    venue: "The Loft Sessions",
    date: "May 2025",
    location: "Colombo, Sri Lanka",
    type: "Live Set",
    images: [],
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
  "Live Set":      "bg-salmon/15 text-salmon-deep",
  "Feature":       "bg-aubergine/10 text-aubergine/80",
  "Showcase":      "bg-mauve/15 text-mauve",
  "Collaboration": "bg-salmon/15 text-salmon-deep",
  "Open Mic":      "bg-aubergine/10 text-aubergine/80",
};

export default function Performances() {
  return (
    <section id="performances" className="relative py-28 md:py-36">
      <div className="hairline mx-auto mb-24 w-2/3 max-w-3xl" />
      <div className="container-page">

        {/* Section header — cream glass, consistent with all other section headers */}
        <FadeIn>
          <div className="glass mb-4 flex flex-col gap-4 p-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[12px] uppercase tracking-wider2 text-salmon-deep">
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

        {/* Unified performance list — single blush-glass container, editorial row layout */}
        <FadeIn>
          <div
            className="overflow-hidden rounded-2xl"
            style={{
              background: "rgba(237, 180, 168, 0.18)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              border: "1px solid rgba(196, 90, 74, 0.15)",
              boxShadow: "0 8px 32px -12px rgba(45, 27, 61, 0.12)",
            }}
          >
            {performances.map((p, i) => {
              const imgs = (p.images ?? []).slice(0, 3);
              return (
                <div key={i} className="group relative">

                  {/* Hover wash */}
                  <div className="absolute inset-0 bg-blush/0 transition-colors duration-300 group-hover:bg-blush/20" />

                  {/* Row content */}
                  <div className="relative flex flex-col gap-5 px-8 py-7 sm:flex-row sm:items-center sm:justify-between">

                    {/* Left — pill + event name + venue */}
                    <div className="flex flex-col gap-2 min-w-0">
                      <span className={`inline-block w-fit rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${typePill[p.type]}`}>
                        {p.type}
                      </span>
                      <p className="font-display text-xl text-aubergine transition-colors duration-300 group-hover:text-salmon-deep md:text-2xl">
                        {p.event}
                      </p>
                      <p className="text-sm text-secondary">{p.venue}</p>
                    </div>

                    {/* Right — date + location + optional link */}
                    <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
                      <p className="font-display text-base italic text-aubergine/70">{p.date}</p>
                      <p className="text-[11px] uppercase tracking-wider2 text-secondary">{p.location}</p>
                      {p.link && (
                        <a
                          href={p.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 text-[11px] uppercase tracking-wider2 text-salmon-deep hover:underline"
                        >
                          View event →
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Image gallery — only rendered when images are provided */}
                  {imgs.length > 0 && (
                    <div
                      className={`relative grid gap-1 px-8 pb-7 ${
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
                          className="relative aspect-[4/3] overflow-hidden rounded-xl"
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

                  {/* Hairline divider — not on the last row */}
                  {i < performances.length - 1 && (
                    <div
                      className="mx-8"
                      style={{
                        height: "1px",
                        background: "linear-gradient(to right, transparent, rgba(196, 90, 74, 0.2), transparent)",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </FadeIn>

        {/* Booking nudge */}
        <FadeIn delay={0.15}>
          <div className="mt-14 text-center">
            <p className="mb-4 text-sm text-aubergine/80">
              Interested in booking Danella for your event?
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full border border-taupe-deep/60 px-7 py-3 text-sm font-medium text-aubergine transition-all duration-300 hover:-translate-y-0.5 hover:bg-blush/40"
            >
              Get in Touch
            </a>
          </div>
        </FadeIn>

      </div>
    </section>
  );
}
