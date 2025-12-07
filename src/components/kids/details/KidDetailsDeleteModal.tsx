import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import type { Kid } from '../../../types/models';

interface KidDetailsDeleteModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  kid: Kid;
}

const KidDetailsDeleteModal: React.FC<KidDetailsDeleteModalProps> = ({
  show,
  onHide,
  onConfirm,
  kid
}) => {
  const { t } = useTranslation();

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{t('confirmDelete')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {t('confirmDeleteKid', {
          firstName: kid.first_name,
          lastName: kid.last_name
        })}
        <br />
        {t('actionCannotBeUndone')}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}> {t('cancel')} </Button>
        <Button variant="danger" onClick={onConfirm}> {t('delete')} </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default KidDetailsDeleteModal;
