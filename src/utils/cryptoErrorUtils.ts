/**
 * Maps crypto-related errors to user-friendly messages
 */
export function getCryptoErrorMessage(error: Error): string {
  if (error.name === 'CryptoError' || error.name === 'CompressionError') {
    return 'encryptionFailed';
  }
  if (error.name === 'InvalidPasswordError') {
    return 'invalidPassword';
  }
  if (error.name === 'CorruptedDataError') {
    return 'corruptedData';
  }
  return 'failedToExportClassData';
}

/**
 * Checks if an error is a crypto-related error
 */
export function isCryptoError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return ['CryptoError', 'CompressionError', 'InvalidPasswordError', 'CorruptedDataError'].includes(
    error.name
  );
}
