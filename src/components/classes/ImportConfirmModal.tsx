import React from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import type { ImportValidationResult } from '../../utils/importUtils';

interface ImportConfirmModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  loading: boolean;
  validationResult: ImportValidationResult | null;
  className?: string;
}

const ImportConfirmModal: React.FC<ImportConfirmModalProps> = ({
  show,
  onHide,
  onConfirm,
  loading,
  validationResult,
  className
}) => {
  const { t } = useTranslation();

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{t('confirmImportDialog')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="info">
          <p className="mb-0">
            {validationResult?.validatedKids?.length} {validationResult?.validatedKids?.length === 1 ? 'kid' : 'kids'} will be imported to {className}.
          </p>
        </Alert>
        <p className="text-muted">
          Any existing kids with the same ID will be overwritten with the imported data.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          {t('cancel')}
        </Button>
        <Button variant="success" onClick={onConfirm} disabled={loading}>
          {loading ? t('importing') : t('confirmImport')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ImportConfirmModal;
