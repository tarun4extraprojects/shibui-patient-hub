import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Loader2, Plus, Printer, Save, Search, Trash2, Copy } from "lucide-react";
import { toast } from "sonner";
import { clinic } from "@/config/clinic";
import { supabase } from "@/integrations/supabase/client";
import { searchMedicines } from "@/services/medicineService";
import { downloadElementAsPdf } from "@/services/pdfService";
import { useSavePrescription } from "@/hooks/usePrescriptions";
import { usePatient } from "@/hooks/usePatients";
import { useAppointment } from "@/hooks/useAppointments";
import { normalizePhone, toISODate } from "@/lib/clinic-utils";
import type { Medicine, Patient, Prescription } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PrescriptionPrintTemplate, type PrintMode } from "./PrescriptionPrintTemplate";
import type { RxData } from "./PrescriptionPreview";
import { cn } from "@/lib/utils";

const emptyMed: Medicine = { name: "", dosage: "", frequency: "", duration: "", notes: "" };

export function PrescriptionForm({
  appointmentId,
  patientId,
  existing,
}: {
  appointmentId?: string;
  patientId?: string;
  existing?: Prescription;
}) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [lookup, setLookup] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState(existing?.rx_date ?? toISODate(new Date()));
  const [bp, setBp] = useState(existing?.vitals?.bp ?? "");
  const [weight, setWeight] = useState(existing?.vitals?.weight ?? "");
  const [temperature, setTemperature] = useState(existing?.vitals?.temperature ?? "");
  const [spo2, setSpo2] = useState(existing?.vitals?.spo2 ?? "");
  const [chiefComplaint, setChiefComplaint] = useState(existing?.chief_complaint ?? "");
  const [diagnosis, setDiagnosis] = useState(existing?.diagnosis ?? "");
  const [medicines, setMedicines] = useState<Medicine[]>(
    existing?.medicines?.length ? existing.medicines : [{ ...emptyMed }],
  );
  const [advice, setAdvice] = useState(existing?.advice ?? "");
  const [tests, setTests] = useState(existing?.tests ?? "");
  const [followUp, setFollowUp] = useState(existing?.follow_up_date ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mode, setMode] = useState<PrintMode>("existing");
  const [savedId, setSavedId] = useState<string | undefined>(existing?.id);
  const [downloading, setDownloading] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);
  const save = useSavePrescription();

  const { data: preloadedPatient } = usePatient(patientId ?? existing?.patient_id ?? undefined);
  const { data: appointment } = useAppointment(appointmentId ?? undefined);

  useEffect(() => {
    if (preloadedPatient) applyPatient(preloadedPatient);
  }, [preloadedPatient]);

  useEffect(() => {
    if (appointment && !preloadedPatient) {
      setName(appointment.patient_name);
      setPhone(appointment.phone);
      if (appointment.appointment_date) setDate(appointment.appointment_date);
    }
  }, [appointment, preloadedPatient]);

  function applyPatient(p: Patient) {
    setPatient(p);
    setName(p.name);
    setPhone(p.phone ?? "");
    setAge(p.age ? String(p.age) : "");
    setSex(p.sex ?? "");
  }

  async function runLookup() {
    const q = lookup.trim();
    if (!q) return;
    const digits = normalizePhone(q);
    const filters = [`patient_uid.ilike.%${q}%`, `name.ilike.%${q}%`];
    if (digits) filters.push(`phone.ilike.%${digits}%`);
    const { data, error } = await supabase.from("patients").select("*").or(filters.join(",")).limit(1);
    if (error || !data?.length) {
      toast.error("No patient found with that Patient ID, name or phone.");
      return;
    }
    applyPatient(data[0] as Patient);
    toast.success(`Loaded ${(data[0] as Patient).patient_uid}`);
  }

  const rxData: RxData = useMemo(
    () => ({
      patientUid: patient?.patient_uid ?? "",
      name,
      age,
      sex,
      phone,
      date,
      vitals: { bp, weight, temperature, spo2 },
      chiefComplaint,
      diagnosis,
      medicines,
      advice,
      tests,
      followUp,
    }),
    [patient, name, age, sex, phone, date, bp, weight, temperature, spo2, chiefComplaint, diagnosis, medicines, advice, tests, followUp],
  );

  async function handleSave() {
    const next: Record<string, string> = {};
    if (!patient) next.patient = "Please select the patient first.";
    if (!date) next.date = "Please choose the prescription date.";
    if (!chiefComplaint.trim() && !diagnosis.trim() && !medicines.some((m) => m.name.trim()))
      next.clinical = "Please add at least a complaint, diagnosis or medicine.";
    setErrors(next);
    if (Object.keys(next).length) return;

    try {
      const saved = await save.mutateAsync({
        id: savedId,
        patient_id: patient!.id,
        appointment_id: appointmentId ?? existing?.appointment_id ?? null,
        rx_date: date,
        vitals: { bp, weight, temperature, spo2 },
        chief_complaint: chiefComplaint,
        diagnosis,
        medicines: medicines.filter((m) => m.name.trim()),
        facilities_advised: [],
        advice,
        tests,
        follow_up_date: followUp || null,
      });
      setSavedId(saved.id);
      // Keep age/sex on the permanent patient record too.
      await supabase
        .from("patients")
        .update({ age: age ? Number(age) : null, sex: sex || null })
        .eq("id", patient!.id);
      toast.success("Prescription saved to the patient's history.");
    } catch {
      toast.error("Could not save the prescription. Please try again.");
    }
  }

  async function handleDownload() {
    if (!printRef.current) return;
    setDownloading(true);
    try {
      const sheet = printRef.current.querySelector(".rx-sheet") as HTMLElement | null;
      await downloadElementAsPdf(
        sheet ?? printRef.current,
        `Prescription-${patient?.patient_uid ?? "patient"}-${date}.pdf`,
      );
    } catch {
      toast.error("Could not create the PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Patient */}
      <section className="clinic-card p-4 sm:p-5">
        <h2 className="text-base font-semibold">1 · Patient</h2>
        <div className="gold-rule my-3" />

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-11 pl-10"
              placeholder="Patient ID (SHB-000001), name or phone"
              value={lookup}
              onChange={(e) => setLookup(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runLookup()}
            />
          </div>
          <Button variant="secondary" className="min-h-11" onClick={runLookup}>
            Find Patient
          </Button>
        </div>

        {patient && (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-accent px-3 py-2 text-sm">
            <span className="font-medium text-accent-foreground">{patient.name}</span>
            <span className="rounded-md bg-card px-2 py-0.5 font-mono text-xs">{patient.patient_uid}</span>
            <Button
              size="sm"
              variant="ghost"
              className="h-8"
              onClick={() => {
                navigator.clipboard.writeText(patient.patient_uid);
                toast.success("Patient ID copied");
              }}
            >
              <Copy className="h-3.5 w-3.5" /> Copy Patient ID
            </Button>
          </div>
        )}
        {errors.patient && <p className="mt-2 text-xs text-destructive">{errors.patient}</p>}

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2 sm:col-span-2">
            <Label>Patient Name</Label>
            <Input className="h-11" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Age</Label>
            <Input className="h-11" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Sex</Label>
            <Select value={sex} onValueChange={setSex}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">M</SelectItem>
                <SelectItem value="F">F</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Phone</Label>
            <Input className="h-11" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Date</Label>
            <Input type="date" className="h-11" value={date} onChange={(e) => setDate(e.target.value)} />
            {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
          </div>
        </div>
      </section>

      {/* Vitals */}
      <section className="clinic-card p-4 sm:p-5">
        <h2 className="text-base font-semibold">2 · Vitals</h2>
        <div className="gold-rule my-3" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>BP</Label>
            <Input className="h-11" placeholder="120/80 mmHg" value={bp} onChange={(e) => setBp(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Weight</Label>
            <Input className="h-11" placeholder="62 kg" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Temperature</Label>
            <Input
              className="h-11"
              placeholder="98.4 °F"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>SpO2</Label>
            <Input className="h-11" placeholder="98%" value={spo2} onChange={(e) => setSpo2(e.target.value)} />
          </div>
        </div>
      </section>

      {/* Clinical */}
      <section className="clinic-card p-4 sm:p-5">
        <h2 className="text-base font-semibold">3 · Complaint &amp; Diagnosis</h2>
        <div className="gold-rule my-3" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Chief Complaint</Label>
            <Textarea
              rows={3}
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="Pain in upper tooth region"
            />
          </div>
          <div className="space-y-2">
            <Label>Diagnosis</Label>
            <Textarea
              rows={3}
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Irreversible pulpitis"
            />
          </div>
        </div>
        {errors.clinical && <p className="mt-2 text-xs text-destructive">{errors.clinical}</p>}
      </section>

      {/* Medicines */}
      <section className="clinic-card p-4 sm:p-5">
        <h2 className="text-base font-semibold">4 · Rx — Medicines</h2>
        <div className="gold-rule my-3" />
        <div className="space-y-4">
          {medicines.map((m, i) => (
            <MedicineRow
              key={i}
              index={i}
              value={m}
              onChange={(v) => setMedicines((prev) => prev.map((x, idx) => (idx === i ? v : x)))}
              onRemove={() =>
                setMedicines((prev) => (prev.length === 1 ? [{ ...emptyMed }] : prev.filter((_, idx) => idx !== i)))
              }
            />
          ))}
        </div>
        <Button
          variant="secondary"
          className="mt-4 min-h-11"
          onClick={() => setMedicines((p) => [...p, { ...emptyMed }])}
        >
          <Plus className="h-4 w-4" /> Add Medicine
        </Button>
      </section>

      {/* Advice / tests / follow-up */}
      <section className="clinic-card p-4 sm:p-5">
        <h2 className="text-base font-semibold">5 · Advice, Tests &amp; Follow-up</h2>
        <div className="gold-rule my-3" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Advice</Label>
            <Textarea rows={3} value={advice} onChange={(e) => setAdvice(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Tests</Label>
            <Textarea rows={3} value={tests} onChange={(e) => setTests(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Follow-up Date</Label>
            <Input type="date" className="h-11" value={followUp} onChange={(e) => setFollowUp(e.target.value)} />
            <p className="text-xs text-muted-foreground">
              A follow-up reminder is scheduled automatically when this date is set.
            </p>
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="no-print sticky bottom-20 z-10 flex flex-wrap gap-2 rounded-2xl border border-border bg-card/95 p-3 shadow-lifted backdrop-blur md:bottom-4">
        <Button className="min-h-11" onClick={handleSave} disabled={save.isPending}>
          {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Prescription
        </Button>
        <div className="flex gap-1 rounded-xl border border-border p-1">
          {(
            [
              ["existing", "Print on clinic pad"],
              ["digital", "Full digital"],
            ] as [PrintMode, string][]
          ).map(([m, label]) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "min-h-9 rounded-lg px-3 text-xs font-medium",
                mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <Button variant="outline" className="min-h-11" onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Print Prescription
        </Button>
        <Button variant="outline" className="min-h-11" onClick={handleDownload} disabled={downloading}>
          {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Download PDF
        </Button>
      </div>

      {/* Preview / print source */}
      <section>
        <h2 className="no-print text-base font-semibold">
          {mode === "existing" ? "Preview — data only (for the pre-printed pad)" : "Preview — full digital prescription"}
        </h2>
        <p className="no-print mt-1 text-xs text-muted-foreground">
          {mode === "existing"
            ? "Place the clinic's printed prescription paper in the printer. Only this text is printed. Fine-tune positions in src/config/clinic.ts → printCalibration."
            : "Complete letterhead version for PDF, storage and WhatsApp sharing."}
        </p>
        <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-muted p-3 print:m-0 print:overflow-visible print:border-0 print:bg-white print:p-0">
          <div
            className="origin-top-left scale-[0.52] sm:scale-[0.7] lg:scale-100 print:scale-100"
            style={{ width: "210mm" }}
          >
            <PrescriptionPrintTemplate ref={printRef} data={rxData} mode={mode} />
          </div>
        </div>
      </section>
    </div>
  );
}

function MedicineRow({
  index,
  value,
  onChange,
  onRemove,
}: {
  index: number;
  value: Medicine;
  onChange: (v: Medicine) => void;
  onRemove: () => void;
}) {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    const t = setTimeout(async () => {
      if (!value.name.trim()) return setSuggestions([]);
      const res = await searchMedicines(value.name);
      if (active) setSuggestions(res.filter((r) => r !== value.name));
    }, 220);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [value.name]);

  return (
    <div className="rounded-xl border border-border p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">Medicine {index + 1}</span>
        <Button size="sm" variant="ghost" className="h-9 text-muted-foreground" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative lg:col-span-2">
          <Input
            className="h-11"
            placeholder="Medicine name"
            value={value.name}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-lifted">
              {suggestions.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                    onClick={() => {
                      onChange({ ...value, name: s });
                      setSuggestions([]);
                    }}
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Input
          className="h-11"
          placeholder="Dosage (625mg)"
          value={value.dosage}
          onChange={(e) => onChange({ ...value, dosage: e.target.value })}
        />
        <Select value={value.frequency} onValueChange={(v) => onChange({ ...value, frequency: v })}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Frequency" />
          </SelectTrigger>
          <SelectContent>
            {clinic.frequencyOptions.map((f) => (
              <SelectItem key={f} value={f}>
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          className="h-11"
          placeholder="Duration (5 days)"
          value={value.duration}
          onChange={(e) => onChange({ ...value, duration: e.target.value })}
        />
        <Input
          className="h-11 lg:col-span-5"
          placeholder="Notes (after meal)"
          value={value.notes}
          onChange={(e) => onChange({ ...value, notes: e.target.value })}
        />
      </div>
    </div>
  );
}
