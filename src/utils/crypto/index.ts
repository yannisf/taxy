/**
 * Secure JSON encryption and compression utility
 *
 * Features:
 * - AES-GCM-256 encryption with PBKDF2 key derivation
 * - Gzip compression using native browser APIs
 * - Zero external dependencies
 * - Supports large JSON files (up to 5MB)
 * - Comprehensive error handling
 */

import { logger } from '../logger';
import {
  CryptoError,
  InvalidPasswordError,
  CorruptedDataError
} from './errors';
import { CONFIG } from './config';
import { uint8ArrayToBase64, base64ToUint8Array } from './encoding';
import { compressData, decompressData } from './compression';
import {
  deriveKeyFromPassword,
  generateSalt,
  generateIV
} from './encryption';

// Re-export all error types and utilities
export * from './errors';
export { validateBrowserSupport, clearSensitiveData } from './validation';

/**
 * Encrypts, compresses, and encodes a JSON object
 *
 * @param data - The JSON object to encrypt
 * @param password - The password for encryption
 * @returns Promise<string> - Base64 encoded encrypted data
 */
export async function encryptAndCompressJSON(data: object, password: string): Promise<string> {
  if (!data || typeof data !== 'object') {
    throw new Error('Data must be a valid object');
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    throw new InvalidPasswordError('Password must be a non-empty string');
  }

  try {
    logger.info('🔄 Starting encryption and compression process...');
    const startTime = performance.now();

    // Step 1: Convert JSON to string
    logger.debug('📝 Converting JSON to string...');
    const jsonString = JSON.stringify(data);
    const originalSize = new TextEncoder().encode(jsonString).length;
    logger.debug(`📊 Original size: ${(originalSize / 1024).toFixed(2)} KB`);

    // Step 2: Convert to bytes
    const encoder = new TextEncoder();
    const jsonBytes = encoder.encode(jsonString);

    // Step 3: Compress with gzip
    logger.debug('🗜️ Compressing data...');
    const compressedData = await compressData(jsonBytes);
    const compressedSize = compressedData.length;
    const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
    logger.debug(`📉 Compressed size: ${(compressedSize / 1024).toFixed(2)} KB (${compressionRatio}% reduction)`);

    // Step 4: Generate random salt and IV
    logger.debug('🔐 Generating encryption parameters...');
    const salt = generateSalt();
    const iv = generateIV();

    // Step 5: Derive key from password
    logger.debug('🔑 Deriving encryption key...');
    const key = await deriveKeyFromPassword(password, salt);

    // Step 6: Encrypt with AES-GCM
    logger.debug('🔒 Encrypting data...');
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: CONFIG.ALGORITHM,
        iv: iv as BufferSource,
      },
      key,
      compressedData as BufferSource
    );

    // Step 7: Combine salt + iv + encrypted data
    const encryptedBytes = new Uint8Array(encryptedData);
    const combined = new Uint8Array(salt.length + iv.length + encryptedBytes.length);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(encryptedBytes, salt.length + iv.length);

    // Step 8: Convert to Base64
    logger.debug('🎯 Encoding to Base64...');
    const base64Result = uint8ArrayToBase64(combined);

    const endTime = performance.now();
    const processingTime = (endTime - startTime).toFixed(2);

    logger.info('✅ Encryption and compression completed successfully!');
    logger.debug(`⚡ Processing time: ${processingTime}ms`);
    logger.debug(`📤 Final size: ${(base64Result.length / 1024).toFixed(2)} KB`);

    return base64Result;
  } catch (error) {
    logger.error('❌ Encryption failed:', error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new CryptoError(`Encryption failed: ${String(error)}`);
    }
  }
}

/**
 * Decrypts, decompresses, and parses encrypted JSON data
 *
 * @param encryptedData - Base64 encoded encrypted data
 * @param password - The password for decryption
 * @returns Promise<object> - The decrypted JSON object
 */
export async function decryptAndDecompressJSON(encryptedData: string, password: string): Promise<object> {
  if (!encryptedData || typeof encryptedData !== 'string') {
    throw new CorruptedDataError('Encrypted data must be a valid Base64 string');
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    throw new InvalidPasswordError('Password must be a non-empty string');
  }

  try {
    logger.info('🔄 Starting decryption and decompression process...');
    const startTime = performance.now();

    // Step 1: Convert from Base64
    logger.debug('🎯 Decoding from Base64...');
    const combined = base64ToUint8Array(encryptedData);

    // Step 2: Extract salt, IV, and encrypted data
    if (combined.length < CONFIG.SALT_LENGTH + CONFIG.IV_LENGTH + 1) {
      throw new CorruptedDataError('Encrypted data is too short to contain valid salt, IV, and encrypted content');
    }

    logger.debug('🔍 Extracting encryption parameters...');
    const salt = combined.slice(0, CONFIG.SALT_LENGTH);
    const iv = combined.slice(CONFIG.SALT_LENGTH, CONFIG.SALT_LENGTH + CONFIG.IV_LENGTH);
    const encryptedBytes = combined.slice(CONFIG.SALT_LENGTH + CONFIG.IV_LENGTH);

    // Step 3: Derive key from password
    logger.debug('🔑 Deriving decryption key...');
    const key = await deriveKeyFromPassword(password, salt);

    // Step 4: Decrypt with AES-GCM
    logger.debug('🔓 Decrypting data...');
    let decryptedData: ArrayBuffer;
    try {
      decryptedData = await crypto.subtle.decrypt(
        {
          name: CONFIG.ALGORITHM,
          iv: iv as BufferSource,
        },
        key,
        encryptedBytes as BufferSource
      );
    } catch {
      throw new InvalidPasswordError('Decryption failed - invalid password or corrupted data');
    }

    // Step 5: Decompress with gzip
    logger.debug('📈 Decompressing data...');
    const decompressedData = await decompressData(new Uint8Array(decryptedData));

    // Step 6: Convert to string and parse JSON
    logger.debug('📝 Converting to JSON...');
    const decoder = new TextDecoder();
    const jsonString = decoder.decode(decompressedData);

    let result: object;
    try {
      result = JSON.parse(jsonString);
    } catch (error) {
      throw new CorruptedDataError(`Invalid JSON data: ${error instanceof Error ? error.message : String(error)}`);
    }

    const endTime = performance.now();
    const processingTime = (endTime - startTime).toFixed(2);

    logger.info('✅ Decryption and decompression completed successfully!');
    logger.debug(`⚡ Processing time: ${processingTime}ms`);

    return result;
  } catch (error) {
    logger.error('❌ Decryption failed:', error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new CryptoError(`Decryption failed: ${String(error)}`);
    }
  }
}
