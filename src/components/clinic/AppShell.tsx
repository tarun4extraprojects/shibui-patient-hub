import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  CalendarRange,
  FilePlus2,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { clinic } from "@/config/clinic";
import { Logo } from "@/components/clinic/Logo";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/appointments", label: "Appointments", icon: CalendarDays },
  { to: "/prescriptions/new", label: "New Prescription", icon: FilePlus2 },
  { to: "/patients", label: "Patients", icon: Users },
  { to: "/calendar", label: "Calendar", icon: CalendarRange },
  { to: "/reminders", label: "Reminders", icon: MessageCircle },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop / iPad sidebar */}
      <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-sidebar md:flex">
        <div className="px-5 py-5">
          <Logo />
        </div>
        <div className="gold-rule mx-5" />
        <nav className="flex-1 space-y-1 p-3">
          {nav.map((item) => {
            const active = pathname === item.to || pathname.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                )}
              >
                <item.icon className="h-[18px] w-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="gold-rule mx-5" />
        <div className="p-4">
          <p className="text-xs leading-relaxed text-muted-foreground">
            {clinic.doctorName}
            <br />
            {clinic.qualifications}
          </p>
          <button
            onClick={signOut}
            className="mt-3 inline-flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="no-print sticky top-0 z-20 flex items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">
        <Logo compact />
        <div className="text-sm font-semibold">{clinic.clinicName}</div>
        <button onClick={signOut} aria-label="Sign out" className="p-2 text-muted-foreground">
          <LogOut className="h-5 w-5" />
        </button>
      </header>

      <main className="px-4 pb-28 pt-5 md:ml-64 md:px-8 md:pb-10 md:pt-8">{children}</main>

      {/* Mobile bottom navigation */}
      <nav className="no-print fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-border bg-card md:hidden">
        {nav.map((item) => {
          const active = pathname === item.to || pathname.startsWith(item.to + "/");
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex min-h-[58px] flex-col items-center justify-center gap-1 px-1 py-2 text-[10px] font-medium",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="leading-none">{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
