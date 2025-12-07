import React from 'react';
import { Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import type { Telephone } from '../../types/models';
import { getTelephoneTypeIcon } from '../../utils/telephoneUtils';

interface TelephoneDisplayProps {
  telephone: Telephone;
  className?: string;
  compact?: boolean;
}

const TelephoneDisplay: React.FC<TelephoneDisplayProps> = ({ 
  telephone, 
  className = '',
  compact = false 
}) => {
  const { t } = useTranslation();

  if (!telephone.country_code || !telephone.number) {
    return null;
  }

  // Helper function to get the telephone type translation key
  const getTelephoneTypeKey = (type: string) => {
    const typeMap: Record<string, string> = {
      'mobile': 'telephoneMobile',
      'home': 'telephoneHome',
      'work': 'telephoneWork',
      'other': 'telephoneOther'
    };
    return typeMap[type] || type;
  };

  const typeIcon = getTelephoneTypeIcon(telephone.telephone_type);
  const typeLabel = t(getTelephoneTypeKey(telephone.telephone_type));

  // Format phone number with pattern: XXX XXX XXXX
  const formatPhoneNumber = (number: string): string => {
    // Remove any existing spaces or special characters except digits
    const digits = number.replace(/\D/g, '');

    // Format as: first 3 digits, next 3 digits, remaining digits
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    } else {
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    }
  };

  // Format phone number: hide +30 country code
  const formattedNumber = telephone.country_code === '+30'
    ? formatPhoneNumber(telephone.number)
    : `${telephone.country_code} ${formatPhoneNumber(telephone.number)}`;

  if (compact) {
    return (
      <div className={`d-flex align-items-center gap-1 ${className}`}>
        <span>{typeIcon}</span>
        <span style={{ fontFamily: 'monospace' }}>{formattedNumber}</span>
        <Badge bg="secondary">{typeLabel}</Badge>
      </div>
    );
  }

  return (
    <div className={`d-flex align-items-center gap-2 ${className}`}>
      <span style={{ fontSize: '1.1em' }}>{typeIcon}</span>
      <span className="fw-medium" style={{ fontFamily: 'monospace' }}>{formattedNumber}</span>
      <Badge bg="outline-secondary" text="dark">{typeLabel}</Badge>
    </div>
  );
};

export default TelephoneDisplay;
