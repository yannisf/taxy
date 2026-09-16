/**
 * Data compression and decompression utilities
 */

import { gzip, ungzip } from 'pako';
import { CompressionError } from './errors';
import { CONFIG } from './config';
import { logger } from '../logger';

/**
 * Compresses data using native CompressionStream or pako fallback
 */
async function compressWithNativeAPI(data: Uint8Array): Promise<Uint8Array> {
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
  await writer.write(data as BufferSource);
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
}

/**
 * Decompresses data using native DecompressionStream or pako fallback
 */
async function decompressWithNativeAPI(compressedData: Uint8Array): Promise<Uint8Array> {
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
  await writer.write(compressedData as BufferSource);
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
}

/**
 * Compresses data using gzip compression (native API with pako fallback)
 */
export async function compressData(data: Uint8Array): Promise<Uint8Array> {
  try {
    // Try native CompressionStream first
    if (typeof CompressionStream !== 'undefined') {
      return await compressWithNativeAPI(data);
    }

    // Fallback to pako for browsers without CompressionStream support
    logger.info('Using pako for compression (native CompressionStream not available)');
    return gzip(data);
  } catch (error) {
    throw new CompressionError(`Failed to compress data: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Decompresses data using gzip decompression (native API with pako fallback)
 */
export async function decompressData(compressedData: Uint8Array): Promise<Uint8Array> {
  try {
    // Try native DecompressionStream first
    if (typeof DecompressionStream !== 'undefined') {
      return await decompressWithNativeAPI(compressedData);
    }

    // Fallback to pako for browsers without DecompressionStream support
    logger.info('Using pako for decompression (native DecompressionStream not available)');
    return ungzip(compressedData);
  } catch (error) {
    throw new CompressionError(`Failed to decompress data: ${error instanceof Error ? error.message : String(error)}`);
  }
}
