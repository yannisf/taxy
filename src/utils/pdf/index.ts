/**
 * PDF generation utilities
 *
 * Provides functions for generating various PDF reports:
 * - Class catalog with guardian information
 * - Student grid (2-column name cards)
 * - Student list (single-column name list)
 */

// Re-export public API
export { generateClassCatalogPDF } from './catalogGenerator';
export { generateStudentGridPDF } from './gridGenerator';
export { generateStudentListPDF } from './listGenerator';

// Re-export utilities that may be needed elsewhere
export { formatPhoneForPDF, createGuardianTextArray } from './formatters';
