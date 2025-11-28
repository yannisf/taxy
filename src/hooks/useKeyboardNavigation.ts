import { useEffect } from 'react';

export interface KeyboardHandler {
  key: string;
  handler: () => void;
  skipOnInputFocused?: boolean;
}

/**
 * Custom hook for handling keyboard navigation
 * Prevents navigation when input/textarea elements are focused
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

        if (event.key.toLowerCase() === handler.key.toLowerCase()) {
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
