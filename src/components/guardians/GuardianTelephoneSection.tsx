import React from 'react';
import type { Control, FieldErrors, FieldArrayWithId } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { Guardian } from '../../types/models';
import TelephoneForm from '../common/TelephoneForm';
import TelephonesSectionHeader from './TelephonesSectionHeader';

interface GuardianTelephoneSectionProps {
  control: Control<Guardian>;
  errors: FieldErrors<Guardian>;
  telephoneFields: FieldArrayWithId<Guardian, 'telephones', 'id'>[];
  onAddTelephone: () => void;
  onRemoveTelephone: (index: number) => void;
}

const GuardianTelephoneSection: React.FC<GuardianTelephoneSectionProps> = ({
  control,
  errors,
  telephoneFields,
  onAddTelephone,
  onRemoveTelephone
}) => {
  const { t } = useTranslation();

  return (
    <div className="mb-4">
      <TelephonesSectionHeader
        telephoneCount={telephoneFields.length}
        onAddTelephone={onAddTelephone}
      />
      {telephoneFields.length === 0 ? (
        <div className="mb-0 p-3 bg-body-tertiary rounded text-muted">
          {t('noTelephonesYet')}
        </div>
      ) : (
        <>
          {telephoneFields.map((field: FieldArrayWithId<Guardian, 'telephones', 'id'>, index: number) => (
            <TelephoneForm
              key={field.id}
              control={control as any}
              errors={errors.telephones?.[index]}
              fieldPrefix={`telephones.${index}`}
              onRemove={() => onRemoveTelephone(index)}
              showRemoveButton={true}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default GuardianTelephoneSection;
