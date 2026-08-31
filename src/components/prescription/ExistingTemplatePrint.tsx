import { printCalibration as cal } from "@/config/clinic";
import { formatDateLong } from "@/lib/clinic-utils";
import type { RxData } from "./PrescriptionPreview";

/**
 * MODE 1 — print onto the clinic's EXISTING pre-printed prescription pad.
 * Only dynamic patient/prescription text is rendered, positioned in millimetres
 * on a blank A4 sheet. Adjust the coordinates in src/config/clinic.ts
 * (printCalibration) to fine-tune alignment with the physical paper —
 * no other file needs to change.
 */
function At({
  x,
  y,
  width,
  children,
  size = "9.5pt",
}: {
  x: number;
  y: number;
  width?: number;
  size?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${x + cal.pageOffsetX}mm`,
        top: `${y + cal.pageOffsetY}mm`,
        width: width ? `${width}mm` : undefined,
        fontSize: size,
        lineHeight: 1.25,
        color: "#000",
      }}
    >
      {children}
    </div>
  );
}

export function ExistingTemplatePrint({ data }: { data: RxData }) {
  const meds = data.medicines.filter((m) => m.name.trim());
  const vitals = [
    data.vitals.bp && `BP ${data.vitals.bp}`,
    data.vitals.weight && `Wt ${data.vitals.weight}`,
    data.vitals.temperature && `Temp ${data.vitals.temperature}`,
    data.vitals.spo2 && `SpO2 ${data.vitals.spo2}`,
  ]
    .filter(Boolean)
    .join("  ·  ");

  return (
    <div
      className="rx-sheet relative mx-auto bg-white"
      style={{ width: "210mm", height: "297mm", position: "relative" }}
    >
      <At {...cal.name}>{data.name}</At>
      <At {...cal.age}>{data.age}</At>
      <At {...cal.sex}>{data.sex}</At>
      <At {...cal.date}>{formatDateLong(data.date)}</At>
      <At {...cal.phone}>{data.phone}</At>

      {vitals && (
        <At {...cal.vitals} size="8.5pt">
          {vitals}
        </At>
      )}
      {data.chiefComplaint && <At {...cal.chiefComplaint}>{data.chiefComplaint}</At>}
      {data.diagnosis && <At {...cal.diagnosis}>{data.diagnosis}</At>}

      {meds.map((m, i) => (
        <At
          key={i}
          x={cal.medicines.x}
          y={cal.medicines.y + i * cal.medicines.rowHeight}
          width={cal.medicines.width}
        >
          {i + 1}. {m.name} — {m.dosage} {m.frequency} {m.duration ? `× ${m.duration}` : ""}
          {m.notes ? ` (${m.notes})` : ""}
        </At>
      ))}

      {data.advice && (
        <At {...cal.advice} width={95}>
          {data.advice}
        </At>
      )}
      {data.tests && (
        <At {...cal.tests} width={95}>
          {data.tests}
        </At>
      )}
      {data.followUp && <At {...cal.followUp}>{formatDateLong(data.followUp)}</At>}
    </div>
  );
}
