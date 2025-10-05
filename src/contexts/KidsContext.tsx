import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { db } from '../services/database';
import type { Kid } from '../types/models';

interface KidsContextType {
  kids: Kid[];
  refreshKids: () => Promise<void>;
  loading: boolean;
}

const KidsContext = createContext<KidsContextType | undefined>(undefined);

interface KidsProviderProps {
  children: ReactNode;
}

export const KidsProvider: React.FC<KidsProviderProps> = ({ children }) => {
  const [kids, setKids] = useState<Kid[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshKids = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedKids = await db.getKids();
      setKids(fetchedKids);
    } catch (error) {
      console.error('Error fetching kids:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    kids,
    refreshKids,
    loading
  };

  return (
    <KidsContext.Provider value={value}>
      {children}
    </KidsContext.Provider>
  );
};

export const useKids = () => {
  const context = useContext(KidsContext);
  if (context === undefined) {
    throw new Error('useKids must be used within a KidsProvider');
  }
  return context;
};
