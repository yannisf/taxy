import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock localStorage for tests
Object.defineProperty(global, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  },
  writable: true,
});

// Mock indexedDB for Dexie
Object.defineProperty(global, 'indexedDB', {
  value: {
    open: vi.fn(),
    deleteDatabase: vi.fn(),
    databases: vi.fn(),
    cmp: vi.fn(),
  },
  writable: true,
});

// Mock URL.createObjectURL and URL.revokeObjectURL for file download tests
Object.defineProperty(URL, 'createObjectURL', {
  value: vi.fn(() => 'mocked-url'),
  writable: true,
});

Object.defineProperty(URL, 'revokeObjectURL', {
  value: vi.fn(),
  writable: true,
});

// Mock FileReader for file upload tests
class MockFileReader {
  result: string | ArrayBuffer | null = null;
  error: DOMException | null = null;
  readyState: number = 0;
  onload: ((ev: ProgressEvent<FileReader>) => void) | null = null;
  onerror: ((ev: ProgressEvent<FileReader>) => void) | null = null;
  onabort: ((ev: ProgressEvent<FileReader>) => void) | null = null;
  onloadend: ((ev: ProgressEvent<FileReader>) => void) | null = null;
  onloadstart: ((ev: ProgressEvent<FileReader>) => void) | null = null;
  onprogress: ((ev: ProgressEvent<FileReader>) => void) | null = null;

  readonly EMPTY = 0;
  readonly LOADING = 1;
  readonly DONE = 2;

  readAsText(): void {
    setTimeout(() => {
      this.readyState = 2; // DONE
      this.result = '[]'; // Default empty array for tests
      if (this.onload) {
        const event = new ProgressEvent('load') as ProgressEvent<FileReader>;
        this.onload(event);
      }
    }, 0);
  }

  abort(): void {}
  readAsArrayBuffer(): void {}
  readAsBinaryString(): void {}
  readAsDataURL(): void {}
  addEventListener(): void {}
  removeEventListener(): void {}
  dispatchEvent(): boolean { return true; }
}

Object.defineProperty(global, 'FileReader', {
  value: MockFileReader,
  writable: true,
});
