import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/database';
import { validationService } from '../services/validation';
import type { Kid, ClassExport } from '../types/models';

export interface ImportStatistics {
  totalImported: number;
  totalInClass: number;
}

export interface ImportValidationResult {
  valid: boolean;
  errors: string[];
  validatedKids?: Kid[];
}

export interface ImportResult {
  success: boolean;
  message: string;
  statistics?: ImportStatistics;
}

/**
 * Validates a JSON file for import - expects ClassExport format: { class: {...}, kids: [...] }
 */
export const validateImportFile = async (file: File): Promise<ImportValidationResult> => {
  try {
    // Read file content
    const fileContent = await readFileContent(file);

    // Parse JSON
    let parsedData: unknown;
    try {
      parsedData = JSON.parse(fileContent);
    } catch {
      return {
        valid: false,
        errors: ['Invalid JSON format. Please ensure the file contains valid JSON.']
      };
    }

    // Validate it's a ClassExport object with class and kids properties
    if (typeof parsedData !== 'object' || parsedData === null) {
      return {
        valid: false,
        errors: ['Import file must contain a valid ClassExport object.']
      };
    }

    const exportData = parsedData as any;

    if (!exportData.class || typeof exportData.class !== 'object') {
      return {
        valid: false,
        errors: ['Import file must contain a "class" object property.']
      };
    }

    if (!Array.isArray(exportData.kids)) {
      return {
        valid: false,
        errors: ['Import file must contain a "kids" array property.']
      };
    }

    const errors: string[] = [];
    const validatedKids: Kid[] = [];

    // Validate each kid
    for (let i = 0; i < exportData.kids.length; i++) {
      const kidData = exportData.kids[i];

      // Validate kid structure
      const validation = validationService.validateKid(kidData);
      if (!validation.valid) {
        const kidErrors = validation.errors?.map(err => `Kid ${i + 1}: ${err.message || 'Invalid data'}`);
        errors.push(...(kidErrors || [`Kid ${i + 1}: Invalid data structure`]));
        continue;
      }

      // Ensure required timestamp fields exist
      const now = new Date().toISOString();
      const validatedKid: Kid = {
        ...kidData,
        kid_id: kidData.kid_id || uuidv4(), // Generate UUID if missing
        class_id: kidData.class_id || exportData.class.class_id, // Use kid's class_id or class ID from export
        created_at: kidData.created_at || now,
        updated_at: now // Always update this during import
      };

      validatedKids.push(validatedKid);
    }

    if (errors.length > 0) {
      return {
        valid: false,
        errors
      };
    }

    return {
      valid: true,
      errors: [],
      validatedKids
    };

  } catch (error) {
    return {
      valid: false,
      errors: [`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
};

/**
 * Performs the actual import operation
 * Imports all kids to the specified class, overriding any existing kids with the same kid_id
 */
export const performImport = async (validatedKids: Kid[], classId: string): Promise<ImportResult> => {
  try {
    const statistics = await db.mergeKidsToClass(classId, validatedKids);

    return {
      success: true,
      message: `Successfully imported ${statistics.totalImported} kids`,
      statistics
    };
  } catch (error) {
    return {
      success: false,
      message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

/**
 * Helper function to read file content
 */
function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target?.result as string);
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsText(file);
  });
}
