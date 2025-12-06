/**
 * Cryptography configuration constants
 */

export const CONFIG = {
  SALT_LENGTH: 16,           // 16 bytes salt
  IV_LENGTH: 12,             // 12 bytes IV for AES-GCM
  KEY_LENGTH: 256,           // 256-bit key
  PBKDF2_ITERATIONS: 100000, // 100,000 iterations for key derivation
  ALGORITHM: 'AES-GCM' as const,
  HASH_ALGORITHM: 'SHA-256' as const,
  COMPRESSION_FORMAT: 'gzip' as const
};
