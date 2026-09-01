import { useState } from "react";
import { toast } from "sonner";
import { clinic } from "@/config/clinic";
import { useBooking } from "@/hooks/useBooking";
import { isValidPhone, toISODate } from "@/lib/clinic-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatSlot } from "@/lib/clinic-utils";

export function BookAppointmentDialog({
  open,
  onOpenChange,
  defaultDate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultDate?: string;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState<string>(clinic.reasonTypes[0]);
  const [dateISO, setDateISO] = useState(defaultDate ?? toISODate(new Date()));
  const [slot, setSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { slots, sunday, book } = useBooking(dateISO);

  function reset() {
    setName("");
    setPhone("");
    setReason(clinic.reasonTypes[0]);
    setSlot("");
    setNotes("");
    setErrors({});
  }

  async function submit() {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Please enter patient's name.";
    if (!phone.trim()) next.phone = "Please enter patient's phone number.";
    else if (!isValidPhone(phone)) next.phone = "Please enter a valid 10-digit phone number.";
    if (!dateISO) next.date = "Please choose an appointment date.";
    if (!slot) next.slot = "Please select an appointment time.";
    setErrors(next);
    if (Object.keys(next).length) return;

    try {
      const res = await book.mutateAsync({
        patientName: name,
        phone,
        reason,
        dateISO,
        slot,
        notes,
      });
      toast.success(`Appointment booked — Patient ID ${res.patient.patient_uid}`);
      reset();
      onOpenChange(false);
    } catch {
      toast.error("Could not save this appointment. Please try again.");
    }
  }

  const SlotGrid = ({
    label,
    list,
  }: {
    label: string;
    list: { slot: string; disabled: boolean }[];
  }) => (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {list.map((s) => (
          <button
            key={s.slot}
            type="button"
            disabled={s.disabled}
            onClick={() => setSlot(s.slot)}
            className={cn(
              "min-h-11 rounded-lg border px-2 text-sm font-medium transition-colors",
              s.disabled && "cursor-not-allowed border-border bg-muted text-muted-foreground/50 line-through",
              !s.disabled && slot === s.slot && "border-primary bg-primary text-primary-foreground",
              !s.disabled && slot !== s.slot && "border-border bg-card hover:border-primary/50",
            )}
          >
            {formatSlot(s.slot)}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Appointment</DialogTitle>
          <DialogDescription>
            If this phone number already exists, the appointment is linked to that patient.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="p-name">Patient Name</Label>
              <Input id="p-name" className="h-11" value={name} onChange={(e) => setName(e.target.value)} />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-phone">Phone</Label>
              <Input
                id="p-phone"
                className="h-11"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Reason</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {clinic.reasonTypes.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-date">Date</Label>
              <Input
                id="p-date"
                type="date"
                className="h-11"
                value={dateISO}
                onChange={(e) => {
                  setDateISO(e.target.value);
                  setSlot("");
                }}
              />
              {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
            </div>
          </div>

          {sunday && (
            <div className="rounded-xl border border-primary/30 bg-accent px-4 py-3 text-sm font-medium text-accent-foreground">
              Sunday — By Appointment Only
            </div>
          )}

          <div className="space-y-4">
            <SlotGrid label="Morning · 09:00 AM – 01:00 PM" list={slots.morning} />
            <SlotGrid label="Evening · 04:00 PM – 09:00 PM" list={slots.evening} />
            {errors.slot && <p className="text-xs text-destructive">{errors.slot}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="p-notes">Notes (optional)</Label>
            <Textarea id="p-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" className="min-h-11" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="min-h-11" onClick={submit} disabled={book.isPending}>
              {book.isPending ? "Saving…" : "Book Appointment"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
