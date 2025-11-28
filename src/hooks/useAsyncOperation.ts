import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';

export interface AsyncOperationOptions {
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useAsyncOperation(options: AsyncOperationOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(
    async <T,>(operation: () => Promise<T>): Promise<T | null> => {
      setIsLoading(true);
      try {
        const result = await operation();
        if (options.successMessage) {
          toast.success(options.successMessage);
        }
        options.onSuccess?.();
        return result;
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        if (options.errorMessage) {
          toast.error(options.errorMessage);
        }
        options.onError?.(errorObj);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  return { isLoading, execute };
}
