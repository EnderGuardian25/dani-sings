"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { HiChevronDown, HiXMark, HiCheck } from "react-icons/hi2";
import { BOOKING_OPEN_EVENT } from "@/lib/booking-modal-bus";
import { getLenis } from "@/lib/lenis-store";
import {
  EVENT_TYPES,
  PERFORMANCE_FORMATS,
  FIELD_LIMITS,
} from "@/lib/booking";

type Status = "idle" | "sending" | "sent";

// Web3Forms access keys are public by design (like a form action URL) — spam
// protection comes from our /api/book rate-limit gate + honeypots. Inlined at
// build time, so changing it requires a rebuild.
const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;

const inputClasses =
  "w-full rounded-xl border border-dusk/50 bg-white/60 px-4 py-2.5 text-sm text-aubergine placeholder:text-secondary/60 outline-none transition-colors duration-200 focus:border-salmon-deep/60 focus:ring-2 focus:ring-salmon-deep/25";

const labelClasses =
  "mb-1.5 block text-[11px] uppercase tracking-wider2 text-secondary";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelClasses}>
        {label}
        {required && <span className="text-salmon-deep"> *</span>}
      </span>
      {children}
    </label>
  );
}

function Select({
  name,
  required,
  placeholder,
  options,
  value,
  onChange,
}: {
  name: string;
  required?: boolean;
  placeholder: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <select
        name={name}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClasses} appearance-none pr-10 ${
          value === "" ? "text-secondary/70" : ""
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <HiChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
    </div>
  );
}

export default function BookingModal() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    eventType: "",
    performanceFormat: "",
    eventDate: "",
    budget: "",
    venue: "",
    message: "",
    botcheck: "",
  });

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const close = useCallback(() => setOpen(false), []);

  // Open on the global bus event (fired by Nav / CTA triggers).
  useEffect(() => {
    const onOpen = () => {
      setStatus("idle");
      setError(null);
      setOpen(true);
    };
    window.addEventListener(BOOKING_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(BOOKING_OPEN_EVENT, onOpen);
  }, []);

  // Scroll lock + focus management while open.
  useEffect(() => {
    if (!open) return;

    lastFocusedRef.current = document.activeElement as HTMLElement | null;

    // Lenis stop() blocks wheel/touch; overflow:hidden covers keyboard
    // scrolling and the reduced-motion case where Lenis isn't running.
    // Pad for the vanished scrollbar so the page doesn't shift.
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    getLenis()?.stop();
    document.documentElement.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;

    const focusTimer = window.setTimeout(() => firstFieldRef.current?.focus(), 50);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      // Minimal focus trap — keep Tab cycling inside the panel.
      if (e.key === "Tab" && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([type="hidden"]), select, textarea'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      document.documentElement.style.overflow = "";
      document.body.style.paddingRight = "";
      getLenis()?.start();
      lastFocusedRef.current?.focus?.();
    };
  }, [open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setError(null);

    if (!WEB3FORMS_KEY) {
      setStatus("idle");
      setError(
        "Booking isn't set up yet — please email hello@danelladc.com directly."
      );
      return;
    }

    try {
      // 1. Our gate: per-IP rate limit + validation. Web3Forms' free plan
      //    only accepts browser submissions, so the actual send is step 2.
      const gate = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const gateData = (await gate.json()) as { ok: boolean; error?: string };

      if (!gate.ok || !gateData.ok) {
        setStatus("idle");
        setError(
          gateData.error ??
            "Something went wrong sending your request — please try again."
        );
        return;
      }

      // 2. Submit to Web3Forms directly from the browser.
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `New event booking request — ${form.name}`,
          from_name: "danelladecruz.com",
          // Web3Forms uses the `email` field as the reply-to address.
          name: form.name,
          email: form.email,
          Mobile: form.mobile,
          "Event Type": form.eventType,
          "Performance Format": form.performanceFormat || "Not sure yet",
          "Event Date": form.eventDate || "Not specified",
          Budget: form.budget || "Not specified",
          Venue: form.venue,
          message: form.message || "No message provided.",
          botcheck: form.botcheck,
        }),
      });
      const data = (await res.json()) as { success?: boolean };

      if (!res.ok || !data.success) {
        setStatus("idle");
        setError("Something went wrong sending your request — please try again.");
        return;
      }

      setStatus("sent");
      setForm({
        name: "",
        email: "",
        mobile: "",
        eventType: "",
        performanceFormat: "",
        eventDate: "",
        budget: "",
        venue: "",
        message: "",
        botcheck: "",
      });
    } catch {
      setStatus("idle");
      setError("Couldn't reach the server — please check your connection and try again.");
    }
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm md:p-6"
          style={{ background: "rgba(45, 27, 61, 0.35)" }}
          onClick={close}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-modal-title"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            data-lenis-prevent
            className="relative max-h-[88vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-dusk/40 p-6 shadow-lift md:p-9"
            style={{
              background: "rgba(250, 247, 244, 0.94)",
              backdropFilter: "blur(20px)",
            }}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close booking form"
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-aubergine/70 transition-colors hover:bg-blush/30 hover:text-aubergine"
            >
              <HiXMark className="h-5 w-5" />
            </button>

            {status === "sent" ? (
              <div className="py-10 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-salmon/15">
                  <HiCheck className="h-7 w-7 text-salmon-deep" />
                </span>
                <h2
                  id="booking-modal-title"
                  className="mt-6 font-display text-3xl text-aubergine"
                >
                  Request sent
                </h2>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-aubergine/80">
                  Thank you — your booking request is on its way. Danella will
                  get back to you within a few days.
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="mt-8 inline-flex items-center rounded-full border border-taupe-deep/60 px-7 py-2.5 text-sm font-medium text-aubergine transition-all duration-300 hover:bg-blush/40"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <p className="text-[12px] uppercase tracking-wider2 text-salmon-deep">
                  Live Bookings
                </p>
                <h2
                  id="booking-modal-title"
                  className="mt-2 font-display text-3xl text-aubergine md:text-4xl"
                >
                  Book an Event
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-aubergine/80">
                  Tell me a little about your event and I&apos;ll get back to
                  you with availability and details.
                </p>

                <form onSubmit={handleSubmit} className="mt-7 space-y-4">
                  {/* Honeypot — hidden from humans, tempting to bots */}
                  <input
                    type="text"
                    name="botcheck"
                    value={form.botcheck}
                    onChange={(e) => set("botcheck")(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="absolute -left-[9999px] h-0 w-0 opacity-0"
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Name" required>
                      <input
                        ref={firstFieldRef}
                        type="text"
                        name="name"
                        required
                        maxLength={FIELD_LIMITS.name}
                        placeholder="Your name"
                        autoComplete="name"
                        value={form.name}
                        onChange={(e) => set("name")(e.target.value)}
                        className={inputClasses}
                      />
                    </Field>
                    <Field label="Email" required>
                      <input
                        type="email"
                        name="email"
                        required
                        maxLength={FIELD_LIMITS.email}
                        placeholder="you@example.com"
                        autoComplete="email"
                        value={form.email}
                        onChange={(e) => set("email")(e.target.value)}
                        className={inputClasses}
                      />
                    </Field>
                  </div>

                  <Field label="Mobile number" required>
                    <input
                      type="tel"
                      name="mobile"
                      required
                      inputMode="tel"
                      maxLength={FIELD_LIMITS.mobile}
                      placeholder="+94 77 123 4567"
                      autoComplete="tel"
                      value={form.mobile}
                      onChange={(e) => set("mobile")(e.target.value)}
                      className={inputClasses}
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Event type" required>
                      <Select
                        name="eventType"
                        required
                        placeholder="Select an event type…"
                        options={EVENT_TYPES}
                        value={form.eventType}
                        onChange={set("eventType")}
                      />
                    </Field>
                    <Field label="Performance format">
                      <Select
                        name="performanceFormat"
                        placeholder="Not sure yet"
                        options={PERFORMANCE_FORMATS}
                        value={form.performanceFormat}
                        onChange={set("performanceFormat")}
                      />
                    </Field>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Event date">
                      <input
                        type="date"
                        name="eventDate"
                        min={today}
                        value={form.eventDate}
                        onChange={(e) => set("eventDate")(e.target.value)}
                        className={inputClasses}
                      />
                    </Field>
                    <Field label="Budget">
                      <input
                        type="text"
                        name="budget"
                        maxLength={FIELD_LIMITS.budget}
                        placeholder="e.g. LKR 50,000 – 100,000"
                        value={form.budget}
                        onChange={(e) => set("budget")(e.target.value)}
                        className={inputClasses}
                      />
                    </Field>
                  </div>

                  <Field label="Venue" required>
                    <input
                      type="text"
                      name="venue"
                      required
                      maxLength={FIELD_LIMITS.venue}
                      placeholder="Venue name & city"
                      value={form.venue}
                      onChange={(e) => set("venue")(e.target.value)}
                      className={inputClasses}
                    />
                  </Field>

                  <Field label="Message">
                    <textarea
                      name="message"
                      rows={4}
                      maxLength={FIELD_LIMITS.message}
                      placeholder="Tell me about your event — the occasion, timings, and anything else I should know."
                      value={form.message}
                      onChange={(e) => set("message")(e.target.value)}
                      className={`${inputClasses} resize-none`}
                    />
                  </Field>

                  {error && (
                    <p role="alert" className="text-sm text-salmon-deep">
                      {error}
                    </p>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={status === "sending"}
                      className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-aubergine px-7 py-3 text-sm font-medium text-frost shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift hover:ring-1 hover:ring-salmon-deep/60 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:w-auto"
                    >
                      {status === "sending" ? "Sending…" : "Send Booking Request"}
                      {status !== "sending" && (
                        <span className="transition-transform duration-300 group-hover:translate-x-1">
                          →
                        </span>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
