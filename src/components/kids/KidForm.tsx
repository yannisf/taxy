import React, { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Form, Button, Container, Row, Col, Alert, Accordion, Card } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createKid } from '../../types/models';
import type { Kid, Guardian } from '../../types/models';
import { validationService } from '../../services/validation';
import { db } from '../../services/database';
import { useKids } from '../../contexts/KidsContext';
import { useClass } from '../../contexts/ClassContext';
import GuardianAccordionItem from '../guardians/GuardianAccordionItem';
import AddressForm from '../common/AddressForm';
import { formatAddressString } from '../../utils/addressUtils';

type KidFormProps = {
  initialData?: Kid;
  onSubmitSuccess: () => void;
};

export const KidForm: React.FC<KidFormProps> = ({ initialData, onSubmitSuccess }) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [guardians, setGuardians] = useState<Guardian[]>(initialData?.guardians || []);
  const [showNewGuardian, setShowNewGuardian] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);
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
      gender: 'male' as const,
      level: 'pre-kindergartner' as const,
      extended_day_care: false,
      special_education: false,
      guardians: [],
      notes: '',
      private_notes: ''
    }
  });

  // Guardian management functions
  const handleSaveGuardian = (index: number, updatedGuardian: Guardian) => {
    const newGuardians = [...guardians];
    newGuardians[index] = updatedGuardian;
    setGuardians(newGuardians);
    setActiveKey(null);
  };

  const handleDeleteGuardian = (guardian: Guardian) => {
    setGuardians(prev => prev.filter(g => g !== guardian));
    setActiveKey(null);
  };

  const handleSaveNewGuardian = (newGuardian: Guardian) => {
    setGuardians(prev => [...prev, newGuardian]);
    setShowNewGuardian(false);
    setActiveKey(null);
  };

  const handleCancelNewGuardian = () => {
    setShowNewGuardian(false);
    setActiveKey(null);
  };

  const handleAddGuardianClick = () => {
    setShowNewGuardian(true);
    setActiveKey('new-guardian');
  };

  // Simple values - no need for memoization
  const guardianCount = guardians.length;
  const addressString = formatAddressString(initialData?.address);
  const addressTitle = addressString ? `${t('common:labels.address')}: ${addressString}` : t('common:labels.address');
  const addressExpanded = !addressString; // Expanded if no address, collapsed if address exists

  const handleCancel = () => {
    if (kidId) {
      navigate(`/kids/${kidId}`);
    }
  };

  const onSubmit = useCallback(async (data: Kid) => {
    try {
      // Ensure minimum required data
      if (!data.first_name || !data.last_name || !data.gender || !data.level) {
        const missingFields = [];
        if (!data.first_name) missingFields.push(t('common:labels.firstName'));
        if (!data.last_name) missingFields.push(t('common:labels.lastName'));
        if (!data.gender) missingFields.push(t('common:labels.gender'));
        if (!data.level) missingFields.push(t('kids:form.level'));
        
        const errorMessage = t('kids:messages.validation.missingFields', { fields: missingFields.join(', ') });
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
          setServerError(t('kids:messages.validation.selectClass'));
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
      setServerError(error instanceof Error ? error.message : t('common:status.error'));
    }
  }, [guardians, initialData, refreshKids, onSubmitSuccess, reset]);

  return (
    <Container>
      {serverError && (
        <Alert variant="danger" onClose={() => setServerError(null)} dismissible>
          {serverError}
        </Alert>
      )}
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Row>
          <Col>
            <Form.Group className="mb-3">
              <Form.Label>{t('common:labels.firstName')} <span style={{color: 'red'}}>{t('common:labels.required')}</span></Form.Label>
              <Controller
                name="first_name"
                control={control}
                rules={{ required: t('common:validation.fieldRequired', { field: t('common:labels.firstName') }) }}
                render={({ field }) => (
                  <Form.Control 
                    {...field} 
                    type="text" 
                    placeholder={t('common:placeholders.firstName')}
                    isInvalid={!!errors.first_name}
                  />
                )}
              />
              {errors.first_name && (
                <Form.Control.Feedback type="invalid">
                  {errors.first_name.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>
          </Col>
          <Col>
            <Form.Group className="mb-3">
              <Form.Label>{t('common:labels.lastName')} <span style={{color: 'red'}}>{t('common:labels.required')}</span></Form.Label>
              <Controller
                name="last_name"
                control={control}
                rules={{ required: t('common:validation.fieldRequired', { field: t('common:labels.lastName') }) }}
                render={({ field }) => (
                  <Form.Control 
                    {...field} 
                    type="text" 
                    placeholder={t('common:placeholders.lastName')}
                    isInvalid={!!errors.last_name}
                  />
                )}
              />
              {errors.last_name && (
                <Form.Control.Feedback type="invalid">
                  {errors.last_name.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col>
            <Form.Group className="mb-3">
              <Form.Label>{t('common:labels.gender')} <span style={{color: 'red'}}>{t('common:labels.required')}</span></Form.Label>
              <Controller
                name="gender"
                control={control}
                rules={{ required: t('common:validation.fieldRequired', { field: t('common:labels.gender') }) }}
                render={({ field }) => (
                  <Form.Select {...field} isInvalid={!!errors.gender}>
                    <option value="" disabled>{t('common:gender.selectGender')}</option>
                    <option value="male">{t('common:gender.male')}</option>
                    <option value="female">{t('common:gender.female')}</option>
                    <option value="other">{t('common:gender.other')}</option>
                  </Form.Select>
                )}
              />
              {errors.gender && (
                <Form.Control.Feedback type="invalid">
                  {errors.gender.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>
          </Col>
          <Col>
            <Form.Group className="mb-3">
              <Form.Label>{t('kids:form.level')} <span style={{color: 'red'}}>{t('common:labels.required')}</span></Form.Label>
              <Controller
                name="level"
                control={control}
                rules={{ required: t('common:validation.fieldRequired', { field: t('kids:form.level') }) }}
                render={({ field }) => (
                  <Form.Select {...field} isInvalid={!!errors.level}>
                    <option value="" disabled>{t('kids:levels.selectLevel')}</option>
                    <option value="pre-kindergartner">{t('kids:levels.preKindergarten')}</option>
                    <option value="kindergartner">{t('kids:levels.kindergarten')}</option>
                    <option value="kindergartner-repeating">{t('kids:levels.kindergartenRepeating')}</option>
                  </Form.Select>
                )}
              />
              {errors.level && (
                <Form.Control.Feedback type="invalid">
                  {errors.level.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col>
            <Form.Group className="mb-3">
              <Form.Label>{t('kids:form.preferredName')}</Form.Label>
              <Controller
                name="preferred_name"
                control={control}
                render={({ field }) => (
                  <Form.Control 
                    {...field}
                    value={field.value ?? ''}
                    type="text" 
                    placeholder={t('kids:form.placeholders.preferredName')}
                  />
                )}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group className="mb-3">
              <Form.Label>{t('common:labels.dateOfBirth')}</Form.Label>
              <Controller
                name="date_of_birth"
                control={control}
                render={({ field }) => (
                  <Form.Control 
                    {...field}
                    value={field.value ?? ''}
                    type="date" 
                  />
                )}
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Check 
            type="checkbox"
            label={t('kids:form.extendedDayCare')}
            {...register('extended_day_care')}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Check 
            type="checkbox"
            label={t('kids:form.specialEducation')}
            {...register('special_education')}
          />
        </Form.Group>

        <Row>
          <Col>
            <Form.Group className="mb-3">
              <Form.Label>{t('common:labels.notes')}</Form.Label>
              <Form.Control 
                {...register('notes')}
                as="textarea" 
                placeholder={t('common:placeholders.notes')}
                rows={4} 
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group className="mb-3">
              <Form.Label>{t('common:labels.privateNotes')}</Form.Label>
              <Form.Control 
                {...register('private_notes')}
                as="textarea" 
                placeholder={t('common:placeholders.privateNotes')}
                rows={4} 
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Address Section */}
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

        {/* Guardians Section */}
        <Card className="mb-4">
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">{t('guardians:title.guardians')} ({guardianCount})</h5>
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={handleAddGuardianClick}
                disabled={showNewGuardian}
              >
                + {t('guardians:actions.addGuardian')}
              </Button>
            </div>
          </Card.Header>
          <Card.Body>
            {guardians.length === 0 && !showNewGuardian ? (
              <div className="mb-0 p-3 bg-body-tertiary rounded text-muted">
                {t('guardians:messages.noGuardians')}
              </div>
            ) : (
              <Accordion activeKey={activeKey} onSelect={(key) => setActiveKey(key as string | null)}>
                {guardians.map((guardian, index) => (
                  <GuardianAccordionItem
                    key={index}
                    guardian={guardian}
                    eventKey={`guardian-${index}`}
                    onSave={(updatedGuardian) => handleSaveGuardian(index, updatedGuardian)}
                    onDelete={handleDeleteGuardian}
                  />
                ))}
                
                {showNewGuardian && (
                  <GuardianAccordionItem
                    isNew
                    eventKey="new-guardian"
                    onSave={handleSaveNewGuardian}
                    onDelete={() => {}}
                    onCancel={handleCancelNewGuardian}
                  />
                )}
              </Accordion>
            )}
          </Card.Body>
        </Card>

        <div className="d-flex gap-2">
          <Button variant="primary" type="submit">
            {initialData ? t('kids:actions.updateKid') : t('kids:actions.addKid')}
          </Button>
          {initialData && (
            <Button variant="secondary" type="button" onClick={handleCancel}>
              {t('common:buttons.cancel')}
            </Button>
          )}
        </div>
      </Form>
    </Container>
  );
};

export default KidForm;
