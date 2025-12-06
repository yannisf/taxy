/**
 * Base64 encoding and decoding utilities
 */

import { CorruptedDataError } from './errors';

/**
 * Converts a Uint8Array to Base64 string
 * Handles large arrays by processing in chunks to avoid call stack overflow
 */
export function uint8ArrayToBase64(data: Uint8Array): string {
  // Handle large arrays by processing in chunks to avoid call stack overflow
  const chunkSize = 0x8000; // 32KB chunks
  let result = '';

  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.subarray(i, i + chunkSize);
    result += String.fromCharCode.apply(null, Array.from(chunk));
  }

  return btoa(result);
}

/**
 * Converts a Base64 string to Uint8Array
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  try {
    const binaryString = atob(base64);
    const data = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      data[i] = binaryString.charCodeAt(i);
    }

    return data;
  } catch (error) {
    throw new CorruptedDataError(`Invalid Base64 data: ${error instanceof Error ? error.message : String(error)}`);
  }
}
