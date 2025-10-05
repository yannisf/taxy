import type { Address } from '../types/models';

/**
 * Formats an address object into a readable string
 * @param address - The address object to format
 * @returns Formatted address string or empty string if no address data
 */
export function formatAddressString(address?: Address | null): string {
  if (!address) {
    return '';
  }

  // Check if any address field has a value
  const hasAddressData = Object.values(address).some(value => value && value.trim() !== '');
  
  if (!hasAddressData) {
    return '';
  }

  const parts = [];
  
  // Street info
  if (address.street_name || address.street_number) {
    const streetPart = [address.street_name, address.street_number]
      .filter(Boolean)
      .join(' ');
    if (streetPart) parts.push(streetPart);
  }
  
  // Neighborhood
  if (address.neighborhood) {
    parts.push(address.neighborhood);
  }
  
  // City and postal code
  const cityPostal = [address.city, address.postal_code]
    .filter(Boolean)
    .join(' ');
  if (cityPostal) parts.push(cityPostal);
  
  // Country
  if (address.country) {
    parts.push(address.country);
  }
  
  return parts.join(', ');
}
