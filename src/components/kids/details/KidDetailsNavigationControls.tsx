import React from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
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
    <>
      {/* Previous Kid Button */}
      <OverlayTrigger
        placement="bottom"
        overlay={<Tooltip>{t('previousKidTooltip')}</Tooltip>}
      >
        <Button
          variant="link"
          size="sm"
          className="p-0 text-decoration-none"
          onClick={onPrevious}
          disabled={!hasPrevious}
          style={{
            cursor: hasPrevious ? 'pointer' : 'not-allowed',
            opacity: hasPrevious ? 1 : 0.5
          }}
        >
          <ChevronLeft size={20} className="text-primary" />
        </Button>
      </OverlayTrigger>

      {/* Next Kid Button */}
      <OverlayTrigger
        placement="bottom"
        overlay={<Tooltip>{t('nextKidTooltip')}</Tooltip>}
      >
        <Button
          variant="link"
          size="sm"
          className="p-0 text-decoration-none"
          onClick={onNext}
          disabled={!hasNext}
          style={{
            cursor: hasNext ? 'pointer' : 'not-allowed',
            opacity: hasNext ? 1 : 0.5
          }}
        >
          <ChevronRight size={20} className="text-primary" />
        </Button>
      </OverlayTrigger>
    </>
  );
};

export default KidDetailsNavigationControls;
