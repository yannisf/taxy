import { describe, it, expect } from 'vitest';
import { validationService } from '../services/validation';
import type { Kid } from '../types/models';

const kidWithRelation = (relation: string) =>
  ({
    first_name: 'Μαρία',
    last_name: 'Σταυρίδης',
    gender: 'female',
    level: 'kindergartner',
    guardians: [{ first_name: 'Σπύρος', last_name: 'Δημητρίου', relation_with_kid: relation }],
  }) as unknown as Kid;

describe('validationService.validateKid', () => {
  it('accepts a current relation value', () => {
    expect(validationService.validateKid(kidWithRelation('father')).valid).toBe(true);
  });

  it.each(['sibling', 'grandparent'])('still accepts the legacy relation %s', relation => {
    expect(validationService.validateKid(kidWithRelation(relation)).valid).toBe(true);
  });

  it('rejects a guardian relation outside the enum', () => {
    const result = validationService.validateKid(kidWithRelation('not-a-relation'));

    expect(result.valid).toBe(false);
    expect(result.errors?.[0].instancePath).toBe('/guardians/0/relation_with_kid');
  });

  it('rejects a guardian missing a relation entirely', () => {
    const kid = {
      first_name: 'Μαρία',
      last_name: 'Σταυρίδης',
      gender: 'female',
      level: 'kindergartner',
      guardians: [{ first_name: 'Σπύρος', last_name: 'Δημητρίου' }],
    } as unknown as Kid;

    expect(validationService.validateKid(kid).valid).toBe(false);
  });

  it('keeps accepting the optional guardian fields the app exports', () => {
    const kid = {
      first_name: 'Μαρία',
      last_name: 'Σταυρίδης',
      gender: 'female',
      level: 'kindergartner',
      guardians: [
        {
          first_name: 'Σπύρος',
          last_name: 'Δημητρίου',
          relation_with_kid: 'father',
          authorized_for_pickup: true,
          same_address_as_kid: true,
          email: 'spyros@example.com',
          profession: 'Μάγειρας',
          telephones: [{ country_code: '+30', number: '6940265423', telephone_type: 'mobile' }],
        },
      ],
    } as unknown as Kid;

    expect(validationService.validateKid(kid).valid).toBe(true);
  });
});
