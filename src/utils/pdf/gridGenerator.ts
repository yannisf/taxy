/**
 * Student grid PDF generator (2 columns)
 */

import type { TDocumentDefinitions, Content } from 'pdfmake/interfaces';
import type { Kid, Class } from '../../types/models';
import type { TFunction } from 'i18next';
import { logger } from '../logger';
import { getCardsFontConfig, createPDFFilename } from './pdfSetup';

/**
 * Generates and downloads a student name grid PDF (2 columns)
 * Uses IEP Sans font for readability
 */
export async function generateStudentGridPDF(classRecord: Class, kids: Kid[], _t: TFunction): Promise<void> {
  const { pdfMake, fontFamily } = await getCardsFontConfig();

  const fileName = createPDFFilename(
    classRecord.school_name,
    classRecord.class_name,
    classRecord.school_year,
    'student_grid'
  );

  // Create 2-column grid
  const gridBody: Content[][] = [];
  for (let i = 0; i < kids.length; i += 2) {
    const leftName = kids[i].preferred_name || kids[i].first_name;
    const leftCell = {
      text: leftName,
      style: 'gridCell',
      fontSize: leftName.length > 10 ? 24 : 30 // smaller for long names
    };

    const rightCell = i + 1 < kids.length ? (() => {
      const rightName = kids[i + 1].preferred_name || kids[i + 1].first_name;
      return {
        text: rightName,
        style: 'gridCell',
        fontSize: rightName.length > 10 ? 24 : 30 // smaller for long names
      };
    })() : { text: '', style: 'gridCell' };

    gridBody.push([leftCell, rightCell]);
  }

  const documentDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageOrientation: 'portrait',
    pageMargins: [40, 40, 40, 40],

    content: [
      {
        table: {
          widths: ['*', '*'],
          body: gridBody,
          dontBreakRows: true
        },
        layout: {
          hLineWidth: function() { return 1; },
          vLineWidth: function() { return 1; },
          hLineColor: function() { return '#000000'; },
          vLineColor: function() { return '#000000'; },
          paddingLeft: function() { return 0; },
          paddingRight: function() { return 0; }
        }
      }
    ],

    styles: {
      gridCell: {
        fontSize: 30,
        alignment: 'center',
        margin: [0, 30, 0, 30],
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
    logger.error('Error generating student grid PDF:', error);
    throw error;
  }
}
