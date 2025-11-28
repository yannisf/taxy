import React, { useMemo } from 'react';
import { Accordion } from 'react-bootstrap';
import type { Control, FieldErrors, UseFormWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { Guardian } from '../../types/models';
import { formatAddressString } from '../../utils/addressUtils';
import AddressForm from '../common/AddressForm';

interface GuardianAddressSectionProps {
  control: Control<Guardian>;
  errors: FieldErrors<Guardian>;
  watch: UseFormWatch<Guardian>;
  guardian?: Guardian;
}

const GuardianAddressSection: React.FC<GuardianAddressSectionProps> = ({
  control,
  errors,
  watch,
  guardian
}) => {
  const { t } = useTranslation();
  const sameAddressAsKid = watch('same_address_as_kid');

  // Memoized address title
  const addressTitle = useMemo(() => {
    const addressString = formatAddressString(guardian?.address);
    return addressString ? `${t('guardianAddress')}: ${addressString}` : t('guardianAddress');
  }, [guardian?.address, t]);

  // Address accordion expanded state
  const addressExpanded = useMemo(() => {
    const addressString = formatAddressString(guardian?.address);
    return !addressString;
  }, [guardian?.address]);

  if (sameAddressAsKid) {
    return (
      <div className="mb-3 p-3 bg-body-secondary rounded">
        <small className="text-muted">
          {t('sameAddressMessage')}
        </small>
      </div>
    );
  }

  return (
    <Accordion className="mb-3" defaultActiveKey={addressExpanded ? "0" : undefined}>
      <Accordion.Item eventKey="0">
        <Accordion.Header>{addressTitle}</Accordion.Header>
        <Accordion.Body>
          <AddressForm
            control={control as any}
            errors={errors.address}
          />
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
};

export default GuardianAddressSection;
