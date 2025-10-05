import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/database';
import { validationService } from '../services/validation';
import type { Kid } from '../types/models';

export interface ImportStatistics {
  newKids: number;
  updatedKids: number;
  unchangedKids: number;
  totalInFile: number;
  totalInDatabase: number;
}

export interface ImportValidationResult {
  valid: boolean;
  errors: string[];
  statistics?: ImportStatistics;
  validatedKids?: Kid[];
}

export interface ImportResult {
  success: boolean;
  message: string;
  statistics?: ImportStatistics;
}

/**
 * Validates and analyzes a JSON file for import
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

    // Calculate statistics
    const statistics = await calculateImportStatistics(validatedKids);

    return {
      valid: true,
      errors: [],
      statistics,
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
 */
export const performImport = async (validatedKids: Kid[]): Promise<ImportResult> => {
  try {
    const statistics = await db.mergeKids(validatedKids);
    
    return {
      success: true,
      message: `Successfully imported ${statistics.newKids + statistics.updatedKids} kids`,
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
 * Calculate import statistics by comparing with existing data
 */
async function calculateImportStatistics(importKids: Kid[]): Promise<ImportStatistics> {
  const existingKids = await db.getKids();
  const existingIds = new Set(existingKids.map(kid => kid.kid_id));
  
  let newKids = 0;
  let updatedKids = 0;
  
  for (const kid of importKids) {
    if (existingIds.has(kid.kid_id)) {
      updatedKids++;
    } else {
      newKids++;
    }
  }
  
  const importIds = new Set(importKids.map(kid => kid.kid_id));
  const unchangedKids = existingKids.filter(kid => !importIds.has(kid.kid_id)).length;
  
  return {
    newKids,
    updatedKids,
    unchangedKids,
    totalInFile: importKids.length,
    totalInDatabase: existingKids.length
  };
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
