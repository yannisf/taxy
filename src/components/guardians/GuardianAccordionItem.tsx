import React, { useState, useMemo, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Accordion, Button } from 'react-bootstrap';
import { X } from 'react-bootstrap-icons';
import { useForm, useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { Guardian } from '../../types/models';
import { validationService } from '../../services/validation';
import GuardianBasicInfo from './GuardianBasicInfo';
import GuardianContactInfo from './GuardianContactInfo';
import GuardianAddressSection from './GuardianAddressSection';
import GuardianTelephoneSection from './GuardianTelephoneSection';
import GuardianDeleteModal from './GuardianDeleteModal';

interface GuardianAccordionItemProps {
  guardian?: Guardian;
  isNew?: boolean;
  eventKey: string;
  onSave: (guardian: Guardian) => void;
  onDelete: (guardian: Guardian) => void;
  onCancel?: () => void;
  // Existing (non-new) guardians only: collapses this accordion item, used
  // when Escape discards in-progress edits.
  onRequestCollapse?: () => void;
}

export interface GuardianAccordionItemHandle {
  // Commits any pending, valid edits into the parent guardians list. Returns
  // false (without committing) if the guardian has unsaved invalid data.
  commitIfDirty: () => Promise<boolean>;
}

const GuardianAccordionItemComponent = forwardRef<GuardianAccordionItemHandle, GuardianAccordionItemProps>(({
  guardian,
  isNew = false,
  eventKey,
  onSave,
  onDelete,
  onCancel,
  onRequestCollapse
}, ref) => {
  const { t } = useTranslation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch
  } = useForm<Guardian>({
    defaultValues: guardian || {
      first_name: '',
      last_name: '',
      relation_with_kid: '' as Guardian['relation_with_kid'],
      authorized_for_pickup: false,
      same_address_as_kid: true,
      telephones: [],
      address: {
        country: 'Ελλάδα'
      }
    }
  });

  // Field array for managing telephones
  const { fields: telephoneFields, append: appendTelephone, remove: removeTelephone } = useFieldArray({
    control,
    name: 'telephones'
  });

  const onSubmit = useCallback((data: Guardian): boolean => {
    setValidationError(null);

    // Validate guardian data
    const validationResult = validationService.validateGuardian(data);

    if (!validationResult.valid) {
      const errorMessages = validationResult.errors?.map(err =>
        `${err.instancePath || ''} ${err.message}`
      ).join(', ') || 'Validation failed';
      setValidationError(errorMessages);
      return false;
    }

    onSave(data);
    // Only reset if it's a new guardian - existing guardians should keep their data
    if (isNew) {
      reset();
    }
    return true;
  }, [onSave, isNew, reset]);

  useImperativeHandle(ref, () => ({
    commitIfDirty: async () => {
      if (!isDirty) {
        return true;
      }
      let succeeded = false;
      await handleSubmit((data) => {
        succeeded = onSubmit(data);
      })();
      return succeeded;
    }
  }), [isDirty, handleSubmit, onSubmit]);

  const handleDelete = useCallback(() => {
    if (guardian) {
      onDelete(guardian);
    }
    setShowDeleteModal(false);
  }, [guardian, onDelete]);

  const handleFieldsKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    // Skip keys already handled elsewhere (e.g. autocomplete suggestion
    // selection) and anything originating from a modal.
    if (e.defaultPrevented) return;
    const target = e.target as HTMLElement;
    if (target.closest('.modal')) return;
    if (target.tagName !== 'INPUT' && target.tagName !== 'SELECT') return;

    if (e.key === 'Enter' && isNew) {
      // This guardian isn't part of the kid's guardians array yet: letting
      // Enter bubble up would submit the kid form natively and silently
      // discard this in-progress draft. Finalize the draft instead.
      e.preventDefault();
      e.stopPropagation();
      handleSubmit(onSubmit)();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      if (isNew) {
        onCancel?.();
      } else {
        reset();
        onRequestCollapse?.();
      }
    }
    // Enter on an existing guardian's fields is intentionally left alone:
    // it bubbles up and submits the kid form natively, which already
    // flushes this guardian's pending edits.
  }, [isNew, handleSubmit, onSubmit, onCancel, reset, onRequestCollapse]);

  // Helper function to get the relation translation key
  const getRelationKey = (relation: string) => {
    const relationMap: Record<string, string> = {
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
    return relationMap[relation] || relation;
  };

  const headerTitle = useMemo(() => {
    if (isNew) return t('newGuardian');
    if (guardian) {
      return (
        <>
          {guardian.first_name || t('unnamedGuardian')} {guardian.last_name || ''} {' '}
          <span className="badge text-bg-secondary">
            {t(getRelationKey(guardian.relation_with_kid))}
          </span>
        </>
      );
    }
    return t('guardian');
  }, [isNew, guardian, t]);

  return (
    <>
      <Accordion.Item eventKey={eventKey}>
        <Accordion.Header>
          <div className="d-flex justify-content-between align-items-center w-100">
            <span>{headerTitle}</span>
            {!isNew && guardian && (
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowDeleteModal(true);
                  }
                }}
              >
                <X size={20} />
              </span>
            )}
          </div>
        </Accordion.Header>
        <Accordion.Body>
          <div onKeyDown={handleFieldsKeyDown}>
            {validationError && (
              <div className="alert alert-danger">{validationError}</div>
            )}

            <GuardianBasicInfo control={control} errors={errors} />
            <GuardianContactInfo control={control} errors={errors} />
            <GuardianAddressSection
              control={control}
              errors={errors}
              watch={watch}
              guardian={guardian}
            />
            <GuardianTelephoneSection
              control={control}
              errors={errors}
              telephoneFields={telephoneFields}
              onAddTelephone={() => appendTelephone({
                country_code: '+30',
                number: '',
                telephone_type: 'mobile' as const
              })}
              onRemoveTelephone={removeTelephone}
            />

            {isNew ? (
              <div className="d-flex gap-2">
                <Button variant="primary" onClick={handleSubmit(onSubmit)}>
                  {t('addGuardian')}
                </Button>
                {onCancel && (
                  <Button variant="secondary" onClick={onCancel}>
                    {t('cancel')}
                  </Button>
                )}
              </div>
            ) : isDirty && (
              <small className="text-muted d-block">
                {t('guardianChangesPending')}
              </small>
            )}
          </div>
        </Accordion.Body>
      </Accordion.Item>

      <GuardianDeleteModal
        show={showDeleteModal}
        guardian={guardian}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </>
  );
});

export const GuardianAccordionItem = React.memo(GuardianAccordionItemComponent);
export default GuardianAccordionItem;
