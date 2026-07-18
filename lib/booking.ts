/**
 * Shared booking-form constants — imported by both the client modal
 * (components/BookingModal.tsx) and the server route (app/api/book/route.ts)
 * so the allowed dropdown values and field limits can never drift apart.
 */

export const EVENT_TYPES = [
  "Wedding",
  "Corporate Event",
  "Private Party",
  "Birthday / Anniversary",
  "Festival",
  "Other",
] as const;

export const PERFORMANCE_FORMATS = [
  "Live Set",
  "Acoustic Session",
  "Background / Ambient Music",
  "Festival / Gig Slot",
  "Other",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];
export type PerformanceFormat = (typeof PERFORMANCE_FORMATS)[number];

/** Max accepted length per field — enforced client-side (maxLength) and server-side. */
export const FIELD_LIMITS = {
  name: 100,
  email: 200,
  eventDate: 10, // YYYY-MM-DD
  budget: 100,
  venue: 200,
  message: 2000,
} as const;

export type BookingPayload = {
  name: string;
  email: string;
  eventType: string;
  /** Optional — empty string means "not sure yet". */
  performanceFormat: string;
  eventDate: string;
  budget: string;
  venue: string;
  message: string;
  /** Honeypot — must be empty; bots that fill it are silently dropped. */
  botcheck: string;
};
