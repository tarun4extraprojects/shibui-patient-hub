import { cn } from "@/lib/utils";
import { clinic } from "@/config/clinic";

/**
 * Temporary heart-shaped tooth mark.
 * Replace the SVG below with the real clinic logo later — nothing else
 * in the app needs to change.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={cn("h-9 w-9", className)} aria-hidden="true">
      <circle cx="24" cy="24" r="23" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <path
        d="M24 38c-4-4-9-9.2-9-16.2C15 16.6 18 13 22 13c1.4 0 2.6.5 3.6 1.4C26.6 13.5 27.8 13 29.2 13 33 13 36 16.6 36 21.8c0 3.6-1.3 6.6-3 9.2"
        fill="currentColor"
        opacity="0.14"
      />
      <path
        d="M24 37.5c-3.8-3.8-8.5-8.8-8.5-15.7 0-5 2.8-8.4 6.5-8.4 1.3 0 2.5.5 3.4 1.3.9-.8 2.1-1.3 3.4-1.3 3.7 0 6.5 3.4 6.5 8.4 0 6.9-4.7 11.9-8.5 15.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({
  className,
  compact = false,
  inverted = false,
}: {
  className?: string;
  compact?: boolean;
  inverted?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <LogoMark className={cn("shrink-0", inverted ? "text-primary-foreground" : "text-primary")} />
      {!compact && (
        <div className="leading-tight">
          <div
            className={cn(
              "font-script text-xl italic",
              inverted ? "text-primary-foreground" : "text-primary",
            )}
          >
            Shibui
          </div>
          <div
            className={cn(
              "text-sm font-bold tracking-tight",
              inverted ? "text-primary-foreground" : "text-foreground",
            )}
          >
            Dental Hub
          </div>
          <div
            className={cn(
              "text-[9px] font-medium uppercase tracking-[0.18em]",
              inverted ? "text-primary-foreground/80" : "text-muted-foreground",
            )}
          >
            {clinic.tagline}
          </div>
        </div>
      )}
    </div>
  );
}
