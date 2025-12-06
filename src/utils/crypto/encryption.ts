/**
 * Encryption and key derivation utilities
 */

import { CryptoError } from './errors';
import { CONFIG } from './config';

/**
 * Derives a cryptographic key from a password using PBKDF2
 */
export async function deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
  try {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    // Import the password as a key for PBKDF2
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveKey']
    );

    // Derive the AES key
    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as BufferSource,
        iterations: CONFIG.PBKDF2_ITERATIONS,
        hash: CONFIG.HASH_ALGORITHM,
      },
      keyMaterial,
      {
        name: CONFIG.ALGORITHM,
        length: CONFIG.KEY_LENGTH,
      },
      false,
      ['encrypt', 'decrypt']
    );

    // Clear password from memory (best effort)
    passwordBuffer.fill(0);

    return derivedKey;
  } catch (error) {
    throw new CryptoError(`Failed to derive key from password: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Encrypts data using AES-GCM
 */
export async function encryptData(
  data: Uint8Array,
  key: CryptoKey,
  iv: Uint8Array
): Promise<Uint8Array> {
  try {
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: CONFIG.ALGORITHM,
        iv: iv as BufferSource,
      },
      key,
      data as BufferSource
    );

    return new Uint8Array(encryptedData);
  } catch (error) {
    throw new CryptoError(`Failed to encrypt data: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Decrypts data using AES-GCM
 */
export async function decryptData(
  encryptedData: Uint8Array,
  key: CryptoKey,
  iv: Uint8Array
): Promise<Uint8Array> {
  try {
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: CONFIG.ALGORITHM,
        iv: iv as BufferSource,
      },
      key,
      encryptedData as BufferSource
    );

    return new Uint8Array(decryptedData);
  } catch (error) {
    throw new CryptoError(`Failed to decrypt data: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Generates random salt
 */
export function generateSalt(): Uint8Array {
  const salt = new Uint8Array(CONFIG.SALT_LENGTH);
  crypto.getRandomValues(salt);
  return salt;
}

/**
 * Generates random initialization vector (IV)
 */
export function generateIV(): Uint8Array {
  const iv = new Uint8Array(CONFIG.IV_LENGTH);
  crypto.getRandomValues(iv);
  return iv;
}
