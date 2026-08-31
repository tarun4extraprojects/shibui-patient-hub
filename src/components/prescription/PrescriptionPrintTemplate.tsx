import { forwardRef } from "react";
import { ExistingTemplatePrint } from "./ExistingTemplatePrint";
import { PrescriptionPreview, type RxData } from "./PrescriptionPreview";

export type PrintMode = "existing" | "digital";

/**
 * The ONLY element that ever reaches the printer (see the @media print block
 * in src/styles.css — everything outside #rx-print-root is hidden).
 * Keep all print tweaks inside this component tree.
 */
export const PrescriptionPrintTemplate = forwardRef<
  HTMLDivElement,
  { data: RxData; mode: PrintMode }
>(function PrescriptionPrintTemplate({ data, mode }, ref) {
  return (
    <div id="rx-print-root" ref={ref}>
      {mode === "existing" ? (
        <ExistingTemplatePrint data={data} />
      ) : (
        <PrescriptionPreview data={data} />
      )}
    </div>
  );
});
