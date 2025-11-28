import { db } from '../services/database';
import type { Kid } from '../types/models';
import {
  encryptAndCompressJSON,
  validateBrowserSupport,
} from './cryptoUtils';
import { downloadFile } from './downloadUtils';

export const exportClassData = async (
  classId?: string,
  options?: { encrypt: boolean; password?: string }
) => {
  try {
    let classData;

    if (classId) {
      // Export specific class data
      classData = await db.exportClassData(classId);
    } else {
      // Fall back to legacy export method
      classData = await db.exportData();
    }

    let blob: Blob;
    let fileExtension: string;

    if (options?.encrypt && options?.password) {
      // Encryption path
      try {
        // Validate browser support first
        const browserSupport = validateBrowserSupport();
        if (!browserSupport.supported) {
          throw new Error(
            `Browser does not support required features: ${browserSupport.missing.join(', ')}`
          );
        }

        // Encrypt and compress
        const encryptedData = await encryptAndCompressJSON(
          classData,
          options.password
        );

        blob = new Blob([encryptedData], { type: 'text/plain' });
        fileExtension = 'json.enc';
      } catch (error) {
        console.error('Encryption failed:', error);
        throw error; // Re-throw to be caught by handler
      }
    } else {
      // Standard unencrypted export
      const jsonString = JSON.stringify(classData, null, 2);
      blob = new Blob([jsonString], { type: 'application/json' });
      fileExtension = 'json';
    }

    // Generate filename with current date and class info
    const now = new Date();
    const timestamp = now.toISOString().split('T')[0];
    const classIdentifier = classId && classData.class_name
      ? `${classData.school_name.replace(/\s+/g, '-')}-${classData.class_name.replace(/\s+/g, '-')}`
      : 'class';
    const filename = `${classIdentifier}-export-${timestamp}.${fileExtension}`;

    downloadFile(blob, filename);
    return true;
  } catch (error) {
    console.error('Error exporting class data:', error);
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
    console.error('Error exporting guardian emails:', error);
    throw error;
  }
};
