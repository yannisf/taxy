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
  const { t } = useTranslation(['forms']);

  if (!telephone.country_code || !telephone.number) {
    return null;
  }

  const typeIcon = getTelephoneTypeIcon(telephone.telephone_type);
  const typeLabel = t(`forms:telephone.typeDisplay.${telephone.telephone_type}`);

  if (compact) {
    return (
      <div className={`d-flex align-items-center gap-1 ${className}`}>
        <span>{typeIcon}</span>
        <span>{telephone.country_code} {telephone.number}</span>
        <Badge bg="secondary">{typeLabel}</Badge>
      </div>
    );
  }

  return (
    <div className={`d-flex align-items-center gap-2 ${className}`}>
      <span style={{ fontSize: '1.1em' }}>{typeIcon}</span>
      <span className="fw-medium">{telephone.country_code} {telephone.number}</span>
      <Badge bg="outline-secondary" text="dark">{typeLabel}</Badge>
    </div>
  );
};

export default TelephoneDisplay;
