import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { generateSlots, isSunday, normalizePhone } from "@/lib/clinic-utils";
import { findOrCreatePatient } from "@/hooks/usePatients";
import { scheduleAppointmentReminder } from "@/hooks/useReminders";

export interface BookingInput {
  patientName: string;
  phone: string;
  reason: string;
  dateISO: string;
  slot: string;
  notes?: string;
}

/**
 * ALL appointment slot logic lives here.
 * Generates the clinic's 30-minute slots, marks booked slots unavailable and
 * saves the appointment (linking or creating the patient by phone).
 */
export function useBooking(dateISO: string) {
  const qc = useQueryClient();

  const { data: taken = [], isLoading: slotsLoading } = useQuery({
    queryKey: ["appointments", "slots", dateISO],
    enabled: !!dateISO,
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from("appointments")
        .select("slot_time,status")
        .eq("appointment_date", dateISO)
        .in("status", ["booked", "done"]);
      if (error) throw error;
      return (data ?? []).map((r) => r.slot_time as string);
    },
  });

  const slots = useMemo(() => {
    const { morning, evening } = generateSlots();
    const mark = (list: string[]) =>
      list.map((slot) => ({ slot, disabled: taken.includes(slot) }));
    return { morning: mark(morning), evening: mark(evening) };
  }, [taken]);

  const sunday = dateISO ? isSunday(dateISO) : false;

  const book = useMutation({
    mutationFn: async (input: BookingInput) => {
      const patient = await findOrCreatePatient({
        name: input.patientName,
        phone: input.phone,
      });

      const { data, error } = await supabase
        .from("appointments")
        .insert({
          patient_id: patient.id,
          patient_name: input.patientName.trim(),
          phone: normalizePhone(input.phone),
          reason: input.reason || null,
          appointment_date: input.dateISO,
          slot_time: input.slot,
          notes: input.notes || null,
          status: "booked",
        })
        .select("*")
        .single();
      if (error) throw error;

      await scheduleAppointmentReminder({
        patientId: patient.id,
        appointmentId: data.id as string,
        name: input.patientName.trim(),
        phone: normalizePhone(input.phone),
        dateISO: input.dateISO,
        slot: input.slot,
      });

      return { appointment: data, patient };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
      qc.invalidateQueries({ queryKey: ["patients"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["reminders"] });
    },
  });

  return { slots, slotsLoading, sunday, book };
}
