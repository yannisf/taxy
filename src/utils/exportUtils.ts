import { db } from '../services/database';
import type { Kid, ClassRecord, ClassExport } from '../types/models';
import { downloadFile } from './downloadUtils';
import { logger } from './logger';

export const exportClassData = async (classId?: string) => {
  try {
    let classData: ClassRecord | ClassExport;

    if (classId) {
      // Export specific class data
      classData = await db.exportClassData(classId);
    } else {
      // Fall back to legacy export method
      classData = await db.exportData();
    }

    const jsonString = JSON.stringify(classData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const fileExtension = 'json';

    // Generate filename with current date and class info
    const now = new Date();
    const timestamp = now.toISOString().split('T')[0];

    // Handle both ClassRecord and ClassExport formats
    let schoolName: string;
    let className: string;
    if ('class' in classData) {
      // ClassExport format
      schoolName = classData.class.school_name;
      className = classData.class.class_name;
    } else {
      // ClassRecord format
      schoolName = classData.school_name;
      className = classData.class_name;
    }

    const classIdentifier = classId
      ? `${schoolName.replace(/\s+/g, '-')}-${className.replace(/\s+/g, '-')}`
      : 'class';
    const filename = `${classIdentifier}-export-${timestamp}.${fileExtension}`;

    downloadFile(blob, filename);
    return true;
  } catch (error) {
    logger.error('Error exporting class data:', error);
    throw error;
  }
};

export const exportGuardianEmails = async (classKids: Kid[], className: string, schoolName: string) => {
  try {
    // Extract all guardians with emails from all kids
    const guardiansWithEmails = classKids
      .flatMap(kid => kid.guardians)
      .filter(guardian => guardian.email && guardian.email.trim() !== '');

    // Remove duplicates based on email address (same guardian might be listed for multiple kids)
    const uniqueGuardians = guardiansWithEmails.filter((guardian, index, self) =>
      index === self.findIndex(g => g.email === guardian.email)
    );

    if (uniqueGuardians.length === 0) {
      throw new Error('No guardians with email addresses found');
    }

    // Create CSV content with English headers
    const csvHeaders = 'first_name,last_name,email';
    const csvRows = uniqueGuardians.map(guardian => {
      // Escape CSV fields that contain commas or quotes
      const escapeField = (field: string) => {
        if (field.includes(',') || field.includes('"') || field.includes('\n')) {
          return `"${field.replace(/"/g, '""')}"`;
        }
        return field;
      };

      return [
        escapeField(guardian.first_name),
        escapeField(guardian.last_name),
        escapeField(guardian.email!)
      ].join(',');
    });

    const csvContent = [csvHeaders, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // Generate filename with current date and class info
    const now = new Date();
    const timestamp = now.toISOString().split('T')[0];
    const classIdentifier = `${schoolName.replace(/\s+/g, '-')}-${className.replace(/\s+/g, '-')}`;
    const filename = `${classIdentifier}-guardian-emails-${timestamp}.csv`;

    downloadFile(blob, filename);
    return {
      success: true,
      count: uniqueGuardians.length
    };
  } catch (error) {
    logger.error('Error exporting guardian emails:', error);
    throw error;
  }
};
