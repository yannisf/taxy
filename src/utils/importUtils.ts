import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/database';
import { validationService } from '../services/validation';
import type { Kid, Class } from '../types/models';

export interface ImportStatistics {
  totalImported: number;
  totalInClass: number;
}

export interface ImportValidationResult {
  valid: boolean;
  errors: string[];
  validatedKids?: Kid[];
  classData?: Omit<Class, 'class_id' | 'created_at' | 'updated_at'> & { class_id: string };
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
        errors: ['invalidJsonFormat']
      };
    }

    // Validate it's a ClassExport object with class and kids properties
    if (typeof parsedData !== 'object' || parsedData === null) {
      return {
        valid: false,
        errors: ['invalidClassExportObject']
      };
    }

    const exportData = parsedData as any;

    if (!exportData.class || typeof exportData.class !== 'object') {
      return {
        valid: false,
        errors: ['missingClassProperty']
      };
    }

    if (!Array.isArray(exportData.kids)) {
      return {
        valid: false,
        errors: ['missingKidsArray']
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
      validatedKids,
      classData: {
        class_id: exportData.class.class_id,
        school_name: exportData.class.school_name,
        class_name: exportData.class.class_name,
        school_year: exportData.class.school_year
      }
    };

  } catch (error) {
    return {
      valid: false,
      errors: ['failedToProcessFile']
    };
  }
};

/**
 * Performs the actual import operation
 * Imports all kids to the specified class, overriding any existing kids with the same kid_id
 * Creates the class if it doesn't exist
 */
export const performImport = async (
  validatedKids: Kid[],
  classId: string,
  classData?: Omit<Class, 'class_id' | 'created_at' | 'updated_at'> & { class_id: string }
): Promise<ImportResult> => {
  try {
    // Check if class exists, create if not
    if (classData) {
      const existingClass = await db.getClassById(classId);
      if (!existingClass) {
        // Create the class with the provided metadata
        const now = new Date().toISOString();
        const newClass: Class = {
          class_id: classData.class_id,
          school_name: classData.school_name,
          class_name: classData.class_name,
          school_year: classData.school_year,
          created_at: now,
          updated_at: now
        };
        await db.addClass(newClass);
      }
    }

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
