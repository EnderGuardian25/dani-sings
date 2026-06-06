/**
 * Fetches live follower counts for Danella's social profiles.
 * Called from the page Server Component — Next.js caches the fetch
 * responses for 24 hours (revalidate: 86400), so it re-fetches once
 * per day without any cron job.
 *
 * If either fetch fails (rate-limit, network, API change) the component
 * gracefully falls back to the FALLBACK values below.
 */

const IG_USERNAME = "danella.decruz";

/**
 * ← Set this to your TikTok @handle (without the @) once you know it.
 * Leave as "" to skip the TikTok fetch and show the fallback.
 */
const TT_USERNAME = "danella.decruz";

/** Fallback values shown when a live fetch fails or username is not set. */
export const FALLBACKS = {
  instagram: "10K+",
  tiktok: "10K+",
};

export type SocialStats = {
  instagram: string | null;
  tiktok: string | null;
};

// ─── Formatters ───────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M+`;
  if (n >= 10_000) return `${Math.round(n / 1_000)}K+`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K+`;
  return String(n);
}

// ─── Instagram ────────────────────────────────────────────────────────────────

const GRAPH_VERSION = "v21.0";

/**
 * Official Instagram Graph API — the reliable, ToS-compliant path.
 * Requires a Creator/Business account + a Meta app access token.
 * Reads two env vars (see .env.local.example for setup):
 *   IG_USER_ID      — numeric Instagram Business/Creator account id
 *   IG_GRAPH_TOKEN  — a long-lived (or system-user) access token
 * Returns null if the env vars are absent so the scraper fallback runs.
 */
async function fetchIgViaGraphApi(): Promise<string | null> {
  const userId = process.env.IG_USER_ID;
  const token = process.env.IG_GRAPH_TOKEN;
  if (!userId || !token) return null;

  try {
    const url =
      `https://graph.facebook.com/${GRAPH_VERSION}/${userId}` +
      `?fields=followers_count&access_token=${token}`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const json = await res.json();
    const count: number | undefined = json?.followers_count;
    return count != null ? fmt(count) : null;
  } catch {
    return null;
  }
}

/**
 * Unofficial web endpoint — fallback when the Graph API isn't configured
 * or returns nothing. Instagram rate-limits this, so it may return null.
 */
async function fetchIgViaScrape(): Promise<string | null> {
  try {
    const res = await fetch(
      `https://www.instagram.com/api/v1/users/web_profile_info/?username=${IG_USERNAME}`,
      {
        headers: {
          "x-ig-app-id": "936619743392459",
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept: "application/json",
          Referer: `https://www.instagram.com/${IG_USERNAME}/`,
        },
        next: { revalidate: 86400 },
      }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const count: number | undefined =
      json?.data?.user?.edge_followed_by?.count;
    return count != null ? fmt(count) : null;
  } catch {
    return null;
  }
}

/** Tiered fetch: official Graph API → unofficial scrape → (static fallback in UI). */
async function fetchIgFollowers(): Promise<string | null> {
  return (await fetchIgViaGraphApi()) ?? (await fetchIgViaScrape());
}

// ─── TikTok ───────────────────────────────────────────────────────────────────

async function fetchTtFollowers(): Promise<string | null> {
  if (!TT_USERNAME) return null;
  try {
    const res = await fetch(`https://www.tiktok.com/@${TT_USERNAME}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html",
      },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const html = await res.text();
    // TikTok embeds stats in the page's __NEXT_DATA__ JSON blob
    const match = html.match(/"followerCount":(\d+)/);
    return match ? fmt(parseInt(match[1], 10)) : null;
  } catch {
    return null;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getSocialStats(): Promise<SocialStats> {
  const [instagram, tiktok] = await Promise.all([
    fetchIgFollowers(),
    fetchTtFollowers(),
  ]);
  return { instagram, tiktok };
}
