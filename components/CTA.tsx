import { FaInstagram, FaTiktok, FaSpotify } from "react-icons/fa";
import { HiOutlineDocumentArrowDown, HiOutlineEnvelope } from "react-icons/hi2";
import FadeIn from "./FadeIn";

export default function CTA() {
  return (
    <section id="contact" className="relative py-28 md:py-36">
      <div className="container-page">
        <FadeIn className="mx-auto max-w-2xl">
          <div className="glass p-10 text-center md:p-14">
            <p className="text-[12px] uppercase tracking-wider2 text-salmon-deep">
              Let&apos;s Work Together
            </p>
            <h2 className="mt-3 font-display text-4xl text-aubergine md:text-5xl">
              Let&apos;s Collaborate
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-base text-aubergine md:text-lg">
              Have a song in mind, a project, or a release you&apos;d like a
              vocal on? Send me a note — I&apos;d love to hear it.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <a
                href="mailto:hello@danelladecruz.com?subject=Collaboration%20inquiry"
                className="group inline-flex items-center gap-2 rounded-full bg-aubergine px-7 py-3 text-sm font-medium text-frost shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift hover:ring-1 hover:ring-salmon-deep/60"
                style={{ ["--hover-shadow" as string]: "0 4px 20px rgba(45,27,61,0.25)" }}
              >
                Book a Collaboration
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </a>
              <a
                href="/assets/Danella_De_Cruz_Pricing_Guide.pdf"
                target="_blank"
                rel="noopener noreferrer"
                download
                className="inline-flex items-center gap-2 rounded-full border border-taupe-deep/60 px-7 py-3 text-sm font-medium text-aubergine transition-all duration-300 hover:-translate-y-0.5 hover:bg-blush/40"
              >
                <HiOutlineDocumentArrowDown className="h-4 w-4" />
                Download Pricing Guide
              </a>
              <a
                href="mailto:hello@danelladecruz.com"
                className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm text-aubergine transition-colors hover:text-salmon-deep"
              >
                <HiOutlineEnvelope className="h-4 w-4" />
                Email directly
              </a>
            </div>

            <div className="mt-12 flex flex-col items-center gap-4 border-t border-dusk/25 pt-10">
              <p className="text-[11px] uppercase tracking-wider2 text-secondary">
                Follow along
              </p>
              <div className="flex items-center gap-3">
                {[
                  { Icon: FaInstagram, href: "https://www.instagram.com/danella.decruz/", label: "Instagram" },
                  { Icon: FaTiktok,    href: "https://www.tiktok.com/@danella.decruz",    label: "TikTok" },
                  { Icon: FaSpotify,   href: "https://spotify.com",                        label: "Spotify" },
                ].map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-taupe/50 text-aubergine transition-all duration-300 hover:-translate-y-0.5 hover:border-salmon-deep hover:bg-salmon/15 hover:text-salmon-deep"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
