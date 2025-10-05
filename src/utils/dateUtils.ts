/**
 * Formats a date string to "DD MMMM YYYY" format (e.g., "04 July 2023")
 * @param dateString - The date string to format
 * @returns Formatted date string or original string if invalid
 */
export function formatDateDisplay(dateString?: string): string {
  if (!dateString) return 'Not specified';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Return original if invalid date
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
