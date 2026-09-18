import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { PersonPlus } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';

interface GuardiansSectionHeaderProps {
  onAddGuardian: () => void;
}

const GuardiansSectionHeader: React.FC<GuardiansSectionHeaderProps> = ({
  onAddGuardian
}) => {
  const { t } = useTranslation();

  return (
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h5 className="mb-0">
        {t('guardians')}
      </h5>
      <OverlayTrigger placement="bottom" overlay={<Tooltip>{t('addGuardian')}</Tooltip>}>
        <button
          type="button"
          className="icon-action icon-action--accent"
          onClick={onAddGuardian}
          aria-label={t('addGuardian')}
        >
          <PersonPlus size={18} />
        </button>
      </OverlayTrigger>
    </div>
  );
};

export default GuardiansSectionHeader;
