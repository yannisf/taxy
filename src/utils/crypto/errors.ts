/**
 * Custom error types for crypto operations
 */

export class CryptoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CryptoError';
  }
}

export class CompressionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CompressionError';
  }
}

export class InvalidPasswordError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPasswordError';
  }
}

export class CorruptedDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CorruptedDataError';
  }
}
