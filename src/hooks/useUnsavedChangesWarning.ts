import { useBlocker } from 'react-router-dom';

export interface NavigationBlocker {
  state: 'unblocked' | 'blocked';
  proceed: (() => void) | null;
  reset: (() => void) | null;
  location?: string;
}

/**
 * Hook to warn users about unsaved changes when navigating away
 * @param shouldBlock - Function that returns whether to block navigation
 */
export function useUnsavedChangesWarning(
  shouldBlock: () => boolean
): NavigationBlocker {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      shouldBlock() &&
      currentLocation.pathname !== nextLocation.pathname
  );

  return {
    state: blocker.state === 'blocked' ? 'blocked' : 'unblocked',
    proceed: blocker.state === 'blocked' ? () => blocker.proceed?.() : null,
    reset: blocker.state === 'blocked' ? () => blocker.reset?.() : null,
    location: blocker.state === 'blocked' ? blocker.location?.pathname : undefined,
  };
}
