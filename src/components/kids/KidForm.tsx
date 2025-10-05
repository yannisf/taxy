import React, { useState, useCallback, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Form, Button, Container, Row, Col, Alert, Accordion, Card } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
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
      gender: '' as any,
      level: '' as any,
      special_education: false,
      guardians: [],
      notes: '',
      private_notes: ''
    }
  });

  // Memoized callback functions for guardian management
  const handleSaveGuardian = useCallback((index: number, updatedGuardian: Guardian) => {
    const newGuardians = [...guardians];
    newGuardians[index] = updatedGuardian;
    setGuardians(newGuardians);
    setActiveKey(null);
  }, [guardians]);

  const handleDeleteGuardian = useCallback((guardian: Guardian) => {
    setGuardians(prev => prev.filter(g => g !== guardian));
    setActiveKey(null);
  }, []);

  const handleSaveNewGuardian = useCallback((newGuardian: Guardian) => {
    setGuardians(prev => [...prev, newGuardian]);
    setShowNewGuardian(false);
    setActiveKey(null);
  }, []);

  const handleCancelNewGuardian = useCallback(() => {
    setShowNewGuardian(false);
    setActiveKey(null);
  }, []);

  const handleAddGuardianClick = useCallback(() => {
    setShowNewGuardian(true);
    setActiveKey('new-guardian');
  }, []);

  // Memoized guardian count
  const guardianCount = useMemo(() => guardians.length, [guardians.length]);

  // Memoized address title
  const addressTitle = useMemo(() => {
    const addressString = formatAddressString(initialData?.address);
    return addressString ? `Address: ${addressString}` : 'Address';
  }, [initialData?.address]);

  // Address accordion expanded state
  const addressExpanded = useMemo(() => {
    const addressString = formatAddressString(initialData?.address);
    return !addressString; // Expanded if no address, collapsed if address exists
  }, [initialData?.address]);

  const handleCancel = useCallback(() => {
    if (kidId) {
      navigate(`/kids/${kidId}`);
    }
  }, [kidId, navigate]);

  const onSubmit = useCallback(async (data: Kid) => {
    try {
      // Ensure minimum required data
      if (!data.first_name || !data.last_name || !data.gender || !data.level) {
        const missingFields = [];
        if (!data.first_name) missingFields.push('First Name');
        if (!data.last_name) missingFields.push('Last Name');
        if (!data.gender) missingFields.push('Gender');
        if (!data.level) missingFields.push('Level');
        
        const errorMessage = `Missing required fields: ${missingFields.join(', ')}`;
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
          setServerError('Please select a class before adding a kid.');
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
      setServerError(error instanceof Error ? error.message : 'An unexpected error occurred');
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
              <Form.Label>First Name <span style={{color: 'red'}}>*</span></Form.Label>
              <Controller
                name="first_name"
                control={control}
                rules={{ required: 'First name is required' }}
                render={({ field }) => (
                  <Form.Control 
                    {...field} 
                    type="text" 
                    placeholder="Enter first name"
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
              <Form.Label>Last Name <span style={{color: 'red'}}>*</span></Form.Label>
              <Controller
                name="last_name"
                control={control}
                rules={{ required: 'Last name is required' }}
                render={({ field }) => (
                  <Form.Control 
                    {...field} 
                    type="text" 
                    placeholder="Enter last name"
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
              <Form.Label>Gender <span style={{color: 'red'}}>*</span></Form.Label>
              <Controller
                name="gender"
                control={control}
                rules={{ required: 'Gender is required' }}
                render={({ field }) => (
                  <Form.Select {...field} isInvalid={!!errors.gender}>
                    <option value="" disabled>Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
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
              <Form.Label>Level <span style={{color: 'red'}}>*</span></Form.Label>
              <Controller
                name="level"
                control={control}
                rules={{ required: 'Level is required' }}
                render={({ field }) => (
                  <Form.Select {...field} isInvalid={!!errors.level}>
                    <option value="" disabled>Select level</option>
                    <option value="pre-kindergartner">Pre-Kindergartner</option>
                    <option value="kindergartner">Kindergartner</option>
                    <option value="kindergartner-repeating">Kindergartner (Repeating)</option>
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
              <Form.Label>Preferred Name</Form.Label>
              <Controller
                name="preferred_name"
                control={control}
                render={({ field }) => (
                  <Form.Control 
                    {...field}
                    value={field.value ?? ''}
                    type="text" 
                    placeholder="Enter preferred name"
                  />
                )}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group className="mb-3">
              <Form.Label>Date of Birth</Form.Label>
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
            label="Special Education"
            {...register('special_education')}
          />
        </Form.Group>

        <Row>
          <Col>
            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control 
                {...register('notes')}
                as="textarea" 
                placeholder="General notes about the child"
                rows={4} 
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group className="mb-3">
              <Form.Label>Private Notes</Form.Label>
              <Form.Control 
                {...register('private_notes')}
                as="textarea" 
                placeholder="Confidential notes (restricted access)"
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
              <h5 className="mb-0">Guardians ({guardianCount})</h5>
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={handleAddGuardianClick}
                disabled={showNewGuardian}
              >
                + Add Guardian
              </Button>
            </div>
          </Card.Header>
          <Card.Body>
            {guardians.length === 0 && !showNewGuardian ? (
              <Alert variant="info" className="mb-0">
                No guardians added yet. Click "Add Guardian" to get started.
              </Alert>
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
            {initialData ? 'Update Kid' : 'Add Kid'}
          </Button>
          {initialData && (
            <Button variant="secondary" type="button" onClick={handleCancel}>
              Cancel
            </Button>
          )}
        </div>
      </Form>
    </Container>
  );
};

export default KidForm;
