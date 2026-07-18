import type { MetadataRoute } from "next";

export const SITE_URL = "https://danelladc.com";

// Single-page site — the hash sections (#portfolio, #about, …) are not
// separate documents, so the sitemap is just the root URL.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
