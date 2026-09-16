import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { db } from '../services/database';
import type { Class } from '../types/models';
import { createClass as createClassModel } from '../types/models';
import { logger } from '../utils/logger';
import { ClassContext } from '../hooks/useClass';
import type { ClassContextType } from '../hooks/useClass';

interface ClassProviderProps {
  children: ReactNode;
}

const SELECTED_CLASS_KEY = 'selectedClassId';

export const ClassProvider: React.FC<ClassProviderProps> = ({ children }) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [loading, setLoading] = useState(false);

  // Mirrors selectedClass so callbacks below can read the latest value
  // without depending on it (which would make them unstable).
  const selectedClassRef = useRef(selectedClass);
  useEffect(() => {
    selectedClassRef.current = selectedClass;
  }, [selectedClass]);

  const refreshClasses = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedClasses = await db.getClasses();
      setClasses(fetchedClasses);

      // Check if selected class still exists
      const current = selectedClassRef.current;
      if (current && !fetchedClasses.find(c => c.class_id === current.class_id)) {
        setSelectedClass(null);
        localStorage.removeItem(SELECTED_CLASS_KEY);
      }
    } catch (error) {
      logger.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const selectClass = useCallback(async (classId: string) => {
    try {
      const classObj = await db.getClassById(classId);
      if (classObj) {
        setSelectedClass(classObj);
        localStorage.setItem(SELECTED_CLASS_KEY, classId);
      }
    } catch (error) {
      logger.error('Error selecting class:', error);
    }
  }, []);

  const clearSelectedClass = useCallback(() => {
    setSelectedClass(null);
    localStorage.removeItem(SELECTED_CLASS_KEY);
  }, []);

  const createClass = useCallback(async (classData: Omit<Class, 'class_id' | 'created_at' | 'updated_at' | 'kid_ids'>) => {
    try {
      const newClass = createClassModel(classData);
      await db.addClass(newClass);
      await refreshClasses();
      return newClass;
    } catch (error) {
      logger.error('Error creating class:', error);
      throw error;
    }
  }, [refreshClasses]);

  const updateClass = useCallback(async (classId: string, classData: { school_name: string; class_name: string; school_year: string }) => {
    try {
      await db.updateClass(classId, classData);

      // If the updated class is the selected one, update the selected class state
      if (selectedClassRef.current?.class_id === classId) {
        const updatedClass = await db.getClassById(classId);
        if (updatedClass) {
          setSelectedClass(updatedClass);
        }
      }

      await refreshClasses();
    } catch (error) {
      logger.error('Error updating class:', error);
      throw error;
    }
  }, [refreshClasses]);

  const deleteClass = useCallback(async (classId: string) => {
    try {
      await db.deleteClass(classId);
      if (selectedClassRef.current?.class_id === classId) {
        clearSelectedClass();
      }
      await refreshClasses();
    } catch (error) {
      logger.error('Error deleting class:', error);
      throw error;
    }
  }, [refreshClasses, clearSelectedClass]);

  // Load classes and restore selected class on mount
  useEffect(() => {
    const initializeClasses = async () => {
      await refreshClasses();

      // Try to restore selected class from localStorage
      const savedClassId = localStorage.getItem(SELECTED_CLASS_KEY);
      if (savedClassId) {
        try {
          const classObj = await db.getClassById(savedClassId);
          if (classObj) {
            setSelectedClass(classObj);
          } else {
            localStorage.removeItem(SELECTED_CLASS_KEY);
          }
        } catch (error) {
          logger.error('Error restoring selected class:', error);
          localStorage.removeItem(SELECTED_CLASS_KEY);
        }
      }
    };

    initializeClasses();
  }, [refreshClasses]);

  const value = useMemo<ClassContextType>(() => ({
    classes,
    selectedClass,
    loading,
    refreshClasses,
    selectClass,
    clearSelectedClass,
    createClass,
    updateClass,
    deleteClass
  }), [classes, selectedClass, loading, refreshClasses, selectClass, clearSelectedClass, createClass, updateClass, deleteClass]);

  return (
    <ClassContext.Provider value={value}>
      {children}
    </ClassContext.Provider>
  );
};
