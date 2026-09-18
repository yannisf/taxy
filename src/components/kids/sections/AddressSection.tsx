import React, { useState } from 'react';
import { CaretDownFill, CaretUpFill } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import { useWatch } from 'react-hook-form';
import type { Control, FieldErrors } from 'react-hook-form';
import type { Kid } from '../../../types/models';
import AddressForm from '../../common/AddressForm';
import { formatAddressString } from '../../../utils/addressUtils';

interface AddressSectionProps {
  control: Control<Kid>;
  errors: FieldErrors<Kid>;
}

// Same deal as a guardian's address: one line that says what the kid's address
// is, and the fields only once you ask for them. The line keeps showing the
// address while the fields are away, so nothing is hidden by closing them.
const AddressSection: React.FC<AddressSectionProps> = ({ control, errors }) => {
  const { t } = useTranslation();
  const address = useWatch({ control, name: 'address' });
  const [isEditing, setIsEditing] = useState(false);

  const summary = formatAddressString(address) || t('addressNone');

  return (
    <div className="mb-4">
      <button
        type="button"
        className="btn btn-link p-0 mb-2 text-decoration-none text-body d-flex align-items-center gap-2"
        onClick={() => setIsEditing(!isEditing)}
        aria-expanded={isEditing}
        aria-label={isEditing ? t('hideAddress') : t('editAddress')}
      >
        <span>📍 {summary}</span>
        {isEditing ? <CaretUpFill size={12} /> : <CaretDownFill size={12} />}
      </button>
      {isEditing && (
        <div className="p-3 bg-body-tertiary rounded">
          <AddressForm
            control={control as unknown as Control<Record<string, unknown>>}
            errors={errors.address}
          />
        </div>
      )}
    </div>
  );
};

export default AddressSection;
