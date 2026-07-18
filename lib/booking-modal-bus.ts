/**
 * Tiny client-side event bus for the booking modal.
 *
 * Any component (Nav, CTA button, …) can call openBookingModal() without the
 * modal state having to be threaded through React context — important here
 * because the triggers live in separate trees (Nav is a client component,
 * CTA is a server component with a small client button inside).
 */

export const BOOKING_OPEN_EVENT = "booking:open";

export function openBookingModal() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(BOOKING_OPEN_EVENT));
}
