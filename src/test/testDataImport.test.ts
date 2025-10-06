import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateImportFile, performImport } from '../utils/importUtils';
import { db } from '../services/database';
import { validationService } from '../services/validation';
import type { Kid, Class } from '../types/models';
import fs from 'fs';
import path from 'path';

// Mock the dependencies
vi.mock('../services/database', () => ({
  db: {
    getKids: vi.fn(),
    getKidsByClassId: vi.fn(),
    mergeKids: vi.fn(),
    mergeKidsToClass: vi.fn(),
    addKidsToClass: vi.fn(),
    getClassById: vi.fn(),
  },
}));

vi.mock('../services/validation', () => ({
  validationService: {
    validateKid: vi.fn(),
  },
}));

// Mock UUID generation to be deterministic for testing
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'test-generated-uuid'),
}));

describe('Test Data Import Integration', () => {
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

  const createMockFileFromJson = (jsonData: any): File => {
    const content = JSON.stringify(jsonData);
    const blob = new Blob([content], { type: 'application/json' });
    return new File([blob], 'test-kids-data.json', { type: 'application/json' });
  };

  const setupMockFileReader = (content: string) => {
    const originalFileReader = global.FileReader;
    
    global.FileReader = class MockFileReader {
      onload: ((ev: ProgressEvent<FileReader>) => void) | null = null;
      onerror: ((ev: ProgressEvent<FileReader>) => void) | null = null;
      
      readAsText(): void {
        setTimeout(() => {
          const event = { target: { result: content } } as ProgressEvent<FileReader>;
          this.onload?.(event);
        }, 0);
      }
    } as any;

    return originalFileReader;
  };

  it('should successfully validate and import the complete test kids data', async () => {
    // Load the actual test data file
    const testDataPath = path.join(process.cwd(), 'test-kids-data.json');
    const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));
    
    expect(Array.isArray(testData)).toBe(true);
    expect(testData).toHaveLength(10);

    const file = createMockFileFromJson(testData);
    const originalFileReader = setupMockFileReader(JSON.stringify(testData));

    try {
      const validationResult = await validateImportFile(file, 'test-class-id');

      expect(validationResult.valid).toBe(true);
      expect(validationResult.errors).toEqual([]);
      expect(validationResult.validatedKids).toHaveLength(10);
      expect(validationResult.statistics).toBeDefined();
      
      // Verify that the validation service was called for each kid
      expect(validationService.validateKid).toHaveBeenCalledTimes(10);

      // Verify statistics calculation
      expect(validationResult.statistics).toEqual({
        newKids: 10,        // All kids are new (empty database)
        updatedKids: 0,     // No existing kids to update
        unchangedKids: 0,   // No existing kids remain unchanged
        conflictingKids: 0, // No conflicts with empty database
        totalInFile: 10,
        totalInDatabase: 0
      });

      // Test the import process if validation passes
      if (validationResult.validatedKids) {
        const mockImportStatistics = {
          newKids: 10,
          updatedKids: 0,
          unchangedKids: 0,
          conflictingKids: 0,
          totalInFile: 10,
          totalInDatabase: 0,
        };

        (db.mergeKidsToClass as ReturnType<typeof vi.fn>).mockResolvedValue(mockImportStatistics);

        const importResult = await performImport(validationResult.validatedKids, 'test-class-id');

        expect(importResult.success).toBe(true);
        expect(importResult.message).toBe('Successfully imported 10 kids');
        expect(importResult.statistics).toEqual(mockImportStatistics);
        expect(db.mergeKidsToClass).toHaveBeenCalledWith('test-class-id', validationResult.validatedKids);
      }

    } finally {
      global.FileReader = originalFileReader;
    }
  });

  it('should validate individual kid data structure from test file', async () => {
    const testDataPath = path.join(process.cwd(), 'test-kids-data.json');
    const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));
    
    // Test first kid (Emma Johnson)
    const firstKid = testData[0];
    expect(firstKid).toMatchObject({
      kid_id: '550e8400-e29b-41d4-a716-446655440001',
      first_name: 'Emma',
      last_name: 'Johnson',
      preferred_name: 'Em',
      date_of_birth: '2019-03-15',
      gender: 'female',
      level: 'kindergartner',
      special_education: false
    });

    // Verify address structure
    expect(firstKid.address).toMatchObject({
      street_name: 'Oak Street',
      street_number: '123',
      neighborhood: 'Downtown',
      postal_code: '12345',
      city: 'Springfield',
      country: 'USA'
    });

    // Verify guardians structure
    expect(firstKid.guardians).toHaveLength(2);
    expect(firstKid.guardians[0]).toMatchObject({
      first_name: 'Sarah',
      last_name: 'Johnson',
      relation_with_kid: 'mother',
      authorized_for_pickup: true,
      same_address_as_kid: true,
      email: 'sarah.johnson@email.com',
      profession: 'Software Engineer'
    });

    // Verify telephone structure
    expect(firstKid.guardians[0].telephones).toHaveLength(2);
    expect(firstKid.guardians[0].telephones[0]).toMatchObject({
      country_code: '+1',
      number: '5551234567',
      telephone_type: 'mobile'
    });
  });

  it('should validate data variety across all test kids', async () => {
    const testDataPath = path.join(process.cwd(), 'test-kids-data.json');
    const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));
    
    // Check gender variety
    const genders = testData.map((kid: any) => kid.gender);
    expect(genders).toContain('male');
    expect(genders).toContain('female');

    // Check level variety
    const levels = testData.map((kid: any) => kid.level);
    expect(levels).toContain('kindergartner');
    expect(levels).toContain('kindergartner-repeating');
    expect(levels).toContain('pre-kindergartner');

    // Check special education variety
    const specialEducation = testData.map((kid: any) => kid.special_education);
    expect(specialEducation).toContain(true);
    expect(specialEducation).toContain(false);

    // Check guardian relationship variety
    const relationships = testData.flatMap((kid: any) => 
      kid.guardians.map((guardian: any) => guardian.relation_with_kid)
    );
    expect(relationships).toContain('mother');
    expect(relationships).toContain('father');
    expect(relationships).toContain('grandparent');
    expect(relationships).toContain('sibling');
    expect(relationships).toContain('extended family');
    expect(relationships).toContain('friend');

    // Check telephone type variety
    const telephoneTypes = testData.flatMap((kid: any) => 
      kid.guardians.flatMap((guardian: any) => 
        guardian.telephones.map((phone: any) => phone.telephone_type)
      )
    );
    expect(telephoneTypes).toContain('mobile');
    expect(telephoneTypes).toContain('home');
    expect(telephoneTypes).toContain('work');

    // Verify guardian count variation (1-3 guardians each)
    const guardianCounts = testData.map((kid: any) => kid.guardians.length);
    expect(Math.min(...guardianCounts)).toBeGreaterThanOrEqual(1);
    expect(Math.max(...guardianCounts)).toBeLessThanOrEqual(3);

    // Verify telephone count (at least 2 per guardian)
    testData.forEach((kid: any) => {
      kid.guardians.forEach((guardian: any) => {
        expect(guardian.telephones.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  it('should handle import with existing kids in database', async () => {
    const testDataPath = path.join(process.cwd(), 'test-kids-data.json');
    const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));
    
    // Mock existing kids in database (first 3 kids already exist)
    const existingKids: Kid[] = testData.slice(0, 3).map((kid: any) => ({
      ...kid,
      updated_at: '2024-01-01T00:00:00Z' // Older timestamp
    }));

    (db.getKids as ReturnType<typeof vi.fn>).mockResolvedValue(existingKids);
    (db.getKidsByClassId as ReturnType<typeof vi.fn>).mockResolvedValue(existingKids);

    const file = createMockFileFromJson(testData);
    const originalFileReader = setupMockFileReader(JSON.stringify(testData));

    try {
      const validationResult = await validateImportFile(file, 'test-class-id');

      expect(validationResult.valid).toBe(true);
      expect(validationResult.statistics).toEqual({
        newKids: 7,         // 7 new kids
        updatedKids: 3,     // 3 existing kids will be updated
        unchangedKids: 0,   // No kids remain unchanged (all existing kids are in import)
        conflictingKids: 0, // No conflicts in this test scenario
        totalInFile: 10,
        totalInDatabase: 3
      });

    } finally {
      global.FileReader = originalFileReader;
    }
  });

  it('should import kids to a specific class when classId is provided', async () => {
    const testDataPath = path.join(process.cwd(), 'test-kids-data.json');
    const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));
    
    const mockClass: Class = {
      class_id: 'test-class-id',
      school_name: 'Test School',
      class_name: 'Test Class',
      school_year: '2024-2025',
      kid_ids: [],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    };

    (db.getClassById as ReturnType<typeof vi.fn>).mockResolvedValue(mockClass);
    (db.addKidsToClass as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const file = createMockFileFromJson(testData);
    const originalFileReader = setupMockFileReader(JSON.stringify(testData));

    try {
      const validationResult = await validateImportFile(file, 'test-class-id');
      
      if (validationResult.validatedKids) {
        const mockImportStatistics = {
          newKids: 10,
          updatedKids: 0,
          unchangedKids: 0,
          conflictingKids: 0,
          totalInFile: 10,
          totalInDatabase: 0,
        };

        (db.mergeKidsToClass as ReturnType<typeof vi.fn>).mockResolvedValue(mockImportStatistics);

        // Test import with class ID
        const importResult = await performImport(validationResult.validatedKids, 'test-class-id');

        expect(importResult.success).toBe(true);
        expect(db.mergeKidsToClass).toHaveBeenCalledWith('test-class-id', validationResult.validatedKids);
      }

    } finally {
      global.FileReader = originalFileReader;
    }
  });

  it('should handle import failure when class does not exist', async () => {
    const testDataPath = path.join(process.cwd(), 'test-kids-data.json');
    const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));
    
    // Mock class not found
    (db.mergeKidsToClass as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Class not found'));

    const file = createMockFileFromJson(testData);
    const originalFileReader = setupMockFileReader(JSON.stringify(testData));

    try {
      const validationResult = await validateImportFile(file, 'test-class-id');
      
      if (validationResult.validatedKids) {
        // Test import with invalid class ID
        const importResult = await performImport(validationResult.validatedKids, 'invalid-class-id');

        expect(importResult.success).toBe(false);
        expect(importResult.message).toBe('Import failed: Class not found');
        expect(db.mergeKidsToClass).toHaveBeenCalledWith('invalid-class-id', validationResult.validatedKids);
      }

    } finally {
      global.FileReader = originalFileReader;
    }
  });

  it('should verify all required fields are present in test data', async () => {
    const testDataPath = path.join(process.cwd(), 'test-kids-data.json');
    const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));
    
    const requiredKidFields = [
      'kid_id', 'first_name', 'last_name', 'gender', 'level', 
      'special_education', 'guardians', 'created_at', 'updated_at'
    ];

    const requiredGuardianFields = [
      'first_name', 'last_name', 'relation_with_kid'
    ];

    const requiredTelephoneFields = [
      'country_code', 'number', 'telephone_type'
    ];

    testData.forEach((kid: any) => {
      // Check required kid fields
      requiredKidFields.forEach(field => {
        expect(kid).toHaveProperty(field);
        expect(kid[field]).toBeDefined();
      });

      // Check guardians
      expect(kid.guardians).toBeInstanceOf(Array);
      expect(kid.guardians.length).toBeGreaterThan(0);

      kid.guardians.forEach((guardian: any) => {
        // Check required guardian fields
        requiredGuardianFields.forEach(field => {
          expect(guardian).toHaveProperty(field);
          expect(guardian[field]).toBeDefined();
        });

        // Check telephones
        expect(guardian.telephones).toBeInstanceOf(Array);
        expect(guardian.telephones.length).toBeGreaterThanOrEqual(2);

        guardian.telephones.forEach((telephone: any) => {
          // Check required telephone fields
          requiredTelephoneFields.forEach(field => {
            expect(telephone).toHaveProperty(field);
            expect(telephone[field]).toBeDefined();
          });

          // Validate telephone format
          expect(telephone.country_code).toMatch(/^\+\d{1,3}$/);
          expect(telephone.number).toMatch(/^\d{4,15}$/);
          expect(['mobile', 'home', 'work', 'other']).toContain(telephone.telephone_type);
        });
      });
    });
  });
});
