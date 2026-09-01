import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarDays,
  FileText,
  Loader2,
  Phone,
  Plus,
  Stethoscope,
  User,
} from "lucide-react";
import { AppShell } from "@/components/clinic/AppShell";
import { StatusBadge } from "@/components/clinic/StatusBadge";
import { Button } from "@/components/ui/button";
import { usePatient, usePatientHistory } from "@/hooks/usePatients";
import { formatDateLong, formatSlot } from "@/lib/clinic-utils";

export const Route = createFileRoute("/_authenticated/patients/$patientId")({
  head: () => ({
    meta: [
      { title: "Patient Record | Shibui Dental Hub" },
      {
        name: "description",
        content: "Complete visit history, prescriptions and appointments for a clinic patient.",
      },
      { property: "og:title", content: "Patient Record | Shibui Dental Hub" },
      {
        property: "og:description",
        content: "Complete visit history, prescriptions and appointments for a clinic patient.",
      },
    ],
  }),
  component: PatientDetailPage,
});

function PatientDetailPage() {
  const { patientId } = Route.useParams();
  const { data: patient, isLoading } = usePatient(patientId);
  const { data: history, isLoading: loadingHistory } = usePatientHistory(patientId);

  if (isLoading) {
    return (
      <AppShell title="Patient">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading patient record…
        </div>
      </AppShell>
    );
  }

  if (!patient) {
    return (
      <AppShell title="Patient">
        <div className="clinic-card p-6 text-sm text-muted-foreground">
          This patient record could not be found.
          <div className="mt-4">
            <Button asChild variant="secondary">
              <Link to="/patients">Back to patients</Link>
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={patient.name} subtitle={patient.patient_uid}>
      <div className="space-y-6">
        <section className="clinic-card p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{patient.name}</h2>
                <p className="font-mono text-sm text-muted-foreground">{patient.patient_uid}</p>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                  {patient.phone && (
                    <span className="inline-flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" /> {patient.phone}
                    </span>
                  )}
                  {patient.age != null && <span>Age {patient.age}</span>}
                  {patient.sex && <span>{patient.sex}</span>}
                </div>
              </div>
            </div>
            <Button asChild className="min-h-11">
              <Link to="/prescriptions/new" search={{ patient: patient.id }}>
                <Plus className="h-4 w-4" /> New Prescription
              </Link>
            </Button>
          </div>
          {patient.notes && (
            <>
              <div className="gold-rule my-4" />
              <p className="text-sm">
                <span className="font-medium">Medical notes: </span>
                {patient.notes}
              </p>
            </>
          )}
        </section>

        <section className="clinic-card p-4 sm:p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Stethoscope className="h-4 w-4 text-primary" /> Prescription History
          </h2>
          <div className="gold-rule my-3" />
          {loadingHistory ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : !history?.prescriptions.length ? (
            <p className="text-sm text-muted-foreground">No prescriptions recorded yet.</p>
          ) : (
            <ul className="space-y-3">
              {history.prescriptions.map((rx) => (
                <li key={rx.id} className="rounded-xl border border-border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2 text-sm font-medium">
                      <FileText className="h-4 w-4 text-primary" />
                      {formatDateLong(rx.rx_date)}
                    </span>
                    {rx.follow_up_date && (
                      <span className="text-xs text-muted-foreground">
                        Follow-up {formatDateLong(rx.follow_up_date)}
                      </span>
                    )}
                  </div>
                  {rx.diagnosis && (
                    <p className="mt-1 text-sm">
                      <span className="text-muted-foreground">Diagnosis: </span>
                      {rx.diagnosis}
                    </p>
                  )}
                  {!!rx.medicines?.length && (
                    <ul className="mt-2 space-y-0.5 text-sm text-muted-foreground">
                      {rx.medicines.map((m, i) => (
                        <li key={i}>
                          {i + 1}. {m.name} {m.dosage} {m.frequency}{" "}
                          {m.duration ? `× ${m.duration}` : ""}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="clinic-card p-4 sm:p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <CalendarDays className="h-4 w-4 text-primary" /> Appointment History
          </h2>
          <div className="gold-rule my-3" />
          {loadingHistory ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : !history?.appointments.length ? (
            <p className="text-sm text-muted-foreground">No appointments recorded yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {history.appointments.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div>
                    <p className="text-sm font-medium">{formatDateLong(a.appointment_date)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatSlot(a.slot_time)} · {a.reason || "Consultation"}
                    </p>
                  </div>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}
