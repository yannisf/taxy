/**
 * PDF initialization and setup utilities
 */

import { registerIEPSansFont, IEP_SANS_FONT_FAMILY } from './iepFonts';

export interface PDFMakeInstance {
  createPdf: (docDefinition: any) => any;
  addVirtualFileSystem: (vfs: Record<string, string>) => void;
  fonts: any;
}

/**
 * Dynamically imports pdfMake and initializes default fonts
 */
export async function initializePDFMake(): Promise<PDFMakeInstance> {
  const pdfMakeModule = await import('pdfmake/build/pdfmake');

  // Get the actual pdfMake instance
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfMake = (pdfMakeModule as any).default || pdfMakeModule;

  // IEP Sans is the only family used by any report, so pdfmake's bundled
  // Roboto VFS (vfs_fonts) is deliberately not loaded — it is ~836KB and
  // would have no consumer. Every generator sets defaultStyle.font, so
  // nothing falls back to pdfmake's implicit 'Roboto' default.
  registerIEPSansFont(pdfMake);

  return pdfMake;
}

/**
 * Gets font configuration for catalog PDFs (IEP Sans)
 */
export async function getCatalogFontConfig() {
  const pdfMake = await initializePDFMake();

  return { pdfMake, fontFamily: IEP_SANS_FONT_FAMILY };
}

/**
 * Gets font configuration for student card PDFs (IEP Sans)
 */
export async function getCardsFontConfig() {
  const pdfMake = await initializePDFMake();

  return { pdfMake, fontFamily: IEP_SANS_FONT_FAMILY };
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
