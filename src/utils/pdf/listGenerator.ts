/**
 * Student list PDF generator (single column)
 */

import type { TDocumentDefinitions, Content } from 'pdfmake/interfaces';
import type { Kid, Class } from '../../types/models';
import type { TFunction } from 'i18next';
import { logger } from '../logger';
import { getCardsFontConfig, createPDFFilename } from './pdfSetup';

/**
 * Generates and downloads a single-column student list PDF
 * One student per row with full name
 * Uses OpenDyslexic font for better readability
 */
export async function generateStudentListPDF(classRecord: Class, kids: Kid[], _t: TFunction): Promise<void> {
  const { pdfMake, fontFamily } = await getCardsFontConfig();

  const fileName = createPDFFilename(
    classRecord.school_name,
    classRecord.class_name,
    classRecord.school_year,
    'student_list'
  );

  // Create single-column list
  const listBody: Content[][] = [];
  kids.forEach((kid) => {
    const fullName = `${kid.preferred_name || kid.first_name} ${kid.last_name}`;
    const cell = {
      text: fullName,
      style: 'listCell',
      fontSize: fullName.length >= 18 ? 26 : 40 // 26pt for names >=18 chars, 40pt for shorter names
    };

    listBody.push([cell]);
  });

  const documentDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageOrientation: 'portrait',
    pageMargins: [40, 40, 40, 40],

    content: [
      {
        table: {
          widths: ['*'],
          body: listBody,
          dontBreakRows: true,
          headerRows: 0 // Explicitly no header rows
        },
        layout: {
          hLineWidth: function() { return 1; },
          vLineWidth: function() { return 1; },
          hLineColor: function() { return '#000000'; },
          vLineColor: function() { return '#000000'; },
          paddingTop: function() { return 15; },
          paddingBottom: function() { return 15; }
        }
      }
    ],

    styles: {
      listCell: {
        fontSize: 40, // Default font size (overridden per cell)
        alignment: 'center',
        margin: [20, 15, 20, 15], // Reduced vertical margin for more rows per page
        font: fontFamily
      }
    },

    defaultStyle: {
      font: fontFamily
    }
  };

  try {
    // Generate and download the PDF
    const pdfDoc = pdfMake.createPdf(documentDefinition);
    logger.debug('PDF document created, attempting download...');
    pdfDoc.download(fileName);
    logger.debug('Download method called');
  } catch (error) {
    logger.error('Error generating student list PDF:', error);
    throw error;
  }
}
