import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateImportFile, performImport } from '../utils/importUtils';
import { db } from '../services/database';
import { validationService } from '../services/validation';
import type { Kid } from '../types/models';

// Mock the dependencies
vi.mock('../services/database', () => ({
  db: {
    getKids: vi.fn(),
    getKidsByClassId: vi.fn(),
    mergeKids: vi.fn(),
    mergeKidsToClass: vi.fn(),
  },
}));

vi.mock('../services/validation', () => ({
  validationService: {
    validateKid: vi.fn(),
  },
}));

// Mock UUID generation
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mocked-uuid-1234'),
}));

describe('importUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up default successful validation
    (validationService.validateKid as ReturnType<typeof vi.fn>).mockReturnValue({
      valid: true,
      errors: null,
    });

    // Set up default empty database
    (db.getKids as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (db.getKidsByClassId as ReturnType<typeof vi.fn>).mockResolvedValue([]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validateImportFile', () => {
    const createMockFile = (content: string): File => {
      const blob = new Blob([content], { type: 'application/json' });
      return new File([blob], 'test.json', { type: 'application/json' });
    };

    it('should successfully validate a valid JSON file with kids array', async () => {
      const validKids = [
        {
          first_name: 'John',
          last_name: 'Doe',
          gender: 'male',
          level: 'kindergartner',
          special_education: false,
          guardians: [],
        },
      ];

      const file = createMockFile(JSON.stringify(validKids));
      
      // Mock FileReader to return our test content
      const originalFileReader = global.FileReader;
      global.FileReader = class MockFileReader {
        onload: ((ev: ProgressEvent<FileReader>) => void) | null = null;
        
        readAsText(): void {
          setTimeout(() => {
            const event = { target: { result: JSON.stringify(validKids) } } as ProgressEvent<FileReader>;
            this.onload?.(event);
          }, 0);
        }
      } as any;

      const result = await validateImportFile(file, 'test-class-id');

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.validatedKids).toHaveLength(1);
      expect(result.validatedKids?.[0]).toMatchObject({
        first_name: 'John',
        last_name: 'Doe',
        gender: 'male',
        level: 'kindergartner',
        kid_id: 'mocked-uuid-1234', // UUID should be generated
      });

      global.FileReader = originalFileReader;
    });

    it('should reject invalid JSON format', async () => {
      const file = createMockFile('invalid json {');
      
      const originalFileReader = global.FileReader;
      global.FileReader = class MockFileReader {
        onload: ((ev: ProgressEvent<FileReader>) => void) | null = null;
        
        readAsText(): void {
          setTimeout(() => {
            const event = { target: { result: 'invalid json {' } } as ProgressEvent<FileReader>;
            this.onload?.(event);
          }, 0);
        }
      } as any;

      const result = await validateImportFile(file, 'test-class-id');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid JSON format. Please ensure the file contains valid JSON.');

      global.FileReader = originalFileReader;
    });

    it('should reject non-array JSON', async () => {
      const file = createMockFile('{"not": "an array"}');
      
      const originalFileReader = global.FileReader;
      global.FileReader = class MockFileReader {
        onload: ((ev: ProgressEvent<FileReader>) => void) | null = null;
        
        readAsText(): void {
          setTimeout(() => {
            const event = { target: { result: '{"not": "an array"}' } } as ProgressEvent<FileReader>;
            this.onload?.(event);
          }, 0);
        }
      } as any;

      const result = await validateImportFile(file, 'test-class-id');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Import file must contain an array of kids.');

      global.FileReader = originalFileReader;
    });

    it('should reject kids with validation errors', async () => {
      const invalidKids = [
        {
          first_name: '', // Invalid - empty first name
          last_name: 'Doe',
          gender: 'male',
          level: 'kindergartner',
          guardians: [],
        },
      ];

      const file = createMockFile(JSON.stringify(invalidKids));
      
      // Mock validation to return error
      (validationService.validateKid as ReturnType<typeof vi.fn>).mockReturnValue({
        valid: false,
        errors: [{ message: 'First name is required' }],
      });

      const originalFileReader = global.FileReader;
      global.FileReader = class MockFileReader {
        onload: ((ev: ProgressEvent<FileReader>) => void) | null = null;
        
        readAsText(): void {
          setTimeout(() => {
            const event = { target: { result: JSON.stringify(invalidKids) } } as ProgressEvent<FileReader>;
            this.onload?.(event);
          }, 0);
        }
      } as any;

      const result = await validateImportFile(file, 'test-class-id');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Kid 1: First name is required');

      global.FileReader = originalFileReader;
    });

    it('should generate UUIDs for kids without IDs', async () => {
      const kidsWithoutIds = [
        {
          first_name: 'John',
          last_name: 'Doe',
          gender: 'male',
          level: 'kindergartner',
          special_education: false,
          guardians: [],
        },
      ];

      const file = createMockFile(JSON.stringify(kidsWithoutIds));
      
      const originalFileReader = global.FileReader;
      global.FileReader = class MockFileReader {
        onload: ((ev: ProgressEvent<FileReader>) => void) | null = null;
        
        readAsText(): void {
          setTimeout(() => {
            const event = { target: { result: JSON.stringify(kidsWithoutIds) } } as ProgressEvent<FileReader>;
            this.onload?.(event);
          }, 0);
        }
      } as any;

      const result = await validateImportFile(file, 'test-class-id');

      expect(result.valid).toBe(true);
      expect(result.validatedKids?.[0].kid_id).toBe('mocked-uuid-1234');

      global.FileReader = originalFileReader;
    });

    it('should preserve existing IDs when present', async () => {
      const kidsWithIds = [
        {
          kid_id: 'existing-id-123',
          first_name: 'John',
          lastName: 'Doe',
          gender: 'male',
          level: 'kindergartner',
          special_education: false,
          guardians: [],
          created_at: '2023-01-01T00:00:00.000Z',
        },
      ];

      const file = createMockFile(JSON.stringify(kidsWithIds));
      
      const originalFileReader = global.FileReader;
      global.FileReader = class MockFileReader {
        onload: ((ev: ProgressEvent<FileReader>) => void) | null = null;
        
        readAsText(): void {
          setTimeout(() => {
            const event = { target: { result: JSON.stringify(kidsWithIds) } } as ProgressEvent<FileReader>;
            this.onload?.(event);
          }, 0);
        }
      } as any;

      const result = await validateImportFile(file, 'test-class-id');

      expect(result.valid).toBe(true);
      expect(result.validatedKids?.[0].kid_id).toBe('existing-id-123');
      expect(result.validatedKids?.[0].created_at).toBe('2023-01-01T00:00:00.000Z');

      global.FileReader = originalFileReader;
    });

    it('should calculate correct statistics for import', async () => {
      const existingKids: Kid[] = [
        {
          kid_id: 'existing-1',
          first_name: 'Existing',
          last_name: 'Kid',
          gender: 'male',
          level: 'kindergartner',
          extended_day_care: false,
          special_education: false,
          guardians: [],
          created_at: '2023-01-01T00:00:00.000Z',
          updated_at: '2023-01-01T00:00:00.000Z',
        },
      ];

      const importKids = [
        {
          kid_id: 'existing-1', // Will update existing
          first_name: 'Updated',
          last_name: 'Kid',
          gender: 'male',
          level: 'kindergartner',
          special_education: false,
          guardians: [],
        },
        {
          first_name: 'New', // Will create new (no ID)
          last_name: 'Kid',
          gender: 'female',
          level: 'pre-kindergartner',
          special_education: false,
          guardians: [],
        },
      ];

      (db.getKids as ReturnType<typeof vi.fn>).mockResolvedValue(existingKids);
      (db.getKidsByClassId as ReturnType<typeof vi.fn>).mockResolvedValue(existingKids);

      const file = createMockFile(JSON.stringify(importKids));
      
      const originalFileReader = global.FileReader;
      global.FileReader = class MockFileReader {
        onload: ((ev: ProgressEvent<FileReader>) => void) | null = null;
        
        readAsText(): void {
          setTimeout(() => {
            const event = { target: { result: JSON.stringify(importKids) } } as ProgressEvent<FileReader>;
            this.onload?.(event);
          }, 0);
        }
      } as any;

      const result = await validateImportFile(file, 'test-class-id');

      expect(result.valid).toBe(true);
      expect(result.statistics).toEqual({
        newKids: 1,        // New kid without ID
        updatedKids: 1,    // Existing kid with same ID
        unchangedKids: 0,  // No kids will remain unchanged (all existing kids are being updated)
        conflictingKids: 0, // No conflicts in this test case
        totalInFile: 2,
        totalInDatabase: 1,
      });

      global.FileReader = originalFileReader;
    });
  });

  describe('performImport', () => {
    it('should successfully import validated kids', async () => {
      const validatedKids: Kid[] = [
        {
          kid_id: 'test-id-1',
          first_name: 'John',
          last_name: 'Doe',
          gender: 'male',
          level: 'kindergartner',
          extended_day_care: false,
          special_education: false,
          guardians: [],
          created_at: '2023-01-01T00:00:00.000Z',
          updated_at: '2023-01-01T00:00:00.000Z',
        },
      ];

      const mockStatistics = {
        newKids: 1,
        updatedKids: 0,
        unchangedKids: 0,
        conflictingKids: 0,
        totalInFile: 1,
        totalInDatabase: 0,
      };

      (db.mergeKidsToClass as ReturnType<typeof vi.fn>).mockResolvedValue(mockStatistics);

      const result = await performImport(validatedKids, 'test-class-id');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Successfully imported 1 kids');
      expect(result.statistics).toEqual(mockStatistics);
      expect(db.mergeKidsToClass).toHaveBeenCalledWith('test-class-id', validatedKids);
    });

    it('should handle import errors gracefully', async () => {
      const validatedKids: Kid[] = [
        {
          kid_id: 'test-id-1',
          first_name: 'John',
          last_name: 'Doe',
          gender: 'male',
          level: 'kindergartner',
          extended_day_care: false,
          special_education: false,
          guardians: [],
          created_at: '2023-01-01T00:00:00.000Z',
          updated_at: '2023-01-01T00:00:00.000Z',
        },
      ];

      const mockError = new Error('Database transaction failed');
      (db.mergeKidsToClass as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      const result = await performImport(validatedKids, 'test-class-id');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Import failed: Database transaction failed');
    });

    it('should report correct import counts in success message', async () => {
      const validatedKids: Kid[] = [];

      const mockStatistics = {
        newKids: 3,
        updatedKids: 2,
        unchangedKids: 1,
        conflictingKids: 0,
        totalInFile: 5,
        totalInDatabase: 3,
      };

      (db.mergeKidsToClass as ReturnType<typeof vi.fn>).mockResolvedValue(mockStatistics);

      const result = await performImport(validatedKids, 'test-class-id');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Successfully imported 5 kids'); // 3 new + 2 updated
    });
  });
});
