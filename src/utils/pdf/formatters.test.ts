import { describe, it, expect } from 'vitest';
import type { TFunction } from 'i18next';
import type { Guardian, Telephone } from '../../types/models';
import { formatPhoneForPDF, createGuardianTable } from './formatters';

const t = ((key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? key) as unknown as TFunction;

const phone = (number: string): Telephone => ({ country_code: '+30', number, telephone_type: 'mobile' });

const guardian = (firstName: string, phones: string[] = []): Guardian => ({
  first_name: firstName,
  last_name: 'Παππά',
  relation_with_kid: 'mother',
  telephones: phones.map(phone),
  same_address_as_kid: true
});

describe('formatPhoneForPDF', () => {
  it('groups a 10 digit number as XXX XXX XXXX', () => {
    expect(formatPhoneForPDF(phone('6941234567'))).toBe('694 123 4567');
  });

  it('groups a 7 digit number after the third digit', () => {
    expect(formatPhoneForPDF(phone('2105550'))).toBe('210 5550');
  });

  it('leaves shorter numbers untouched', () => {
    expect(formatPhoneForPDF(phone('12345'))).toBe('12345');
  });
});

describe('createGuardianTable', () => {
  it('renders one row per guardian', () => {
    const table = createGuardianTable([guardian('Μαρία'), guardian('Νίκος')], t, '#ffffff');

    expect(table.table.body).toHaveLength(2);
  });

  it('zebra stripes every second guardian over the row colour', () => {
    const table = createGuardianTable([guardian('Μαρία'), guardian('Νίκος'), guardian('Ελένη')], t, '#ffffff');
    const fills = table.table.body.map(row => (row[0] as unknown as { fillColor: string }).fillColor);

    expect(fills).toEqual(['#ffffff', '#e9ecef', '#ffffff']);
  });

  it('uses a darker stripe on the grey catalog rows', () => {
    const table = createGuardianTable([guardian('Μαρία'), guardian('Νίκος')], t, '#f8f9fa');
    const fills = table.table.body.map(row => (row[0] as unknown as { fillColor: string }).fillColor);

    expect(fills).toEqual(['#f8f9fa', '#e2e6ea']);
  });

  it('sets the phone numbers in bold monospace', () => {
    const table = createGuardianTable([guardian('Μαρία', ['6941234567'])], t, '#ffffff');
    const runs = (table.table.body[0][0] as unknown as { text: Array<Record<string, unknown>> }).text;
    const phoneRun = runs.find(run => run.text === '694 123 4567');

    expect(phoneRun).toMatchObject({ font: 'Courier', bold: true });
  });
});
