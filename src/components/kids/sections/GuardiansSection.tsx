import { useState } from 'react';
import { Accordion } from 'react-bootstrap';
import { useFieldArray } from 'react-hook-form';
import type { Control, FieldErrors, UseFormSetValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { Guardian, Kid } from '../../../types/models';
import { createEmptyAddress } from '../../../utils/addressUtils';
import GuardianAccordionItem from '../../guardians/GuardianAccordionItem';
import GuardiansSectionHeader from './GuardiansSectionHeader';

interface GuardiansSectionProps {
  control: Control<Kid>;
  errors: FieldErrors<Kid>;
  setValue: UseFormSetValue<Kid>;
}

const blankGuardian: Guardian = {
  first_name: '',
  last_name: '',
  relation_with_kid: '' as Guardian['relation_with_kid'],
  authorized_for_pickup: true,
  // No address until someone says otherwise - not even the kid's.
  same_address_as_kid: false,
  telephones: [],
  address: createEmptyAddress()
};

// Guardians are just another field of the kid's own form (via useFieldArray),
// not a separate form of their own. Every keystroke updates the kid form
// directly, so "Update Kid" is a single, ordinary submit - no separate step
// is needed to pull in-progress guardian edits into the saved data.
const GuardiansSection: React.FC<GuardiansSectionProps> = ({ control, errors, setValue }) => {
  const { t } = useTranslation();
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const { fields, append, remove } = useFieldArray({ control, name: 'guardians' });

  const handleAddGuardianClick = () => {
    const newIndex = fields.length;
    append(blankGuardian);
    setActiveKey(`guardian-${newIndex}`);
  };

  const handleDeleteGuardian = (index: number) => {
    remove(index);
    setActiveKey(null);
  };

  return (
    <div className="mb-4">
      <GuardiansSectionHeader
        onAddGuardian={handleAddGuardianClick}
      />
      {fields.length === 0 ? (
        <div className="mb-0 p-3 bg-body-tertiary rounded text-muted">
          {t('noGuardiansYet')}
        </div>
      ) : (
        <Accordion activeKey={activeKey} onSelect={(key) => setActiveKey(key as string | null)}>
          {fields.map((field, index) => {
            const eventKey = `guardian-${index}`;
            return (
              <GuardianAccordionItem
                key={field.id}
                control={control}
                setValue={setValue}
                errors={errors.guardians?.[index]}
                index={index}
                eventKey={eventKey}
                onDelete={() => handleDeleteGuardian(index)}
              />
            );
          })}
        </Accordion>
      )}
    </div>
  );
};

export default GuardiansSection;
