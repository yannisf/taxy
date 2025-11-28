import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import type { Guardian } from '../../types/models';

interface GuardianDeleteModalProps {
  show: boolean;
  guardian: Guardian | undefined;
  onConfirm: () => void;
  onCancel: () => void;
}

const GuardianDeleteModal: React.FC<GuardianDeleteModalProps> = ({
  show,
  guardian,
  onConfirm,
  onCancel
}) => {
  const { t } = useTranslation();

  return (
    <Modal show={show} onHide={onCancel}>
      <Modal.Header closeButton>
        <Modal.Title>{t('confirmDelete')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {t('confirmDeleteGuardian', {
          name: `${guardian?.first_name} ${guardian?.last_name}`
        })}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          {t('cancel')}
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {t('delete')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default GuardianDeleteModal;
