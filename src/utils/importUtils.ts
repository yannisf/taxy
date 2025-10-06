import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/database';
import { validationService } from '../services/validation';
import type { Kid } from '../types/models';

export interface ImportStatistics {
  newKids: number;
  updatedKids: number;
  unchangedKids: number;
  conflictingKids: number;  // Kids with IDs that exist in other classes
  totalInFile: number;
  totalInDatabase: number;
}

export interface ImportValidationResult {
  valid: boolean;
  errors: string[];
  statistics?: ImportStatistics;
  validatedKids?: Kid[];
  conflictingKids?: Kid[];  // Kids that will get new UUIDs due to conflicts
}

export interface ImportResult {
  success: boolean;
  message: string;
  statistics?: ImportStatistics;
}

/**
 * Validates and analyzes a JSON file for import
 */
export const validateImportFile = async (file: File, classId: string): Promise<ImportValidationResult> => {
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

    // Validate it's an array
    if (!Array.isArray(parsedData)) {
      return {
        valid: false,
        errors: ['Import file must contain an array of kids.']
      };
    }

    const errors: string[] = [];
    const validatedKids: Kid[] = [];

    // Validate each kid
    for (let i = 0; i < parsedData.length; i++) {
      const kidData = parsedData[i];
      
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

    // Calculate statistics and identify conflicts
    const { statistics, conflictingKids } = await calculateImportStatisticsWithConflicts(validatedKids, classId);

    return {
      valid: true,
      errors: [],
      statistics,
      validatedKids,
      conflictingKids: conflictingKids.length > 0 ? conflictingKids : undefined
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
 */
export const performImport = async (validatedKids: Kid[], classId: string): Promise<ImportResult> => {
  try {
    const statistics = await db.mergeKidsToClass(classId, validatedKids);
    
    return {
      success: true,
      message: `Successfully imported ${statistics.newKids + statistics.updatedKids + statistics.conflictingKids} kids`,
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
 * Calculate import statistics and identify conflicting kids
 */
async function calculateImportStatisticsWithConflicts(importKids: Kid[], classId: string): Promise<{
  statistics: ImportStatistics;
  conflictingKids: Kid[];
}> {
  const existingClassKids = await db.getKidsByClassId(classId);
  const allExistingKids = await db.getKids();
  
  const existingClassKidIds = new Set(existingClassKids.map(kid => kid.kid_id));
  const allExistingKidIds = new Set(allExistingKids.map(kid => kid.kid_id));
  
  let newKids = 0;
  let updatedKids = 0;
  const conflictingKids: Kid[] = [];
  
  for (const kid of importKids) {
    if (existingClassKidIds.has(kid.kid_id)) {
      // Kid exists in current class - will be updated
      updatedKids++;
    } else if (allExistingKidIds.has(kid.kid_id)) {
      // Kid exists in database but not in current class - conflict
      conflictingKids.push(kid);
    } else {
      // Kid doesn't exist anywhere - new
      newKids++;
    }
  }
  
  const importIds = new Set(importKids.map(kid => kid.kid_id));
  const unchangedKids = existingClassKids.filter(kid => !importIds.has(kid.kid_id)).length;
  
  const statistics: ImportStatistics = {
    newKids,
    updatedKids,
    unchangedKids,
    conflictingKids: conflictingKids.length,
    totalInFile: importKids.length,
    totalInDatabase: existingClassKids.length
  };
  
  return { statistics, conflictingKids };
}

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
