import React, { useState, useMemo, useCallback } from 'react';
import { Accordion, Button, Modal, Form, Row, Col, Card } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { createGuardian } from '../../types/models';
import type { Guardian } from '../../types/models';
import { validationService } from '../../services/validation';
import AddressForm from '../common/AddressForm';

interface GuardianAccordionItemProps {
  guardian?: Guardian;
  isNew?: boolean;
  eventKey: string;
  onSave: (guardian: Guardian) => void;
  onDelete: (guardianId: string) => void;
  onCancel?: () => void;
}

const GuardianAccordionItemComponent: React.FC<GuardianAccordionItemProps> = ({
  guardian,
  isNew = false,
  eventKey,
  onSave,
  onDelete,
  onCancel
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { 
    control, 
    handleSubmit, 
    formState: { errors }, 
    reset,
    watch 
  } = useForm<Guardian>({
    defaultValues: guardian || {
      guardian_id: '',
      name: '',
      surname: '',
      relation_with_kid: 'mother',
      authorized_for_pickup: false,
      same_address_as_kid: true,
      telephones: []
    }
  });

  const onSubmit = useCallback((data: Guardian) => {
    setValidationError(null);
    
    // Validate guardian data
    const validationResult = validationService.validateGuardian(data);
    
    if (!validationResult.valid) {
      const errorMessages = validationResult.errors?.map(err => 
        `${err.instancePath || ''} ${err.message}`
      ).join(', ') || 'Validation failed';
      setValidationError(errorMessages);
      return;
    }

    // Ensure a guardian_id exists
    const guardianToSave: Guardian = isNew 
      ? createGuardian(data)
      : { ...data, guardian_id: guardian?.guardian_id || '' };

    onSave(guardianToSave);
    // Only reset if it's a new guardian - existing guardians should keep their data
    if (isNew) {
      reset();
    }
  }, [onSave, isNew, guardian?.guardian_id, reset]);

  const handleDelete = useCallback(() => {
    if (guardian?.guardian_id) {
      onDelete(guardian.guardian_id);
    }
    setShowDeleteModal(false);
  }, [guardian?.guardian_id, onDelete]);

  const headerTitle = useMemo(() => {
    if (isNew) return 'New Guardian';
    if (guardian) {
      return `${guardian.name || 'Unnamed'} ${guardian.surname || ''} - ${guardian.relation_with_kid}`;
    }
    return 'Guardian';
  }, [isNew, guardian?.name, guardian?.surname, guardian?.relation_with_kid]);

  return (
    <>
      <Accordion.Item eventKey={eventKey}>
        <Accordion.Header>
          <div className="d-flex justify-content-between align-items-center w-100">
            <span>{headerTitle}</span>
            {!isNew && guardian && (
              <div className="me-2" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => setShowDeleteModal(true)}
                  className="p-1"
                  title="Delete guardian"
                >
                  🗑️
                </Button>
              </div>
            )}
          </div>
        </Accordion.Header>
        <Accordion.Body>
          <div>
            {validationError && (
              <div className="alert alert-danger">{validationError}</div>
            )}
            
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
                        value={field.value ?? ''}
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
                        value={field.value ?? ''}
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
                  <Controller
                    name="authorized_for_pickup"
                    control={control}
                    render={({ field }) => (
                      <Form.Check
                        type="checkbox"
                        label="Authorized for Pickup"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  <Controller
                    name="same_address_as_kid"
                    control={control}
                    render={({ field }) => (
                      <Form.Check
                        type="checkbox"
                        label="Same Address as Kid"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Address Section - Only show if NOT same address as kid */}
            {!watch('same_address_as_kid') && (
              <Card className="mb-3">
                <Card.Header>
                  <h6 className="mb-0">Guardian Address</h6>
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
            )}

            {/* Show message when same address as kid is checked */}
            {watch('same_address_as_kid') && (
              <div className="mb-3 p-3 bg-light rounded">
                <small className="text-muted">
                  📍 This guardian uses the same address as the kid
                </small>
              </div>
            )}

            <div className="d-flex gap-2">
              <Button variant="primary" onClick={handleSubmit(onSubmit)}>
                {isNew ? 'Add Guardian' : 'Update Guardian'}
              </Button>
              {isNew && onCancel && (
                <Button variant="secondary" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </Accordion.Body>
      </Accordion.Item>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete <strong>{guardian?.name} {guardian?.surname}</strong>? 
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export const GuardianAccordionItem = React.memo(GuardianAccordionItemComponent);
export default GuardianAccordionItem;
