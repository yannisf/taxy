import React from 'react';
import { Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { PencilSquare, InfoCircle, PersonDash } from 'react-bootstrap-icons';
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
      <div className="card-actions flex-shrink-0">
        {/* Navigation Controls */}
        <KidDetailsNavigationControls onPrevious={onPrevious} onNext={onNext} hasPrevious={hasPrevious} hasNext={hasNext} />

        <span className="card-actions-divider" aria-hidden="true" />

        {/* Record timestamps */}
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
          <button type="button" className="icon-action" aria-label={t('recordInfo')}>
            <InfoCircle size={18} />
          </button>
        </OverlayTrigger>

        {/* Edit */}
        <OverlayTrigger placement="bottom" overlay={<Tooltip>{t('editDetails')} ({t('editModeShortcut')})</Tooltip>}>
          <button type="button" className="icon-action" onClick={onEdit} aria-label={t('editDetails')}>
            <PencilSquare size={18} />
          </button>
        </OverlayTrigger>

        <span className="card-actions-divider" aria-hidden="true" />

        {/* Remove kid record — a person being taken off the roster, not rubbish */}
        <OverlayTrigger placement="bottom" overlay={<Tooltip>{t('removeKid')} ({t('deleteModeShortcut')})</Tooltip>}>
          <button type="button" className="icon-action icon-action--destructive" onClick={onDelete} aria-label={t('removeKid')}>
            <PersonDash size={18} />
          </button>
        </OverlayTrigger>
      </div>
    </Card.Header>
  );
};

export default KidDetailsHeader;
