import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Medicine, Prescription, Vitals } from "@/lib/types";
import { scheduleFollowUpReminder } from "@/hooks/useReminders";

export interface PrescriptionInput {
  patient_id: string;
  appointment_id?: string | null;
  rx_date: string;
  vitals: Vitals;
  chief_complaint: string;
  diagnosis: string;
  medicines: Medicine[];
  facilities_advised?: string[];
  advice: string;
  tests: string;
  follow_up_date?: string | null;
}

export function usePrescription(id: string | undefined) {
  return useQuery({
    enabled: !!id,
    queryKey: ["prescription", id],
    queryFn: async (): Promise<Prescription | null> => {
      const { data, error } = await supabase
        .from("prescriptions")
        .select("*, patients(*)")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as Prescription | null;
    },
  });
}

export function useSavePrescription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: PrescriptionInput & { id?: string }) => {
      const payload = {
        patient_id: input.patient_id,
        appointment_id: input.appointment_id ?? null,
        rx_date: input.rx_date,
        vitals: input.vitals as never,
        chief_complaint: input.chief_complaint || null,
        diagnosis: input.diagnosis || null,
        medicines: input.medicines as never,
        facilities_advised: input.facilities_advised ?? null,
        advice: input.advice || null,
        tests: input.tests || null,
        follow_up_date: input.follow_up_date || null,
      };

      const res = input.id
        ? await supabase.from("prescriptions").update(payload).eq("id", input.id).select("*").single()
        : await supabase.from("prescriptions").insert(payload).select("*").single();
      if (res.error) throw res.error;

      if (input.follow_up_date) {
        const { data: patient } = await supabase
          .from("patients")
          .select("name, phone")
          .eq("id", input.patient_id)
          .maybeSingle();
        if (patient?.phone) {
          await scheduleFollowUpReminder({
            patientId: input.patient_id,
            prescriptionId: res.data.id as string,
            name: patient.name as string,
            phone: patient.phone as string,
            dateISO: input.follow_up_date,
          });
        }
      }
      return res.data as unknown as Prescription;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patient"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["reminders"] });
    },
  });
}
