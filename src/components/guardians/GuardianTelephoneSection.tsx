import React from 'react';
import { useFieldArray } from 'react-hook-form';
import type { Control, FieldErrors } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { Guardian, Kid } from '../../types/models';
import TelephoneForm from '../common/TelephoneForm';
import TelephonesSectionHeader from './TelephonesSectionHeader';

interface GuardianTelephoneSectionProps {
  control: Control<Kid>;
  errors?: FieldErrors<Guardian>;
  index: number;
}

const GuardianTelephoneSection: React.FC<GuardianTelephoneSectionProps> = ({
  control,
  errors,
  index
}) => {
  const { t } = useTranslation();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `guardians.${index}.telephones`
  });

  return (
    <div className="mb-4">
      <TelephonesSectionHeader
        telephoneCount={fields.length}
        onAddTelephone={() => append({ country_code: '+30', number: '', telephone_type: 'mobile' })}
      />
      {fields.length === 0 ? (
        <div className="mb-0 p-3 bg-body-tertiary rounded text-muted">
          {t('noTelephonesYet')}
        </div>
      ) : (
        fields.map((field, telephoneIndex) => (
          <TelephoneForm
            key={field.id}
            control={control as unknown as Control<Record<string, unknown>>}
            errors={errors?.telephones?.[telephoneIndex]}
            fieldPrefix={`guardians.${index}.telephones.${telephoneIndex}`}
            onRemove={() => remove(telephoneIndex)}
            showRemoveButton={true}
          />
        ))
      )}
    </div>
  );
};

export default GuardianTelephoneSection;
