import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { db } from '../../services/database';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import KidForm from './KidForm';
import type { Kid } from '../../types/models';

const KidEditView: React.FC = () => {
  const { kidId } = useParams<{ kidId: string }>();
  const [kid, setKid] = useState<Kid | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchKid = async () => {
      if (kidId) {
        try {
          setLoading(true);
          const fetchedKid = await db.getKidById(kidId);
          if (fetchedKid) {
            setKid(fetchedKid);
          } else {
            setError(t('kidNotFound'));
          }
        } catch (err) {
          console.error('Error fetching kid:', err);
          setError(t('error'));
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

  const handleCancel = () => {
    // Navigate back to the kid's detail view (same as cancel behavior)
    if (kidId) {
      navigate(`/kids/${kidId}`);
    }
  };

  // Keyboard navigation - Escape key to cancel/close edit mode
  useKeyboardNavigation([
    { key: 'Escape', handler: handleCancel, skipOnInputFocused: false },
  ]);

  if (loading) {
    return (
      <Container className="mt-3">
        <h2>{t('editKid')}</h2>
        <p>{t('loadingDetails')}</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-3">
        <h2>{t('editKid')}</h2>
        <Alert variant="danger">
          {error}
        </Alert>
      </Container>
    );
  }

  if (!kid) {
    return (
      <Container className="mt-3">
        <h2>{t('editKid')}</h2>
        <Alert variant="warning">
          {t('kidNotFound')}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-3">
      <h2>{t('editKid')}: {kid.first_name} {kid.last_name}</h2>
      <KidForm 
        initialData={kid}
        onSubmitSuccess={handleSubmitSuccess} 
      />
    </Container>
  );
};

export default KidEditView;
