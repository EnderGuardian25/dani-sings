import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";
import memoryQueue from "@opennextjs/cloudflare/overrides/queue/memory-queue";

// KV incremental cache keeps the 24h ISR revalidation of the home page
// (live follower counts) working on Workers; the memory queue handles the
// time-based revalidations (fine for a single low-traffic site).
export default defineCloudflareConfig({
  incrementalCache: kvIncrementalCache,
  queue: memoryQueue,
});
