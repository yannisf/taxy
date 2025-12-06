import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

export interface AsyncActionOptions<T> {
  /**
   * Success message to show in toast notification
   */
  successMessage?: string;

  /**
   * Error message to show in toast notification
   * If not provided, uses generic error message
   */
  errorMessage?: string;

  /**
   * Callback to execute on successful completion
   */
  onSuccess?: (result: T) => void | Promise<void>;

  /**
   * Callback to execute on error
   */
  onError?: (error: Error) => void | Promise<void>;

  /**
   * If true, suppresses error toast
   * Useful when you want to handle errors manually
   */
  suppressErrorToast?: boolean;

  /**
   * If true, suppresses success toast
   * Useful when success is implied by navigation or other UI changes
   */
  suppressSuccessToast?: boolean;
}

/**
 * Hook for executing async actions with standardized error handling and toast notifications
 *
 * @example
 * ```typescript
 * const executeAction = useAsyncAction();
 *
 * await executeAction(
 *   () => deleteClass(classId),
 *   {
 *     successMessage: t('classDeleted'),
 *     errorMessage: t('failedToDeleteClass'),
 *     onSuccess: () => navigate('/kids')
 *   }
 * );
 * ```
 */
export function useAsyncAction() {
  const { t } = useTranslation();

  return useCallback(
    async <T,>(
      action: () => Promise<T>,
      options: AsyncActionOptions<T> = {}
    ): Promise<T> => {
      try {
        const result = await action();

        if (!options.suppressSuccessToast && options.successMessage) {
          toast.success(options.successMessage);
        }

        if (options.onSuccess) {
          await options.onSuccess(result);
        }

        return result;
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));

        if (!options.suppressErrorToast) {
          const message = options.errorMessage || t('unexpectedError');
          toast.error(message);
        }

        if (options.onError) {
          await options.onError(errorObj);
        }

        throw error;
      }
    },
    [t]
  );
}
