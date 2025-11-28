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
  className?: string; // Current class name (if importing to existing class)
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

  // Use class name from context if available, otherwise use class data from import file
  const displayClassName = className || validationResult?.classData?.class_name;
  const displaySchoolName = validationResult?.classData?.school_name;
  const displaySchoolYear = validationResult?.classData?.school_year;

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{t('confirmImportDialog')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="info">
          <p className="mb-0">
            {validationResult?.validatedKids?.length} {validationResult?.validatedKids?.length === 1 ? 'kid' : 'kids'} will be imported to <strong>{displayClassName}</strong>.
          </p>
          {displaySchoolName && (
            <p className="mb-0 small text-muted mt-2">
              School: <strong>{displaySchoolName}</strong>
              {displaySchoolYear && ` (${displaySchoolYear})`}
            </p>
          )}
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
