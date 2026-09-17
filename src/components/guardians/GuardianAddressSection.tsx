import React from 'react';
import { Accordion } from 'react-bootstrap';
import type { Control, FieldErrors, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { Guardian, Kid } from '../../types/models';
import { formatAddressString } from '../../utils/addressUtils';
import AddressForm from '../common/AddressForm';

interface GuardianAddressSectionProps {
  control: Control<Kid>;
  errors?: FieldErrors<Guardian>;
  index: number;
  guardian: Guardian;
}

const GuardianAddressSection: React.FC<GuardianAddressSectionProps> = ({
  control,
  errors,
  index,
  guardian
}) => {
  const { t } = useTranslation();

  if (guardian.same_address_as_kid) {
    return (
      <div className="mb-3 p-3 bg-body-secondary rounded">
        <small className="text-muted">
          {t('sameAddressMessage')}
        </small>
      </div>
    );
  }

  const addressString = formatAddressString(guardian.address);

  return (
    <Accordion className="mb-3">
      <Accordion.Item eventKey="0">
        <Accordion.Header>
          {addressString ? `${t('guardianAddress')}: ${addressString}` : t('guardianAddress')}
        </Accordion.Header>
        <Accordion.Body>
          <AddressForm
            control={control as unknown as Control<FieldValues>}
            errors={errors?.address}
            fieldPrefix={`guardians.${index}.address`}
          />
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
};

export default GuardianAddressSection;
