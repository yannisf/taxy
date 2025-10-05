import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Card, Row, Col, Alert } from 'react-bootstrap';
import { db } from '../../services/database';
import GuardianCard from '../guardians/GuardianCard';
import AddressDisplay from '../common/AddressDisplay';
import type { Kid } from '../../types/models';

const KidDetailsView: React.FC = () => {
  const { kidId } = useParams<{ kidId: string }>();
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
        <Card.Header>
          <h2>{kid.name} {kid.surname}</h2>
        </Card.Header>
        <Card.Body>
          <p><strong>Preferred Name:</strong> {kid.preferred_name || 'Not specified'}</p>
          <p><strong>Date of Birth:</strong> {kid.date_of_birth || 'Not specified'}</p>
          <p><strong>Gender:</strong> {kid.gender}</p>
          <p><strong>Level:</strong> {kid.level}</p>
          <p><strong>Special Education:</strong> {kid.special_education ? 'Yes' : 'No'}</p>
          
          {kid.notes && (
            <div>
              <strong>Notes:</strong>
              <p>{kid.notes}</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Address Section */}
      <Card className="mt-3">
        <Card.Header>
          <h4>Address</h4>
        </Card.Header>
        <Card.Body>
          <AddressDisplay address={kid.address} />
        </Card.Body>
      </Card>

      {/* Guardians Section */}
      <Card className="mt-3">
        <Card.Header>
          <h4>Guardians ({kid.guardians?.length || 0})</h4>
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
