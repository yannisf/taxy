import React, { useState } from 'react';
import { Accordion } from 'react-bootstrap';
import { X } from 'react-bootstrap-icons';
import { useWatch } from 'react-hook-form';
import type { Control, FieldErrors } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { Kid, Guardian } from '../../types/models';
import GuardianBasicInfo from './GuardianBasicInfo';
import GuardianContactInfo from './GuardianContactInfo';
import GuardianAddressSection from './GuardianAddressSection';
import GuardianTelephoneSection from './GuardianTelephoneSection';
import GuardianDeleteModal from './GuardianDeleteModal';

const relationKeys: Record<string, string> = {
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

interface GuardianAccordionItemProps {
  control: Control<Kid>;
  errors?: FieldErrors<Guardian>;
  index: number;
  eventKey: string;
  onDelete: () => void;
}

const GuardianAccordionItem: React.FC<GuardianAccordionItemProps> = ({
  control,
  errors,
  index,
  eventKey,
  onDelete
}) => {
  const { t } = useTranslation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  // Live values, so the header reflects unsaved edits as the user types.
  const guardian = useWatch({ control, name: `guardians.${index}` });

  return (
    <>
      <Accordion.Item eventKey={eventKey}>
        <Accordion.Header>
          <div className="d-flex justify-content-between align-items-center w-100">
            <span>
              {guardian.first_name || t('unnamedGuardian')} {guardian.last_name}{' '}
              {guardian.relation_with_kid && (
                <span className="badge text-bg-secondary">
                  {t(relationKeys[guardian.relation_with_kid] ?? guardian.relation_with_kid)}
                </span>
              )}
            </span>
            <span
              role="button"
              tabIndex={-1}
              className="p-2 me-3 text-danger border border-danger rounded"
              style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
              title={t('deleteGuardian')}
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteModal(true);
              }}
            >
              <X size={20} />
            </span>
          </div>
        </Accordion.Header>
        <Accordion.Body>
          <GuardianBasicInfo control={control} errors={errors} index={index} />
          <GuardianContactInfo control={control} errors={errors} index={index} />
          <GuardianAddressSection control={control} errors={errors} index={index} guardian={guardian} />
          <GuardianTelephoneSection control={control} errors={errors} index={index} />
        </Accordion.Body>
      </Accordion.Item>

      <GuardianDeleteModal
        show={showDeleteModal}
        guardian={guardian}
        onConfirm={() => {
          setShowDeleteModal(false);
          onDelete();
        }}
        onCancel={() => setShowDeleteModal(false)}
      />
    </>
  );
};

export default GuardianAccordionItem;
