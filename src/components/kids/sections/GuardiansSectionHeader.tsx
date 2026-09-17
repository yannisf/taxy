import React from 'react';
import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

interface GuardiansSectionHeaderProps {
  guardianCount: number;
  onAddGuardian: () => void;
}

const GuardiansSectionHeader: React.FC<GuardiansSectionHeaderProps> = ({
  guardianCount,
  onAddGuardian
}) => {
  const { t } = useTranslation();

  return (
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h5 className="mb-0">
        {t('guardians')} <span className="badge text-bg-secondary">{guardianCount}</span>
      </h5>
      <Button
        variant="outline-primary"
        size="sm"
        onClick={onAddGuardian}
      >
        + {t('addGuardian')}
      </Button>
    </div>
  );
};

export default GuardiansSectionHeader;
