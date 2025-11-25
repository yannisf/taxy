import type { TDocumentDefinitions, Content } from 'pdfmake/interfaces';
import type { Kid, Guardian, Telephone, ClassRecord } from '../types/models';
import type { TFunction } from 'i18next';

/**
 * Formats a telephone number for PDF (XXX XXX XXXX format, no country code)
 */
function formatPhoneForPDF(telephone: Telephone): string {
  const number = telephone.number;
  // Format as XXX XXX XXXX
  if (number.length >= 10) {
    return `${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6)}`;
  } else if (number.length >= 7) {
    return `${number.slice(0, 3)} ${number.slice(3)}`;
  }
  return number;
}

/**
 * Creates a text array for guardians with proper formatting
 */
function createGuardianTextArray(guardians: Guardian[], t: TFunction): Content[] {
  const textArray: Content[] = [];
  
  guardians.forEach((guardian, guardianIndex) => {
    if (guardianIndex > 0) {
      textArray.push({ text: '\n', fontSize: 10 });
    }
    
    // Guardian name (normal size)
    textArray.push({
      text: `${guardian.first_name} ${guardian.last_name} `,
      fontSize: 10
    });
    
    // Relation (xx-small bold, no space before)
    const relationKey = `pdfRelation${guardian.relation_with_kid.charAt(0).toUpperCase() + guardian.relation_with_kid.slice(1).replace(/\s+/g, '')}`;
    const relationText = t(relationKey, { defaultValue: guardian.relation_with_kid.toUpperCase() });
    textArray.push({
      text: relationText,
      fontSize: 7,
      bold: true
    });
    
    // Phone numbers
    if (guardian.telephones && guardian.telephones.length > 0) {
      const phoneTexts = guardian.telephones
        .slice(0, 3)
        .map(formatPhoneForPDF);
      textArray.push({
        text: ` | ${phoneTexts.join(' | ')}`,
        fontSize: 10
      });
    } else {
      textArray.push({
        text: ' |',
        fontSize: 10
      });
    }
  });
  
  return textArray;
}

/**
 * Creates the table data for the PDF
 */
function createTableData(kids: Kid[], t: TFunction): Content[][] {
  const tableData: Content[][] = [];
  
  // Header row
  tableData.push([
    { text: t('pdfNumber'), style: 'tableHeader' },
    { text: t('pdfStudentName'), style: 'tableHeader' },
    { text: t('pdfGuardianInformation'), style: 'tableHeader' }
  ]);
  
  kids.forEach((kid, index) => {
    const kidName = `${kid.preferred_name || kid.first_name} ${kid.last_name}`;
    
    if (kid.guardians.length === 0) {
      // Kid with no guardians
      tableData.push([
        { text: (index + 1).toString(), style: 'tableCell' },
        { text: kidName, style: 'tableCell' },
        { text: t('pdfNoGuardians'), style: 'tableCell', italics: true, color: '#666666' }
      ]);
    } else {
      // Kid with guardians - each guardian on a separate line
      tableData.push([
        { text: (index + 1).toString(), style: 'tableCell' },
        { text: kidName, style: 'tableCell' },
        { 
          text: createGuardianTextArray(kid.guardians, t),
          style: 'tableCell'
        }
      ]);
    }
  });
  
  return tableData;
}

/**
 * Generates and downloads the class catalog PDF
 */
export async function generateClassCatalogPDF(classRecord: ClassRecord, kids: Kid[], t: TFunction): Promise<void> {
  // Dynamic import to ensure proper initialization
  const pdfMakeModule = await import('pdfmake/build/pdfmake');
  const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
  
  // Get the actual pdfMake instance
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfMake = (pdfMakeModule as any).default || pdfMakeModule;
  
  // Initialize fonts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pdfMake.vfs = (pdfFontsModule as any).default || pdfFontsModule;
  
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const fileName = `${classRecord.school_name}_${classRecord.class_name}_${classRecord.school_year}_catalog.pdf`;
  
  console.log('Generating PDF with filename:', fileName);
  console.log('Kids data:', kids.length, 'students');
  
  const documentDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageOrientation: 'landscape',
    pageMargins: [40, 60, 40, 40],
    
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
      margin: [40, 20, 40, 20]
    },
    
    content: [
      {
        table: {
          headerRows: 1,
          widths: [30, 'auto', '*'],
          body: createTableData(kids, t)
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
        color: '#2c3e50'
      },
      subheader: {
        fontSize: 14,
        color: '#34495e'
      },
      dateInfo: {
        fontSize: 8,
        color: '#6c757d'
      },
      tableHeader: {
        fontSize: 12,
        color: '#495057',
        fillColor: '#e9ecef',
        margin: [8, 8, 8, 8]
      },
      tableCell: {
        fontSize: 10,
        margin: [8, 3, 8, 3],
        lineHeight: 1.2
      }
    },
    
    defaultStyle: {
      // Use default font that doesn't require bold variants
    }
  };
  
  try {
    // Generate and download the PDF
    const pdfDoc = pdfMake.createPdf(documentDefinition);
    console.log('PDF document created, attempting download...');
    pdfDoc.download(fileName);
    console.log('Download method called');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}
