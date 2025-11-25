import type { Kid, Address } from '../types/models';

/**
 * Normalizes a string by removing accents and converting to lowercase
 * for case-insensitive and accent-insensitive comparison
 */
export function normalizeString(str: string): string {
  return str
    .normalize('NFD') // Decompose combined characters (é -> e + ́)
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
    .toLowerCase()
    .trim();
}

/**
 * Extracts unique first names and preferred names from a list of kids
 * Returns a sorted array of unique names
 */
export function extractUniqueFirstNames(kids: Kid[]): string[] {
  const namesSet = new Set<string>();

  kids.forEach(kid => {
    // Add first name if it exists
    if (kid.first_name && kid.first_name.trim()) {
      namesSet.add(kid.first_name.trim());
    }

    // Add preferred name if it exists
    if (kid.preferred_name && kid.preferred_name.trim()) {
      namesSet.add(kid.preferred_name.trim());
    }
  });

  // Convert to array and sort alphabetically (case-insensitive)
  return Array.from(namesSet).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );
}

/**
 * Filters names based on a search query
 * Performs case-insensitive and accent-insensitive matching
 */
export function filterNamesByQuery(names: string[], query: string): string[] {
  if (!query || query.length < 2) {
    return [];
  }

  const normalizedQuery = normalizeString(query);

  return names.filter(name =>
    normalizeString(name).startsWith(normalizedQuery)
  );
}

/**
 * Extracts all addresses from kids and their guardians
 * Returns array of all address objects
 */
function extractAllAddresses(kids: Kid[]): Address[] {
  const addresses: Address[] = [];

  kids.forEach(kid => {
    // Add kid's address if it exists
    if (kid.address) {
      addresses.push(kid.address);
    }

    // Add guardian addresses if they exist
    kid.guardians.forEach(guardian => {
      if (guardian.address && !guardian.same_address_as_kid) {
        addresses.push(guardian.address);
      }
    });
  });

  return addresses;
}

/**
 * Extracts unique values for a specific address field from all addresses
 * Returns a sorted array of unique values
 */
function extractUniqueAddressField(
  addresses: Address[],
  field: keyof Address
): string[] {
  const valuesSet = new Set<string>();

  addresses.forEach(address => {
    const value = address[field];
    if (value && typeof value === 'string' && value.trim()) {
      valuesSet.add(value.trim());
    }
  });

  // Convert to array and sort alphabetically (case-insensitive)
  return Array.from(valuesSet).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );
}

/**
 * Extracts unique street names from all kids and guardian addresses
 */
export function extractUniqueStreetNames(kids: Kid[]): string[] {
  const addresses = extractAllAddresses(kids);
  return extractUniqueAddressField(addresses, 'street_name');
}

/**
 * Extracts unique neighborhoods from all kids and guardian addresses
 */
export function extractUniqueNeighborhoods(kids: Kid[]): string[] {
  const addresses = extractAllAddresses(kids);
  return extractUniqueAddressField(addresses, 'neighborhood');
}

/**
 * Extracts unique postal codes from all kids and guardian addresses
 */
export function extractUniquePostalCodes(kids: Kid[]): string[] {
  const addresses = extractAllAddresses(kids);
  return extractUniqueAddressField(addresses, 'postal_code');
}

/**
 * Extracts unique cities from all kids and guardian addresses
 */
export function extractUniqueCities(kids: Kid[]): string[] {
  const addresses = extractAllAddresses(kids);
  return extractUniqueAddressField(addresses, 'city');
}

/**
 * Extracts unique countries from all kids and guardian addresses
 */
export function extractUniqueCountries(kids: Kid[]): string[] {
  const addresses = extractAllAddresses(kids);
  return extractUniqueAddressField(addresses, 'country');
}
