export type AppointmentStatus = "booked" | "done" | "cancelled" | "no_show";

export interface Patient {
  id: string;
  patient_uid: string;
  name: string;
  age: number | null;
  sex: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string | null;
  patient_name: string;
  phone: string;
  reason: string | null;
  appointment_date: string;
  slot_time: string;
  status: AppointmentStatus;
  notes: string | null;
  created_at: string;
  patients?: { patient_uid: string; name: string } | null;
}

export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes: string;
}

export interface Vitals {
  bp?: string;
  weight?: string;
  temperature?: string;
  spo2?: string;
}

export interface Prescription {
  id: string;
  patient_id: string | null;
  appointment_id: string | null;
  rx_date: string;
  vitals: Vitals;
  chief_complaint: string | null;
  diagnosis: string | null;
  medicines: Medicine[];
  facilities_advised: string[] | null;
  advice: string | null;
  tests: string | null;
  follow_up_date: string | null;
  created_at: string;
  patients?: Patient | null;
}

export type ReminderStatus = "scheduled" | "sent" | "failed" | "skipped";

export interface Reminder {
  id: string;
  patient_id: string | null;
  appointment_id: string | null;
  prescription_id: string | null;
  recipient_name: string | null;
  recipient_phone: string;
  type: "appointment" | "follow_up" | "missed" | "doctor_daily" | "upcoming";
  channel: string;
  message: string;
  scheduled_at: string;
  sent_at: string | null;
  status: ReminderStatus;
  delivery_status: string | null;
  error_message: string | null;
  dedupe_key: string | null;
  created_at: string;
  patients?: { patient_uid: string; name: string } | null;
}
