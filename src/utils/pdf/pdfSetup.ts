/**
 * PDF initialization and setup utilities
 */

export interface PDFMakeInstance {
  createPdf: (docDefinition: any) => any;
  vfs: any;
}

/**
 * Dynamically imports pdfMake and initializes default fonts
 */
export async function initializePDFMake(): Promise<PDFMakeInstance> {
  const pdfMakeModule = await import('pdfmake/build/pdfmake');
  const pdfFontsModule = await import('pdfmake/build/vfs_fonts');

  // Get the actual pdfMake instance
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfMake = (pdfMakeModule as any).default || pdfMakeModule;

  // Initialize default fonts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pdfMake.vfs = (pdfFontsModule as any).default || pdfFontsModule;

  return pdfMake;
}

/**
 * Gets font configuration for PDF generation (Roboto)
 */
export async function getPDFFontConfig() {
  const pdfMake = await initializePDFMake();
  const fontFamily = 'Roboto';

  return { pdfMake, fontFamily };
}

/**
 * Creates a standardized filename for PDF exports
 */
export function createPDFFilename(
  schoolName: string,
  className: string,
  schoolYear: string,
  type: 'catalog' | 'student_grid' | 'student_list'
): string {
  return `${schoolName}_${className}_${schoolYear}_${type}.pdf`;
}
