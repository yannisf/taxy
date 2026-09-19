/**
 * PDF initialization and setup utilities
 */

import { registerIEPSansFont, IEP_SANS_FONT_FAMILY } from './iepFonts';

/**
 * Monospace family used for phone numbers so digits line up in columns.
 * Courier is one of the PDF standard-14 fonts: no font file is embedded in the
 * output, only pdfmake's ~62KB of AFM metrics is loaded. Its Latin-only glyph
 * coverage is not a limitation because phone numbers are digits and spaces.
 */
export const MONOSPACE_FONT_FAMILY = 'Courier';

export interface PDFMakeInstance {
  createPdf: (docDefinition: any) => any;
  addVirtualFileSystem: (vfs: Record<string, string>) => void;
  addFontContainer: (fontContainer: unknown) => void;
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

  // IEP Sans is the body font of every report, so pdfmake's bundled Roboto VFS
  // (vfs_fonts) is deliberately not loaded — it is ~836KB and would have no
  // consumer. Every generator sets defaultStyle.font, so nothing falls back to
  // pdfmake's implicit 'Roboto' default.
  registerIEPSansFont(pdfMake);

  // Courier's AFM metrics still have to be registered even though the font
  // itself is built into every PDF reader; pdfmake ships them as a font
  // container that declares both the VFS entries and the family mapping.
  // @ts-expect-error - pdfmake ships no type declarations for its font bundles
  const courierModule = await import('pdfmake/build/standard-fonts/Courier.js');
  pdfMake.addFontContainer(courierModule.default || courierModule);

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
  type: 'catalog' | 'student_grid' | 'student_grid_bold' | 'student_list'
): string {
  return `${schoolName}_${className}_${schoolYear}_${type}.pdf`;
}
