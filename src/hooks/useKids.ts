import { createContext, useContext } from 'react';
import type { Kid } from '../types/models';

export interface KidsContextType {
  kids: Kid[];
  refreshKids: () => Promise<void>;
  loading: boolean;
}

export const KidsContext = createContext<KidsContextType | undefined>(undefined);

export const useKids = () => {
  const context = useContext(KidsContext);
  if (context === undefined) {
    throw new Error('useKids must be used within a KidsProvider');
  }
  return context;
};
