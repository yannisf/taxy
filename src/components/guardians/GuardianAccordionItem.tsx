import React, { useState, useMemo, useCallback } from 'react';
import { Accordion, Button, Modal, Form, Row, Col, Card, Alert } from 'react-bootstrap';
import { X } from 'react-bootstrap-icons';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import type { Control } from 'react-hook-form';
import type { Guardian } from '../../types/models';
import { validationService } from '../../services/validation';
import AddressForm from '../common/AddressForm';
import TelephoneForm from '../common/TelephoneForm';
import { formatAddressString } from '../../utils/addressUtils';

interface GuardianAccordionItemProps {
  guardian?: Guardian;
  isNew?: boolean;
  eventKey: string;
  onSave: (guardian: Guardian) => void;
  onDelete: (guardian: Guardian) => void;
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
      first_name: '',
      last_name: '',
      relation_with_kid: 'mother',
      authorized_for_pickup: false,
      same_address_as_kid: true,
      telephones: []
    }
  });

  // Field array for managing telephones
  const { fields: telephoneFields, append: appendTelephone, remove: removeTelephone } = useFieldArray({
    control,
    name: 'telephones'
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

    onSave(data);
    // Only reset if it's a new guardian - existing guardians should keep their data
    if (isNew) {
      reset();
    }
  }, [onSave, isNew, reset]);

  const handleDelete = useCallback(() => {
    if (guardian) {
      onDelete(guardian);
    }
    setShowDeleteModal(false);
  }, [guardian, onDelete]);

  const headerTitle = useMemo(() => {
    if (isNew) return 'New Guardian';
    if (guardian) {
      return `${guardian.first_name || 'Unnamed'} ${guardian.last_name || ''} - ${guardian.relation_with_kid}`;
    }
    return 'Guardian';
  }, [isNew, guardian?.first_name, guardian?.last_name, guardian?.relation_with_kid]);

  // Memoized address title for guardian
  const guardianAddressTitle = useMemo(() => {
    const addressString = formatAddressString(guardian?.address);
    return addressString ? `Guardian Address: ${addressString}` : 'Guardian Address';
  }, [guardian?.address]);

  // Address accordion expanded state for guardian
  const guardianAddressExpanded = useMemo(() => {
    const addressString = formatAddressString(guardian?.address);
    return !addressString; // Expanded if no address, collapsed if address exists
  }, [guardian?.address]);

  return (
    <>
      <Accordion.Item eventKey={eventKey}>
        <Accordion.Header>
          <div className="d-flex justify-content-between align-items-center w-100">
            <span>{headerTitle}</span>
            {!isNew && guardian && (
              <Button
                variant="link"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteModal(true);
                }}
                className="p-1 text-danger"
                title="Delete guardian"
                style={{ marginLeft: 'auto' }}
              >
                <X size={16} />
              </Button>
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
                  <Form.Label>First Name</Form.Label>
                  <Controller
                    name="first_name"
                    control={control}
                    rules={{ required: 'First name is required' }}
                    render={({ field }) => (
                      <Form.Control
                        {...field}
                        value={field.value ?? ''}
                        type="text"
                        placeholder="Enter guardian's first name"
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
                  <Form.Label>Last Name</Form.Label>
                  <Controller
                    name="last_name"
                    control={control}
                    rules={{ required: 'Last name is required' }}
                    render={({ field }) => (
                      <Form.Control
                        {...field}
                        value={field.value ?? ''}
                        type="text"
                        placeholder="Enter guardian's last name"
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

            {/* Address Section - Only show if NOT same address as kid */}
            {!watch('same_address_as_kid') && (
              <Accordion className="mb-3" defaultActiveKey={guardianAddressExpanded ? "0" : undefined}>
                <Accordion.Item eventKey="0">
                  <Accordion.Header>{guardianAddressTitle}</Accordion.Header>
                  <Accordion.Body>
                    <AddressForm 
                      control={control}
                      errors={errors.address}
                    />
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            )}

            {/* Show message when same address as kid is checked */}
            {watch('same_address_as_kid') && (
              <div className="mb-3 p-3 bg-light rounded">
                <small className="text-muted">
                  📍 This guardian uses the same address as the kid
                </small>
              </div>
            )}

            {/* Telephone Section */}
            <Card className="mb-4">
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">📞 Telephone Numbers ({telephoneFields.length})</h6>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => appendTelephone({ 
                      country_code: '+30', 
                      number: '', 
                      telephone_type: 'mobile' as const 
                    })}
                  >
                    + Add Telephone
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                {telephoneFields.length === 0 ? (
                  <Alert variant="info" className="mb-0">
                    📞 No telephone numbers added yet. Click "Add Telephone" to get started.
                  </Alert>
                ) : (
                  <>
                    {telephoneFields.map((field, index) => (
                      <TelephoneForm
                        key={field.id}
                        control={control as unknown as Control<Record<string, unknown>>}
                        errors={errors.telephones?.[index]}
                        fieldPrefix={`telephones.${index}`}
                        onRemove={() => removeTelephone(index)}
                        showRemoveButton={true}
                      />
                    ))}
                  </>
                )}
              </Card.Body>
            </Card>

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
          Are you sure you want to delete <strong>{guardian?.first_name} {guardian?.last_name}</strong>?
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
