import React from 'react';
import { Card } from 'react-bootstrap';
import { CheckLg } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import AddressDisplay from '../../common/AddressDisplay';
import { hasAddressData } from '../../../utils/addressUtils';
import { formatDateDisplay } from '../../../utils/dateUtils';
import type { Kid } from '../../../types/models';

interface KidDetailsPersonalInfoProps {
  kid: Kid;
}

const KidDetailsPersonalInfo: React.FC<KidDetailsPersonalInfoProps> = ({ kid }) => {
  const { t } = useTranslation();

  return (
    <Card.Body>
      <p><strong>{t('firstName')}:</strong> {kid.first_name}</p>
      <p><strong>{t('lastName')}:</strong> {kid.last_name}</p>
      {kid.preferred_name && (
        <p><strong>{t('preferredName')}:</strong> {kid.preferred_name}</p>
      )}
      {kid.date_of_birth && (
        <p><strong>{t('dateOfBirth')}:</strong> {formatDateDisplay(kid.date_of_birth)}</p>
      )}
      {kid.gender && (
        <p><strong>{t('gender')}:</strong> {t(`gender${kid.gender === 'male' ? 'Boy' : 'Girl'}`)}</p>
      )}
      <p><strong>{t('level')}:</strong> {t(`level${kid.level === 'pre-kindergartner' ? 'PreKindergarten' : kid.level === 'kindergartner' ? 'Kindergarten' : 'KindergartenRepeating'}`)}</p>
      {kid.extended_day_care && (
        <p><strong>{t('extendedDayCare')}</strong> <CheckLg className="text-success" /></p>
      )}
      {kid.special_education && (
        <p><strong>{t('specialEducationStatus')}</strong> <CheckLg className="text-success" /></p>
      )}

      {/* Address */}
      {hasAddressData(kid.address) && (
        <p><strong>{t('address')}:</strong> <AddressDisplay address={kid.address} className="d-inline" /></p>
      )}

      {/* Notes */}
      {kid.notes && (
        <div className="mt-3">
          <strong>{t('notes')}:</strong>
          <p>{kid.notes}</p>
        </div>
      )}
    </Card.Body>
  );
};

export default KidDetailsPersonalInfo;
