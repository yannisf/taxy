import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import KidForm from './KidForm';

const KidAddView: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmitSuccess = () => {
    navigate('/kids');
  };

  return (
    <Container className="mt-3">
      <h2>Add New Kid</h2>
      <KidForm 
        onSubmitSuccess={handleSubmitSuccess} 
      />
    </Container>
  );
};

export default KidAddView;
