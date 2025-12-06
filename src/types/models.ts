import { nanoid } from 'nanoid';

export interface Address {
  street_name?: string;
  street_number?: string;
  neighborhood?: string;
  postal_code?: string;
  city?: string;
  country?: string;
}

export interface Telephone {
  country_code: string;
  number: string;
  telephone_type: 'mobile' | 'home' | 'work' | 'other';
}

export interface Guardian {
  first_name: string;
  last_name: string;
  relation_with_kid: 'father' | 'mother' | 'sibling' | 'grandparent' | 'extended family' | 'friend';
  authorized_for_pickup?: boolean;
  same_address_as_kid?: boolean;
  telephones?: Telephone[];
  email?: string;
  profession?: string;
  address?: Address;
}

export interface Kid {
  kid_id: string;
  class_id: string;
  first_name: string;
  last_name: string;
  preferred_name?: string;
  date_of_birth?: string;
  gender: 'male' | 'female' | 'other';
  level: 'pre-kindergartner' | 'kindergartner' | 'kindergartner-repeating';
  address?: Address;
  notes?: string | null;
  private_notes?: string | null;
  extended_day_care: boolean;
  special_education: boolean;
  guardians: Guardian[];
  created_at: string;
  updated_at: string;
}

export interface Class {
  class_id: string;
  school_name: string;
  class_name: string;
  school_year: string;
  created_at: string;
  updated_at: string;
}

export interface ClassRecord {
  class_id: string;
  school_name: string;
  class_name: string;
  school_year: string;
  kid_ids: string[];
  kids: Kid[];
  created_at: string;
  updated_at: string;
}

export interface ClassExport {
  class: Class;
  kids: Kid[];
}

// Utility function to create a new kid with default ID
// Note: class_id is required and must be provided
export function createKid(partialKid: Omit<Kid, 'kid_id' | 'created_at' | 'updated_at'>): Kid {
  const now = new Date().toISOString();
  return {
    kid_id: nanoid(),
    created_at: now,
    updated_at: now,
    ...partialKid
  };
}

// Utility function to create a new class with default ID
export function createClass(partialClass: Omit<Class, 'class_id' | 'created_at' | 'updated_at'>): Class {
  const now = new Date().toISOString();
  return {
    class_id: nanoid(),
    created_at: now,
    updated_at: now,
    ...partialClass
  };
}
