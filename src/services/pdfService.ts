/** Renders an A4 element to a downloadable PDF using the same on-screen design. */
export async function downloadElementAsPdf(element: HTMLElement, filename: string) {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas-pro"),
  ]);

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
  });

  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageWidth = 210;
  const pageHeight = 297;
  const imgHeight = (canvas.height * pageWidth) / canvas.width;

  pdf.addImage(
    canvas.toDataURL("image/jpeg", 0.95),
    "JPEG",
    0,
    0,
    pageWidth,
    Math.min(imgHeight, pageHeight),
  );
  pdf.save(filename);
}
