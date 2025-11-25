import i18n from '../i18n';

/**
 * Maps i18n language codes to locale codes for date formatting
 */
const languageToLocaleMap: Record<string, string> = {
  'en': 'en-GB',
  'el': 'el-GR'
};

/**
 * Gets the current locale for date formatting based on i18n language
 */
function getCurrentLocale(): string {
  const currentLanguage = i18n.language || 'en';
  return languageToLocaleMap[currentLanguage] || currentLanguage;
}

/**
 * Formats a date string to localized format (e.g., "04 July 2023" for en-GB, "04 Ιουλίου 2023" for el-GR)
 * @param dateString - The date string to format
 * @param includeTime - Whether to include time in the format
 * @returns Formatted date string or original string if invalid
 */
export function formatDateDisplay(dateString?: string, includeTime: boolean = false): string {
  if (!dateString) return i18n.t('notSpecified');

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Return original if invalid date
    }

    const locale = getCurrentLocale();

    if (includeTime) {
      return new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(date);
    }

    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(date);
  } catch {
    return dateString; // Return original on error
  }
}
