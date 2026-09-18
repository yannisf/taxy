import { describe, it, expect } from 'vitest';
import {
  normalizeString,
  extractUniqueFirstNames,
  filterNamesByQuery,
  extractUniqueStreetNames,
  extractUniqueNeighborhoods,
  extractUniquePostalCodes,
  extractUniqueCities,
  extractUniqueCountries
} from './nameUtils';
import type { Kid } from '../types/models';

describe('nameUtils', () => {
  describe('normalizeString', () => {
    it('should remove accents from characters', () => {
      expect(normalizeString('José')).toBe('jose');
      expect(normalizeString('François')).toBe('francois');
      expect(normalizeString('Μαρία')).toBe('μαρια');
      expect(normalizeString('Γιώργος')).toBe('γιωργος');
    });

    it('should convert to lowercase', () => {
      expect(normalizeString('JOHN')).toBe('john');
      expect(normalizeString('MaRy')).toBe('mary');
    });

    it('should trim whitespace', () => {
      expect(normalizeString('  John  ')).toBe('john');
    });

    it('should handle combined operations', () => {
      expect(normalizeString('  JOSÉ  ')).toBe('jose');
    });
  });

  describe('extractUniqueFirstNames', () => {
    it('should extract first names from kids', () => {
      const kids: Kid[] = [
        {
          kid_id: '1',
          class_id: 'test-class',
          first_name: 'John',
          last_name: 'Doe',
          gender: 'male',
          level: 'kindergartner',
          extended_day_care: false,
          special_education: false,
          guardians: [],
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        {
          kid_id: '2',
          class_id: 'test-class',
          first_name: 'Jane',
          last_name: 'Smith',
          gender: 'female',
          level: 'kindergartner',
          extended_day_care: false,
          special_education: false,
          guardians: [],
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        }
      ];

      const names = extractUniqueFirstNames(kids);
      expect(names).toEqual(['Jane', 'John']);
    });

    it('should extract preferred names', () => {
      const kids: Kid[] = [
        {
          kid_id: '1',
          class_id: 'test-class',
          first_name: 'Jonathan',
          last_name: 'Doe',
          preferred_name: 'Johnny',
          gender: 'male',
          level: 'kindergartner',
          extended_day_care: false,
          special_education: false,
          guardians: [],
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        }
      ];

      const names = extractUniqueFirstNames(kids);
      expect(names).toContain('Jonathan');
      expect(names).toContain('Johnny');
    });

    it('should remove duplicates', () => {
      const kids: Kid[] = [
        {
          kid_id: '1',
          class_id: 'test-class',
          first_name: 'John',
          last_name: 'Doe',
          gender: 'male',
          level: 'kindergartner',
          extended_day_care: false,
          special_education: false,
          guardians: [],
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        {
          kid_id: '2',
          class_id: 'test-class',
          first_name: 'John',
          last_name: 'Smith',
          gender: 'male',
          level: 'kindergartner',
          extended_day_care: false,
          special_education: false,
          guardians: [],
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        }
      ];

      const names = extractUniqueFirstNames(kids);
      expect(names).toEqual(['John']);
    });

    it('should handle empty first names', () => {
      const kids: Kid[] = [
        {
          kid_id: '1',
          class_id: 'test-class',
          first_name: '',
          last_name: 'Doe',
          gender: 'male',
          level: 'kindergartner',
          extended_day_care: false,
          special_education: false,
          guardians: [],
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        }
      ];

      const names = extractUniqueFirstNames(kids);
      expect(names).toEqual([]);
    });

    it('should sort names alphabetically case-insensitive', () => {
      const kids: Kid[] = [
        {
          kid_id: '1',
          class_id: 'test-class',
          first_name: 'Zoe',
          last_name: 'Doe',
          gender: 'female',
          level: 'kindergartner',
          extended_day_care: false,
          special_education: false,
          guardians: [],
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        {
          kid_id: '2',
          class_id: 'test-class',
          first_name: 'anna',
          last_name: 'Smith',
          gender: 'female',
          level: 'kindergartner',
          extended_day_care: false,
          special_education: false,
          guardians: [],
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        }
      ];

      const names = extractUniqueFirstNames(kids);
      expect(names).toEqual(['anna', 'Zoe']);
    });
  });

  describe('filterNamesByQuery', () => {
    const names = ['John', 'Jane', 'José', 'Γιώργος', 'Γιάννης'];

    it('should return empty array for queries less than 2 characters', () => {
      expect(filterNamesByQuery(names, '')).toEqual([]);
      expect(filterNamesByQuery(names, 'J')).toEqual([]);
    });

    it('should filter names case-insensitively', () => {
      expect(filterNamesByQuery(names, 'jo')).toContain('John');
      expect(filterNamesByQuery(names, 'JO')).toContain('John');
      expect(filterNamesByQuery(names, 'Jo')).toContain('John');
    });

    it('should filter names accent-insensitively', () => {
      expect(filterNamesByQuery(names, 'jose')).toContain('José');
      expect(filterNamesByQuery(names, 'José')).toContain('José');
    });

    it('should filter Greek names with accents', () => {
      expect(filterNamesByQuery(names, 'γιω')).toContain('Γιώργος');
      expect(filterNamesByQuery(names, 'γιωρ')).toContain('Γιώργος');
    });

    it('should only match names that start with query', () => {
      const result = filterNamesByQuery(names, 'ja');
      expect(result).toContain('Jane');
      expect(result).not.toContain('John');
    });

    it('should handle queries with accents', () => {
      expect(filterNamesByQuery(names, 'Γιώ')).toContain('Γιώργος');
      expect(filterNamesByQuery(names, 'Γιά')).toContain('Γιάννης');
    });
  });

  describe('Address field extraction', () => {
    const kids: Kid[] = [
      {
        kid_id: '1',
        class_id: 'test-class',
        first_name: 'John',
        last_name: 'Doe',
        gender: 'male',
        level: 'kindergartner',
        extended_day_care: false,
        special_education: false,
        guardians: [
          {
            first_name: 'Jane',
            last_name: 'Doe',
            relation_with_kid: 'mother',
            address: {
              street_name: 'Oak Street',
              neighborhood: 'Downtown',
              postal_code: '54321',
              city: 'Springfield',
              country: 'USA'
            }
          }
        ],
        address: {
          street_name: 'Main Street',
          neighborhood: 'Central',
          postal_code: '12345',
          city: 'Athens',
          country: 'Greece'
        },
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      },
      {
        kid_id: '2',
        class_id: 'test-class',
        first_name: 'Mary',
        last_name: 'Smith',
        gender: 'female',
        level: 'kindergartner',
        extended_day_care: false,
        special_education: false,
        guardians: [
          {
            first_name: 'Bob',
            last_name: 'Smith',
            relation_with_kid: 'father',
            same_address_as_kid: true
          }
        ],
        address: {
          street_name: 'Main Street',
          neighborhood: 'Uptown',
          postal_code: '12345',
          city: 'Athens',
          country: 'Greece'
        },
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      }
    ];

    describe('extractUniqueStreetNames', () => {
      it('should extract street names from kid and guardian addresses', () => {
        const streets = extractUniqueStreetNames(kids);
        expect(streets).toContain('Main Street');
        expect(streets).toContain('Oak Street');
        expect(streets).toHaveLength(2);
      });

      it('should remove duplicates', () => {
        const streets = extractUniqueStreetNames(kids);
        const mainStreets = streets.filter(s => s === 'Main Street');
        expect(mainStreets).toHaveLength(1);
      });

      it('should skip guardians with same_address_as_kid', () => {
        const streets = extractUniqueStreetNames(kids);
        // Bob's address should not be included
        expect(streets).toHaveLength(2);
      });
    });

    describe('extractUniqueNeighborhoods', () => {
      it('should extract unique neighborhoods', () => {
        const neighborhoods = extractUniqueNeighborhoods(kids);
        expect(neighborhoods).toContain('Central');
        expect(neighborhoods).toContain('Downtown');
        expect(neighborhoods).toContain('Uptown');
        expect(neighborhoods).toHaveLength(3);
      });
    });

    describe('extractUniquePostalCodes', () => {
      it('should extract unique postal codes', () => {
        const postalCodes = extractUniquePostalCodes(kids);
        expect(postalCodes).toContain('12345');
        expect(postalCodes).toContain('54321');
        expect(postalCodes).toHaveLength(2);
      });
    });

    describe('extractUniqueCities', () => {
      it('should extract unique cities', () => {
        const cities = extractUniqueCities(kids);
        expect(cities).toContain('Athens');
        expect(cities).toContain('Springfield');
        expect(cities).toHaveLength(2);
      });
    });

    describe('extractUniqueCountries', () => {
      it('should extract unique countries', () => {
        const countries = extractUniqueCountries(kids);
        expect(countries).toContain('Greece');
        expect(countries).toContain('USA');
        expect(countries).toHaveLength(2);
      });
    });
  });
});
