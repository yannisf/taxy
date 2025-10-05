import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, Alert, Badge } from 'react-bootstrap';
import { PencilSquare, CheckLg } from 'react-bootstrap-icons';
import { db } from '../../services/database';
import GuardianCard from '../guardians/GuardianCard';
import AddressDisplay from '../common/AddressDisplay';
import { formatDateDisplay } from '../../utils/dateUtils';
import type { Kid } from '../../types/models';

const KidDetailsView: React.FC = () => {
  const { kidId } = useParams<{ kidId: string }>();
  const navigate = useNavigate();
  const [kid, setKid] = useState<Kid | null>(null);

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
    const displayName = kid.preferred_name || kid.name;
    return `${displayName} ${kid.surname}`;
  };

  if (!kid) {
    return (
      <Container className="mt-3">
        <p>Loading kid details...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-3">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h2>{getDisplayName()}</h2>
          <PencilSquare 
            size={24} 
            className="text-primary" 
            style={{ cursor: 'pointer' }}
            onClick={handleEditClick}
            title="Edit kid details"
          />
        </Card.Header>
        <Card.Body>
          <p><strong>Name:</strong> {kid.name}</p>
          <p><strong>Surname:</strong> {kid.surname}</p>
          <p><strong>Preferred Name:</strong> {kid.preferred_name || 'Not specified'}</p>
          <p><strong>Date of Birth:</strong> {formatDateDisplay(kid.date_of_birth)}</p>
          <p><strong>Gender:</strong> {kid.gender}</p>
          <p><strong>Level:</strong> {kid.level}</p>
          {kid.special_education && (
            <p><strong>Special education</strong> <CheckLg className="text-success" /></p>
          )}
          
          {/* Address within main card */}
          <div className="mt-3">
            <strong>Address:</strong>
            <div className="mt-1">
              <AddressDisplay address={kid.address} />
            </div>
          </div>
          
          {kid.notes && (
            <div className="mt-3">
              <strong>Notes:</strong>
              <p>{kid.notes}</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Guardians Section */}
      <Card className="mt-3">
        <Card.Header className="d-flex align-items-center gap-2">
          <h4 className="mb-0">Guardians</h4>
          <Badge bg="secondary">{kid.guardians?.length || 0}</Badge>
        </Card.Header>
        <Card.Body>
          {!kid.guardians || kid.guardians.length === 0 ? (
            <Alert variant="info" className="mb-0">
              No guardians have been added for this student yet.
            </Alert>
          ) : (
            <Row>
              {kid.guardians.map((guardian, index) => (
                <Col key={guardian.guardian_id || index} md={6} lg={4} className="mb-3">
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
