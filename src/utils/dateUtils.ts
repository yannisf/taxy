/**
 * Formats a date string to "DD MMMM YYYY" format (e.g., "04 July 2023")
 * @param dateString - The date string to format
 * @param includeTime - Whether to include time in the format
 * @returns Formatted date string or original string if invalid
 */
export function formatDateDisplay(dateString?: string, includeTime: boolean = false): string {
  if (!dateString) return 'Not specified';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Return original if invalid date
    }
    
    if (includeTime) {
      return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(date);
    }
    
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(date);
  } catch {
    return dateString; // Return original on error
  }
}
