import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { messageTemplates } from "@/config/clinic";
import { formatDateLong, formatSlot } from "@/lib/clinic-utils";
import { getWhatsAppStatus, sendReminderNow } from "@/lib/whatsapp.functions";
import type { Reminder } from "@/lib/types";

/** Insert a reminder unless the identical one already exists (dedupe_key is unique). */
async function insertReminder(row: {
  patient_id?: string | null;
  appointment_id?: string | null;
  prescription_id?: string | null;
  recipient_name: string;
  recipient_phone: string;
  type: Reminder["type"];
  message: string;
  scheduled_at: string;
  dedupe_key: string;
}) {
  const { error } = await supabase.from("reminders").insert({ ...row, channel: "whatsapp" });
  // 23505 = duplicate dedupe_key -> reminder already exists, never send twice.
  if (error && error.code !== "23505") throw error;
}

export async function scheduleAppointmentReminder(p: {
  patientId: string;
  appointmentId: string;
  name: string;
  phone: string;
  dateISO: string;
  slot: string;
}) {
  const when = new Date(`${p.dateISO}T00:00:00`);
  when.setDate(when.getDate() - 1);
  when.setHours(10, 0, 0, 0);
  await insertReminder({
    patient_id: p.patientId,
    appointment_id: p.appointmentId,
    recipient_name: p.name,
    recipient_phone: p.phone,
    type: "appointment",
    message: messageTemplates.appointment(p.name, formatDateLong(p.dateISO), formatSlot(p.slot)),
    scheduled_at: when.toISOString(),
    dedupe_key: `appointment:${p.appointmentId}`,
  });
}

export async function scheduleFollowUpReminder(p: {
  patientId: string;
  prescriptionId: string;
  name: string;
  phone: string;
  dateISO: string;
}) {
  const when = new Date(`${p.dateISO}T00:00:00`);
  when.setDate(when.getDate() - 1);
  when.setHours(10, 0, 0, 0);
  await insertReminder({
    patient_id: p.patientId,
    prescription_id: p.prescriptionId,
    recipient_name: p.name,
    recipient_phone: p.phone,
    type: "follow_up",
    message: messageTemplates.follow_up(p.name, formatDateLong(p.dateISO)),
    scheduled_at: when.toISOString(),
    dedupe_key: `follow_up:${p.prescriptionId}`,
  });
}

export async function scheduleMissedReminder(a: {
  patientId: string | null;
  appointmentId: string;
  name: string;
  phone: string;
}) {
  await insertReminder({
    patient_id: a.patientId,
    appointment_id: a.appointmentId,
    recipient_name: a.name,
    recipient_phone: a.phone,
    type: "missed",
    message: messageTemplates.missed(a.name),
    scheduled_at: new Date().toISOString(),
    dedupe_key: `missed:${a.appointmentId}`,
  });
}

export function useReminders() {
  return useQuery({
    queryKey: ["reminders"],
    queryFn: async (): Promise<Reminder[]> => {
      const { data, error } = await supabase
        .from("reminders")
        .select("*, patients(patient_uid, name)")
        .order("scheduled_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as unknown as Reminder[];
    },
  });
}

export function useWhatsAppStatus() {
  const fn = useServerFn(getWhatsAppStatus);
  return useQuery({
    queryKey: ["whatsapp", "status"],
    queryFn: () => fn(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSendReminder() {
  const qc = useQueryClient();
  const send = useServerFn(sendReminderNow);
  return useMutation({
    mutationFn: (reminderId: string) => send({ data: { reminderId } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reminders"] }),
  });
}

/** Creates today's agenda reminder for the doctor / reception desk. */
export function useCreateDoctorDailyReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      dateISO,
      lines,
      phone,
    }: {
      dateISO: string;
      lines: string[];
      phone: string;
    }) => {
      await insertReminder({
        recipient_name: "Clinic",
        recipient_phone: phone,
        type: "doctor_daily",
        message: messageTemplates.doctor_daily(lines),
        scheduled_at: new Date().toISOString(),
        dedupe_key: `doctor_daily:${dateISO}`,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reminders"] }),
  });
}
