import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Alert } from 'react-bootstrap';
import { db } from '../../services/database';
import KidForm from './KidForm';
import type { Kid } from '../../types/models';

const KidEditView: React.FC = () => {
  const { kidId } = useParams<{ kidId: string }>();
  const [kid, setKid] = useState<Kid | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchKid = async () => {
      if (kidId) {
        try {
          setLoading(true);
          const fetchedKid = await db.getKidById(kidId);
          if (fetchedKid) {
            setKid(fetchedKid);
          } else {
            setError('Kid not found');
          }
        } catch (err) {
          console.error('Error fetching kid:', err);
          setError('Failed to load kid data');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchKid();
  }, [kidId]);

  const handleSubmitSuccess = () => {
    // Navigate back to the kid's detail view after successful edit
    if (kidId) {
      navigate(`/kids/${kidId}`);
    }
  };

  if (loading) {
    return (
      <Container className="mt-3">
        <h2>Edit Kid</h2>
        <p>Loading kid data...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-3">
        <h2>Edit Kid</h2>
        <Alert variant="danger">
          {error}
        </Alert>
      </Container>
    );
  }

  if (!kid) {
    return (
      <Container className="mt-3">
        <h2>Edit Kid</h2>
        <Alert variant="warning">
          Kid not found.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-3">
      <h2>Edit Kid: {kid.first_name} {kid.last_name}</h2>
      <KidForm 
        initialData={kid}
        onSubmitSuccess={handleSubmitSuccess} 
      />
    </Container>
  );
};

export default KidEditView;
