"use client";

import { openBookingModal } from "@/lib/booking-modal-bus";

/**
 * Primary CTA trigger for the booking modal. A small client island so the
 * surrounding CTA section can stay a Server Component.
 */
export default function BookEventButton() {
  return (
    <button
      type="button"
      onClick={openBookingModal}
      className="group inline-flex items-center gap-2 rounded-full bg-aubergine px-7 py-3 text-sm font-medium text-frost shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift hover:ring-1 hover:ring-salmon-deep/60"
    >
      Book an Event
      <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
    </button>
  );
}
