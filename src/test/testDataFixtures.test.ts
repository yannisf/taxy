import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { validateImportFile } from '../utils/importUtils';
import { validationService } from '../services/validation';
import { db } from '../services/database';
import type { Guardian } from '../types/models';

vi.mock('../services/database', () => ({
  db: {
    getClassById: vi.fn(),
  },
}));

const loadFixture = (filename: string) => {
  const content = readFileSync(join(__dirname, '../../test-data', filename), 'utf-8');
  return { content, file: new File([content], filename, { type: 'application/json' }) };
};

const withFileReaderResult = async (content: string, run: () => Promise<void>) => {
  const originalFileReader = global.FileReader;
  global.FileReader = class MockFileReader {
    onload: ((ev: ProgressEvent<FileReader>) => void) | null = null;
    readAsText(): void {
      setTimeout(() => {
        const event = { target: { result: content } } as ProgressEvent<FileReader>;
        this.onload?.(event);
      }, 0);
    }
  } as unknown as typeof FileReader;

  try {
    await run();
  } finally {
    global.FileReader = originalFileReader;
  }
};

describe('test-data fixtures', () => {
  const FIXTURE = 'test-class-export-el-23.json';

  it('imports cleanly through validateImportFile', async () => {
    (db.getClassById as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const { content, file } = loadFixture(FIXTURE);
    const parsed = JSON.parse(content);

    let result: Awaited<ReturnType<typeof validateImportFile>> | undefined;
    await withFileReaderResult(content, async () => {
      result = await validateImportFile(file);
    });

    expect(result?.errors).toEqual([]);
    expect(result?.valid).toBe(true);
    expect(result?.validatedKids).toHaveLength(parsed.kids.length);
  });

  // validateKid only checks that guardians have the three required keys, not that
  // relation_with_kid is one of the accepted values, so the import assertion above
  // would stay green if the relation enum dropped a value this fixture still uses.
  it('uses only guardian relation values the app still accepts', () => {
    const { content } = loadFixture(FIXTURE);
    const parsed = JSON.parse(content);

    const rejected = parsed.kids.flatMap((kid: { guardians?: Guardian[] }, kidIndex: number) =>
      (kid.guardians ?? [])
        .filter(guardian => !validationService.validateGuardian(guardian).valid)
        .map(guardian => `kid ${kidIndex + 1}: ${guardian.relation_with_kid}`)
    );

    expect(rejected).toEqual([]);
  });
});
