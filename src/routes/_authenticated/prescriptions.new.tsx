import { createFileRoute } from "@tanstack/react-router";
import { PrescriptionForm } from "@/components/prescription/PrescriptionForm";
import { AppShell } from "@/components/clinic/AppShell";

type Search = { appointment?: string; patient?: string };

export const Route = createFileRoute("/_authenticated/prescriptions/new")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    appointment: typeof search.appointment === "string" ? search.appointment : undefined,
    patient: typeof search.patient === "string" ? search.patient : undefined,
  }),
  head: () => ({
    meta: [
      { title: "New Prescription | Shibui Dental Hub" },
      {
        name: "description",
        content:
          "Write a dental prescription, print it on the clinic pad or download a full digital PDF.",
      },
      { property: "og:title", content: "New Prescription | Shibui Dental Hub" },
      {
        property: "og:description",
        content: "Digital prescriptions for Shibui Dental Care, matched to the clinic letterhead.",
      },
    ],
  }),
  component: NewPrescriptionPage,
});

function NewPrescriptionPage() {
  const { appointment, patient } = Route.useSearch();

  return (
    <AppShell title="New Prescription" subtitle="Print on the clinic pad or generate a digital PDF">
      <PrescriptionForm appointmentId={appointment} patientId={patient} />
    </AppShell>
  );
}
