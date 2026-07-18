import { NextRequest, NextResponse } from "next/server";
import {
  EVENT_TYPES,
  PERFORMANCE_FORMATS,
  FIELD_LIMITS,
  type BookingPayload,
} from "@/lib/booking";

/**
 * Booking-form gate: rate limiting + validation.
 *
 * The browser must get an { ok: true } from this endpoint before it submits
 * to Web3Forms directly. (Web3Forms' free plan blocks server-to-server
 * submissions behind a Cloudflare bot challenge — proxying the actual send
 * through here requires their Pro plan — so the send happens client-side
 * with the public access key, and this route enforces the per-IP limit for
 * everything going through the site UI.)
 */

// ---- Rate limiting (in-memory, per server instance) ------------------------

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_PER_WINDOW = 3;
// On serverless each instance has its own map — still blunts abuse; a
// portfolio's legitimate traffic never comes close to the limit.
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();

  // Opportunistic global prune so the map can't grow unbounded.
  if (hits.size > 500) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t > WINDOW_MS)) hits.delete(key);
    }
  }

  const recent = (hits.get(ip) ?? []).filter((t) => now - t <= WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

function clientIp(req: NextRequest): string {
  // Cloudflare puts the real client IP here (x-forwarded-for can be spoofed
  // upstream of it); other hosts populate the x-* headers.
  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf;
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

// ---- Validation -------------------------------------------------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

// ---- Handler ----------------------------------------------------------------

export async function POST(req: NextRequest) {
  if (isRateLimited(clientIp(req))) {
    return bad(
      "You've sent a few requests already — please wait a few minutes and try again.",
      429
    );
  }

  let body: Partial<BookingPayload>;
  try {
    body = await req.json();
  } catch {
    return bad("Invalid request.");
  }

  const field = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const name = field(body.name);
  const email = field(body.email);
  const eventType = field(body.eventType);
  const performanceFormat = field(body.performanceFormat);
  const eventDate = field(body.eventDate);
  const budget = field(body.budget);
  const venue = field(body.venue);
  const message = field(body.message);
  const botcheck = field(body.botcheck);

  // Honeypot tripped — pretend success so bots don't adapt. (The client will
  // go on to submit to Web3Forms, whose own botcheck drops it there too.)
  if (botcheck !== "") {
    return NextResponse.json({ ok: true });
  }

  if (!name || name.length > FIELD_LIMITS.name) return bad("Please enter your name.");
  if (!EMAIL_RE.test(email) || email.length > FIELD_LIMITS.email)
    return bad("Please enter a valid email address.");
  if (!(EVENT_TYPES as readonly string[]).includes(eventType))
    return bad("Please choose an event type.");
  if (
    performanceFormat !== "" &&
    !(PERFORMANCE_FORMATS as readonly string[]).includes(performanceFormat)
  )
    return bad("Invalid performance format.");
  if (eventDate !== "" && !DATE_RE.test(eventDate))
    return bad("Invalid event date.");
  if (budget.length > FIELD_LIMITS.budget) return bad("Budget is too long.");
  if (!venue || venue.length > FIELD_LIMITS.venue)
    return bad("Please enter the venue name and city.");
  if (message.length > FIELD_LIMITS.message) return bad("Message is too long.");

  return NextResponse.json({ ok: true });
}
