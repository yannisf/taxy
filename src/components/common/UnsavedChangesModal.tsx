import React, { useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

interface UnsavedChangesModalProps {
  show: boolean;
  onDiscard: () => void;
  onCancel: () => void;
}

const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  show,
  onDiscard,
  onCancel
}) => {
  const { t } = useTranslation();

  // Handle Escape key explicitly - use capture phase to intercept before other handlers
  useEffect(() => {
    if (!show) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        onCancel();
      }
    };

    // Use capture phase (true) to intercept before other handlers
    document.addEventListener('keydown', handleEscape, true);
    return () => document.removeEventListener('keydown', handleEscape, true);
  }, [show, onCancel]);

  return (
    <Modal
      show={show}
      onHide={onCancel}
      centered
      keyboard={true}
    >
      <Modal.Header closeButton>
        <Modal.Title>{t('unsavedChanges')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{t('unsavedChangesWarning')}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          {t('continueEditing')}
        </Button>
        <Button variant="danger" onClick={onDiscard}>
          {t('discardChanges')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UnsavedChangesModal;
