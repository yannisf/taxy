/**
 * PDF formatting utilities
 */

import type { Content } from 'pdfmake/interfaces';
import type { Guardian, Telephone } from '../../types/models';
import type { TFunction } from 'i18next';

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
 * Creates a text array for guardians with proper formatting
 */
export function createGuardianTextArray(guardians: Guardian[], t: TFunction): Content[] {
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
