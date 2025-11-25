import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import type { Guardian } from '../../types/models';
import AddressDisplay from '../common/AddressDisplay';
import TelephoneDisplay from '../common/TelephoneDisplay';

interface GuardianCardProps {
  guardian: Guardian;
}

const GuardianCardComponent: React.FC<GuardianCardProps> = ({ guardian }) => {
  const { t } = useTranslation();

  // Helper function to get the relation translation key
  const getRelationKey = (relation: string) => {
    const relationMap: Record<string, string> = {
      'father': 'relationFather',
      'mother': 'relationMother',
      'sibling': 'relationSibling',
      'grandparent': 'relationGrandparent',
      'extended family': 'relationExtendedFamily',
      'friend': 'relationFriend'
    };
    return relationMap[relation] || relation;
  };

  return (
    <Card className="h-100">
      <Card.Body>
        <Card.Title className="h6">
          {guardian.first_name || t('unnamedGuardian')} {guardian.last_name}
        </Card.Title>
        <Card.Subtitle className="mb-2 text-muted">
          {t(getRelationKey(guardian.relation_with_kid))}
        </Card.Subtitle>
        
        <div className="mb-2">
          {guardian.authorized_for_pickup && (
            <Badge bg="success" className="me-1">
              {t('pickupAuthorizedBadge')}
            </Badge>
          )}
          {guardian.same_address_as_kid && (
            <Badge bg="info" className="me-1">
              {t('sameAddressBadge')}
            </Badge>
          )}
        </div>

        {guardian.email && (
          <div className="mb-1">
            <small className="text-muted">
              📧 {guardian.email}
            </small>
          </div>
        )}

        {guardian.profession && (
          <div className="mb-2">
            <small className="text-muted">
              💼 {guardian.profession}
            </small>
          </div>
        )}

        {guardian.telephones && guardian.telephones.length > 0 && (
          <div className="mb-2">
            {guardian.telephones.map((telephone, index) => (
              <TelephoneDisplay 
                key={index}
                telephone={telephone}
                className="small text-muted d-block"
              />
            ))}
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
