import { createContext, useContext } from 'react';
import type { Class } from '../types/models';

export interface ClassContextType {
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

export const ClassContext = createContext<ClassContextType | undefined>(undefined);

export const useClass = () => {
  const context = useContext(ClassContext);
  if (context === undefined) {
    throw new Error('useClass must be used within a ClassProvider');
  }
  return context;
};
