import { useState, useEffect } from 'react';
import { db } from '../services/database';
import { useKids } from './useKids';
import { useClass } from './useClass';
import type { Kid } from '../types/models';
import { logger } from '../utils/logger';

/**
 * Custom hook to get kids filtered by the currently selected class
 * @returns Array of kids in the selected class, sorted by name
 */
export const useClassKids = (): Kid[] => {
  const { kids } = useKids();
  const { selectedClass } = useClass();
  const [classKids, setClassKids] = useState<Kid[]>([]);

  useEffect(() => {
    const filterKidsByClass = async () => {
      if (selectedClass) {
        try {
          const filteredKids = await db.getKidsByClassId(selectedClass.class_id);
          
          // Sort kids by preferred name (if exists) or legal name, then by surname
          const sortedKids = [...filteredKids].sort((a, b) => {
            const aFirstName = a.preferred_name || a.first_name;
            const bFirstName = b.preferred_name || b.first_name;
            
            if (aFirstName.toLowerCase() !== bFirstName.toLowerCase()) {
              return aFirstName.toLowerCase().localeCompare(bFirstName.toLowerCase());
            }
            
            return a.last_name.toLowerCase().localeCompare(b.last_name.toLowerCase());
          });
          
          setClassKids(sortedKids);
        } catch (error) {
          logger.error('Error filtering kids by class:', error);
          setClassKids([]);
        }
      } else {
        setClassKids([]);
      }
    };

    filterKidsByClass();
  }, [selectedClass, kids]);

  return classKids;
};
