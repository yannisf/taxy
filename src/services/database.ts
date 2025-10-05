import Dexie from 'dexie';
import type { Kid, ClassRecord } from '../types/models';
import type { ImportStatistics } from '../utils/importUtils';

export class ClassManagementDatabase extends Dexie {
  kids: Dexie.Table<Kid, string>;

  constructor() {
    super('ClassManagementDatabase');
    
    // Version 1: Original schema
    this.version(1).stores({
      kids: 'kid_id, name, surname, level, gender'
    });

    // Version 2: Add timestamp fields
    this.version(2).stores({
      kids: 'kid_id, name, surname, level, gender, createdAt, updatedAt'
    }).upgrade(trans => {
      // Migrate existing records to include timestamps
      return trans.table('kids').toCollection().modify(kid => {
        const now = new Date().toISOString();
        if (!kid.createdAt) {
          kid.createdAt = now;
        }
        if (!kid.updatedAt) {
          kid.updatedAt = now;
        }
      });
    });

    this.kids = this.table('kids');
  }

  // Kid operations
  async addKid(kid: Kid) {
    // Ensure createdAt is set if not already present (for new kids)
    if (!kid.createdAt) {
      const now = new Date().toISOString();
      kid.createdAt = now;
      kid.updatedAt = now;
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
    // Automatically set updatedAt timestamp on every update
    const updatesWithTimestamp = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return this.kids.update(id, updatesWithTimestamp);
  }

  async deleteKid(id: string) {
    return this.kids.delete(id);
  }

  // Guardian operations
  async getGuardiansByKid(kidId: string) {
    const kid = await this.getKidById(kidId);
    return kid ? kid.guardians : [];
  }

  // Export/Import
  async exportData(): Promise<ClassRecord> {
    const kids = await this.getKids();
    return {
      school_name: 'Default School',  // TODO: Make this configurable
      class_name: 'Default Class',    // TODO: Make this configurable
      school_year: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
      kids
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
          // Update existing kid - preserve original createdAt
          const existingKid = existingKids.find(k => k.kid_id === kid.kid_id);
          const updatedKid = {
            ...kid,
            createdAt: existingKid?.createdAt || kid.createdAt,
            updatedAt: new Date().toISOString()
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
