/**
 * Secure JSON encryption and compression utility
 * 
 * Features:
 * - AES-GCM-256 encryption with PBKDF2 key derivation
 * - Gzip compression using native browser APIs
 * - Zero external dependencies
 * - Supports large JSON files (up to 5MB)
 * - Both console output and return values
 * - Comprehensive error handling
 */

// Custom error types for better debugging
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

// Configuration constants
const CONFIG = {
  SALT_LENGTH: 16,           // 16 bytes salt
  IV_LENGTH: 12,             // 12 bytes IV for AES-GCM
  KEY_LENGTH: 256,           // 256-bit key
  PBKDF2_ITERATIONS: 100000, // 100,000 iterations for key derivation
  ALGORITHM: 'AES-GCM' as const,
  HASH_ALGORITHM: 'SHA-256' as const,
  COMPRESSION_FORMAT: 'gzip' as const
};

/**
 * Derives a cryptographic key from a password using PBKDF2
 */
async function deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
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
        salt: salt,
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
 * Compresses data using gzip compression
 */
async function compressData(data: Uint8Array): Promise<Uint8Array> {
  try {
    const stream = new CompressionStream(CONFIG.COMPRESSION_FORMAT);
    const writer = stream.writable.getWriter();
    const reader = stream.readable.getReader();

    // Start reading in parallel with writing
    const chunks: Uint8Array[] = [];
    let totalLength = 0;

    const readPromise = (async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        totalLength += value.length;
      }
    })();

    // Write data to compression stream
    await writer.write(data);
    await writer.close();

    // Wait for reading to complete
    await readPromise;

    // Combine chunks into single array
    const compressed = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      compressed.set(chunk, offset);
      offset += chunk.length;
    }

    return compressed;
  } catch (error) {
    throw new CompressionError(`Failed to compress data: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Decompresses data using gzip decompression
 */
async function decompressData(compressedData: Uint8Array): Promise<Uint8Array> {
  try {
    const stream = new DecompressionStream(CONFIG.COMPRESSION_FORMAT);
    const writer = stream.writable.getWriter();
    const reader = stream.readable.getReader();

    // Start reading in parallel with writing
    const chunks: Uint8Array[] = [];
    let totalLength = 0;

    const readPromise = (async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        totalLength += value.length;
      }
    })();

    // Write compressed data to decompression stream
    await writer.write(compressedData);
    await writer.close();

    // Wait for reading to complete
    await readPromise;

    // Combine chunks into single array
    const decompressed = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      decompressed.set(chunk, offset);
      offset += chunk.length;
    }

    return decompressed;
  } catch (error) {
    throw new CompressionError(`Failed to decompress data: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Converts a Uint8Array to Base64 string
 */
function uint8ArrayToBase64(data: Uint8Array): string {
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
function base64ToUint8Array(base64: string): Uint8Array {
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
    console.log('🔄 Starting encryption and compression process...');
    const startTime = performance.now();
    
    // Step 1: Convert JSON to string
    console.log('📝 Converting JSON to string...');
    const jsonString = JSON.stringify(data);
    const originalSize = new TextEncoder().encode(jsonString).length;
    console.log(`📊 Original size: ${(originalSize / 1024).toFixed(2)} KB`);
    
    // Step 2: Convert to bytes
    const encoder = new TextEncoder();
    const jsonBytes = encoder.encode(jsonString);
    
    // Step 3: Compress with gzip
    console.log('🗜️ Compressing data...');
    const compressedData = await compressData(jsonBytes);
    const compressedSize = compressedData.length;
    const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
    console.log(`📉 Compressed size: ${(compressedSize / 1024).toFixed(2)} KB (${compressionRatio}% reduction)`);
    
    // Step 4: Generate random salt and IV
    console.log('🔐 Generating encryption parameters...');
    const salt = new Uint8Array(CONFIG.SALT_LENGTH);
    const iv = new Uint8Array(CONFIG.IV_LENGTH);
    crypto.getRandomValues(salt);
    crypto.getRandomValues(iv);
    
    // Step 5: Derive key from password
    console.log('🔑 Deriving encryption key...');
    const key = await deriveKeyFromPassword(password, salt);
    
    // Step 6: Encrypt with AES-GCM
    console.log('🔒 Encrypting data...');
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: CONFIG.ALGORITHM,
        iv: iv,
      },
      key,
      compressedData
    );
    
    // Step 7: Combine salt + iv + encrypted data
    const encryptedBytes = new Uint8Array(encryptedData);
    const combined = new Uint8Array(salt.length + iv.length + encryptedBytes.length);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(encryptedBytes, salt.length + iv.length);
    
    // Step 8: Convert to Base64
    console.log('🎯 Encoding to Base64...');
    const base64Result = uint8ArrayToBase64(combined);
    
    const endTime = performance.now();
    const processingTime = (endTime - startTime).toFixed(2);
    
    console.log('✅ Encryption and compression completed successfully!');
    console.log(`⚡ Processing time: ${processingTime}ms`);
    console.log(`📤 Final size: ${(base64Result.length / 1024).toFixed(2)} KB`);
    console.log('🔐 Encrypted and compressed data:');
    console.log(base64Result);
    
    return base64Result;
  } catch (error) {
    console.error('❌ Encryption failed:', error);
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
    console.log('🔄 Starting decryption and decompression process...');
    const startTime = performance.now();
    
    // Step 1: Convert from Base64
    console.log('🎯 Decoding from Base64...');
    const combined = base64ToUint8Array(encryptedData);
    
    // Step 2: Extract salt, IV, and encrypted data
    if (combined.length < CONFIG.SALT_LENGTH + CONFIG.IV_LENGTH + 1) {
      throw new CorruptedDataError('Encrypted data is too short to contain valid salt, IV, and encrypted content');
    }
    
    console.log('🔍 Extracting encryption parameters...');
    const salt = combined.slice(0, CONFIG.SALT_LENGTH);
    const iv = combined.slice(CONFIG.SALT_LENGTH, CONFIG.SALT_LENGTH + CONFIG.IV_LENGTH);
    const encryptedBytes = combined.slice(CONFIG.SALT_LENGTH + CONFIG.IV_LENGTH);
    
    // Step 3: Derive key from password
    console.log('🔑 Deriving decryption key...');
    const key = await deriveKeyFromPassword(password, salt);
    
    // Step 4: Decrypt with AES-GCM
    console.log('🔓 Decrypting data...');
    let decryptedData: ArrayBuffer;
    try {
      decryptedData = await crypto.subtle.decrypt(
        {
          name: CONFIG.ALGORITHM,
          iv: iv,
        },
        key,
        encryptedBytes
      );
    } catch {
      throw new InvalidPasswordError('Decryption failed - invalid password or corrupted data');
    }
    
    // Step 5: Decompress with gzip
    console.log('📈 Decompressing data...');
    const decompressedData = await decompressData(new Uint8Array(decryptedData));
    
    // Step 6: Convert to string and parse JSON
    console.log('📝 Converting to JSON...');
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
    
    console.log('✅ Decryption and decompression completed successfully!');
    console.log(`⚡ Processing time: ${processingTime}ms`);
    console.log('📤 Decrypted data:');
    console.log(result);
    
    return result;
  } catch (error) {
    console.error('❌ Decryption failed:', error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new CryptoError(`Decryption failed: ${String(error)}`);
    }
  }
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

/**
 * Utility function to validate browser support
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
