// React & Core Libraries
import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Types & Models
import { createKid } from '../../types/models';
import type { Kid, Guardian } from '../../types/models';

// Services & Contexts
import { validationService } from '../../services/validation';
import { db } from '../../services/database';
import { useKids } from '../../contexts/KidsContext';
import { useClass } from '../../contexts/ClassContext';

// Section Components
import BasicInfoSection from './sections/BasicInfoSection';
import AdditionalInfoSection from './sections/AdditionalInfoSection';
import AddressSection from './sections/AddressSection';
import GuardiansSection from './sections/GuardiansSection';

type KidFormProps = {
  initialData?: Kid;
  onSubmitSuccess: () => void;
  onCancel?: () => void;
};

export const KidForm: React.FC<KidFormProps> = ({ initialData, onSubmitSuccess, onCancel }) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [guardians, setGuardians] = useState<Guardian[]>(initialData?.guardians || []);
  const navigate = useNavigate();
  const { kidId } = useParams<{ kidId: string }>();
  const { refreshKids } = useKids();
  const { selectedClass } = useClass();
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors },
    register,
    reset
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
      private_notes: ''
    }
  });

  const handleGuardiansChange = useCallback((updatedGuardians: Guardian[]) => {
    setGuardians(updatedGuardians);
  }, []);

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (kidId) {
      navigate(`/kids/${kidId}`);
    } else {
      navigate('/kids');
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

      // Use the guardians from state instead of form data
      data.guardians = guardians;

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
      if (initialData) {
        // Update existing kid
        const updates = { ...data, guardians };
        await Promise.race([
          db.updateKid(initialData.kid_id, updates),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Update timed out')), 5000)
          )
        ]);
      } else {
        // Create new kid
        if (!selectedClass) {
          setServerError(t('selectClassBeforeAdding'));
          return;
        }

        const kidToSave = createKid(data);
        await Promise.race([
          db.addKid(kidToSave),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Insertion timed out')), 5000)
          )
        ]);

        // Add kid to the selected class
        await Promise.race([
          db.addKidToClass(selectedClass.class_id, kidToSave.kid_id),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Adding to class timed out')), 5000)
          )
        ]);
      }

      // Reset form, refresh kids list, and notify parent
      reset();
      await refreshKids(); // Refresh the kids list in the context
      onSubmitSuccess();
    } catch (error) {
      console.error('Kid insertion error:', error);
      setServerError(error instanceof Error ? error.message : t('error'));
    }
  }, [guardians, initialData, refreshKids, onSubmitSuccess, reset, selectedClass, t]);

  return (
    <Container>
      {serverError && (
        <Alert variant="danger" onClose={() => setServerError(null)} dismissible>
          {serverError}
        </Alert>
      )}
      <Form onSubmit={handleSubmit(onSubmit)}>
        <BasicInfoSection control={control} errors={errors} />

        <AdditionalInfoSection register={register} />

        <AddressSection control={control} errors={errors} initialAddress={initialData?.address} />

        <GuardiansSection
          initialGuardians={initialData?.guardians}
          onChange={handleGuardiansChange}
        />

        <div className="d-flex gap-2">
          <Button variant="primary" type="submit">
            {initialData ? t('updateKid') : t('addKid')}
          </Button>
          <Button variant="secondary" type="button" onClick={handleCancel}>
            {t('cancel')}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default KidForm;
