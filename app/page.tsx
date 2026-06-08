import About from "@/components/About";
import Ambience from "@/components/Ambience";
import CTA from "@/components/CTA";
import FeaturedCovers from "@/components/FeaturedCovers";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Nav from "@/components/Nav";
import Performances from "@/components/Performances";
import { getSocialStats } from "@/lib/social-stats";

// Revalidate the whole page once every 24 hours so follower counts stay fresh.
export const revalidate = 86400;

export default async function Page() {
  const socialStats = await getSocialStats();

  return (
    <main className="relative">
      <Ambience />
      <Nav />
      <Hero />
      <FeaturedCovers />
      <About liveStats={socialStats} />
      <Performances />
      <CTA />
      <Footer />
    </main>
  );
}
