import { FALLBACKS, type SocialStats } from "@/lib/social-stats";
import CountUp from "./CountUp";
import FadeIn from "./FadeIn";

export default function About({ liveStats }: { liveStats?: SocialStats }) {
  const stats = [
    {
      value: liveStats?.instagram ?? FALLBACKS.instagram,
      label: "Instagram Followers",
    },
    {
      value: liveStats?.tiktok ?? FALLBACKS.tiktok,
      label: "TikTok Followers",
    },
    // Years count from 2000 (not 0) so the roll reads as a year, not a tally.
    { value: "2025", label: "Performing Since", from: 2000 },
  ];

  return (
    <section id="about" className="relative py-28 md:py-36">
      <div className="hairline mx-auto mb-24 w-2/3 max-w-3xl" />
      <div className="container-page grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-12">

        <FadeIn className="md:col-span-5">
          <div className="glass h-full p-8 md:p-10">
            <p className="text-[12px] uppercase tracking-wider2 text-salmon-deep">
              About
            </p>
            <h2 className="mt-3 font-display text-4xl text-aubergine md:text-5xl">
              A voice for the
              <br />
              <span className="italic text-aubergine/80">in-between hours.</span>
            </h2>
          </div>
        </FadeIn>

        <FadeIn delay={0.1} className="md:col-span-7">
          <div className="glass p-8 md:p-10">
            <div className="space-y-5 text-base leading-relaxed text-aubergine md:text-lg">
              <p>
                I&apos;m Danella — a cover artist drawn to the songs that feel
                like rooms you can step into. My work lives in the soft edges:
                hushed dynamics, close microphones, the kind of arrangement
                that lets a lyric breathe.
              </p>
              <p>
                I share my covers across Instagram and TikTok, and I take on a
                small number of collaborations and bookings each season. If a
                song has been sitting with you, I&apos;d love to hear about it.
              </p>
            </div>

            <ul className="mt-10 grid grid-cols-3 gap-6 border-t border-dusk/40 pt-8">
              {stats.map((s) => (
                <li key={s.label}>
                  <p className="font-display text-3xl text-aubergine">
                    <CountUp value={s.value} from={s.from ?? 0} />
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-wider2 text-secondary">
                    {s.label}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </FadeIn>

      </div>
    </section>
  );
}
