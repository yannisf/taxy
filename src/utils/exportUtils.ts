import { db } from '../services/database';

export const exportClassData = async () => {
  try {
    // Get all class data using the existing database method
    const classData = await db.exportData();
    
    // Create a JSON string from the data
    const jsonString = JSON.stringify(classData.kids, null, 2);
    
    // Create a blob with the JSON data
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Create a download URL
    const url = URL.createObjectURL(blob);
    
    // Create a temporary download link
    const link = document.createElement('a');
    link.href = url;
    
    // Generate filename with current date
    const now = new Date();
    const timestamp = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    link.download = `class-export-${timestamp}.json`;
    
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
