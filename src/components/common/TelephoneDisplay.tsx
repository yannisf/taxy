import React from 'react';
import { Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import type { Telephone } from '../../types/models';
import { getTelephoneTypeIcon, formatPhoneNumberGrouped } from '../../utils/telephoneUtils';

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

  // Format phone number: hide +30 country code for display
  const formattedNumber = telephone.country_code === '+30'
    ? formatPhoneNumberGrouped(telephone.number)
    : `${telephone.country_code} ${formatPhoneNumberGrouped(telephone.number)}`;

  // Create tel: link (always include country code, no spaces)
  const telLink = `tel:${telephone.country_code}${telephone.number.replace(/\D/g, '')}`;

  if (compact) {
    return (
      <div className={`d-flex align-items-center gap-1 ${className}`}>
        <span>{typeIcon}</span>
        <a
          href={telLink}
          className="text-decoration-none"
          style={{
            fontFamily: 'monospace',
            color: 'inherit',
            cursor: 'pointer',
            borderBottom: '1px dotted currentColor'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderBottom = '1px solid currentColor'}
          onMouseLeave={(e) => e.currentTarget.style.borderBottom = '1px dotted currentColor'}
        >
          {formattedNumber}
        </a>
        <Badge bg="primary">{typeLabel}</Badge>
      </div>
    );
  }

  return (
    <div className={`d-flex align-items-center gap-2 ${className}`}>
      <span style={{ fontSize: '1.1em' }}>{typeIcon}</span>
      <a
        href={telLink}
        className="text-decoration-none fw-medium"
        style={{
          fontFamily: 'monospace',
          color: 'inherit',
          cursor: 'pointer',
          borderBottom: '1px dotted currentColor'
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderBottom = '1px solid currentColor'}
        onMouseLeave={(e) => e.currentTarget.style.borderBottom = '1px dotted currentColor'}
      >
        {formattedNumber}
      </a>
      <Badge bg="primary">{typeLabel}</Badge>
    </div>
  );
};

export default TelephoneDisplay;
