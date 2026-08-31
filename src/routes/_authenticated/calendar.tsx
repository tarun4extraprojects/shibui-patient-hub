import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAppointmentsInRange } from "@/hooks/useAppointments";
import { addDays, formatSlot, toISODate } from "@/lib/clinic-utils";
import { AppointmentCard } from "@/components/appointments/AppointmentCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Appointment } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — Shibui Dental Care" },
      {
        name: "description",
        content: "Month, week and day calendar of every appointment at Shibui Dental Hub.",
      },
      { property: "og:title", content: "Calendar — Shibui Dental Care" },
      { property: "og:description", content: "Clinic appointment calendar with live booking data." },
    ],
  }),
  component: CalendarPage,
});

type View = "month" | "week" | "day";

const dotClass: Record<Appointment["status"], string> = {
  booked: "bg-primary",
  done: "bg-success",
  cancelled: "bg-muted-foreground/50",
  no_show: "bg-muted-foreground/50",
};

function CalendarPage() {
  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState<Appointment | null>(null);

  const { from, to, days } = useMemo(() => {
    if (view === "day") {
      const iso = toISODate(cursor);
      return { from: iso, to: iso, days: [new Date(cursor)] };
    }
    if (view === "week") {
      const start = addDays(cursor, -cursor.getDay());
      const list = Array.from({ length: 7 }, (_, i) => addDays(start, i));
      return { from: toISODate(list[0]), to: toISODate(list[6]), days: list };
    }
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const gridStart = addDays(first, -first.getDay());
    const list = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
    return { from: toISODate(list[0]), to: toISODate(list[41]), days: list };
  }, [view, cursor]);

  const { data: appts, isLoading } = useAppointmentsInRange(from, to);

  const byDate = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const a of appts ?? []) {
      const list = map.get(a.appointment_date) ?? [];
      list.push(a);
      map.set(a.appointment_date, list);
    }
    return map;
  }, [appts]);

  function move(dir: number) {
    if (view === "month") setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + dir, 1));
    else if (view === "week") setCursor(addDays(cursor, dir * 7));
    else setCursor(addDays(cursor, dir));
  }

  const title =
    view === "month"
      ? cursor.toLocaleDateString("en-IN", { month: "long", year: "numeric" })
      : view === "week"
        ? `${days[0].toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – ${days[6].toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
        : cursor.toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          });

  const todayISO = toISODate(new Date());

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
        <div className="flex gap-1 rounded-xl border border-border bg-card p-1">
          {(["month", "week", "day"] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "min-h-10 rounded-lg px-4 text-sm font-medium capitalize transition-colors",
                view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground",
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </header>

      <div className="clinic-card flex flex-wrap items-center gap-2 p-3">
        <Button variant="outline" className="min-h-11" onClick={() => move(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="secondary" className="min-h-11" onClick={() => setCursor(new Date())}>
          Today
        </Button>
        <Button variant="outline" className="min-h-11" onClick={() => move(1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <p className="ml-2 text-base font-semibold">{title}</p>
      </div>

      {isLoading && <Skeleton className="h-96 w-full rounded-xl" />}

      {!isLoading && view === "day" && (
        <div className="space-y-3">
          {(byDate.get(toISODate(cursor)) ?? []).length === 0 ? (
            <p className="clinic-card px-5 py-10 text-center text-sm text-muted-foreground">
              No appointments on this day.
            </p>
          ) : (
            byDate.get(toISODate(cursor))!.map((a) => <AppointmentCard key={a.id} appt={a} />)
          )}
        </div>
      )}

      {!isLoading && view !== "day" && (
        <div className="clinic-card overflow-hidden">
          <div className="grid grid-cols-7 border-b border-border bg-secondary">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div
                key={d}
                className="px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {d}
              </div>
            ))}
          </div>
          <div className={cn("grid grid-cols-7", view === "week" && "min-h-[420px]")}>
            {days.map((d) => {
              const iso = toISODate(d);
              const list = byDate.get(iso) ?? [];
              const otherMonth = view === "month" && d.getMonth() !== cursor.getMonth();
              return (
                <div
                  key={iso}
                  className={cn(
                    "min-h-[104px] border-b border-r border-border p-1.5",
                    otherMonth && "bg-secondary/40",
                  )}
                >
                  <button
                    onClick={() => {
                      setCursor(d);
                      setView("day");
                    }}
                    className={cn(
                      "mb-1 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                      iso === todayISO
                        ? "bg-primary text-primary-foreground"
                        : otherMonth
                          ? "text-muted-foreground/60"
                          : "text-foreground",
                    )}
                  >
                    {d.getDate()}
                  </button>
                  <div className="space-y-1">
                    {list.slice(0, view === "week" ? 12 : 3).map((a) => (
                      <button
                        key={a.id}
                        onClick={() => setSelected(a)}
                        className="flex w-full items-center gap-1 rounded-md bg-secondary px-1.5 py-1 text-left text-[11px] leading-tight hover:bg-accent"
                      >
                        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotClass[a.status])} />
                        <span className="truncate">
                          {formatSlot(a.slot_time)} {a.patient_name}
                        </span>
                      </button>
                    ))}
                    {view === "month" && list.length > 3 && (
                      <p className="pl-1 text-[10px] text-muted-foreground">+{list.length - 3} more</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Appointment details</DialogTitle>
          </DialogHeader>
          {selected && <AppointmentCard appt={selected} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
