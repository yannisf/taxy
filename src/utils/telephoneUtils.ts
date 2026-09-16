import type { Telephone } from '../types/models';

/**
 * Formats a telephone object for display
 */
export const formatTelephoneDisplay = (telephone: Telephone): string => {
  if (!telephone.country_code || !telephone.number) {
    return '';
  }
  
  const typeIcon = getTelephoneTypeIcon(telephone.telephone_type);
  const typeLabel = telephone.telephone_type.charAt(0).toUpperCase() + telephone.telephone_type.slice(1);
  
  return `${typeIcon} ${telephone.country_code} ${telephone.number} (${typeLabel})`;
};

/**
 * Gets an icon for the telephone type
 */
export const getTelephoneTypeIcon = (type: string): string => {
  switch (type) {
    case 'mobile':
      return '📱';
    case 'home':
      return '🏠';
    case 'work':
      return '💼';
    case 'other':
    default:
      return '📞';
  }
};

/**
 * Formats telephone number for input display (country code + number)
 */
export const formatTelephoneNumber = (telephone: Telephone): string => {
  if (!telephone.country_code || !telephone.number) {
    return '';
  }
  return `${telephone.country_code} ${telephone.number}`;
};

/**
 * Creates a new empty telephone with default values
 */
export const createEmptyTelephone = (): Omit<Telephone, 'country_code' | 'number' | 'telephone_type'> & Partial<Telephone> => ({
  country_code: '+30',
  number: '',
  telephone_type: 'mobile'
});

/**
 * Groups digits into a XXX XXX XXXX pattern for readability
 */
export const formatPhoneNumberGrouped = (number: string): string => {
  const digits = number.replace(/\D/g, '');

  if (digits.length <= 3) {
    return digits;
  } else if (digits.length <= 6) {
    return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  }
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
};

/**
 * Validates telephone number format
 */
export const validateTelephoneNumber = (number: string): boolean => {
  const phoneRegex = /^\d{4,15}$/;
  return phoneRegex.test(number);
};

/**
 * Validates country code format
 */
export const validateCountryCode = (countryCode: string): boolean => {
  const countryCodeRegex = /^\+[1-9]\d{0,2}$/;
  return countryCodeRegex.test(countryCode);
};
