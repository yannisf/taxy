import { db } from '../services/database';
import type { Kid } from '../types/models';

export const exportClassData = async (classId?: string) => {
  try {
    let classData;
    
    if (classId) {
      // Export specific class data
      classData = await db.exportClassData(classId);
    } else {
      // Fall back to legacy export method
      classData = await db.exportData();
    }
    
    // Create a JSON string from the complete class record
    const jsonString = JSON.stringify(classData, null, 2);
    
    // Create a blob with the JSON data
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Create a download URL
    const url = URL.createObjectURL(blob);
    
    // Create a temporary download link
    const link = document.createElement('a');
    link.href = url;
    
    // Generate filename with current date and class info
    const now = new Date();
    const timestamp = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    const classIdentifier = classId && classData.class_name 
      ? `${classData.school_name.replace(/\s+/g, '-')}-${classData.class_name.replace(/\s+/g, '-')}`
      : 'class';
    link.download = `${classIdentifier}-export-${timestamp}.json`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
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

    // Create a blob with the CSV data
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // Create a download URL
    const url = URL.createObjectURL(blob);

    // Create a temporary download link
    const link = document.createElement('a');
    link.href = url;

    // Generate filename with current date and class info
    const now = new Date();
    const timestamp = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    const classIdentifier = `${schoolName.replace(/\s+/g, '-')}-${className.replace(/\s+/g, '-')}`;
    link.download = `${classIdentifier}-guardian-emails-${timestamp}.csv`;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return {
      success: true,
      count: uniqueGuardians.length
    };
  } catch (error) {
    console.error('Error exporting guardian emails:', error);
    throw error;
  }
};
