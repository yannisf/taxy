import React, { useState } from 'react';
import { Form, Row, Col, Button, Modal } from 'react-bootstrap';
import { Controller } from 'react-hook-form';
import { X, GripVertical } from 'react-bootstrap-icons';
import type { Control, FieldErrors } from 'react-hook-form';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import type { Telephone } from '../../types/models';
import { validateTelephoneNumber, validateCountryCode, getTelephoneTypeIcon } from '../../utils/telephoneUtils';

interface TelephoneFormProps {
  control: Control<Record<string, unknown>>;
  errors?: FieldErrors<Telephone>;
  fieldPrefix: string;
  onRemove: () => void;
  disabled?: boolean;
  showRemoveButton?: boolean;
  showDragHandle?: boolean;
  dragListeners?: SyntheticListenerMap;
}

const TelephoneForm: React.FC<TelephoneFormProps> = ({ 
  control, 
  errors, 
  fieldPrefix,
  onRemove,
  disabled = false,
  showRemoveButton = true,
  showDragHandle = false,
  dragListeners
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteConfirm = () => {
    onRemove();
    setShowDeleteModal(false);
  };

  return (
    <div className="d-flex align-items-start gap-2 mb-3">
      {showDragHandle && (
        <div className="pt-2" style={{ cursor: 'grab' }} {...dragListeners}>
          <GripVertical size={16} className="text-muted" />
        </div>
      )}
      
      <div className="flex-grow-1">
        <Row>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Country Code</Form.Label>
              <Controller
                name={`${fieldPrefix}.country_code`}
                control={control}
                rules={{ 
                  required: 'Country code is required',
                  validate: (value) => validateCountryCode(value || '') || 'Invalid country code format (e.g., +30)'
                }}
                render={({ field }) => (
                  <Form.Control
                    {...field}
                    value={field.value ?? '+30'}
                    type="text"
                    placeholder="+30"
                    disabled={disabled}
                    isInvalid={!!errors?.country_code}
                  />
                )}
              />
              {errors?.country_code && (
                <Form.Control.Feedback type="invalid">
                  {errors.country_code.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>
          </Col>
          
          <Col md={5}>
            <Form.Group className="mb-3">
              <Form.Label>Number</Form.Label>
              <Controller
                name={`${fieldPrefix}.number`}
                control={control}
                rules={{ 
                  required: 'Phone number is required',
                  validate: (value) => validateTelephoneNumber(value || '') || 'Invalid phone number (4-15 digits only)'
                }}
                render={({ field }) => (
                  <Form.Control
                    {...field}
                    value={field.value ?? ''}
                    type="text"
                    placeholder="1234567890"
                    disabled={disabled}
                    isInvalid={!!errors?.number}
                  />
                )}
              />
              {errors?.number && (
                <Form.Control.Feedback type="invalid">
                  {errors.number.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>
          </Col>
          
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Controller
                name={`${fieldPrefix}.telephone_type`}
                control={control}
                rules={{ required: 'Type is required' }}
                render={({ field }) => (
                  <Form.Select 
                    {...field} 
                    value={field.value ?? 'mobile'}
                    disabled={disabled}
                    isInvalid={!!errors?.telephone_type}
                  >
                    <option value="mobile">{getTelephoneTypeIcon('mobile')} Mobile</option>
                    <option value="home">{getTelephoneTypeIcon('home')} Home</option>
                    <option value="work">{getTelephoneTypeIcon('work')} Work</option>
                    <option value="other">{getTelephoneTypeIcon('other')} Other</option>
                  </Form.Select>
                )}
              />
              {errors?.telephone_type && (
                <Form.Control.Feedback type="invalid">
                  {errors.telephone_type.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>
          </Col>
        </Row>
      </div>
      
      {showRemoveButton && (
        <div className="d-flex align-items-center" style={{ paddingTop: '2rem' }}>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            className="p-2"
            title="Remove telephone"
            disabled={disabled}
          >
            <X size={20} />
          </Button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this telephone number? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TelephoneForm;
