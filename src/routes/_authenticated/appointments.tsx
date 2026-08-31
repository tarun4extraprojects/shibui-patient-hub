import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarPlus, ChevronLeft, ChevronRight } from "lucide-react";
import { useAppointmentsByDate } from "@/hooks/useAppointments";
import { addDays, isSunday, parseISODate, toISODate } from "@/lib/clinic-utils";
import { AppointmentCard } from "@/components/appointments/AppointmentCard";
import { BookAppointmentDialog } from "@/components/appointments/BookAppointmentDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/appointments")({
  head: () => ({
    meta: [
      { title: "Appointments — Shibui Dental Care" },
      {
        name: "description",
        content: "Daily appointment agenda for Shibui Dental Hub with one-tap status updates.",
      },
      { property: "og:title", content: "Appointments — Shibui Dental Care" },
      { property: "og:description", content: "Day view of the clinic's appointment schedule." },
    ],
  }),
  component: AppointmentsPage,
});

function AppointmentsPage() {
  const [dateISO, setDateISO] = useState(toISODate(new Date()));
  const [bookOpen, setBookOpen] = useState(false);
  const { data: appts, isLoading } = useAppointmentsByDate(dateISO);

  const shift = (n: number) => setDateISO(toISODate(addDays(parseISODate(dateISO), n)));

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Appointments</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {parseISODate(dateISO).toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <Button className="min-h-11" onClick={() => setBookOpen(true)}>
          <CalendarPlus className="h-4 w-4" /> Book Appointment
        </Button>
      </header>

      <div className="clinic-card flex flex-wrap items-center gap-2 p-3">
        <Button variant="outline" className="min-h-11" onClick={() => shift(-1)}>
          <ChevronLeft className="h-4 w-4" /> Previous Day
        </Button>
        <Button variant="secondary" className="min-h-11" onClick={() => setDateISO(toISODate(new Date()))}>
          Today
        </Button>
        <Button variant="outline" className="min-h-11" onClick={() => shift(1)}>
          Next Day <ChevronRight className="h-4 w-4" />
        </Button>
        <input
          type="date"
          value={dateISO}
          onChange={(e) => setDateISO(e.target.value)}
          className="ml-auto h-11 rounded-lg border border-input bg-card px-3 text-sm"
        />
      </div>

      {isSunday(dateISO) && (
        <div className="rounded-xl border border-primary/30 bg-accent px-4 py-3 text-sm font-medium text-accent-foreground">
          Sunday — By Appointment Only
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      ) : (appts ?? []).length === 0 ? (
        <p className="clinic-card px-5 py-10 text-center text-sm text-muted-foreground">
          No appointments on this day.
        </p>
      ) : (
        <div className="space-y-3">
          {appts!.map((a) => (
            <AppointmentCard key={a.id} appt={a} />
          ))}
        </div>
      )}

      <BookAppointmentDialog open={bookOpen} onOpenChange={setBookOpen} defaultDate={dateISO} />
    </div>
  );
}
