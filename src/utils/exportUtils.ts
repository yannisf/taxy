import { db } from '../services/database';

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
