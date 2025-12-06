import React from 'react';
import { Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { PencilSquare, InfoCircle, XLg } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import { formatDateDisplay } from '../../../utils/dateUtils';
import type { Kid } from '../../../types/models';
import KidDetailsNavigationControls from './KidDetailsNavigationControls';

interface KidDetailsHeaderProps {
  kid: Kid;
  displayName: string;
  onEdit: () => void;
  onDelete: () => void;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

const KidDetailsHeader: React.FC<KidDetailsHeaderProps> = ({
  kid,
  displayName,
  onEdit,
  onDelete,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext
}) => {
  const { t } = useTranslation();

  return (
    <Card.Header className="d-flex flex-wrap justify-content-between align-items-center gap-3">
      <h2 className="mb-0">{displayName}</h2>
      <div className="d-flex align-items-center gap-1 flex-shrink-0">
        {/* Navigation Controls */}
        <KidDetailsNavigationControls
          onPrevious={onPrevious}
          onNext={onNext}
          hasPrevious={hasPrevious}
          hasNext={hasNext}
        />

        {/* Info Icon */}
        <OverlayTrigger
          placement="bottom"
          overlay={
            <Tooltip>
              <div>
                <strong>{t('created')}:</strong> {formatDateDisplay(kid.created_at, true)}<br />
                <strong>{t('lastUpdated')}:</strong> {formatDateDisplay(kid.updated_at, true)}
              </div>
            </Tooltip>
          }
        >
          <InfoCircle
            size={20}
            className="text-primary"
            style={{ cursor: 'pointer' }}
          />
        </OverlayTrigger>

        {/* Edit Icon */}
        <OverlayTrigger
          placement="bottom"
          overlay={<Tooltip>{t('editDetails')} ({t('editModeShortcut')})</Tooltip>}
        >
          <PencilSquare
            size={20}
            className="text-primary"
            style={{ cursor: 'pointer' }}
            onClick={onEdit}
          />
        </OverlayTrigger>

        {/* Delete Icon */}
        <OverlayTrigger
          placement="bottom"
          overlay={<Tooltip>{t('delete')}</Tooltip>}
        >
          <XLg
            size={20}
            className="text-danger"
            style={{ cursor: 'pointer' }}
            onClick={onDelete}
          />
        </OverlayTrigger>
      </div>
    </Card.Header>
  );
};

export default KidDetailsHeader;
