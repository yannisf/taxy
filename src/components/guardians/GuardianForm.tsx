import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Form, Row, Col, Button } from 'react-bootstrap';
import type { Guardian } from '../../types/models';
import { validationService } from '../../services/validation';

type GuardianFormProps = {
  onAddGuardian: (guardian: Guardian) => void;
  initialData?: Guardian;
};

export const GuardianForm: React.FC<GuardianFormProps> = ({ 
  onAddGuardian, 
  initialData 
}) => {
  const { 
    control, 
    handleSubmit, 
    formState: { errors }, 
    reset 
  } = useForm<Guardian>({
    defaultValues: initialData || {
      name: '',
      surname: '',
      relation_with_kid: 'mother',
      authorized_for_pickup: false,
      same_address_as_kid: true,
      telephones: []
    }
  });

  const onSubmit = (data: Guardian) => {
    // Validate guardian data
    const validationResult = validationService.validateGuardian(data);
    
    if (!validationResult.valid) {
      console.error('Guardian validation failed', validationResult.errors);
      return;
    }

    onAddGuardian(data);
    reset(); // Reset form after adding
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Name is required' }}
              render={({ field }) => (
                <Form.Control
                  {...field}
                  type="text"
                  placeholder="Enter guardian's name"
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
            <Form.Label>Surname</Form.Label>
            <Controller
              name="surname"
              control={control}
              rules={{ required: 'Surname is required' }}
              render={({ field }) => (
                <Form.Control
                  {...field}
                  type="text"
                  placeholder="Enter guardian's surname"
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
            <Form.Label>Relation with Kid</Form.Label>
            <Controller
              name="relation_with_kid"
              control={control}
              render={({ field }) => (
                <Form.Select {...field}>
                  <option value="father">Father</option>
                  <option value="mother">Mother</option>
                  <option value="sibling">Sibling</option>
                  <option value="grandparent">Grandparent</option>
                  <option value="extended family">Extended Family</option>
                  <option value="friend">Friend</option>
                </Form.Select>
              )}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Authorized for Pickup"
              {...control.register('authorized_for_pickup')}
            />
            <Form.Check
              type="checkbox"
              label="Same Address as Kid"
              {...control.register('same_address_as_kid')}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Form.Control
                  {...field}
                  value={field.value ?? ''}
                  type="email"
                  placeholder="Enter email address"
                  isInvalid={!!errors.email}
                />
              )}
            />
            {errors.email && (
              <Form.Control.Feedback type="invalid">
                {errors.email.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label>Profession</Form.Label>
            <Controller
              name="profession"
              control={control}
              render={({ field }) => (
                <Form.Control
                  {...field}
                  value={field.value ?? ''}
                  type="text"
                  placeholder="Enter profession"
                  isInvalid={!!errors.profession}
                />
              )}
            />
            {errors.profession && (
              <Form.Control.Feedback type="invalid">
                {errors.profession.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
      </Row>

      <Button variant="primary" type="submit">
        {initialData ? 'Update Guardian' : 'Add Guardian'}
      </Button>
    </Form>
  );
};

export default GuardianForm;
