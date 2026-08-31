import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { usePatientSearch } from "@/hooks/usePatients";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/patients/")({
  head: () => ({
    meta: [
      { title: "Patients — Shibui Dental Care" },
      {
        name: "description",
        content: "Search Shibui Dental Hub patients by Patient ID, name or phone number.",
      },
      { property: "og:title", content: "Patients — Shibui Dental Care" },
      { property: "og:description", content: "Complete patient directory and treatment history." },
    ],
  }),
  component: PatientsPage,
});

function PatientsPage() {
  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(term), 250);
    return () => clearTimeout(t);
  }, [term]);

  const { data: patients, isLoading } = usePatientSearch(debounced);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Patients</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Search by Patient ID (SHB-000001), name or phone number.
        </p>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="h-12 pl-10"
          placeholder="Search patients…"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : (patients ?? []).length === 0 ? (
        <p className="clinic-card px-5 py-10 text-center text-sm text-muted-foreground">
          No patients found.
        </p>
      ) : (
        <div className="space-y-2">
          {patients!.map((p) => (
            <Link
              key={p.id}
              to="/patients/$patientId"
              params={{ patientId: p.id }}
              className="clinic-card flex min-h-16 items-center justify-between gap-3 px-4 py-3 transition-shadow hover:shadow-lifted"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{p.name}</p>
                <p className="text-sm text-muted-foreground">{p.phone || "No phone"}</p>
              </div>
              <span className="shrink-0 rounded-md bg-secondary px-2 py-1 font-mono text-xs text-muted-foreground">
                {p.patient_uid}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
