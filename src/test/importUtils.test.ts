import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateImportFile, performImport } from '../utils/importUtils';
import { db } from '../services/database';
import { validationService } from '../services/validation';
import type { Kid, ClassExport } from '../types/models';

// Mock the dependencies
vi.mock('../services/database', () => ({
  db: {
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
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validateImportFile', () => {
    const createMockFile = (content: string): File => {
      const blob = new Blob([content], { type: 'application/json' });
      return new File([blob], 'test.json', { type: 'application/json' });
    };

    it('should successfully validate a valid ClassExport JSON file', async () => {
      const validKids = [
        {
          first_name: 'John',
          last_name: 'Doe',
          gender: 'male' as const,
          level: 'kindergartner' as const,
          special_education: false,
          guardians: [],
        },
      ];

      const classExport: ClassExport = {
        class: {
          class_id: 'test-class-id',
          school_name: 'Test School',
          class_name: 'Test Class',
          school_year: '2024-2025',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        kids: validKids as any,
      };

      const file = createMockFile(JSON.stringify(classExport));

      const originalFileReader = global.FileReader;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      global.FileReader = class MockFileReader {
        onload: ((ev: ProgressEvent<FileReader>) => void) | null = null;

        readAsText(): void {
          setTimeout(() => {
            const event = { target: { result: JSON.stringify(classExport) } } as ProgressEvent<FileReader>;
            this.onload?.(event);
          }, 0);
        }
      } as any;

      const result = await validateImportFile(file);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.validatedKids).toHaveLength(1);
      expect(result.validatedKids?.[0]).toMatchObject({
        first_name: 'John',
        last_name: 'Doe',
        gender: 'male',
        level: 'kindergartner',
        class_id: 'test-class-id', // Should have class_id set
        kid_id: 'mocked-uuid-1234', // UUID should be generated
      });

      global.FileReader = originalFileReader;
    });

    it('should reject invalid JSON format', async () => {
      const file = createMockFile('invalid json {');

      const originalFileReader = global.FileReader;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      global.FileReader = class MockFileReader {
        onload: ((ev: ProgressEvent<FileReader>) => void) | null = null;

        readAsText(): void {
          setTimeout(() => {
            const event = { target: { result: 'invalid json {' } } as ProgressEvent<FileReader>;
            this.onload?.(event);
          }, 0);
        }
      } as any;

      const result = await validateImportFile(file);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('invalidJsonFormat');

      global.FileReader = originalFileReader;
    });

    it('should reject non-ClassExport JSON', async () => {
      const file = createMockFile('{"not": "a ClassExport"}');

      const originalFileReader = global.FileReader;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      global.FileReader = class MockFileReader {
        onload: ((ev: ProgressEvent<FileReader>) => void) | null = null;

        readAsText(): void {
          setTimeout(() => {
            const event = { target: { result: '{"not": "a ClassExport"}' } } as ProgressEvent<FileReader>;
            this.onload?.(event);
          }, 0);
        }
      } as any;

      const result = await validateImportFile(file);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('missingClassProperty');

      global.FileReader = originalFileReader;
    });

    it('should reject ClassExport without kids array', async () => {
      const invalidExport = {
        class: {
          class_id: 'test-class-id',
          school_name: 'Test School',
          class_name: 'Test Class',
          school_year: '2024-2025',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      };

      const file = createMockFile(JSON.stringify(invalidExport));

      const originalFileReader = global.FileReader;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      global.FileReader = class MockFileReader {
        onload: ((ev: ProgressEvent<FileReader>) => void) | null = null;

        readAsText(): void {
          setTimeout(() => {
            const event = { target: { result: JSON.stringify(invalidExport) } } as ProgressEvent<FileReader>;
            this.onload?.(event);
          }, 0);
        }
      } as any;

      const result = await validateImportFile(file);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('missingKidsArray');

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

      const classExport: ClassExport = {
        class: {
          class_id: 'test-class-id',
          school_name: 'Test School',
          class_name: 'Test Class',
          school_year: '2024-2025',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        kids: invalidKids as any,
      };

      const file = createMockFile(JSON.stringify(classExport));

      // Mock validation to return error
      (validationService.validateKid as ReturnType<typeof vi.fn>).mockReturnValue({
        valid: false,
        errors: [{ message: 'First name is required' }],
      });

      const originalFileReader = global.FileReader;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      global.FileReader = class MockFileReader {
        onload: ((ev: ProgressEvent<FileReader>) => void) | null = null;

        readAsText(): void {
          setTimeout(() => {
            const event = { target: { result: JSON.stringify(classExport) } } as ProgressEvent<FileReader>;
            this.onload?.(event);
          }, 0);
        }
      } as any;

      const result = await validateImportFile(file);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Kid 1: First name is required');

      global.FileReader = originalFileReader;
    });

    it('should generate UUIDs for kids without IDs', async () => {
      const kidsWithoutIds = [
        {
          first_name: 'John',
          last_name: 'Doe',
          gender: 'male' as const,
          level: 'kindergartner' as const,
          special_education: false,
          guardians: [],
        },
      ];

      const classExport: ClassExport = {
        class: {
          class_id: 'test-class-id',
          school_name: 'Test School',
          class_name: 'Test Class',
          school_year: '2024-2025',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        kids: kidsWithoutIds as any,
      };

      const file = createMockFile(JSON.stringify(classExport));

      const originalFileReader = global.FileReader;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      global.FileReader = class MockFileReader {
        onload: ((ev: ProgressEvent<FileReader>) => void) | null = null;

        readAsText(): void {
          setTimeout(() => {
            const event = { target: { result: JSON.stringify(classExport) } } as ProgressEvent<FileReader>;
            this.onload?.(event);
          }, 0);
        }
      } as any;

      const result = await validateImportFile(file);

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
          gender: 'male' as const,
          level: 'kindergartner' as const,
          special_education: false,
          guardians: [],
          created_at: '2023-01-01T00:00:00.000Z',
        },
      ];

      const classExport: ClassExport = {
        class: {
          class_id: 'test-class-id',
          school_name: 'Test School',
          class_name: 'Test Class',
          school_year: '2024-2025',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        kids: kidsWithIds as any,
      };

      const file = createMockFile(JSON.stringify(classExport));

      const originalFileReader = global.FileReader;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      global.FileReader = class MockFileReader {
        onload: ((ev: ProgressEvent<FileReader>) => void) | null = null;

        readAsText(): void {
          setTimeout(() => {
            const event = { target: { result: JSON.stringify(classExport) } } as ProgressEvent<FileReader>;
            this.onload?.(event);
          }, 0);
        }
      } as any;

      const result = await validateImportFile(file);

      expect(result.valid).toBe(true);
      expect(result.validatedKids?.[0].kid_id).toBe('existing-id-123');
      expect(result.validatedKids?.[0].created_at).toBe('2023-01-01T00:00:00.000Z');

      global.FileReader = originalFileReader;
    });

    it('should validate multiple kids in ClassExport', async () => {
      const multipleKids = [
        {
          first_name: 'John',
          last_name: 'Doe',
          gender: 'male' as const,
          level: 'kindergartner' as const,
          special_education: false,
          guardians: [],
        },
        {
          first_name: 'Jane',
          last_name: 'Smith',
          gender: 'female' as const,
          level: 'pre-kindergartner' as const,
          special_education: false,
          guardians: [],
        },
        {
          first_name: 'Bob',
          last_name: 'Johnson',
          gender: 'male' as const,
          level: 'kindergartner-repeating' as const,
          special_education: true,
          guardians: [],
        },
      ];

      const classExport: ClassExport = {
        class: {
          class_id: 'test-class-id',
          school_name: 'Test School',
          class_name: 'Test Class',
          school_year: '2024-2025',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        kids: multipleKids as any,
      };

      const file = createMockFile(JSON.stringify(classExport));

      const originalFileReader = global.FileReader;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      global.FileReader = class MockFileReader {
        onload: ((ev: ProgressEvent<FileReader>) => void) | null = null;

        readAsText(): void {
          setTimeout(() => {
            const event = { target: { result: JSON.stringify(classExport) } } as ProgressEvent<FileReader>;
            this.onload?.(event);
          }, 0);
        }
      } as any;

      const result = await validateImportFile(file);

      expect(result.valid).toBe(true);
      expect(result.validatedKids).toHaveLength(3);

      global.FileReader = originalFileReader;
    });
  });

  describe('performImport', () => {
    it('should successfully import validated kids to a class', async () => {
      const validatedKids: Kid[] = [
        {
          kid_id: 'test-id-1',
          class_id: 'test-class-id',
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
        totalImported: 1,
        totalInClass: 1,
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
          class_id: 'test-class-id',
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

    it('should import multiple kids to a class', async () => {
      const validatedKids: Kid[] = [
        {
          kid_id: 'test-id-1',
          class_id: 'test-class-id',
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
        {
          kid_id: 'test-id-2',
          class_id: 'test-class-id',
          first_name: 'Jane',
          last_name: 'Smith',
          gender: 'female',
          level: 'pre-kindergartner',
          extended_day_care: false,
          special_education: false,
          guardians: [],
          created_at: '2023-01-01T00:00:00.000Z',
          updated_at: '2023-01-01T00:00:00.000Z',
        },
      ];

      const mockStatistics = {
        totalImported: 2,
        totalInClass: 2,
      };

      (db.mergeKidsToClass as ReturnType<typeof vi.fn>).mockResolvedValue(mockStatistics);

      const result = await performImport(validatedKids, 'test-class-id');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Successfully imported 2 kids');
      expect(db.mergeKidsToClass).toHaveBeenCalledWith('test-class-id', validatedKids);
    });

    it('should override existing kids with same ID on import', async () => {
      const validatedKids: Kid[] = [
        {
          kid_id: 'existing-id-1',
          class_id: 'test-class-id',
          first_name: 'Updated Name',
          last_name: 'Updated Lastname',
          gender: 'male',
          level: 'kindergartner',
          extended_day_care: false,
          special_education: false,
          guardians: [],
          created_at: '2023-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z',
        },
      ];

      const mockStatistics = {
        totalImported: 1,
        totalInClass: 1,
      };

      (db.mergeKidsToClass as ReturnType<typeof vi.fn>).mockResolvedValue(mockStatistics);

      const result = await performImport(validatedKids, 'test-class-id');

      expect(result.success).toBe(true);
      expect(db.mergeKidsToClass).toHaveBeenCalledWith('test-class-id', validatedKids);
    });
  });
});
