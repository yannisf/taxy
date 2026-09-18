import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Plus } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';

interface TelephonesSectionHeaderProps {
  onAddTelephone: () => void;
}

const TelephonesSectionHeader: React.FC<TelephonesSectionHeaderProps> = ({
  onAddTelephone
}) => {
  const { t } = useTranslation();

  return (
    <div className="d-flex align-items-center gap-1 mb-3">
      <h6 className="mb-0">
        📞 {t('telephoneNumbers')}
      </h6>
      <OverlayTrigger placement="bottom" overlay={<Tooltip>{t('addTelephone')}</Tooltip>}>
        <button
          type="button"
          className="icon-action icon-action--sm"
          onClick={onAddTelephone}
          aria-label={t('addTelephone')}
        >
          <Plus size={18} />
        </button>
      </OverlayTrigger>
    </div>
  );
};

export default TelephonesSectionHeader;
