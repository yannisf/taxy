import type { Class } from '../types/models';

/**
 * Formats a class object for display
 * @param classObj - The class object to format
 * @returns Formatted class string or empty string if no class
 */
export const formatClassDisplay = (classObj: Class | null): string => {
  if (!classObj) return '';
  return `${classObj.school_name} - ${classObj.class_name} (${classObj.school_year})`;
};
