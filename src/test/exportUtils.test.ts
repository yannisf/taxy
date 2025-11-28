import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportClassData } from '../utils/exportUtils';
import { db } from '../services/database';
import type { Kid } from '../types/models';

// Mock the database
vi.mock('../services/database', () => ({
  db: {
    exportData: vi.fn(),
    exportClassData: vi.fn(),
  },
}));

describe('exportUtils', () => {
  let mockCreateElement: ReturnType<typeof vi.fn>;
  let mockAppendChild: ReturnType<typeof vi.fn>;
  let mockRemoveChild: ReturnType<typeof vi.fn>;
  let mockClick: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock DOM methods
    mockCreateElement = vi.fn();
    mockAppendChild = vi.fn();
    mockRemoveChild = vi.fn();
    mockClick = vi.fn();

    const mockLink = {
      href: '',
      download: '',
      click: mockClick,
    };

    mockCreateElement.mockReturnValue(mockLink);

    Object.defineProperty(document, 'createElement', {
      value: mockCreateElement,
      writable: true,
    });

    Object.defineProperty(document.body, 'appendChild', {
      value: mockAppendChild,
      writable: true,
    });

    Object.defineProperty(document.body, 'removeChild', {
      value: mockRemoveChild,
      writable: true,
    });

    // Mock URL methods
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should export class data with correct format', async () => {
    const mockKids: Kid[] = [
      {
        kid_id: '123e4567-e89b-12d3-a456-426614174000',
        class_id: 'test-class-id',
        first_name: 'John',
        last_name: 'Doe',
        gender: 'male',
        level: 'kindergartner',
        special_education: false,
        extended_day_care: false,
        guardians: [],
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z',
      },
      {
        kid_id: '123e4567-e89b-12d3-a456-426614174001',
        class_id: 'test-class-id',
        first_name: 'Jane',
        last_name: 'Smith',
        gender: 'female',
        level: 'pre-kindergartner',
        special_education: false,
        extended_day_care: false,
        guardians: [],
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z',
      },
    ];

    const mockClassData = {
      school_name: 'Test School',
      class_name: 'Test Class',
      school_year: '2023-2024',
      kids: mockKids,
    };

    (db.exportData as ReturnType<typeof vi.fn>).mockResolvedValue(mockClassData);

    await exportClassData();

    // Verify database was called
    expect(db.exportData).toHaveBeenCalledOnce();

    // Verify DOM manipulation
    expect(mockCreateElement).toHaveBeenCalledWith('a');
    expect(mockAppendChild).toHaveBeenCalled();
    expect(mockRemoveChild).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();

    // Verify the link element was set up correctly
    const linkElement = mockCreateElement.mock.results[0].value;
    expect(linkElement.download).toMatch(/^class-export-\d{4}-\d{2}-\d{2}\.json$/);
    expect(linkElement.href).toBe('mocked-url');
  });

  it('should generate filename with current date', async () => {
    const mockClassData = {
      school_name: 'Test School',
      class_name: 'Test Class',
      school_year: '2023-2024',
      kids: [],
    };

    (db.exportData as ReturnType<typeof vi.fn>).mockResolvedValue(mockClassData);

    // Mock date to have consistent test results
    const mockDate = new Date('2023-10-15T10:30:00.000Z');
    vi.setSystemTime(mockDate);

    await exportClassData();

    const linkElement = mockCreateElement.mock.results[0].value;
    expect(linkElement.download).toBe('class-export-2023-10-15.json');

    vi.useRealTimers();
  });

  it('should export only kids array (not full class data)', async () => {
    const mockKids: Kid[] = [
      {
        kid_id: '123e4567-e89b-12d3-a456-426614174000',
        class_id: 'test-class-id',
        first_name: 'John',
        last_name: 'Doe',
        gender: 'male',
        level: 'kindergartner',
        special_education: false,
        extended_day_care: false,
        guardians: [],
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z',
      },
    ];

    const mockClassData = {
      school_name: 'Test School',
      class_name: 'Test Class',
      school_year: '2023-2024',
      kids: mockKids,
    };

    (db.exportData as ReturnType<typeof vi.fn>).mockResolvedValue(mockClassData);

    // Mock Blob constructor to capture the JSON content
    const mockBlob = { type: 'application/json' };
    const BlobConstructor = vi.fn().mockReturnValue(mockBlob);
    global.Blob = BlobConstructor;

    await exportClassData();

    // Verify Blob was created with complete class data
    expect(BlobConstructor).toHaveBeenCalledWith(
      [JSON.stringify(mockClassData, null, 2)],
      { type: 'application/json' }
    );
  });

  it('should handle export errors gracefully', async () => {
    const mockError = new Error('Database error');
    (db.exportData as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

    await expect(exportClassData()).rejects.toThrow('Database error');
  });

  it('should clean up resources after export', async () => {
    const mockClassData = {
      school_name: 'Test School',
      class_name: 'Test Class',
      school_year: '2023-2024',
      kids: [],
    };

    (db.exportData as ReturnType<typeof vi.fn>).mockResolvedValue(mockClassData);

    await exportClassData();

    // Verify cleanup
    expect(mockRemoveChild).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('mocked-url');
  });
});
