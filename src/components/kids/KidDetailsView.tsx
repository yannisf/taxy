import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, Alert, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { PencilSquare, CheckLg, InfoCircle } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import { db } from '../../services/database';
import GuardianCard from '../guardians/GuardianCard';
import AddressDisplay from '../common/AddressDisplay';
import { formatDateDisplay } from '../../utils/dateUtils';
import type { Kid } from '../../types/models';

const KidDetailsView: React.FC = () => {
  const { kidId } = useParams<{ kidId: string }>();
  const navigate = useNavigate();
  const [kid, setKid] = useState<Kid | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchKid = async () => {
      if (kidId) {
        const fetchedKid = await db.getKidById(kidId);
        setKid(fetchedKid || null);
      }
    };

    fetchKid();
  }, [kidId]);

  const handleEditClick = () => {
    if (kidId) {
      navigate(`/kids/${kidId}/edit`);
    }
  };

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
            <PencilSquare 
              size={24} 
              className="text-primary" 
              style={{ cursor: 'pointer' }}
              onClick={handleEditClick}
              title={t('common:labels.editDetails')}
            />
          </div>
        </Card.Header>
        <Card.Body>
          <p><strong>{t('common:labels.firstName')}:</strong> {kid.first_name}</p>
          <p><strong>{t('common:labels.lastName')}:</strong> {kid.last_name}</p>
          <p><strong>{t('kids:form.preferredName')}:</strong> {kid.preferred_name || t('kids:form.notSpecified')}</p>
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
            <Alert variant="info" className="mb-0">
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
    </Container>
  );
};

export default KidDetailsView;
