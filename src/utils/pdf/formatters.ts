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
      textArray.push({ text: '\n', fontSize: 8 });
    }

    // Guardian name
    textArray.push({
      text: `${guardian.first_name} ${guardian.last_name} `,
      fontSize: 8
    });

    // Relation as a black/white badge (non-breaking spaces act as horizontal padding)
    const relationKey = `pdfRelation${guardian.relation_with_kid.charAt(0).toUpperCase() + guardian.relation_with_kid.slice(1).replace(/\s+/g, '')}`;
    const relationText = t(relationKey, { defaultValue: guardian.relation_with_kid.toUpperCase() });
    textArray.push({
      text: `\u00A0${relationText}\u00A0`,
      fontSize: 6,
      bold: true,
      color: '#ffffff',
      background: '#000000'
    });

    // Phone numbers
    if (guardian.telephones && guardian.telephones.length > 0) {
      const phoneTexts = guardian.telephones
        .slice(0, 3)
        .map(formatPhoneForPDF);
      textArray.push({
        text: ` | ${phoneTexts.join(' | ')}`,
        fontSize: 8
      });
    } else {
      textArray.push({
        text: ' |',
        fontSize: 8
      });
    }
  });

  return textArray;
}
