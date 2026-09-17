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
}

const ImportConfirmModal: React.FC<ImportConfirmModalProps> = ({
  show,
  onHide,
  onConfirm,
  loading,
  validationResult
}) => {
  const { t } = useTranslation();

  // Whether the class_id in the import file already exists in the database -
  // i.e. whether this import will merge into real, existing data.
  const classExists = !!validationResult?.targetClassExists;
  const displaySchoolName = validationResult?.classData?.school_name;
  const displayClassName = validationResult?.classData?.class_name;
  const displaySchoolYear = validationResult?.classData?.school_year;

  // Format: "School Name - Class Name (Year)"
  const classDisplay = displaySchoolName && displayClassName
    ? `${displaySchoolName} - ${displayClassName}${displaySchoolYear ? ` (${displaySchoolYear})` : ''}`
    : displayClassName;

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
            <strong>{t('warning')}:</strong> {t('importMergeWarning')}
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
