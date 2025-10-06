import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { db } from '../services/database';
import type { Class } from '../types/models';

interface ClassContextType {
  classes: Class[];
  selectedClass: Class | null;
  loading: boolean;
  refreshClasses: () => Promise<void>;
  selectClass: (classId: string) => Promise<void>;
  clearSelectedClass: () => void;
  createClass: (classData: Omit<Class, 'class_id' | 'created_at' | 'updated_at' | 'kid_ids'>) => Promise<Class>;
  updateClass: (classId: string, classData: { school_name: string; class_name: string; school_year: string }) => Promise<void>;
  deleteClass: (classId: string) => Promise<void>;
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

interface ClassProviderProps {
  children: ReactNode;
}

const SELECTED_CLASS_KEY = 'selectedClassId';

export const ClassProvider: React.FC<ClassProviderProps> = ({ children }) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshClasses = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedClasses = await db.getClasses();
      setClasses(fetchedClasses);
      
      // Check if selected class still exists
      if (selectedClass && !fetchedClasses.find(c => c.class_id === selectedClass.class_id)) {
        setSelectedClass(null);
        localStorage.removeItem(SELECTED_CLASS_KEY);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedClass?.class_id]);

  const selectClass = useCallback(async (classId: string) => {
    try {
      const classObj = await db.getClassById(classId);
      if (classObj) {
        setSelectedClass(classObj);
        localStorage.setItem(SELECTED_CLASS_KEY, classId);
      }
    } catch (error) {
      console.error('Error selecting class:', error);
    }
  }, []);

  const clearSelectedClass = useCallback(() => {
    setSelectedClass(null);
    localStorage.removeItem(SELECTED_CLASS_KEY);
  }, []);

  const createClass = useCallback(async (classData: Omit<Class, 'class_id' | 'created_at' | 'updated_at' | 'kid_ids'>) => {
    try {
      const { createClass } = await import('../types/models');
      const newClass = createClass(classData);
      await db.addClass(newClass);
      await refreshClasses();
      return newClass;
    } catch (error) {
      console.error('Error creating class:', error);
      throw error;
    }
  }, [refreshClasses]);

  const updateClass = useCallback(async (classId: string, classData: { school_name: string; class_name: string; school_year: string }) => {
    try {
      await db.updateClass(classId, classData);
      
      // If the updated class is the selected one, update the selected class state
      if (selectedClass?.class_id === classId) {
        const updatedClass = await db.getClassById(classId);
        if (updatedClass) {
          setSelectedClass(updatedClass);
        }
      }
      
      await refreshClasses();
    } catch (error) {
      console.error('Error updating class:', error);
      throw error;
    }
  }, [selectedClass, refreshClasses]);

  const deleteClass = useCallback(async (classId: string) => {
    try {
      await db.deleteClass(classId);
      if (selectedClass?.class_id === classId) {
        clearSelectedClass();
      }
      await refreshClasses();
    } catch (error) {
      console.error('Error deleting class:', error);
      throw error;
    }
  }, [selectedClass, clearSelectedClass, refreshClasses]);

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
          console.error('Error restoring selected class:', error);
          localStorage.removeItem(SELECTED_CLASS_KEY);
        }
      }
    };

    initializeClasses();
  }, []);

  const value = {
    classes,
    selectedClass,
    loading,
    refreshClasses,
    selectClass,
    clearSelectedClass,
    createClass,
    updateClass,
    deleteClass
  };

  return (
    <ClassContext.Provider value={value}>
      {children}
    </ClassContext.Provider>
  );
};

export const useClass = () => {
  const context = useContext(ClassContext);
  if (context === undefined) {
    throw new Error('useClass must be used within a ClassProvider');
  }
  return context;
};
