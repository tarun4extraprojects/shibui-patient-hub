import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Patient, Appointment, Prescription } from "@/lib/types";
import { normalizePhone } from "@/lib/clinic-utils";

export function usePatientSearch(term: string) {
  const q = term.trim();
  return useQuery({
    queryKey: ["patients", "search", q],
    queryFn: async (): Promise<Patient[]> => {
      let query = supabase.from("patients").select("*").order("created_at", { ascending: false });
      if (q) {
        const digits = normalizePhone(q);
        const parts = [`name.ilike.%${q}%`, `patient_uid.ilike.%${q}%`];
        if (digits) parts.push(`phone.ilike.%${digits}%`);
        query = query.or(parts.join(","));
      }
      const { data, error } = await query.limit(100);
      if (error) throw error;
      return (data ?? []) as Patient[];
    },
  });
}

export function usePatientsCount() {
  return useQuery({
    queryKey: ["patients", "count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("patients")
        .select("id", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });
}

export function usePatient(id: string | undefined) {
  return useQuery({
    enabled: !!id,
    queryKey: ["patient", id],
    queryFn: async (): Promise<Patient | null> => {
      const { data, error } = await supabase.from("patients").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data as Patient | null;
    },
  });
}

/** Look a patient up by their permanent Patient ID (SHB-XXXXXX). */
export function usePatientByUid(uid: string | undefined) {
  return useQuery({
    enabled: !!uid,
    queryKey: ["patient", "uid", uid],
    queryFn: async (): Promise<Patient | null> => {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("patient_uid", uid!)
        .maybeSingle();
      if (error) throw error;
      return data as Patient | null;
    },
  });
}

export function usePatientHistory(patientId: string | undefined) {
  return useQuery({
    enabled: !!patientId,
    queryKey: ["patient", patientId, "history"],
    queryFn: async () => {
      const [appts, rx] = await Promise.all([
        supabase
          .from("appointments")
          .select("*")
          .eq("patient_id", patientId!)
          .order("appointment_date", { ascending: false }),
        supabase
          .from("prescriptions")
          .select("*")
          .eq("patient_id", patientId!)
          .order("rx_date", { ascending: false }),
      ]);
      if (appts.error) throw appts.error;
      if (rx.error) throw rx.error;
      return {
        appointments: (appts.data ?? []) as unknown as Appointment[],
        prescriptions: (rx.data ?? []) as unknown as Prescription[],
      };
    },
  });
}

/** Find an existing patient by phone — never create duplicates. */
export async function findPatientByPhone(phone: string): Promise<Patient | null> {
  const digits = normalizePhone(phone);
  if (!digits) return null;
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("phone", digits)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as Patient | null;
}

/** Returns the existing patient for this phone, or creates one with a new Patient ID. */
export async function findOrCreatePatient(input: {
  name: string;
  phone: string;
  age?: number | null;
  sex?: string | null;
}): Promise<Patient> {
  const existing = await findPatientByPhone(input.phone);
  if (existing) return existing;
  const { data, error } = await supabase
    .from("patients")
    .insert({
      name: input.name.trim(),
      phone: normalizePhone(input.phone),
      age: input.age ?? null,
      sex: input.sex ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as Patient;
}

export function useUpdatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...values }: Partial<Patient> & { id: string }) => {
      const { error } = await supabase.from("patients").update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["patient", v.id] });
      qc.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}
