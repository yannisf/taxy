import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { ChevronLeft, ChevronRight } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';

interface KidDetailsNavigationControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

const KidDetailsNavigationControls: React.FC<KidDetailsNavigationControlsProps> = ({
  onPrevious,
  onNext,
  hasPrevious,
  hasNext
}) => {
  const { t } = useTranslation();

  return (
    <div className="icon-action-group" role="group" aria-label={t('kidNavigation')}>
      <OverlayTrigger placement="bottom" overlay={<Tooltip>{t('previousKidTooltip')}</Tooltip>}>
        <button
          type="button"
          className="icon-action"
          onClick={onPrevious}
          disabled={!hasPrevious}
          aria-label={t('previousKidTooltip')}
        >
          <ChevronLeft size={16} />
        </button>
      </OverlayTrigger>

      <OverlayTrigger placement="bottom" overlay={<Tooltip>{t('nextKidTooltip')}</Tooltip>}>
        <button
          type="button"
          className="icon-action"
          onClick={onNext}
          disabled={!hasNext}
          aria-label={t('nextKidTooltip')}
        >
          <ChevronRight size={16} />
        </button>
      </OverlayTrigger>
    </div>
  );
};

export default KidDetailsNavigationControls;
