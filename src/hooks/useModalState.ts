import { useState } from 'react';

export interface ModalState {
  show: boolean;
  isLoading: boolean;
}

export interface ModalStateActions {
  open: () => void;
  close: () => void;
  setLoading: (loading: boolean) => void;
}

/**
 * Custom hook for managing modal state (show/hide and loading state)
 */
export function useModalState(initialShow: boolean = false): ModalState & ModalStateActions {
  const [show, setShow] = useState(initialShow);
  const [isLoading, setIsLoading] = useState(false);

  return {
    show,
    isLoading,
    open: () => setShow(true),
    close: () => setShow(false),
    setLoading: (loading: boolean) => setIsLoading(loading),
  };
}

/**
 * Custom hook for managing dropdown state
 */
export function useDropdownState(initialOpen: boolean = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: (open?: boolean) => setIsOpen(open !== undefined ? open : !isOpen),
  };
}
