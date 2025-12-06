/**
 * Browser support validation utilities
 */

/**
 * Validates browser support for required crypto APIs
 */
export function validateBrowserSupport(): { supported: boolean; missing: string[] } {
  const missing: string[] = [];

  if (!crypto?.subtle) {
    missing.push('Web Crypto API (crypto.subtle)');
  }

  if (typeof CompressionStream === 'undefined') {
    missing.push('Compression Streams API');
  }

  if (typeof DecompressionStream === 'undefined') {
    missing.push('Decompression Streams API');
  }

  if (!TextEncoder || !TextDecoder) {
    missing.push('TextEncoder/TextDecoder');
  }

  return {
    supported: missing.length === 0,
    missing
  };
}

/**
 * Utility function to securely clear sensitive data from memory
 * Note: This is a best-effort approach in JavaScript
 */
export function clearSensitiveData(data: Uint8Array): void {
  if (data && data.fill) {
    data.fill(0);
  }
}
