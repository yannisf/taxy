// React & Core Libraries
import React, { useState, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Types & Models
import { createKid } from '../../types/models';
import type { Kid } from '../../types/models';

// Services & Contexts
import { validationService } from '../../services/validation';
import { db } from '../../services/database';
import { useKids } from '../../hooks/useKids';
import { useClass } from '../../hooks/useClass';

// Utils
import { withTimeout } from '../../utils/asyncUtils';
import { logger } from '../../utils/logger';

// Hooks
import { useUnsavedChangesWarning } from '../../hooks/useUnsavedChangesWarning';

// Section Components
import BasicInfoSection from './sections/BasicInfoSection';
import AdditionalInfoSection from './sections/AdditionalInfoSection';
import AddressSection from './sections/AddressSection';
import GuardiansSection from './sections/GuardiansSection';
import UnsavedChangesModal from '../common/UnsavedChangesModal';

type KidFormProps = {
  initialData?: Kid;
  onSubmitSuccess: (kidId?: string) => void;
  onCancel?: () => void;
};

export const KidForm: React.FC<KidFormProps> = ({ initialData, onSubmitSuccess, onCancel }) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const bypassBlockerRef = useRef(false);
  const navigate = useNavigate();
  const { kidId } = useParams<{ kidId: string }>();
  const { refreshKids } = useKids();
  const { selectedClass } = useClass();
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    register,
    reset,
    setValue,
    watch
  } = useForm<Kid>({
      defaultValues: initialData || {
      first_name: '',
      last_name: '',
      gender: undefined as unknown as Kid['gender'],
      level: undefined as unknown as Kid['level'],
      extended_day_care: false,
      special_education: false,
      guardians: [],
      notes: '',
      private_notes: '',
      address: {
        country: 'Ελλάδα'
      }
    }
  });

  // Check if form has actual user input (for add mode). Guardians are part
  // of this same form (via useFieldArray in GuardiansSection), so `isDirty`
  // already reflects guardian edits - no separate tracking needed.
  const hasActualInput = () => {
    // If we're editing an existing kid, use isDirty
    if (initialData) {
      return isDirty;
    }

    // For add mode, check if any meaningful fields have been filled
    const formValues = watch();
    const hasName = formValues.first_name || formValues.last_name;
    const hasGender = formValues.gender !== undefined;
    const hasLevel = formValues.level !== undefined;
    const hasGuardians = (formValues.guardians?.length ?? 0) > 0;
    const hasNotes = formValues.notes || formValues.private_notes;

    return !!(hasName || hasGender || hasLevel || hasGuardians || hasNotes);
  };

  // Block navigation if there are unsaved changes (checked synchronously via function)
  const blocker = useUnsavedChangesWarning(() => {
    return !bypassBlockerRef.current && hasActualInput();
  });

  const handleCancel = () => {
    // Bypass blocker for explicit cancel action
    bypassBlockerRef.current = true;

    if (onCancel) {
      onCancel();
    } else if (kidId) {
      navigate(`/kids/${kidId}`);
    } else {
      navigate('/kids');
    }
  };

  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    const target = e.target as HTMLElement;
    // Modals are portaled but their key events still bubble here through the
    // React tree; they handle their own keys.
    if (target.closest('.modal')) return;

    if (e.key === 'Enter') {
      // Ctrl/Cmd+Enter saves from any element in the form, even one that
      // already handled Enter itself (e.g. autocomplete, date picker).
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.currentTarget.requestSubmit();
      } else if (target.tagName === 'INPUT') {
        // Plain Enter never saves: suppress the browser's implicit submit.
        e.preventDefault();
      }
      return;
    }

    // The date picker's Escape closes its calendar popup, not the whole form.
    if (e.key === 'Escape' && !e.defaultPrevented && !target.closest('.react-datepicker-wrapper')) {
      e.preventDefault();
      handleCancel();
    }
  };

  const onSubmit = useCallback(async (data: Kid) => {
    try {
      // Ensure minimum required data
      if (!data.first_name || !data.last_name || !data.gender || !data.level) {
        const missingFields = [];
        if (!data.first_name) missingFields.push(t('firstName'));
        if (!data.last_name) missingFields.push(t('lastName'));
        if (!data.gender) missingFields.push(t('gender'));
        if (!data.level) missingFields.push(t('level'));
        
        const errorMessage = t('missingFields', { fields: missingFields.join(', ') });
        setServerError(errorMessage);
        return;
      }

      // Validate kid data
      const validationResult = validationService.validateKid(data);
      
      if (!validationResult.valid) {
        const errorMessages = validationResult.errors?.map(err => 
          `${err.instancePath || ''} ${err.message}`
        ).join(', ') || 'Validation failed';
        
        setServerError(errorMessages);
        return;
      }

      // Save to database with timeout
      let newKidId: string | undefined;

      if (initialData) {
        // Update existing kid
        await withTimeout(db.updateKid(initialData.kid_id, data), 5000, 'Update timed out');
      } else {
        // Create new kid
        if (!selectedClass) {
          setServerError(t('selectClassBeforeAdding'));
          return;
        }

        // Validate class exists
        const classExists = await db.getClassById(selectedClass.class_id);
        if (!classExists) {
          setServerError('Class not found. It may have been deleted.');
          return;
        }

        const kidToSave = createKid({
          ...data,
          class_id: selectedClass.class_id
        });
        await withTimeout(db.addKid(kidToSave), 5000, 'Insertion timed out');
        newKidId = kidToSave.kid_id;
      }

      // Reset form, refresh kids list, and notify parent
      reset();
      await refreshKids(); // Refresh the kids list in the context

      // Bypass blocker for navigation after successful save
      bypassBlockerRef.current = true;
      onSubmitSuccess(newKidId);
    } catch (error) {
      logger.error('Kid insertion error:', error);
      setServerError(error instanceof Error ? error.message : t('error'));
    }
  }, [initialData, refreshKids, onSubmitSuccess, reset, selectedClass, t]);

  return (
    <Container>
      {serverError && (
        <Alert variant="danger" onClose={() => setServerError(null)} dismissible>
          {serverError}
        </Alert>
      )}
      <Form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleFormKeyDown}>
        <BasicInfoSection control={control} errors={errors} />

        <AdditionalInfoSection register={register} control={control} />

        <AddressSection control={control} errors={errors} />

        <GuardiansSection control={control} errors={errors} setValue={setValue} />

        <div className="d-flex gap-2">
          <Button variant="primary" type="submit">
            {initialData ? t('update') : t('addKid')}
          </Button>
          <Button variant="secondary" type="button" onClick={handleCancel}>
            {t('cancel')}
          </Button>
        </div>
      </Form>

      {/* Unsaved changes warning modal */}
      <UnsavedChangesModal
        show={blocker.state === 'blocked'}
        onDiscard={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
      />
    </Container>
  );
};

export default KidForm;
