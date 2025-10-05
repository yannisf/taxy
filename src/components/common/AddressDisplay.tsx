import React from 'react';
import type { Address } from '../../types/models';

interface AddressDisplayProps {
  address?: Address | null;
  className?: string;
}

const AddressDisplay: React.FC<AddressDisplayProps> = ({ address, className = '' }) => {
  if (!address) {
    return (
      <div className={`text-muted ${className}`}>
        No address provided
      </div>
    );
  }

  // Check if any address field has a value
  const hasAddressData = Object.values(address).some(value => value && value.trim() !== '');
  
  if (!hasAddressData) {
    return (
      <div className={`text-muted ${className}`}>
        No address provided
      </div>
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
    
    // Country
    if (address.country) {
      parts.push(address.country);
    }
    
    return parts.join(', ');
  };

  return (
    <div className={className}>
      📍 {formatAddress()}
    </div>
  );
};

export default AddressDisplay;
