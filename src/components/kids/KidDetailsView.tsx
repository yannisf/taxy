import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, Alert, Badge, OverlayTrigger, Tooltip, Button, Modal } from 'react-bootstrap';
import { PencilSquare, CheckLg, InfoCircle, ChevronLeft, ChevronRight, XLg } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import { db } from '../../services/database';
import { useClassKids } from '../../hooks/useClassKids';
import { useKids } from '../../contexts/KidsContext';
import GuardianCard from '../guardians/GuardianCard';
import AddressDisplay from '../common/AddressDisplay';
import { formatDateDisplay } from '../../utils/dateUtils';
import type { Kid } from '../../types/models';

const KidDetailsView: React.FC = () => {
  const { kidId } = useParams<{ kidId: string }>();
  const navigate = useNavigate();
  const [kid, setKid] = useState<Kid | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { t } = useTranslation(['common', 'kids', 'guardians', 'navigation']);
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

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (kid) {
      try {
        await db.deleteKid(kid.kid_id);
        await refreshKids(); // Refresh the list using context
        setShowDeleteModal(false);
        // Navigate to default view since the current kid is deleted
        navigate('/kids');
      } catch (error) {
        console.error('Error deleting kid:', error);
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle navigation if no input elements are focused
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handlePrevious();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleNext();
      } else if (event.key.toLowerCase() === 'e') {
        event.preventDefault();
        handleEditClick();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlePrevious, handleNext, handleEditClick]);

  const getDisplayName = () => {
    if (!kid) return '';
    const displayName = kid.preferred_name || kid.first_name;
    return `${displayName} ${kid.last_name}`;
  };

  if (!kid) {
    return (
      <Container className="mt-3">
        <p>{t('kids:messages.loadingDetails')}</p>
      </Container>
    );
  }

  return (
    <Container className="mt-3">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h2>{getDisplayName()}</h2>
          <div className="d-flex align-items-center gap-2">
            {/* Previous Kid Button */}
            <OverlayTrigger
              placement="bottom"
              overlay={<Tooltip>{t('navigation:kidNavigation.previousTooltip')}</Tooltip>}
            >
              <Button
                variant="link"
                size="sm"
                className="p-1 text-decoration-none"
                onClick={handlePrevious}
                disabled={!getPreviousKid()}
                style={{ 
                  cursor: getPreviousKid() ? 'pointer' : 'not-allowed',
                  opacity: getPreviousKid() ? 1 : 0.5
                }}
              >
                <ChevronLeft size={24} className="text-primary" />
              </Button>
            </OverlayTrigger>

            {/* Next Kid Button */}
            <OverlayTrigger
              placement="bottom"
              overlay={<Tooltip>{t('navigation:kidNavigation.nextTooltip')}</Tooltip>}
            >
              <Button
                variant="link"
                size="sm"
                className="p-1 text-decoration-none"
                onClick={handleNext}
                disabled={!getNextKid()}
                style={{ 
                  cursor: getNextKid() ? 'pointer' : 'not-allowed',
                  opacity: getNextKid() ? 1 : 0.5
                }}
              >
                <ChevronRight size={24} className="text-primary" />
              </Button>
            </OverlayTrigger>

            <OverlayTrigger
              placement="bottom"
              overlay={
                <Tooltip>
                  <div>
                    <strong>{t('common:labels.created')}:</strong> {formatDateDisplay(kid.created_at, true)}<br />
                    <strong>{t('common:labels.lastUpdated')}:</strong> {formatDateDisplay(kid.updated_at, true)}
                  </div>
                </Tooltip>
              }
            >
              <InfoCircle 
                size={24} 
                className="text-primary" 
                style={{ cursor: 'pointer' }}
              />
            </OverlayTrigger>
            <OverlayTrigger
              placement="bottom"
              overlay={<Tooltip>{t('common:labels.editDetails')} ({t('navigation:keyboardShortcuts.editMode')})</Tooltip>}
            >
              <PencilSquare 
                size={24} 
                className="text-primary" 
                style={{ cursor: 'pointer' }}
                onClick={handleEditClick}
              />
            </OverlayTrigger>

            {/* Delete Button */}
            <OverlayTrigger
              placement="bottom"
              overlay={<Tooltip>{t('common:actions.delete')}</Tooltip>}
            >
              <XLg 
                size={24} 
                className="text-danger" 
                style={{ cursor: 'pointer' }}
                onClick={handleDeleteClick}
              />
            </OverlayTrigger>
          </div>
        </Card.Header>
        <Card.Body>
          <p><strong>{t('common:labels.firstName')}:</strong> {kid.first_name}</p>
          <p><strong>{t('common:labels.lastName')}:</strong> {kid.last_name}</p>
          {kid.preferred_name && (
            <p><strong>{t('kids:form.preferredName')}:</strong> {kid.preferred_name}</p>
          )}
          <p><strong>{t('common:labels.dateOfBirth')}:</strong> {formatDateDisplay(kid.date_of_birth)}</p>
          <p><strong>{t('common:labels.gender')}:</strong> {kid.gender}</p>
          <p><strong>{t('kids:form.level')}:</strong> {kid.level}</p>
          {kid.special_education && (
            <p><strong>{t('kids:status.specialEducation')}</strong> <CheckLg className="text-success" /></p>
          )}
          
          {/* Address within main card */}
          <p><strong>{t('common:labels.address')}:</strong> <AddressDisplay address={kid.address} className="d-inline" /></p>
          
          {kid.notes && (
            <div className="mt-3">
              <strong>{t('common:labels.notes')}:</strong>
              <p>{kid.notes}</p>
            </div>
          )}

        </Card.Body>
      </Card>

      {/* Guardians Section */}
      <Card className="mt-3">
        <Card.Header className="d-flex align-items-center gap-2">
          <h4 className="mb-0">{t('guardians:title.guardians')}</h4>
          <Badge bg="secondary">{kid.guardians?.length || 0}</Badge>
        </Card.Header>
        <Card.Body>
          {!kid.guardians || kid.guardians.length === 0 ? (
            <Alert variant="secondary" className="mb-0">
              {t('kids:messages.noGuardians')}
            </Alert>
          ) : (
            <Row>
              {kid.guardians.map((guardian, index) => (
                <Col key={index} md={6} lg={4} className="mb-3">
                  <GuardianCard guardian={guardian} />
                </Col>
              ))}
            </Row>
          )}
        </Card.Body>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={cancelDelete}>
        <Modal.Header closeButton>
          <Modal.Title>{t('common:dialogs.confirmDelete')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {t('kids:dialogs.confirmDeleteKid', { 
            firstName: kid?.first_name, 
            lastName: kid?.last_name 
          })}
          <br />
          {t('common:dialogs.actionCannotBeUndone')}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelDelete}>
            {t('common:buttons.cancel')}
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            {t('common:buttons.delete')}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default KidDetailsView;
