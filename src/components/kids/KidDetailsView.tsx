import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { db } from '../../services/database';
import { useClassKids } from '../../hooks/useClassKids';
import { useKids } from '../../contexts/KidsContext';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { useModalState } from '../../hooks/useModalState';
import KidDetailsHeader from './details/KidDetailsHeader';
import KidDetailsPersonalInfo from './details/KidDetailsPersonalInfo';
import KidDetailsGuardians from './details/KidDetailsGuardians';
import KidDetailsDeleteModal from './details/KidDetailsDeleteModal';
import type { Kid } from '../../types/models';

const KidDetailsView: React.FC = () => {
  const { kidId } = useParams<{ kidId: string }>();
  const navigate = useNavigate();
  const [kid, setKid] = useState<Kid | null>(null);
  const deleteModal = useModalState();
  const { t } = useTranslation();
  const { refreshKids } = useKids();
  const classKids = useClassKids();

  useEffect(() => {
    const fetchKid = async () => {
      if (kidId) {
        const fetchedKid = await db.getKidById(kidId);
        setKid(fetchedKid || null);
      }
    };

    fetchKid();
  }, [kidId]);

  // Navigation logic
  const getCurrentKidIndex = () => {
    if (!kidId || classKids.length === 0) return -1;
    return classKids.findIndex(k => k.kid_id === kidId);
  };

  const getPreviousKid = () => {
    const currentIndex = getCurrentKidIndex();
    if (currentIndex <= 0) return null;
    return classKids[currentIndex - 1];
  };

  const getNextKid = () => {
    const currentIndex = getCurrentKidIndex();
    if (currentIndex < 0 || currentIndex >= classKids.length - 1) return null;
    return classKids[currentIndex + 1];
  };

  const handlePrevious = () => {
    const previousKid = getPreviousKid();
    if (previousKid) {
      navigate(`/kids/${previousKid.kid_id}`);
    }
  };

  const handleNext = () => {
    const nextKid = getNextKid();
    if (nextKid) {
      navigate(`/kids/${nextKid.kid_id}`);
    }
  };

  const handleEditClick = () => {
    if (kidId) {
      navigate(`/kids/${kidId}/edit`);
    }
  };

  const confirmDelete = async () => {
    if (kid) {
      try {
        await db.deleteKid(kid.kid_id);
        await refreshKids();
        deleteModal.close();
        navigate('/kids');
      } catch (error) {
        console.error('Error deleting kid:', error);
      }
    }
  };

  // Keyboard navigation
  useKeyboardNavigation([
    { key: 'ArrowLeft', handler: handlePrevious },
    { key: 'ArrowRight', handler: handleNext },
    { key: ['e', 'ε'], handler: handleEditClick },
    { key: ['d', 'δ'], handler: deleteModal.open },
  ]);

  const getDisplayName = () => {
    if (!kid) return '';
    const displayName = kid.preferred_name || kid.first_name;
    return `${displayName} ${kid.last_name}`;
  };

  if (!kid) {
    return (
      <Container className="mt-3">
        <p>{t('loadingDetails')}</p>
      </Container>
    );
  }

  return (
    <Container className="mt-3">
      <Card>
        <KidDetailsHeader
          kid={kid}
          displayName={getDisplayName()}
          onEdit={handleEditClick}
          onDelete={deleteModal.open}
          onPrevious={handlePrevious}
          onNext={handleNext}
          hasPrevious={!!getPreviousKid()}
          hasNext={!!getNextKid()}
        />
        <KidDetailsPersonalInfo kid={kid} />
      </Card>

      <KidDetailsGuardians guardians={kid.guardians || []} />

      <KidDetailsDeleteModal
        show={deleteModal.show}
        onHide={deleteModal.close}
        onConfirm={confirmDelete}
        kid={kid}
      />
    </Container>
  );
};

export default KidDetailsView;
