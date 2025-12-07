import React from 'react';
import type { Address } from '../../types/models';

interface AddressDisplayProps {
  address?: Address | null;
  className?: string;
}

const AddressDisplay: React.FC<AddressDisplayProps> = ({ address, className = '' }) => {
  if (!address) {
    return (
      <span className={`text-muted ${className}`}>
        No address provided
      </span>
    );
  }

  // Check if any address field has a value
  const hasAddressData = Object.values(address).some(value => value && value.trim() !== '');
  
  if (!hasAddressData) {
    return (
      <span className={`text-muted ${className}`}>
        No address provided
      </span>
    );
  }

  const formatAddress = () => {
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

    // Country (hide "Ελλάδα" as it's the default)
    if (address.country && address.country !== 'Ελλάδα') {
      parts.push(address.country);
    }
    
    return parts.join(', ');
  };

  return (
    <span className={className}>
      📍 {formatAddress()}
    </span>
  );
};

export default AddressDisplay;
