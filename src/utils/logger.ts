/**
 * Logging utility for the application
 * Provides consistent logging with automatic production suppression
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  /**
   * Debug-level logging - only shown in development
   * Use for detailed diagnostic information
   */
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  },

  /**
   * Info-level logging - only shown in development
   * Use for general informational messages
   */
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info('[INFO]', ...args);
    }
  },

  /**
   * Warning-level logging - shown in all environments
   * Use for potentially problematic situations
   */
  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args);
  },

  /**
   * Error-level logging - shown in all environments
   * Use for error conditions
   */
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
  },

  /**
   * Group start - only shown in development
   * Use for grouping related log messages
   */
  group: (label: string) => {
    if (isDevelopment) {
      console.group(label);
    }
  },

  /**
   * Group end - only shown in development
   */
  groupEnd: () => {
    if (isDevelopment) {
      console.groupEnd();
    }
  },

  /**
   * Time tracking start - only shown in development
   * Use for performance measurements
   */
  time: (label: string) => {
    if (isDevelopment) {
      console.time(label);
    }
  },

  /**
   * Time tracking end - only shown in development
   */
  timeEnd: (label: string) => {
    if (isDevelopment) {
      console.timeEnd(label);
    }
  }
};
