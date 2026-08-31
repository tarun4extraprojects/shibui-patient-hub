import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarPlus, FilePlus2 } from "lucide-react";
import { clinic } from "@/config/clinic";
import { useAppointmentsByDate, useDashboardStats } from "@/hooks/useAppointments";
import { toISODate } from "@/lib/clinic-utils";
import { AppointmentCard } from "@/components/appointments/AppointmentCard";
import { BookAppointmentDialog } from "@/components/appointments/BookAppointmentDialog";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Shibui Dental Care" },
      {
        name: "description",
        content: "Today's appointments, patient totals and quick actions for Shibui Dental Hub.",
      },
      { property: "og:title", content: "Dashboard — Shibui Dental Care" },
      { property: "og:description", content: "Daily clinic overview for Shibui Dental Hub." },
    ],
  }),
  component: Dashboard,
});

function Stat({ label, value, loading }: { label: string; value?: number; loading: boolean }) {
  return (
    <div className="clinic-card px-4 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      {loading ? (
        <Skeleton className="mt-2 h-8 w-12" />
      ) : (
        <p className="mt-1 text-3xl font-semibold text-primary">{value ?? 0}</p>
      )}
    </div>
  );
}

function Dashboard() {
  const today = toISODate(new Date());
  const { data: stats, isLoading } = useDashboardStats();
  const { data: appts, isLoading: apptsLoading } = useAppointmentsByDate(today);
  const [bookOpen, setBookOpen] = useState(false);

  const remaining = (appts ?? []).filter((a) => a.status === "booked");

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Today at {clinic.clinicName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Today's Appointments" value={stats?.today} loading={isLoading} />
        <Stat label="Upcoming Appointments" value={stats?.upcoming} loading={isLoading} />
        <Stat label="Total Patients" value={stats?.patients} loading={isLoading} />
        <Stat label="Prescriptions This Week" value={stats?.prescriptionsThisWeek} loading={isLoading} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          onClick={() => setBookOpen(true)}
          className="clinic-card flex min-h-24 items-center gap-4 px-5 py-5 text-left transition-shadow hover:shadow-lifted"
        >
          <span className="rounded-xl bg-accent p-3 text-primary">
            <CalendarPlus className="h-6 w-6" />
          </span>
          <span>
            <span className="block text-lg font-semibold">Book Appointment</span>
            <span className="block text-sm text-muted-foreground">Add a patient to the day's list</span>
          </span>
        </button>

        <Link
          to="/prescriptions/new"
          search={{}}
          className="clinic-card flex min-h-24 items-center gap-4 px-5 py-5 text-left transition-shadow hover:shadow-lifted"
        >
          <span className="rounded-xl bg-accent p-3 text-primary">
            <FilePlus2 className="h-6 w-6" />
          </span>
          <span>
            <span className="block text-lg font-semibold">New Prescription</span>
            <span className="block text-sm text-muted-foreground">Write and print on the clinic pad</span>
          </span>
        </Link>
      </div>

      <section>
        <h2 className="text-lg font-semibold">Today's Remaining Appointments</h2>
        <div className="gold-rule my-3" />
        {apptsLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
        ) : remaining.length === 0 ? (
          <p className="clinic-card px-5 py-8 text-center text-sm text-muted-foreground">
            No appointments left for today.
          </p>
        ) : (
          <div className="space-y-3">
            {remaining.map((a) => (
              <AppointmentCard key={a.id} appt={a} />
            ))}
          </div>
        )}
      </section>

      <BookAppointmentDialog open={bookOpen} onOpenChange={setBookOpen} defaultDate={today} />
    </div>
  );
}
