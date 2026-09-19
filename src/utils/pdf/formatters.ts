/**
 * PDF formatting utilities
 */

import type { Content, ContentTable } from 'pdfmake/interfaces';
import type { Guardian, Telephone } from '../../types/models';
import type { TFunction } from 'i18next';
import { MONOSPACE_FONT_FAMILY } from './pdfSetup';

/**
 * Zebra shade painted behind every second guardian inside a guardian cell,
 * keyed by the catalog row's own stripe colour so the two stay distinguishable
 * on both the white and the grey rows.
 */
const GUARDIAN_ZEBRA_FILL: Record<string, string> = {
  '#ffffff': '#e9ecef',
  '#f8f9fa': '#e2e6ea'
};

/**
 * Formats a telephone number for PDF (XXX XXX XXXX format, no country code)
 */
export function formatPhoneForPDF(telephone: Telephone): string {
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
 * Creates the inline text runs for a single guardian: name, relation badge and
 * phone numbers
 */
export function createGuardianText(guardian: Guardian, t: TFunction): Content[] {
  const textArray: Content[] = [];

  // Guardian name
  textArray.push({
    text: `${guardian.first_name} ${guardian.last_name} `,
    fontSize: 8
  });

  // Relation in small bold caps
  // 'extended family' -> 'pdfRelationExtendedFamily'
  const relationKey = `pdfRelation${guardian.relation_with_kid.split(/\s+/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('')}`;
  const relationText = t(relationKey, { defaultValue: guardian.relation_with_kid.toUpperCase() });
  textArray.push({
    text: relationText,
    fontSize: 4,
    bold: true,
    color: '#000000',
    characterSpacing: 0.3
  });

  // Phone numbers. Only the digits are monospaced; the separators stay in the
  // body font because Courier's space is 600/1000 em against IEP Sans' 278.
  // The negative characterSpacing pulls Courier's 600-unit digit slot back to
  // roughly IEP Sans' 556 so the numbers do not read as letter-spaced. It is
  // applied uniformly, so digits still line up in columns between rows.
  if (guardian.telephones && guardian.telephones.length > 0) {
    guardian.telephones.slice(0, 3).forEach(telephone => {
      textArray.push({ text: ' | ', fontSize: 8 });
      textArray.push({
        text: formatPhoneForPDF(telephone),
        fontSize: 8,
        font: MONOSPACE_FONT_FAMILY,
        bold: true,
        characterSpacing: -0.35
      });
    });
  } else {
    textArray.push({
      text: ' |',
      fontSize: 8
    });
  }

  return textArray;
}

/**
 * Builds the contents of a catalog guardian cell: a borderless nested table
 * with one row per guardian, zebra striped so multiple guardians stay readable.
 * `rowFillColor` is the stripe colour of the catalog row this cell sits in, so
 * the unfilled guardian rows blend into it.
 */
export function createGuardianTable(guardians: Guardian[], t: TFunction, rowFillColor: string): ContentTable {
  const zebraFill = GUARDIAN_ZEBRA_FILL[rowFillColor] ?? GUARDIAN_ZEBRA_FILL['#ffffff'];

  return {
    table: {
      widths: ['*'],
      body: guardians.map((guardian, index) => [
        {
          text: createGuardianText(guardian, t),
          fillColor: index % 2 === 1 ? zebraFill : rowFillColor,
          // pdfmake puts all of a lineHeight's extra leading below the text, so
          // an inherited lineHeight would push every line against the top edge
          // of its band. Neutralise it here and let the padding do the spacing.
          lineHeight: 1
        }
      ])
    },
    layout: {
      hLineWidth: function() { return 0; },
      vLineWidth: function() { return 0; },
      // The stripes run the full width of the column, so the text inset lives
      // here instead of on the cell: 12 matches the other columns, which get 4
      // from the outer table's padding plus 8 from their own margin. Top and
      // bottom are equal so each line sits centred in its own band.
      paddingLeft: function() { return 12; },
      paddingRight: function() { return 12; },
      paddingTop: function() { return 1; },
      paddingBottom: function() { return 1; }
    }
  };
}
