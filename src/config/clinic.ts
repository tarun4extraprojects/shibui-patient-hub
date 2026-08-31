/**
 * SINGLE SOURCE OF TRUTH for all clinic information.
 * Everything in the app (letterhead, footer, dropdowns, reminders, messages)
 * reads from this file. There is no settings table and no settings page.
 */

export const clinic = {
  clinicName: "Shibui Dental Hub",
  appName: "Shibui Dental Care",
  tagline: "Root Canal Specialist",

  doctorName: "Dr. Nidhi Nupur Mukul Kumar",
  qualifications: "BDS, MDS (Endodontics)",
  regNo: "A-30080",

  phone: "8788564733",
  whatsapp: "8390974572",
  email: "nupurnidhi90@gmail.com",

  address:
    "Shop No.4, Tirupati Corner, Plot No. C/1, Sector-12, Kharghar, Navi Mumbai - 410210 (Near HP Gas Agency)",

  timings:
    "Mon to Sat: 09:00 AM - 01:00 PM | 04:00 PM - 09:00 PM. Sunday: by appointment only",

  facilities: [
    "Digital X-Ray",
    "Child Dental Treatment",
    "Braces",
    "Clear Aligners",
    "Teeth Cleaning",
    "Dentures",
    "Crown & Bridge",
    "Root Canal Treatment",
    "Gum Problems Treatment",
    "Implants",
    "Oral Surgery (Major / Minor)",
    "Smile Design",
    "Teeth Whitening",
  ],

  reasonTypes: [
    "Consultation",
    "Root Canal",
    "Cleaning",
    "Braces / Aligners",
    "Crown & Bridge",
    "Tooth Extraction",
    "Filling",
    "Follow-up",
    "Other",
  ],

  frequencyOptions: [
    "OD (once a day)",
    "BD (twice a day)",
    "TDS (thrice a day)",
    "HS (at bedtime)",
    "SOS (as needed)",
    "Stat (immediately)",
  ],
} as const;

/** Clinic working hours used by the booking slot generator. */
export const clinicHours = {
  morning: { start: "09:00", end: "13:00" },
  evening: { start: "16:00", end: "21:00" },
  slotMinutes: 30,
};

/**
 * Print calibration for MODE 1 (printing onto the pre-printed paper pad).
 * All values are millimetres on an A4 sheet and can be fine-tuned later
 * without touching any other file.
 */
export const printCalibration = {
  pageOffsetX: 0,
  pageOffsetY: 0,
  name: { x: 22, y: 46 },
  age: { x: 22, y: 55 },
  sex: { x: 60, y: 55 },
  date: { x: 108, y: 55 },
  phone: { x: 165, y: 55 },
  vitals: { x: 100, y: 66 },
  chiefComplaint: { x: 100, y: 74 },
  diagnosis: { x: 100, y: 82 },
  medicines: { x: 100, y: 92, rowHeight: 9, width: 95 },
  advice: { x: 100, y: 150 },
  tests: { x: 100, y: 158 },
  followUp: { x: 100, y: 166 },
};

/** WhatsApp message templates — edit the wording here. */
export const messageTemplates = {
  appointment: (name: string, date: string, time: string) =>
    `Hello ${name},\nThis is a reminder from ${clinic.clinicName} regarding your dental appointment on ${date} at ${time}.\nPlease contact us if you need to reschedule.\n${clinic.phone}`,
  follow_up: (name: string, date: string) =>
    `Hello ${name},\nThis is a reminder from ${clinic.clinicName} for your follow-up scheduled on ${date}.\n${clinic.phone}`,
  missed: (name: string) =>
    `Hello ${name},\nWe missed you at ${clinic.clinicName} today. Please contact us to rebook your appointment.\n${clinic.phone}`,
  upcoming: (name: string, date: string, time: string) =>
    `Hello ${name},\nYour upcoming appointment at ${clinic.clinicName} is on ${date} at ${time}. See you soon.`,
  doctor_daily: (lines: string[]) =>
    `Today's appointments at ${clinic.clinicName}:\n${lines.join("\n")}`,
};

export type ReminderType = keyof typeof messageTemplates;
