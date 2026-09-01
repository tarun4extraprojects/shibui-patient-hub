import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, Clock, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/clinic/AppShell";
import { Button } from "@/components/ui/button";
import { useReminders, useSendReminder, useWhatsAppStatus } from "@/hooks/useReminders";
import { formatDateLong } from "@/lib/clinic-utils";

export const Route = createFileRoute("/_authenticated/reminders")({
  head: () => ({
    meta: [
      { title: "WhatsApp Reminders | Shibui Dental Hub" },
      {
        name: "description",
        content:
          "Track scheduled, sent and failed WhatsApp appointment and follow-up reminders for the clinic.",
      },
      { property: "og:title", content: "WhatsApp Reminders | Shibui Dental Hub" },
      {
        property: "og:description",
        content: "Scheduled, sent and failed patient reminders in one place.",
      },
    ],
  }),
  component: RemindersPage,
});

const typeLabel: Record<string, string> = {
  appointment: "Appointment",
  follow_up: "Follow-up",
  missed: "Missed visit",
  doctor_daily: "Daily agenda",
  upcoming: "Upcoming visit",
};

function RemindersPage() {
  const { data: reminders, isLoading } = useReminders();
  const { data: status } = useWhatsAppStatus();
  const send = useSendReminder();

  const pending = reminders?.filter((r) => r.status === "scheduled").length ?? 0;
  const sent = reminders?.filter((r) => r.status === "sent").length ?? 0;
  const failed = reminders?.filter((r) => r.status === "failed").length ?? 0;

  async function handleSend(id: string) {
    try {
      await send.mutateAsync(id);
      toast.success("Reminder sent on WhatsApp.");
    } catch {
      toast.error("Could not send this reminder. Please check the WhatsApp setup.");
    }
  }

  return (
    <AppShell title="Reminders" subtitle="WhatsApp messages to patients">
      <div className="space-y-6">
        {status && !status.configured && (
          <div className="clinic-card flex items-start gap-3 border-l-4 border-l-secondary p-4">
            <AlertTriangle className="mt-0.5 h-4 w-4 text-secondary-foreground" />
            <div className="text-sm">
              <p className="font-medium">WhatsApp sending is not connected yet</p>
              <p className="text-muted-foreground">
                Reminders are still scheduled and stored here. Once the WhatsApp Business
                credentials are added, messages will go out automatically.
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={<Clock className="h-4 w-4" />} label="Scheduled" value={pending} />
          <StatCard icon={<CheckCircle2 className="h-4 w-4" />} label="Sent" value={sent} />
          <StatCard icon={<AlertTriangle className="h-4 w-4" />} label="Failed" value={failed} />
        </div>

        <section className="clinic-card p-4 sm:p-5">
          <h2 className="text-base font-semibold">All Reminders</h2>
          <div className="gold-rule my-3" />
          {isLoading ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading reminders…
            </p>
          ) : !reminders?.length ? (
            <p className="text-sm text-muted-foreground">
              No reminders yet. They are created automatically when you book an appointment or set a
              follow-up date.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {reminders.map((r) => (
                <li key={r.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{r.recipient_name ?? "Clinic"}</span>
                      <span className="rounded-md bg-accent px-2 py-0.5 text-xs text-accent-foreground">
                        {typeLabel[r.type] ?? r.type}
                      </span>
                      <span className="text-xs text-muted-foreground">{r.recipient_phone}</span>
                    </div>
                    <p className="mt-1 max-w-2xl whitespace-pre-line text-xs text-muted-foreground">
                      {r.message}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Scheduled for {formatDateLong(r.scheduled_at.slice(0, 10))}
                      {r.error_message ? ` · ${r.error_message}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        r.status === "sent"
                          ? "rounded-full bg-accent px-2.5 py-1 text-xs text-accent-foreground"
                          : r.status === "failed"
                            ? "rounded-full bg-destructive/10 px-2.5 py-1 text-xs text-destructive"
                            : "rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
                      }
                    >
                      {r.status}
                    </span>
                    {r.status !== "sent" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="min-h-9"
                        onClick={() => handleSend(r.id)}
                        disabled={send.isPending}
                      >
                        <Send className="h-3.5 w-3.5" /> Send now
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="clinic-card flex items-center gap-3 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
    </div>
  );
}
