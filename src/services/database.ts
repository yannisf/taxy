import Dexie from 'dexie';
import type { Kid, Class, ClassRecord, ClassExport } from '../types/models';
import type { ImportStatistics } from '../utils/importUtils';
import { logger } from '../utils/logger';

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

    // Version 4: Add class_id index to kids, migrate from kid_ids array to class_id property
    this.version(4).stores({
      kids: 'kid_id, first_name, last_name, level, gender, created_at, updated_at, class_id',
      classes: 'class_id, school_name, class_name, school_year, created_at, updated_at'
    }).upgrade(async trans => {
      // Build mapping of kid_id -> class_id from existing class.kid_ids arrays
      const classesTable = trans.table('classes');
      const kidsTable = trans.table('kids');

      const allClasses = await classesTable.toArray();
      const kidToClassMap = new Map<string, string>();
      const kidsInMultipleClasses = new Set<string>();

      // Build mapping: kid_id -> class_id
      for (const classObj of allClasses) {
        // Handle v3 schema that has kid_ids array
        const kidIds = (classObj as any).kid_ids || [];
        for (const kidId of kidIds) {
          if (kidToClassMap.has(kidId)) {
            kidsInMultipleClasses.add(kidId);
            logger.warn(`Migration v4: Kid ${kidId} found in multiple classes. Using first occurrence.`);
          } else {
            kidToClassMap.set(kidId, classObj.class_id);
          }
        }
      }

      // Update all kids with their class_id
      const orphanedKids: string[] = [];
      await kidsTable.toCollection().modify((kid: any, ref) => {
        const classId = kidToClassMap.get(kid.kid_id);
        if (classId) {
          ref.value = {
            ...kid,
            class_id: classId,
            updated_at: new Date().toISOString()
          };
        } else {
          orphanedKids.push(`${kid.first_name} ${kid.last_name} (${kid.kid_id})`);
        }
      });

      // Fail migration if there are orphaned kids
      if (orphanedKids.length > 0) {
        throw new Error(
          `Migration v4 failed: Found ${orphanedKids.length} orphaned kid(s) with no class assignment:\n` +
          orphanedKids.join('\n') +
          '\n\nPlease assign these kids to a class before upgrading.'
        );
      }

      // Remove kid_ids from all classes
      await classesTable.toCollection().modify((classObj: any) => {
        const { kid_ids, ...classWithoutKidIds } = classObj;
        const updated = {
          ...classWithoutKidIds,
          updated_at: new Date().toISOString()
        };
        Object.assign(classObj, updated);
      });
    });

    // Version 5: Gender is now nullable and limited to male/female; clear 'other'
    this.version(5).stores({
      kids: 'kid_id, first_name, last_name, level, gender, created_at, updated_at, class_id',
      classes: 'class_id, school_name, class_name, school_year, created_at, updated_at'
    }).upgrade(trans => {
      return trans.table('kids').toCollection().modify((kid: Kid) => {
        if (kid.gender !== 'male' && kid.gender !== 'female') {
          kid.gender = null;
        }
      });
    });

    this.kids = this.table('kids');
    this.classes = this.table('classes');
  }

  // Kid operations
  async addKid(kid: Kid) {
    // Validate class_id is present
    if (!kid.class_id) {
      throw new Error('class_id is required when adding a kid');
    }

    // Validate the class exists
    const classExists = await this.getClassById(kid.class_id);
    if (!classExists) {
      throw new Error(`Class with ID ${kid.class_id} not found`);
    }

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
    // Simply delete the kid - no need to update classes since kids now have class_id
    return this.kids.delete(id);
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
    const kidsCount = await this.getKidsCountByClassId(id);
    if (kidsCount > 0) {
      throw new Error('Cannot delete class that contains kids. Remove all kids first.');
    }
    return this.classes.delete(id);
  }

  async moveKidToClass(kidId: string, newClassId: string) {
    const kid = await this.getKidById(kidId);
    const newClass = await this.getClassById(newClassId);

    if (!kid) throw new Error('Kid not found');
    if (!newClass) throw new Error('Class not found');

    await this.updateKid(kidId, { class_id: newClassId });
  }

  async moveKidsToClass(kidIds: string[], newClassId: string) {
    const newClass = await this.getClassById(newClassId);
    if (!newClass) throw new Error('Class not found');

    for (const kidId of kidIds) {
      const kid = await this.getKidById(kidId);
      if (kid) {
        await this.updateKid(kidId, { class_id: newClassId });
      }
    }
  }

  async getKidsByClassId(classId: string): Promise<Kid[]> {
    return this.kids.where('class_id').equals(classId).toArray();
  }

  async getKidsCountByClassId(classId: string): Promise<number> {
    return this.kids.where('class_id').equals(classId).count();
  }

  // Guardian operations
  async getGuardiansByKid(kidId: string) {
    const kid = await this.getKidById(kidId);
    return kid ? kid.guardians : [];
  }

  // Export/Import (class-scoped)
  async exportClassData(classId: string): Promise<ClassExport> {
    const classObj = await this.getClassById(classId);
    if (!classObj) throw new Error('Class not found');

    const kids = await this.getKidsByClassId(classId);

    return {
      class: classObj,
      kids
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

  // Merge kids to a specific class with transaction support for import functionality
  // Imports all kids from the file, overriding any existing kids with the same kid_id
  async mergeKidsToClass(classId: string, kidsToMerge: Kid[]): Promise<ImportStatistics> {
    return this.transaction('rw', [this.kids, this.classes], async () => {
      // Get the class to ensure it exists
      const classObj = await this.getClassById(classId);
      if (!classObj) {
        throw new Error('Class not found');
      }

      // Get existing kids in this class
      const existingClassKids = await this.getKidsByClassId(classId);

      // Process each kid in the import - set class_id and preserve timestamps
      for (const kid of kidsToMerge) {
        const existingKid = existingClassKids.find(k => k.kid_id === kid.kid_id);
        const processedKid = {
          ...kid,
          class_id: classId, // Ensure class_id is set to target class
          created_at: existingKid?.created_at || kid.created_at,
          updated_at: new Date().toISOString()
        };
        await this.kids.put(processedKid);
      }

      // Get final count of kids in the class
      const finalKidsCount = await this.getKidsCountByClassId(classId);

      return {
        totalImported: kidsToMerge.length,
        totalInClass: finalKidsCount
      };
    });
  }
}

export const db = new ClassManagementDatabase();
