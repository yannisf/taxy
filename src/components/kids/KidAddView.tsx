import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container } from 'react-bootstrap';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import KidForm from './KidForm';

const KidAddView: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmitSuccess = (kidId?: string) => {
    if (kidId) {
      navigate(`/kids/${kidId}`);
    } else {
      navigate('/kids');
    }
  };

  const handleCancel = () => {
    navigate('/kids');
  };

  // Keyboard navigation - Escape key to cancel/close add form
  useKeyboardNavigation([
    { key: 'Escape', handler: handleCancel, skipOnInputFocused: false },
  ]);

  return (
    <Container className="mt-3">
      <h2>{t('addKid')}</h2>
      <KidForm 
        onSubmitSuccess={handleSubmitSuccess} 
      />
    </Container>
  );
};

export default KidAddView;
