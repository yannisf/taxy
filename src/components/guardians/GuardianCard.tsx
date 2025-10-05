import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import type { Guardian } from '../../types/models';
import AddressDisplay from '../common/AddressDisplay';

interface GuardianCardProps {
  guardian: Guardian;
}

const GuardianCardComponent: React.FC<GuardianCardProps> = ({ guardian }) => {
  return (
    <Card className="h-100">
      <Card.Body>
        <Card.Title className="h6">
          {guardian.name} {guardian.surname}
        </Card.Title>
        <Card.Subtitle className="mb-2 text-muted">
          {guardian.relation_with_kid.charAt(0).toUpperCase() + guardian.relation_with_kid.slice(1)}
        </Card.Subtitle>
        
        <div className="mb-2">
          {guardian.authorized_for_pickup && (
            <Badge bg="success" className="me-1">
              ✓ Pickup Authorized
            </Badge>
          )}
          {guardian.same_address_as_kid && (
            <Badge bg="info" className="me-1">
              📍 Same Address
            </Badge>
          )}
        </div>

        {guardian.telephones && guardian.telephones.length > 0 && (
          <div className="small text-muted mb-2">
            📞 {guardian.telephones.length} phone number{guardian.telephones.length > 1 ? 's' : ''}
          </div>
        )}

        {/* Address Display */}
        <div className="small">
          {!guardian.same_address_as_kid && (
            <AddressDisplay 
              address={guardian.address} 
              className="text-muted"
            />
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export const GuardianCard = React.memo(GuardianCardComponent);
export default GuardianCard;
