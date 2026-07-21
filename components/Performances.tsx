"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import FadeIn from "./FadeIn";
import { getLenis } from "@/lib/lenis-store";

/**
 * To add media to a performance, drop web-ready files into
 *   public/performances/
 * and add entries to the `media` array:
 *   { kind: "image", src: "/performances/foo.jpg" }
 *   { kind: "video", src: "/performances/foo.mp4", poster: "/performances/foo-poster.jpg" }
 * Videos need a poster image — only the poster loads until the visitor
 * presses play (the video itself opens in the lightbox).
 *
 * Keep videos compressed (H.264, ≤720px wide, ~1 Mbps) — Cloudflare Workers
 * rejects static assets over 25 MB, and phones thank you. Originals live in
 * /media-originals (gitignored); re-encode with ffmpeg, don't copy them here.
 */

type MediaItem = {
  kind: "image" | "video";
  src: string;
  poster?: string; // required for videos
};

type Performance = {
  event: string;
  venue: string;
  date: string;
  link?: string;
  media?: MediaItem[];
};

const performances: Performance[] = [
  {
    event: "Taylor Swift Tribute Night",
    venue: "Ma Café",
    date: "18 July 2026",
    media: [
      { kind: "video", src: "/performances/taylor-swift-tribute.mp4", poster: "/performances/taylor-swift-tribute-poster.jpg" },
      { kind: "image", src: "/performances/taylor-swift-tribute-1.jpg" },
      { kind: "image", src: "/performances/taylor-swift-tribute-2.jpg" },
    ],
  },
  {
    event: "Seylan Bank Media Cocktail Night",
    venue: "Oak Room, Cinnamon Grand",
    date: "24 June 2026",
    media: [
      { kind: "video", src: "/performances/seylan-bank-1.mp4", poster: "/performances/seylan-bank-1-poster.jpg" },
      { kind: "video", src: "/performances/seylan-bank-2.mp4", poster: "/performances/seylan-bank-2-poster.jpg" },
      { kind: "image", src: "/performances/seylan-bank-1.jpg" },
      { kind: "image", src: "/performances/seylan-bank-2.jpg" },
    ],
  },
  {
    event: "StageCraft",
    venue: "Nelum Pokuna Theatre",
    date: "22 May 2026",
    media: [
      { kind: "video", src: "/performances/stagecraft.mp4", poster: "/performances/stagecraft-poster.jpg" },
      { kind: "image", src: "/performances/stagecraft-1.jpg" },
      { kind: "image", src: "/performances/stagecraft-2.jpg" },
    ],
  },
  {
    event: "Avurudu Celebrations",
    venue: "The Shoppes, Cinnamon Life",
    date: "14 April 2026",
    media: [
      { kind: "video", src: "/performances/avurudu-celebrations.mp4", poster: "/performances/avurudu-celebrations-poster.jpg" },
    ],
  },
  {
    event: "Avurudu Countdown",
    venue: "The Shoppes, Cinnamon Life",
    date: "11 April 2026",
    media: [
      { kind: "video", src: "/performances/avurudu-countdown-1.mp4", poster: "/performances/avurudu-countdown-1-poster.jpg" },
      { kind: "video", src: "/performances/avurudu-countdown-2.mp4", poster: "/performances/avurudu-countdown-2-poster.jpg" },
    ],
  },
  {
    event: "Valentine's High Tea",
    venue: "Gatz, Cinnamon Life",
    date: "14 February 2026",
    media: [
      { kind: "video", src: "/performances/valentines-high-tea.mp4", poster: "/performances/valentines-high-tea-poster.jpg" },
    ],
  },
];

function MediaTile({
  item,
  label,
  onOpen,
}: {
  item: MediaItem;
  label: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={item.kind === "video" ? `Play video — ${label}` : `View photo — ${label}`}
      className={`group/tile relative h-48 shrink-0 overflow-hidden rounded-xl sm:h-56 ${
        item.kind === "video" ? "aspect-[9/16]" : "aspect-[3/4]"
      }`}
    >
      <Image
        src={item.kind === "video" ? item.poster! : item.src}
        alt={label}
        fill
        className="object-cover transition-transform duration-500 group-hover/tile:scale-[1.04]"
        sizes="(max-width: 640px) 40vw, 170px"
      />
      {item.kind === "video" && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-full shadow-soft transition-transform duration-300 group-hover/tile:scale-110"
            style={{
              background: "rgba(250, 247, 244, 0.85)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              className="ml-0.5 h-4 w-4 text-aubergine"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 5.5v13l11-6.5-11-6.5z" />
            </svg>
          </span>
        </span>
      )}
    </button>
  );
}

function Lightbox({
  item,
  label,
  onClose,
}: {
  item: MediaItem;
  label: string;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    getLenis()?.stop();
    document.documentElement.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      getLenis()?.start();
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10"
      role="dialog"
      aria-modal="true"
      aria-label={label}
      data-lenis-prevent
    >
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(45, 27, 61, 0.88)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
        onClick={onClose}
      />
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full text-frost transition-colors hover:text-salmon sm:right-6 sm:top-6"
        style={{ background: "rgba(250, 247, 244, 0.12)" }}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
      <figure className="relative z-[1] flex max-h-full max-w-full flex-col items-center">
        {item.kind === "video" ? (
          <video
            src={item.src}
            poster={item.poster}
            controls
            autoPlay
            playsInline
            className="max-h-[80vh] max-w-full rounded-xl"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- already web-sized; next/image fill needs fixed dims
          <img src={item.src} alt={label} className="max-h-[80vh] max-w-full rounded-xl object-contain" />
        )}
        <figcaption className="mt-3 text-center text-[11px] uppercase tracking-wider2 text-frost/70">
          {label}
        </figcaption>
      </figure>
    </div>,
    document.body
  );
}

export default function Performances() {
  const [lightbox, setLightbox] = useState<{ item: MediaItem; label: string } | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const openLightbox = (item: MediaItem, label: string) => {
    triggerRef.current = document.activeElement as HTMLElement;
    setLightbox({ item, label });
  };

  const closeLightbox = useCallback(() => {
    setLightbox(null);
    triggerRef.current?.focus();
  }, []);

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
              A record of stages, rooms, and evenings across Colombo — each one
              a song shared with a room full of people.
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
              const label = `${p.event} — ${p.venue}`;
              return (
                <div key={i} className="group relative">

                  {/* Hover wash */}
                  <div className="absolute inset-0 bg-blush/0 transition-colors duration-300 group-hover:bg-blush/20" />

                  {/* Row content */}
                  <div className="relative flex flex-col gap-5 px-8 py-7 sm:flex-row sm:items-center sm:justify-between">

                    {/* Left — event name + venue */}
                    <div className="flex min-w-0 flex-col gap-1.5">
                      <p className="font-display text-xl text-aubergine transition-colors duration-300 group-hover:text-salmon-deep md:text-2xl">
                        {p.event}
                      </p>
                      <p className="text-sm text-secondary">{p.venue}</p>
                    </div>

                    {/* Right — date + optional link */}
                    <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
                      <p className="font-display text-base italic text-aubergine/70">{p.date}</p>
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

                  {/* Media strip — poster thumbnails, click to open in the lightbox */}
                  {(p.media ?? []).length > 0 && (
                    <div className="relative flex flex-wrap gap-2 px-8 pb-7">
                      {p.media!.map((m, j) => (
                        <MediaTile
                          key={j}
                          item={m}
                          label={label}
                          onOpen={() => openLightbox(m, label)}
                        />
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

      {lightbox && (
        <Lightbox item={lightbox.item} label={lightbox.label} onClose={closeLightbox} />
      )}
    </section>
  );
}
