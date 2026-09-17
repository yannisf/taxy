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
  const pdfFontsModule = await import('pdfmake/build/vfs_fonts');

  // Get the actual pdfMake instance
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfMake = (pdfMakeModule as any).default || pdfMakeModule;

  // Register the default (Roboto) fonts baked into pdfmake
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pdfMake.addVirtualFileSystem((pdfFontsModule as any).default || pdfFontsModule);

  return pdfMake;
}

/**
 * Gets font configuration for catalog PDFs (Roboto)
 */
export async function getCatalogFontConfig() {
  const pdfMake = await initializePDFMake();
  const fontFamily = 'Roboto';

  return { pdfMake, fontFamily };
}

/**
 * Gets font configuration for student card PDFs (IEP Sans)
 */
export async function getCardsFontConfig() {
  const pdfMake = await initializePDFMake();
  registerIEPSansFont(pdfMake);

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
