import React from 'react';
import { Accordion } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import type { Control, FieldErrors } from 'react-hook-form';
import type { Kid, Address } from '../../../types/models';
import AddressForm from '../../common/AddressForm';
import { formatAddressString } from '../../../utils/addressUtils';

interface AddressSectionProps {
  control: Control<Kid>;
  errors: FieldErrors<Kid>;
  initialAddress?: Address;
}

const AddressSection: React.FC<AddressSectionProps> = ({ control, errors, initialAddress }) => {
  const { t } = useTranslation();

  const addressString = formatAddressString(initialAddress);
  const addressTitle = addressString ? `${t('address')}: ${addressString}` : t('address');
  const addressExpanded = !addressString; // Expanded if no address, collapsed if address exists

  return (
    <Accordion className="mb-4" defaultActiveKey={addressExpanded ? "0" : undefined}>
      <Accordion.Item eventKey="0">
        <Accordion.Header>{addressTitle}</Accordion.Header>
        <Accordion.Body>
          <AddressForm
            control={control}
            errors={errors.address}
          />
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
};

export default AddressSection;
