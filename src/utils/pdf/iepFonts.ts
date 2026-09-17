/**
 * IEP Sans font registration for pdfmake.
 * IEP Sans is a Greek/Latin sans-serif family published by the Greek Institute
 * of Educational Policy (IEP), used here for the student name-card PDFs.
 */

import {
  IEP_SANS_REGULAR,
  IEP_SANS_BOLD,
  IEP_SANS_ITALIC,
  IEP_SANS_BOLD_ITALIC
} from './iepFontsData';
import type { PDFMakeInstance } from './pdfSetup';

export const IEP_SANS_FONT_FAMILY = 'IEPSans';

/**
 * Registers the IEP Sans font family into a pdfmake instance's virtual file system
 */
export function registerIEPSansFont(pdfMake: PDFMakeInstance): void {
  pdfMake.addVirtualFileSystem({
    'IEPSans-Regular.otf': IEP_SANS_REGULAR,
    'IEPSans-Bold.otf': IEP_SANS_BOLD,
    'IEPSans-Italic.otf': IEP_SANS_ITALIC,
    'IEPSans-BoldItalic.otf': IEP_SANS_BOLD_ITALIC
  });

  pdfMake.fonts = {
    ...pdfMake.fonts,
    [IEP_SANS_FONT_FAMILY]: {
      normal: 'IEPSans-Regular.otf',
      bold: 'IEPSans-Bold.otf',
      italics: 'IEPSans-Italic.otf',
      bolditalics: 'IEPSans-BoldItalic.otf'
    }
  };
}
