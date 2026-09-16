import React, { useState, useCallback, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { db } from '../services/database';
import { logger } from '../utils/logger';
import { KidsContext } from '../hooks/useKids';
import type { KidsContextType } from '../hooks/useKids';
import type { Kid } from '../types/models';

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
      logger.error('Error fetching kids:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load kids on mount
  useEffect(() => {
    refreshKids();
  }, [refreshKids]);

  const value = useMemo<KidsContextType>(() => ({
    kids,
    refreshKids,
    loading
  }), [kids, refreshKids, loading]);

  return (
    <KidsContext.Provider value={value}>
      {children}
    </KidsContext.Provider>
  );
};
