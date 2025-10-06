import type { TDocumentDefinitions, Content } from 'pdfmake/interfaces';
import type { Kid, Guardian, Telephone, ClassRecord } from '../types/models';

/**
 * Formats a telephone number
 */
function formatTelephone(telephone: Telephone): string {
  return `${telephone.country_code} ${telephone.number}`;
}

/**
 * Formats guardian information for display in the PDF
 */
function formatGuardianInfo(guardian: Guardian): string[] {
  const lines: string[] = [];
  
  // Guardian name
  lines.push(`${guardian.first_name} ${guardian.last_name}`);
  
  // Relation in small bold text
  lines.push(`${guardian.relation_with_kid.toUpperCase()}`);
  
  // Telephones (up to 3)
  if (guardian.telephones && guardian.telephones.length > 0) {
    const telephoneTexts = guardian.telephones
      .slice(0, 3)
      .map(formatTelephone);
    lines.push(`| ${telephoneTexts.join(' | ')}`);
  }
  
  return lines;
}

/**
 * Creates the table data for the PDF
 */
function createTableData(kids: Kid[]): Content[][] {
  const tableData: Content[][] = [];
  
  // Header row
  tableData.push([
    { text: '#', style: 'tableHeader' },
    { text: 'Student Name', style: 'tableHeader' },
    { text: 'Guardian Information', style: 'tableHeader' }
  ]);
  
  kids.forEach((kid, index) => {
    const kidName = `${kid.preferred_name || kid.first_name} ${kid.last_name}`;
    
    if (kid.guardians.length === 0) {
      // Kid with no guardians
      tableData.push([
        { text: (index + 1).toString(), style: 'tableCell' },
        { text: kidName, style: 'tableCell' },
        { text: 'No guardians', style: 'tableCell', italics: true, color: '#666666' }
      ]);
    } else {
      // Kid with guardians
      const guardianCells: Content[] = [];
      
      kid.guardians.forEach((guardian, guardianIndex) => {
        const guardianLines = formatGuardianInfo(guardian);
        
        if (guardianIndex > 0) {
          guardianCells.push({ text: '\n', fontSize: 6 }); // Separator between guardians
        }
        
        guardianLines.forEach((line, lineIndex) => {
          if (lineIndex === 1) {
            // Relation line - xx-small bold
            guardianCells.push({
              text: line,
              fontSize: 8,
              margin: [0, 0, 0, 2]
            });
          } else {
            // Name and telephone lines
            guardianCells.push({
              text: line,
              fontSize: 10,
              margin: [0, 0, 0, 1]
            });
          }
        });
      });
      
      tableData.push([
        { text: (index + 1).toString(), style: 'tableCell' },
        { text: kidName, style: 'tableCell' },
        guardianCells
      ]);
    }
  });
  
  return tableData;
}

/**
 * Generates and downloads the class catalog PDF
 */
export async function generateClassCatalogPDF(classRecord: ClassRecord, kids: Kid[]): Promise<void> {
  // Dynamic import to ensure proper initialization
  const pdfMakeModule = await import('pdfmake/build/pdfmake');
  const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
  
  // Get the actual pdfMake instance
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfMake = (pdfMakeModule as any).default || pdfMakeModule;
  
  // Initialize fonts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pdfMake.vfs = (pdfFontsModule as any).default || pdfFontsModule;
  
  const currentDate = new Date().toLocaleDateString();
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
          text: [
            { text: 'Class Catalog\n', style: 'header' },
            { text: `${classRecord.school_name} - ${classRecord.class_name}\n`, style: 'subheader' },
            { text: `School Year: ${classRecord.school_year}`, style: 'subheader' }
          ]
        },
        {
          width: 'auto',
          text: [
            { text: 'Generated on:\n', style: 'dateLabel' },
            { text: currentDate, style: 'dateValue' }
          ],
          alignment: 'right'
        }
      ],
      margin: [40, 20, 40, 20]
    },
    
    content: [
      {
        table: {
          headerRows: 1,
          widths: ['auto', '*', '*'],
          body: createTableData(kids)
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
      dateLabel: {
        fontSize: 10,
        color: '#6c757d'
      },
      dateValue: {
        fontSize: 12,
        color: '#495057'
      },
      tableHeader: {
        fontSize: 12,
        color: '#495057',
        fillColor: '#e9ecef',
        margin: [8, 8, 8, 8]
      },
      tableCell: {
        fontSize: 10,
        margin: [8, 6, 8, 6],
        lineHeight: 1.3
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
