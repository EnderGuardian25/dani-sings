import type { Metadata } from "next";
import { Playfair_Display, Inter_Tight } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Danella De Cruz — Cover Artist & Vocalist",
  description:
    "Cover artist and vocalist Danella De Cruz. A curated portfolio of covers, collaborations, and bookings.",
  openGraph: {
    title: "Danella De Cruz — Cover Artist & Vocalist",
    description:
      "A curated portfolio of covers, collaborations, and bookings.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="font-body text-gunmetal antialiased">
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
