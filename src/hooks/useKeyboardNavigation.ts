import { useEffect } from 'react';

export interface KeyboardHandler {
  key: string | string[];
  handler: () => void;
  skipOnInputFocused?: boolean;
}

/**
 * Custom hook for handling keyboard navigation
 * Prevents navigation when input/textarea elements are focused
 * Supports multiple keys per handler (e.g., ['e', 'ε'] for edit in English and Greek)
 */
export function useKeyboardNavigation(handlers: KeyboardHandler[]): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if an input or textarea is focused
      const isInputFocused =
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA';

      for (const handler of handlers) {
        const shouldSkip = handler.skipOnInputFocused !== false && isInputFocused;
        if (shouldSkip) continue;

        // Support both single key and array of keys
        const keys = Array.isArray(handler.key) ? handler.key : [handler.key];
        const matchesKey = keys.some(k => event.key.toLowerCase() === k.toLowerCase());

        if (matchesKey) {
          event.preventDefault();
          handler.handler();
          return; // Stop after first match
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlers]);
}
