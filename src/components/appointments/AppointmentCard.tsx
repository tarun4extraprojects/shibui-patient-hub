import { Link } from "@tanstack/react-router";
import { Check, FileText, Phone, User, X, UserX } from "lucide-react";
import { toast } from "sonner";
import type { Appointment } from "@/lib/types";
import { formatSlot } from "@/lib/clinic-utils";
import { StatusBadge } from "@/components/clinic/StatusBadge";
import { Button } from "@/components/ui/button";
import { useUpdateAppointmentStatus } from "@/hooks/useAppointments";
import { scheduleMissedReminder } from "@/hooks/useReminders";

export function AppointmentCard({ appt }: { appt: Appointment }) {
  const update = useUpdateAppointmentStatus();

  async function setStatus(status: Appointment["status"]) {
    await update.mutateAsync({ id: appt.id, status });
    if (status === "no_show") {
      await scheduleMissedReminder({
        patientId: appt.patient_id,
        appointmentId: appt.id,
        name: appt.patient_name,
        phone: appt.phone,
      });
    }
    toast.success(`Marked as ${status === "no_show" ? "no-show" : status}`);
  }

  return (
    <div className="clinic-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold">{appt.patient_name}</h3>
            {appt.patients?.patient_uid && (
              <span className="rounded-md bg-secondary px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                {appt.patients.patient_uid}
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              {appt.phone}
            </span>
            <span>{appt.reason || "Consultation"}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-primary">{formatSlot(appt.slot_time)}</div>
          <StatusBadge status={appt.status} className="mt-1" />
        </div>
      </div>

      {appt.notes && <p className="mt-3 text-sm text-muted-foreground">{appt.notes}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={appt.status === "done" ? "secondary" : "default"}
          className="min-h-10"
          onClick={() => setStatus("done")}
        >
          <Check className="h-4 w-4" /> Done
        </Button>
        <Button size="sm" variant="outline" className="min-h-10" onClick={() => setStatus("cancelled")}>
          <X className="h-4 w-4" /> Cancel
        </Button>
        <Button size="sm" variant="outline" className="min-h-10" onClick={() => setStatus("no_show")}>
          <UserX className="h-4 w-4" /> No-show
        </Button>
        <Button asChild size="sm" variant="outline" className="min-h-10">
          <Link
            to="/prescriptions/new"
            search={{ appointment: appt.id, patient: appt.patient_id ?? undefined }}
          >
            <FileText className="h-4 w-4" /> Create Prescription
          </Link>
        </Button>
        {appt.patient_id && (
          <Button asChild size="sm" variant="ghost" className="min-h-10">
            <Link to="/patients/$patientId" params={{ patientId: appt.patient_id }}>
              <User className="h-4 w-4" /> Patient
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
