import React from 'react';
import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

interface TelephonesSectionHeaderProps {
  telephoneCount: number;
  onAddTelephone: () => void;
}

const TelephonesSectionHeader: React.FC<TelephonesSectionHeaderProps> = ({
  telephoneCount,
  onAddTelephone
}) => {
  const { t } = useTranslation();

  return (
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h6 className="mb-0">
        📞 {t('telephoneNumbers')} <span className="badge text-bg-secondary">{telephoneCount}</span>
      </h6>
      <Button
        variant="outline-primary"
        size="sm"
        onClick={onAddTelephone}
      >
        + {t('addTelephone')}
      </Button>
    </div>
  );
};

export default TelephonesSectionHeader;
