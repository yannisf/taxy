import React from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { Download } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';

interface ExportModalProps {
  show: boolean;
  onHide: () => void;
  onConfirmExport: () => Promise<void>;
  loading?: boolean;
  className?: string;
  schoolName?: string;
  schoolYear?: string;
}

const ExportModal: React.FC<ExportModalProps> = ({
  show,
  onHide,
  onConfirmExport,
  loading = false,
  className,
  schoolName,
  schoolYear
}) => {
  const { t } = useTranslation();

  const handleConfirm = async () => {
    await onConfirmExport();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{t('exportOptions')}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {schoolName && className && (
          <Alert variant="info" className="mb-0">
            <div>
              {schoolName} - {className} {schoolYear && `(${schoolYear})`}
            </div>
          </Alert>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          {t('cancel')}
        </Button>
        <Button variant="primary" onClick={handleConfirm} disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
              {t('exporting')}
            </>
          ) : (
            <>
              <Download size={16} className="me-2" />
              {t('download')}
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ExportModal;
