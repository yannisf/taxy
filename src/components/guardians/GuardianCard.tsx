import React, { useState } from 'react';
import { Card, Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Clipboard, ClipboardCheck } from 'react-bootstrap-icons';
import type { Guardian } from '../../types/models';
import { logger } from '../../utils/logger';
import AddressDisplay from '../common/AddressDisplay';
import TelephoneDisplay from '../common/TelephoneDisplay';

interface GuardianCardProps {
  guardian: Guardian;
}

const GuardianCardComponent: React.FC<GuardianCardProps> = ({ guardian }) => {
  const { t } = useTranslation();
  const [emailCopied, setEmailCopied] = useState(false);

  // Helper function to get the relation translation key
  const getRelationKey = (relation: string) => {
    const relationMap: Record<string, string> = {
      'father': 'relationFather',
      'mother': 'relationMother',
      'brother': 'relationBrother',
      'sister': 'relationSister',
      'grandfather': 'relationGrandfather',
      'grandmother': 'relationGrandmother',
      'uncle': 'relationUncle',
      'aunt': 'relationAunt',
      'godfather': 'relationGodfather',
      'godmother': 'relationGodmother',
      'caregiver': 'relationCaregiver',
      'extended family': 'relationExtendedFamily',
      'friend': 'relationFriend',
      // Legacy values kept for backward compatibility with existing records.
      'sibling': 'relationSibling',
      'grandparent': 'relationGrandparent'
    };
    return relationMap[relation] || relation;
  };

  // Copy email to clipboard
  const handleCopyEmail = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!guardian.email) return;

    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(guardian.email);
        setEmailCopied(true);
        setTimeout(() => setEmailCopied(false), 2000);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = guardian.email;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand('copy');
          setEmailCopied(true);
          setTimeout(() => setEmailCopied(false), 2000);
        } catch (err) {
          logger.error('Fallback copy failed:', err);
          alert('Could not copy email to clipboard');
        }

        document.body.removeChild(textArea);
      }
    } catch (err) {
      logger.error('Failed to copy email:', err);
      alert('Could not copy email to clipboard');
    }
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

        {guardian.profession && (
          <div className="mb-2">
            <small className="text-muted text-nowrap">
              💼 {guardian.profession}
            </small>
          </div>
        )}

        {guardian.email && (
          <div className="mb-1 d-flex align-items-center gap-1">
            <small className="text-muted">
              📧{' '}
              <a
                href={`mailto:${guardian.email}`}
                className="text-decoration-none"
                style={{
                  color: 'inherit',
                  cursor: 'pointer',
                  borderBottom: '1px dotted currentColor'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderBottom = '1px solid currentColor'}
                onMouseLeave={(e) => e.currentTarget.style.borderBottom = '1px dotted currentColor'}
              >
                {guardian.email}
              </a>
            </small>
            <button
              type="button"
              onClick={handleCopyEmail}
              className="btn btn-link p-0 border-0"
              style={{ fontSize: '0.875rem', lineHeight: 1, minWidth: '20px' }}
              title={emailCopied ? t('copied') : t('copyEmail')}
              aria-label={emailCopied ? t('copied') : t('copyEmail')}
            >
              {emailCopied ? (
                <ClipboardCheck size={14} className="text-success" />
              ) : (
                <Clipboard size={14} className="text-muted" />
              )}
            </button>
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
              hideWhenEmpty
            />
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export const GuardianCard = React.memo(GuardianCardComponent);
export default GuardianCard;
