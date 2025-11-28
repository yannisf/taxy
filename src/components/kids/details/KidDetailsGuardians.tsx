import React from 'react';
import { Card, Row, Col, Alert, Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import GuardianCard from '../../guardians/GuardianCard';
import type { Guardian } from '../../../types/models';

interface KidDetailsGuardiansProps {
  guardians: Guardian[];
}

const KidDetailsGuardians: React.FC<KidDetailsGuardiansProps> = ({ guardians }) => {
  const { t } = useTranslation();

  return (
    <Card className="mt-3">
      <Card.Header className="d-flex align-items-center gap-2">
        <h4 className="mb-0">{t('guardians')}</h4>
        <Badge bg="secondary">{guardians.length}</Badge>
      </Card.Header>
      <Card.Body>
        {guardians.length === 0 ? (
          <Alert variant="secondary" className="mb-0">
            {t('noGuardiansForKid')}
          </Alert>
        ) : (
          <Row>
            {guardians.map((guardian, index) => (
              <Col key={index} md={6} lg={4} className="mb-3">
                <GuardianCard guardian={guardian} />
              </Col>
            ))}
          </Row>
        )}
      </Card.Body>
    </Card>
  );
};

export default KidDetailsGuardians;
