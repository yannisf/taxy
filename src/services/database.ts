import Dexie from 'dexie';
import type { Kid, Guardian, ClassRecord } from '../types/models';

export class ClassManagementDatabase extends Dexie {
  kids: Dexie.Table<Kid, string>;
  guardians: Dexie.Table<Guardian, string>;

  constructor() {
    super('ClassManagementDatabase');
    this.version(1).stores({
      kids: 'kid_id, name, surname, level, gender',
      guardians: 'guardian_id, name, surname'
    });

    this.kids = this.table('kids');
    this.guardians = this.table('guardians');
  }

  // Kid operations
  async addKid(kid: Kid) {
    return this.transaction('rw', this.kids, this.guardians, async () => {
      // First, add guardians if they don't exist
      for (const guardian of kid.guardians) {
        await this.guardians.put(guardian);
      }
      
      // Then add the kid
      return this.kids.put(kid);
    });
  }

  async getKids() {
    const kids = await this.kids.toArray();
    // Load guardians for each kid
    for (const kid of kids) {
      if (kid.guardians && kid.guardians.length > 0) {
        const guardianIds = kid.guardians.map(g => g.guardian_id).filter(id => id);
        if (guardianIds.length > 0) {
          const guardians = await this.guardians.where('guardian_id').anyOf(guardianIds).toArray();
          kid.guardians = guardians.length > 0 ? guardians : kid.guardians;
        }
      }
    }
    return kids;
  }

  async getKidById(id: string) {
    const kid = await this.kids.get(id);
    if (kid && kid.guardians && kid.guardians.length > 0) {
      // Load guardians for this kid
      const guardianIds = kid.guardians.map(g => g.guardian_id).filter(id => id);
      if (guardianIds.length > 0) {
        const guardians = await this.guardians.where('guardian_id').anyOf(guardianIds).toArray();
        kid.guardians = guardians.length > 0 ? guardians : kid.guardians;
      }
    }
    return kid;
  }

  async updateKid(id: string, updates: Partial<Kid>) {
    return this.kids.update(id, updates);
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
    return this.transaction('rw', this.kids, this.guardians, async () => {
      // Clear existing data
      await this.kids.clear();
      await this.guardians.clear();

      // Import new data
      for (const kid of data.kids) {
        await this.addKid(kid);
      }
    });
  }
}

export const db = new ClassManagementDatabase();
