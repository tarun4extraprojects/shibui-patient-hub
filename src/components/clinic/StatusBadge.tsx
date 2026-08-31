import { cn } from "@/lib/utils";
import { statusLabel } from "@/lib/clinic-utils";
import type { AppointmentStatus } from "@/lib/types";

const styles: Record<AppointmentStatus, string> = {
  booked: "bg-accent text-accent-foreground border-primary/25",
  done: "bg-success/12 text-success border-success/30",
  cancelled: "bg-muted text-muted-foreground border-border",
  no_show: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({
  status,
  className,
}: {
  status: AppointmentStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles[status],
        className,
      )}
    >
      {statusLabel[status]}
    </span>
  );
}
