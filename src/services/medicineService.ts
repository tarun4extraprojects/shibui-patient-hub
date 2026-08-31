/**
 * Optional medicine autocomplete.
 *
 * If VITE_MEDICINE_API_URL is configured the service queries it, otherwise the
 * prescription form falls back to a small built-in list plus free manual typing.
 * No secret keys are hardcoded — a server proxy should be used for private APIs.
 */

const COMMON_MEDICINES = [
  "Tab Amoxiclav-CV 625mg",
  "Tab Amoxicillin 500mg",
  "Tab Metronidazole 400mg",
  "Tab Ibuprofen 400mg",
  "Tab Paracetamol 650mg",
  "Tab Aceclofenac + Paracetamol",
  "Tab Ketorolac 10mg",
  "Cap Pantoprazole 40mg",
  "Tab Chymoral Forte",
  "Tab Diclofenac 50mg",
  "Mouthwash Chlorhexidine 0.2%",
  "Gel Metrogyl DG",
  "Tab Cefixime 200mg",
  "Tab Azithromycin 500mg",
  "Tab Vitamin B-Complex",
];

export function isMedicineApiConfigured(): boolean {
  return Boolean(import.meta.env["VITE_MEDICINE_API_URL"]);
}

export async function searchMedicines(term: string): Promise<string[]> {
  const q = term.trim().toLowerCase();
  if (!q) return [];

  const base = import.meta.env["VITE_MEDICINE_API_URL"] as string | undefined;
  if (base) {
    try {
      const res = await fetch(`${base}?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const json = (await res.json()) as unknown;
        if (Array.isArray(json)) {
          return json
            .map((i) => (typeof i === "string" ? i : ((i as { name?: string }).name ?? "")))
            .filter(Boolean)
            .slice(0, 10);
        }
      }
    } catch {
      // fall through to the local list — manual entry must always keep working
    }
  }

  return COMMON_MEDICINES.filter((m) => m.toLowerCase().includes(q)).slice(0, 8);
}
