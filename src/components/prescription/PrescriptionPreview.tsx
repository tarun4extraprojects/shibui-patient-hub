import { clinic } from "@/config/clinic";
import { LogoMark } from "@/components/clinic/Logo";
import { formatDateLong } from "@/lib/clinic-utils";
import type { Medicine, Vitals } from "@/lib/types";

export interface RxData {
  patientUid: string;
  name: string;
  age: string;
  sex: string;
  phone: string;
  date: string;
  vitals: Vitals;
  chiefComplaint: string;
  diagnosis: string;
  medicines: Medicine[];
  advice: string;
  tests: string;
  followUp: string;
}

/**
 * MODE 2 — full digital prescription (letterhead + data).
 * Used for the on-screen preview, the PDF download and WhatsApp sharing.
 * A4: 210mm x 297mm.
 */
export function PrescriptionPreview({ data }: { data: RxData }) {
  const vitalLine = [
    data.vitals.bp && `BP: ${data.vitals.bp}`,
    data.vitals.weight && `Weight: ${data.vitals.weight}`,
    data.vitals.temperature && `Temp: ${data.vitals.temperature}`,
    data.vitals.spo2 && `SpO2: ${data.vitals.spo2}`,
  ]
    .filter(Boolean)
    .join("   |   ");

  return (
    <div
      className="rx-sheet relative mx-auto flex flex-col bg-white text-[#3A3A3A]"
      style={{ width: "210mm", minHeight: "297mm", padding: "10mm 12mm" }}
    >
      {/* Decorative rose corner + gold swoosh */}
      <div
        className="pointer-events-none absolute left-0 top-0"
        style={{
          width: "108mm",
          height: "34mm",
          background: "#9A5454",
          borderBottomRightRadius: "100% 180%",
        }}
      />
      <div
        className="pointer-events-none absolute left-0 top-0"
        style={{
          width: "120mm",
          height: "40mm",
          borderBottom: "1.2pt solid #C2A05A",
          borderBottomRightRadius: "100% 180%",
        }}
      />

      {/* Letterhead */}
      <header className="relative flex items-start justify-between" style={{ minHeight: "26mm" }}>
        <div className="pt-1 text-white">
          <p className="text-[13pt] font-bold leading-tight">{clinic.doctorName}</p>
          <p className="text-[8pt] opacity-90">{clinic.qualifications}</p>
          <p className="text-[8pt] opacity-90">Reg. No.: {clinic.regNo}</p>
        </div>
        <div className="flex items-center gap-2 text-[#9A5454]">
          <LogoMark className="h-12 w-12" />
          <div className="leading-tight">
            <div className="font-serif text-[17pt] italic">Shibui</div>
            <div className="text-[13pt] font-bold tracking-tight">Dental Hub</div>
            <div className="text-[6.5pt] font-semibold uppercase tracking-[0.16em]">
              {clinic.tagline}
            </div>
          </div>
        </div>
      </header>

      {/* Patient line */}
      <div className="mt-3 grid grid-cols-12 gap-2 border-b border-[#C2A05A] pb-2 text-[9.5pt]">
        <div className="col-span-5">
          <span className="text-[#9A5454]">Name: </span>
          <span className="font-medium">{data.name}</span>
        </div>
        <div className="col-span-2">
          <span className="text-[#9A5454]">Age: </span>
          {data.age}
        </div>
        <div className="col-span-2">
          <span className="text-[#9A5454]">Sex: </span>
          {data.sex}
        </div>
        <div className="col-span-3 text-right">
          <span className="text-[#9A5454]">Date: </span>
          {formatDateLong(data.date)}
        </div>
        <div className="col-span-6">
          <span className="text-[#9A5454]">Patient ID: </span>
          <span className="font-mono">{data.patientUid}</span>
        </div>
        <div className="col-span-6 text-right">
          <span className="text-[#9A5454]">Phone: </span>
          {data.phone}
        </div>
      </div>

      {/* Body: facilities column + Rx area */}
      <div className="mt-3 flex flex-1 gap-4">
        <aside className="w-[46mm] shrink-0 border-r border-[#E7DFD6] pr-3">
          <p className="text-[9pt] font-bold tracking-wide text-[#9A5454]">FACILITIES :</p>
          <ul className="mt-2 space-y-[3.2mm] text-[8pt]">
            {clinic.facilities.map((f) => (
              <li key={f} className="border-b border-dotted border-[#E7DFD6] pb-[1mm]">
                {f}
              </li>
            ))}
          </ul>
        </aside>

        <section className="min-w-0 flex-1">
          {vitalLine && (
            <p className="mb-2 text-[8.5pt] text-[#7A6A60]">{vitalLine}</p>
          )}

          {data.chiefComplaint && (
            <p className="text-[9.5pt]">
              <span className="font-semibold text-[#9A5454]">Chief complaint: </span>
              {data.chiefComplaint}
            </p>
          )}
          {data.diagnosis && (
            <p className="mt-1 text-[9.5pt]">
              <span className="font-semibold text-[#9A5454]">Diagnosis: </span>
              {data.diagnosis}
            </p>
          )}

          <p className="mt-3 font-serif text-[22pt] italic leading-none text-[#9A5454]">R</p>
          <p className="-mt-3 ml-3 font-serif text-[11pt] italic text-[#9A5454]">x</p>

          <table className="mt-1 w-full border-collapse text-[9pt]">
            <thead>
              <tr className="border-b border-[#C2A05A] text-left text-[8pt] text-[#9A5454]">
                <th className="w-[6mm] py-1 font-semibold">#</th>
                <th className="py-1 font-semibold">Medicine</th>
                <th className="w-[18mm] py-1 font-semibold">Dosage</th>
                <th className="w-[26mm] py-1 font-semibold">Frequency</th>
                <th className="w-[18mm] py-1 font-semibold">Duration</th>
              </tr>
            </thead>
            <tbody>
              {data.medicines
                .filter((m) => m.name.trim())
                .map((m, i) => (
                  <tr key={i} className="border-b border-[#EFE7DE] align-top">
                    <td className="py-1.5">{i + 1}.</td>
                    <td className="py-1.5">
                      {m.name}
                      {m.notes && <div className="text-[7.5pt] text-[#7A6A60]">{m.notes}</div>}
                    </td>
                    <td className="py-1.5">{m.dosage}</td>
                    <td className="py-1.5">{m.frequency}</td>
                    <td className="py-1.5">{m.duration}</td>
                  </tr>
                ))}
            </tbody>
          </table>

          <div className="mt-4 space-y-1.5 text-[9.5pt]">
            {data.advice && (
              <p>
                <span className="font-semibold text-[#9A5454]">Advice: </span>
                {data.advice}
              </p>
            )}
            {data.tests && (
              <p>
                <span className="font-semibold text-[#9A5454]">Tests: </span>
                {data.tests}
              </p>
            )}
            {data.followUp && (
              <p>
                <span className="font-semibold text-[#9A5454]">Follow-up: </span>
                {formatDateLong(data.followUp)}
              </p>
            )}
          </div>

          <div className="mt-16 text-right text-[8.5pt] text-[#7A6A60]">
            <div className="ml-auto w-[55mm] border-t border-[#C2A05A] pt-1">{clinic.doctorName}</div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="relative mt-4 pt-2">
        <div style={{ height: "1pt", background: "#C2A05A" }} />
        <div className="mt-2 flex flex-wrap justify-between gap-x-4 text-[7.5pt] text-[#3A3A3A]">
          <span>WhatsApp: {clinic.whatsapp}</span>
          <span>Phone: {clinic.phone}</span>
          <span>{clinic.email}</span>
        </div>
        <p className="mt-1 text-[7.5pt]">{clinic.address}</p>
        <p className="text-[7.5pt] text-[#7A6A60]">{clinic.timings}</p>
      </footer>
    </div>
  );
}
