import Dexie from 'dexie';
import type { Kid, Class, ClassRecord } from '../types/models';
import type { ImportStatistics } from '../utils/importUtils';

export class ClassManagementDatabase extends Dexie {
  kids: Dexie.Table<Kid, string>;
  classes: Dexie.Table<Class, string>;

  constructor() {
    super('ClassManagementDatabase');
    
    // Version 1: Original schema
    this.version(1).stores({
      kids: 'kid_id, first_name, last_name, level, gender'
    });

    // Version 2: Add timestamp fields
    this.version(2).stores({
      kids: 'kid_id, first_name, last_name, level, gender, created_at, updated_at'
    }).upgrade(trans => {
      // Migrate existing records to include timestamps
      return trans.table('kids').toCollection().modify(kid => {
        const now = new Date().toISOString();
        if (!kid.created_at) {
          kid.created_at = now;
        }
        if (!kid.updated_at) {
          kid.updated_at = now;
        }
      });
    });

    // Version 3: Add classes table
    this.version(3).stores({
      kids: 'kid_id, first_name, last_name, level, gender, created_at, updated_at',
      classes: 'class_id, school_name, class_name, school_year, created_at, updated_at'
    });

    this.kids = this.table('kids');
    this.classes = this.table('classes');
  }

  // Kid operations
  async addKid(kid: Kid) {
    // Ensure created_at is set if not already present (for new kids)
    if (!kid.created_at) {
      const now = new Date().toISOString();
      kid.created_at = now;
      kid.updated_at = now;
    }
    return this.kids.put(kid);
  }

  async getKids() {
    return this.kids.toArray();
  }

  async getKidById(id: string) {
    return this.kids.get(id);
  }

  async updateKid(id: string, updates: Partial<Kid>) {
    // Automatically set updated_at timestamp on every update
    const updatesWithTimestamp = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    return this.kids.update(id, updatesWithTimestamp);
  }

  async deleteKid(id: string) {
    return this.transaction('rw', [this.kids, this.classes], async () => {
      // Remove kid from all classes
      const classes = await this.classes.toArray();
      for (const classObj of classes) {
        if (classObj.kid_ids.includes(id)) {
          const updatedKidIds = classObj.kid_ids.filter(kidId => kidId !== id);
          await this.classes.update(classObj.class_id, { 
            kid_ids: updatedKidIds,
            updated_at: new Date().toISOString()
          });
        }
      }
      
      // Delete the kid
      return this.kids.delete(id);
    });
  }

  // Class operations
  async addClass(classObj: Class) {
    if (!classObj.created_at) {
      const now = new Date().toISOString();
      classObj.created_at = now;
      classObj.updated_at = now;
    }
    return this.classes.put(classObj);
  }

  async getClasses() {
    return this.classes.toArray();
  }

  async getClassById(id: string) {
    return this.classes.get(id);
  }

  async updateClass(id: string, updates: Partial<Class>) {
    const updatesWithTimestamp = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    return this.classes.update(id, updatesWithTimestamp);
  }

  async deleteClass(id: string) {
    const classObj = await this.getClassById(id);
    if (classObj && classObj.kid_ids.length > 0) {
      throw new Error('Cannot delete class that contains kids. Remove all kids first.');
    }
    return this.classes.delete(id);
  }

  async addKidToClass(classId: string, kidId: string) {
    const classObj = await this.getClassById(classId);
    const kid = await this.getKidById(kidId);
    
    if (!classObj) throw new Error('Class not found');
    if (!kid) throw new Error('Kid not found');
    
    if (!classObj.kid_ids.includes(kidId)) {
      const updatedKidIds = [...classObj.kid_ids, kidId];
      await this.updateClass(classId, { kid_ids: updatedKidIds });
    }
  }

  async removeKidFromClass(classId: string, kidId: string) {
    const classObj = await this.getClassById(classId);
    if (!classObj) throw new Error('Class not found');
    
    const updatedKidIds = classObj.kid_ids.filter(id => id !== kidId);
    await this.updateClass(classId, { kid_ids: updatedKidIds });
  }

  async getKidsByClassId(classId: string) {
    const classObj = await this.getClassById(classId);
    if (!classObj) return [];
    
    const kids = await Promise.all(
      classObj.kid_ids.map(kidId => this.getKidById(kidId))
    );
    
    return kids.filter((kid): kid is Kid => kid !== undefined);
  }

  // Guardian operations
  async getGuardiansByKid(kidId: string) {
    const kid = await this.getKidById(kidId);
    return kid ? kid.guardians : [];
  }

  // Export/Import (class-scoped)
  async exportClassData(classId: string): Promise<ClassRecord> {
    const classObj = await this.getClassById(classId);
    if (!classObj) throw new Error('Class not found');
    
    const kids = await this.getKidsByClassId(classId);
    
    return {
      class_id: classObj.class_id,
      school_name: classObj.school_name,
      class_name: classObj.class_name,
      school_year: classObj.school_year,
      kid_ids: classObj.kid_ids,
      kids,
      created_at: classObj.created_at,
      updated_at: classObj.updated_at
    };
  }

  // Legacy export method (for backward compatibility)
  async exportData(): Promise<ClassRecord> {
    const kids = await this.getKids();
    const now = new Date().toISOString();
    
    return {
      class_id: 'legacy-export',
      school_name: 'Default School',
      class_name: 'Default Class',
      school_year: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
      kid_ids: kids.map(kid => kid.kid_id),
      kids,
      created_at: now,
      updated_at: now
    };
  }

  async importData(data: ClassRecord) {
    return this.transaction('rw', this.kids, async () => {
      // Clear existing data
      await this.kids.clear();

      // Import new data
      for (const kid of data.kids) {
        await this.addKid(kid);
      }
    });
  }

  // Merge kids with transaction support for import functionality
  async mergeKids(kidsToMerge: Kid[]): Promise<ImportStatistics> {
    return this.transaction('rw', this.kids, async () => {
      const existingKids = await this.getKids();
      const existingIds = new Set(existingKids.map(kid => kid.kid_id));
      
      let newKids = 0;
      let updatedKids = 0;
      
      // Process each kid in the import
      for (const kid of kidsToMerge) {
        if (existingIds.has(kid.kid_id)) {
          // Update existing kid - preserve original created_at
          const existingKid = existingKids.find(k => k.kid_id === kid.kid_id);
          const updatedKid = {
            ...kid,
            created_at: existingKid?.created_at || kid.created_at,
            updated_at: new Date().toISOString()
          };
          await this.kids.put(updatedKid);
          updatedKids++;
        } else {
          // Add new kid
          await this.addKid(kid);
          newKids++;
        }
      }
      
      // Calculate unchanged kids
      const importIds = new Set(kidsToMerge.map(kid => kid.kid_id));
      const unchangedKids = existingKids.filter(kid => !importIds.has(kid.kid_id)).length;
      
      return {
        newKids,
        updatedKids,
        unchangedKids,
        totalInFile: kidsToMerge.length,
        totalInDatabase: existingKids.length
      };
    });
  }
}

export const db = new ClassManagementDatabase();
