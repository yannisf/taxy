import React, { useState, useCallback, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Form, Button, Container, Row, Col, Alert, Accordion, Card } from 'react-bootstrap';
import { createKid } from '../../types/models';
import type { Kid, Guardian } from '../../types/models';
import { validationService } from '../../services/validation';
import { db } from '../../services/database';
import { useKids } from '../../contexts/KidsContext';
import GuardianAccordionItem from '../guardians/GuardianAccordionItem';
import AddressForm from '../common/AddressForm';

type KidFormProps = {
  initialData?: Kid;
  onSubmitSuccess: () => void;
};

export const KidForm: React.FC<KidFormProps> = ({ initialData, onSubmitSuccess }) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [guardians, setGuardians] = useState<Guardian[]>(initialData?.guardians || []);
  const [showNewGuardian, setShowNewGuardian] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const { refreshKids } = useKids();
  const { 
    control, 
    handleSubmit, 
    formState: { errors }, 
    register,
    reset 
  } = useForm<Kid>({
    defaultValues: initialData || {
      name: '',
      surname: '',
      gender: 'male',
      level: 'kindergartner',
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

  const handleDeleteGuardian = useCallback((guardianId: string) => {
    setGuardians(prev => prev.filter(g => g.guardian_id !== guardianId));
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

  const onSubmit = useCallback(async (data: Kid) => {
    try {
      // Ensure minimum required data
      if (!data.name || !data.surname || !data.gender || !data.level) {
        const missingFields = [];
        if (!data.name) missingFields.push('Name');
        if (!data.surname) missingFields.push('Surname');
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

      // Prepare kid object for saving
      const kidToSave = initialData 
        ? { ...data, kid_id: initialData.kid_id } 
        : createKid(data);

      // Save to database with timeout
      await Promise.race([
        db.addKid(kidToSave),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Insertion timed out')), 5000)
        )
      ]);

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
              <Form.Label>Name <span style={{color: 'red'}}>*</span></Form.Label>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Name is required' }}
                render={({ field }) => (
                  <Form.Control 
                    {...field} 
                    type="text" 
                    placeholder="Enter name"
                    isInvalid={!!errors.name}
                  />
                )}
              />
              {errors.name && (
                <Form.Control.Feedback type="invalid">
                  {errors.name.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>
          </Col>
          <Col>
            <Form.Group className="mb-3">
              <Form.Label>Surname <span style={{color: 'red'}}>*</span></Form.Label>
              <Controller
                name="surname"
                control={control}
                rules={{ required: 'Surname is required' }}
                render={({ field }) => (
                  <Form.Control 
                    {...field} 
                    type="text" 
                    placeholder="Enter surname"
                    isInvalid={!!errors.surname}
                  />
                )}
              />
              {errors.surname && (
                <Form.Control.Feedback type="invalid">
                  {errors.surname.message}
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
                render={({ field }) => (
                  <Form.Select {...field}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Form.Select>
                )}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group className="mb-3">
              <Form.Label>Level <span style={{color: 'red'}}>*</span></Form.Label>
              <Controller
                name="level"
                control={control}
                render={({ field }) => (
                  <Form.Select {...field}>
                    <option value="pre-kindergartner">Pre-Kindergartner</option>
                    <option value="kindergartner">Kindergartner</option>
                    <option value="kindergartner-repeating">Kindergartner (Repeating)</option>
                  </Form.Select>
                )}
              />
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
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">Address</h5>
          </Card.Header>
          <Card.Body>
            <Accordion>
              <Accordion.Item eventKey="0">
                <Accordion.Header>Click to add address information</Accordion.Header>
                <Accordion.Body>
                  <AddressForm 
                    control={control}
                    errors={errors.address}
                  />
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Card.Body>
        </Card>

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
                    key={guardian.guardian_id}
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

        <Button variant="primary" type="submit">
          {initialData ? 'Update Kid' : 'Add Kid'}
        </Button>
      </Form>
    </Container>
  );
};

export default KidForm;
