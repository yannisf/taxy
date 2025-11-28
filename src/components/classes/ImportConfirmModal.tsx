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

  // Determine if this class already exists (class is in context)
  const classExists = !!className;
  const displaySchoolName = validationResult?.classData?.school_name;
  const displayClassName = validationResult?.classData?.class_name;
  const displaySchoolYear = validationResult?.classData?.school_year;

  // Format: "School Name - Class Name (Year)"
  const classDisplay = displaySchoolName && displayClassName
    ? `${displaySchoolName} - ${displayClassName}${displaySchoolYear ? ` (${displaySchoolYear})` : ''}`
    : className || displayClassName;

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{t('confirmImportDialog')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="info">
          <p className="mb-0">
            {validationResult?.validatedKids?.length} {validationResult?.validatedKids?.length === 1 ? 'kid' : 'kids'} will be imported.
          </p>
          <p className="mb-0 mt-2">
            <strong>{classDisplay}</strong>
          </p>
        </Alert>
        {classExists && (
          <p className="text-warning">
            <strong>Warning:</strong> All existing kids in this class will be replaced with the imported data.
          </p>
        )}
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
