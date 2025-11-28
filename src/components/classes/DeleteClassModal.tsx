import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import type { Class } from '../../types/models';

interface DeleteClassModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  loading: boolean;
  classData: Class | null;
  hasKids?: boolean;
  kidsCount?: number;
}

const DeleteClassModal: React.FC<DeleteClassModalProps> = ({
  show,
  onHide,
  onConfirm,
  loading,
  classData,
  hasKids = false,
  kidsCount = 0
}) => {
  const { t } = useTranslation();

  const formatClassDisplay = (classObj: Class | null) => {
    if (!classObj) return '';
    return `${classObj.school_name} - ${classObj.class_name} (${classObj.school_year})`;
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title className={hasKids ? 'text-danger' : undefined}>
          {t('confirmDelete')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {hasKids ? (
          <>
            <div className="alert alert-danger">
              <strong>{t('warning')}!</strong> {t('confirmDeleteClassWithKidsMessage')}
            </div>
            {classData && (
              <>
                <p className="mb-2">
                  <strong>{formatClassDisplay(classData)}</strong>
                </p>
                <p className="mb-0 text-danger">
                  <strong>{t('kidsInClass', { count: kidsCount })}</strong>
                </p>
              </>
            )}
          </>
        ) : (
          <>
            <p>{t('confirmDeleteClassMessage')}</p>
            {classData && (
              <p className="mb-0">
                <strong>{formatClassDisplay(classData)}</strong>
              </p>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          {t('cancel')}
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={loading}>
          {loading ? t('deleting') : hasKids ? t('deleteClassAndKids') : t('delete')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteClassModal;
