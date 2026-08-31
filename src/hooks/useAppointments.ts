import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Appointment, AppointmentStatus } from "@/lib/types";
import { toISODate } from "@/lib/clinic-utils";

const SELECT = "*, patients(patient_uid, name)";

export function useAppointmentsByDate(dateISO: string) {
  return useQuery({
    queryKey: ["appointments", "day", dateISO],
    queryFn: async (): Promise<Appointment[]> => {
      const { data, error } = await supabase
        .from("appointments")
        .select(SELECT)
        .eq("appointment_date", dateISO)
        .order("slot_time");
      if (error) throw error;
      return (data ?? []) as unknown as Appointment[];
    },
  });
}

export function useAppointmentsInRange(fromISO: string, toISO: string) {
  return useQuery({
    queryKey: ["appointments", "range", fromISO, toISO],
    queryFn: async (): Promise<Appointment[]> => {
      const { data, error } = await supabase
        .from("appointments")
        .select(SELECT)
        .gte("appointment_date", fromISO)
        .lte("appointment_date", toISO)
        .order("appointment_date")
        .order("slot_time");
      if (error) throw error;
      return (data ?? []) as unknown as Appointment[];
    },
  });
}

export function useDashboardStats() {
  const today = toISODate(new Date());
  return useQuery({
    queryKey: ["dashboard", "stats", today],
    queryFn: async () => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const [todayRes, upcomingRes, patientsRes, rxRes] = await Promise.all([
        supabase
          .from("appointments")
          .select("id", { count: "exact", head: true })
          .eq("appointment_date", today),
        supabase
          .from("appointments")
          .select("id", { count: "exact", head: true })
          .gt("appointment_date", today)
          .eq("status", "booked"),
        supabase.from("patients").select("id", { count: "exact", head: true }),
        supabase
          .from("prescriptions")
          .select("id", { count: "exact", head: true })
          .gte("rx_date", toISODate(weekAgo)),
      ]);
      return {
        today: todayRes.count ?? 0,
        upcoming: upcomingRes.count ?? 0,
        patients: patientsRes.count ?? 0,
        prescriptionsThisWeek: rxRes.count ?? 0,
      };
    },
  });
}

export function useUpdateAppointmentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AppointmentStatus }) => {
      const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useAppointment(id: string | undefined) {
  return useQuery({
    enabled: !!id,
    queryKey: ["appointment", id],
    queryFn: async (): Promise<Appointment | null> => {
      const { data, error } = await supabase.from("appointments").select(SELECT).eq("id", id!).maybeSingle();
      if (error) throw error;
      return data as unknown as Appointment | null;
    },
  });
}
