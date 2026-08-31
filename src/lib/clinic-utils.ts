import { clinicHours } from "@/config/clinic";

/** Keep only digits; used to match patients reliably by phone. */
export function normalizePhone(phone: string): string {
  return (phone || "").replace(/\D/g, "");
}

export function isValidPhone(phone: string): boolean {
  const d = normalizePhone(phone);
  return d.length >= 10 && d.length <= 13;
}

/** "2026-08-31" for a Date, in local time. */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseISODate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function addDays(d: Date, n: number): Date {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}

/** "14:30" -> "02:30 PM" */
export function formatSlot(slot: string): string {
  const [h, m] = slot.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function formatDateLong(iso: string): string {
  if (!iso) return "";
  return parseISODate(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function slotRange(start: string, end: string, step: number): string[] {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const out: string[] = [];
  let cur = sh * 60 + sm;
  const last = eh * 60 + em;
  while (cur < last) {
    out.push(`${String(Math.floor(cur / 60)).padStart(2, "0")}:${String(cur % 60).padStart(2, "0")}`);
    cur += step;
  }
  return out;
}

/** All bookable 30-minute slots for the clinic (morning + evening). */
export function generateSlots(): { morning: string[]; evening: string[] } {
  return {
    morning: slotRange(clinicHours.morning.start, clinicHours.morning.end, clinicHours.slotMinutes),
    evening: slotRange(clinicHours.evening.start, clinicHours.evening.end, clinicHours.slotMinutes),
  };
}

export function isSunday(dateISO: string): boolean {
  return parseISODate(dateISO).getDay() === 0;
}

export const statusLabel: Record<string, string> = {
  booked: "Booked",
  done: "Done",
  cancelled: "Cancelled",
  no_show: "No-show",
};
