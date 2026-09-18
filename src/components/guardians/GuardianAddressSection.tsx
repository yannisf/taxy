import React, { useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import type { Control, FieldErrors, FieldValues, UseFormSetValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { Guardian, Kid } from '../../types/models';
import { createEmptyAddress, formatAddressString, hasEnteredAddress } from '../../utils/addressUtils';
import AddressForm from '../common/AddressForm';

// A guardian's address is one of three things, never two of them: the kid's,
// their own, or not recorded. The whole thing is one line of text that says
// which - click it to change. The address fields are part of that control too:
// they appear when you pick "own address" there and nowhere else, so the two
// common cases add nothing to the form.
type AddressMode = 'same' | 'own' | 'none';

interface GuardianAddressSectionProps {
  control: Control<Kid>;
  setValue: UseFormSetValue<Kid>;
  errors?: FieldErrors<Guardian>;
  index: number;
  guardian: Guardian;
}

const GuardianAddressSection: React.FC<GuardianAddressSectionProps> = ({
  control,
  setValue,
  errors,
  index,
  guardian
}) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<AddressMode>(() => {
    if (guardian.same_address_as_kid) return 'same';
    return hasEnteredAddress(guardian.address) ? 'own' : 'none';
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleModeChange = (nextMode: AddressMode) => {
    setMode(nextMode);
    setValue(`guardians.${index}.same_address_as_kid`, nextMode === 'same', { shouldDirty: true });
    // The fields are shown and hidden from the control alone: picking "own
    // address" opens them, picking it again puts them away.
    setIsEditing(nextMode === 'own' && !(mode === 'own' && isEditing));
    if (nextMode !== 'own') {
      // Drop what was typed, so the stored address always matches what the
      // line says the guardian has.
      setValue(`guardians.${index}.address`, createEmptyAddress(), { shouldDirty: true });
    }
  };

  const modes: { value: AddressMode; label: string }[] = [
    { value: 'same', label: t('addressSameAsKid') },
    { value: 'own', label: t('addressOwn') },
    { value: 'none', label: t('addressNone') }
  ];

  const summary = mode === 'own'
    ? (formatAddressString(guardian.address) || t('addressOwn'))
    : modes.find(({ value }) => value === mode)!.label;

  return (
    <div className="mb-3">
      <div className="mb-2">
        <Dropdown>
          <Dropdown.Toggle
            variant="link"
            className="p-0 text-decoration-none text-body"
          >
            📍 {summary}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {modes.map(({ value, label }) => (
              <Dropdown.Item
                key={value}
                active={mode === value}
                onClick={() => handleModeChange(value)}
              >
                {label}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </div>
      {mode === 'own' && isEditing && (
        <div className="p-3 bg-body-tertiary rounded">
          <AddressForm
            control={control as unknown as Control<FieldValues>}
            errors={errors?.address}
            fieldPrefix={`guardians.${index}.address`}
          />
        </div>
      )}
    </div>
  );
};

export default GuardianAddressSection;
