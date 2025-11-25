import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container } from 'react-bootstrap';
import KidForm from './KidForm';

const KidAddView: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmitSuccess = () => {
    navigate('/kids');
  };

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
