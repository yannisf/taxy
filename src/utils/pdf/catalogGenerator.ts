/**
 * Class catalog PDF generator
 */

import type { TDocumentDefinitions, TableCell } from 'pdfmake/interfaces';
import type { Kid, Class } from '../../types/models';
import type { TFunction } from 'i18next';
import { format } from 'date-fns';
import { el, enGB } from 'date-fns/locale';
import i18n from '../../i18n';
import { logger } from '../logger';
import { createGuardianTextArray } from './formatters';
import { getPDFFontConfig, createPDFFilename } from './pdfSetup';

/**
 * Creates the table data for the catalog PDF
 */
function createCatalogTableData(kids: Kid[], t: TFunction): TableCell[][] {
  const tableData: TableCell[][] = [];

  // Header row
  tableData.push([
    { text: t('pdfNumber'), style: 'tableHeader', margin: [3, 8, 3, 8], alignment: 'center' },
    { text: t('pdfStudentName'), style: 'tableHeader' },
    { text: t('pdfGuardianInformation'), style: 'tableHeader' },
    { text: t('pdfNotes'), style: 'tableHeader' }
  ]);

  kids.forEach((kid, index) => {
    const kidName = `${kid.preferred_name || kid.first_name} ${kid.last_name}`;
    const notes = kid.notes || '';

    if (kid.guardians.length === 0) {
      // Kid with no guardians
      tableData.push([
        { text: (index + 1).toString(), style: 'numberCell', verticalAlignment: 'middle' },
        { text: kidName, style: 'nameCell', verticalAlignment: 'middle' },
        { text: t('pdfNoGuardians'), style: 'guardianCell', italics: true, color: '#666666' },
        { text: notes, style: 'tableCell', fontSize: 8 }
      ]);
    } else {
      // Kid with guardians - each guardian on a separate line
      tableData.push([
        { text: (index + 1).toString(), style: 'numberCell', verticalAlignment: 'middle' },
        { text: kidName, style: 'nameCell', verticalAlignment: 'middle' },
        {
          text: createGuardianTextArray(kid.guardians, t),
          style: 'guardianCell'
        },
        { text: notes, style: 'tableCell', fontSize: 8 }
      ]);
    }
  });

  return tableData;
}

/**
 * Generates and downloads the class catalog PDF
 * Uses Roboto font for professional appearance
 */
export async function generateClassCatalogPDF(classRecord: Class, kids: Kid[], t: TFunction): Promise<void> {
  const { pdfMake, fontFamily } = await getPDFFontConfig();

  // Get current locale from i18n
  const currentLanguage = i18n.language || 'en';
  const locale = currentLanguage === 'el' ? el : enGB;

  const currentDate = format(new Date(), 'dd/MM/yyyy', { locale });

  const fileName = createPDFFilename(
    classRecord.school_name,
    classRecord.class_name,
    classRecord.school_year,
    'catalog'
  );

  logger.debug('Generating PDF with filename:', fileName);
  logger.debug('Kids data:', kids.length, 'students');

  const documentDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageOrientation: 'landscape',
    pageMargins: [40, 46, 40, 40],

    header: {
      columns: [
        {
          width: '*',
          text: `${classRecord.school_name} / ${classRecord.class_name} / ${classRecord.school_year}`,
          style: 'header',
          alignment: 'left'
        },
        {
          width: 'auto',
          text: `${t('generatedOn')} ${currentDate}`,
          style: 'dateInfo',
          alignment: 'right'
        }
      ],
      margin: [40, 20, 40, 0]
    },

    content: [
      {
        table: {
          headerRows: 1,
          widths: ['auto', 100, '*', 130],
          body: createCatalogTableData(kids, t),
          dontBreakRows: true
        },
        layout: {
          fillColor: function(rowIndex: number) {
            return rowIndex === 0 ? '#f8f9fa' : (rowIndex % 2 === 0 ? '#ffffff' : '#f8f9fa');
          },
          hLineWidth: function() { return 0.5; },
          vLineWidth: function() { return 0.5; },
          hLineColor: function() { return '#dee2e6'; },
          vLineColor: function() { return '#dee2e6'; }
        }
      }
    ],

    styles: {
      header: {
        fontSize: 18,
        color: '#2c3e50',
        font: fontFamily
      },
      subheader: {
        fontSize: 14,
        color: '#34495e',
        font: fontFamily
      },
      dateInfo: {
        fontSize: 8,
        color: '#6c757d',
        font: fontFamily
      },
      tableHeader: {
        fontSize: 12,
        color: '#495057',
        fillColor: '#e9ecef',
        margin: [8, 8, 8, 8],
        font: fontFamily
      },
      tableCell: {
        fontSize: 10,
        margin: [8, 3, 8, 3],
        lineHeight: 1.2,
        font: fontFamily
      },
      numberCell: {
        fontSize: 10,
        margin: [3, 2, 3, 2],
        alignment: 'center',
        font: fontFamily
      },
      nameCell: {
        fontSize: 10,
        margin: [8, 3, 8, 3],
        alignment: 'left',
        font: fontFamily
      },
      guardianCell: {
        fontSize: 8,
        margin: [8, 1, 8, 1],
        lineHeight: 1.1,
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
    logger.error('Error generating PDF:', error);
    throw error;
  }
}
