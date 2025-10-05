import { v4 as uuidv4 } from 'uuid';

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
  name: string;
  surname: string;
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
  name: string;
  surname: string;
  preferred_name?: string;
  date_of_birth?: string;
  gender: 'male' | 'female' | 'other';
  level: 'pre-kindergartner' | 'kindergartner' | 'kindergartner-repeating';
  address?: Address;
  notes?: string | null;
  private_notes?: string | null;
  special_education: boolean;
  guardians: Guardian[];
  createdAt: string;
  updatedAt: string;
}

export interface ClassRecord {
  school_name: string;
  class_name: string;
  school_year: string;
  kids: Kid[];
}

// Utility function to create a new kid with default UUID
export function createKid(partialKid: Omit<Kid, 'kid_id' | 'createdAt' | 'updatedAt'>): Kid {
  const now = new Date().toISOString();
  return {
    kid_id: uuidv4(),
    createdAt: now,
    updatedAt: now,
    ...partialKid
  };
}
