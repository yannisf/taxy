import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { Controller } from 'react-hook-form';
import type { Control, FieldErrors } from 'react-hook-form';
import type { Address } from '../../types/models';

interface AddressFormProps {
  control: Control<Record<string, any>>;
  errors?: FieldErrors<Address>;
  fieldPrefix?: string;
  disabled?: boolean;
}

const AddressForm: React.FC<AddressFormProps> = ({ 
  control, 
  errors, 
  fieldPrefix = 'address',
  disabled = false 
}) => {
  return (
    <>
      <Row>
        <Col md={8}>
          <Form.Group className="mb-3">
            <Form.Label>Street Name</Form.Label>
            <Controller
              name={`${fieldPrefix}.street_name`}
              control={control}
              render={({ field }) => (
                <Form.Control
                  {...field}
                  value={field.value ?? ''}
                  type="text"
                  placeholder="Enter street name"
                  disabled={disabled}
                  isInvalid={!!errors?.street_name}
                />
              )}
            />
            {errors?.street_name && (
              <Form.Control.Feedback type="invalid">
                {errors.street_name.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Street Number</Form.Label>
            <Controller
              name={`${fieldPrefix}.street_number`}
              control={control}
              render={({ field }) => (
                <Form.Control
                  {...field}
                  value={field.value ?? ''}
                  type="text"
                  placeholder="Number"
                  disabled={disabled}
                  isInvalid={!!errors?.street_number}
                />
              )}
            />
            {errors?.street_number && (
              <Form.Control.Feedback type="invalid">
                {errors.street_number.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Neighborhood</Form.Label>
            <Controller
              name={`${fieldPrefix}.neighborhood`}
              control={control}
              render={({ field }) => (
                <Form.Control
                  {...field}
                  value={field.value ?? ''}
                  type="text"
                  placeholder="Enter neighborhood"
                  disabled={disabled}
                  isInvalid={!!errors?.neighborhood}
                />
              )}
            />
            {errors?.neighborhood && (
              <Form.Control.Feedback type="invalid">
                {errors.neighborhood.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Postal Code</Form.Label>
            <Controller
              name={`${fieldPrefix}.postal_code`}
              control={control}
              render={({ field }) => (
                <Form.Control
                  {...field}
                  value={field.value ?? ''}
                  type="text"
                  placeholder="Enter postal code"
                  disabled={disabled}
                  isInvalid={!!errors?.postal_code}
                />
              )}
            />
            {errors?.postal_code && (
              <Form.Control.Feedback type="invalid">
                {errors.postal_code.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>City</Form.Label>
            <Controller
              name={`${fieldPrefix}.city`}
              control={control}
              render={({ field }) => (
                <Form.Control
                  {...field}
                  value={field.value ?? ''}
                  type="text"
                  placeholder="Enter city"
                  disabled={disabled}
                  isInvalid={!!errors?.city}
                />
              )}
            />
            {errors?.city && (
              <Form.Control.Feedback type="invalid">
                {errors.city.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Country</Form.Label>
            <Controller
              name={`${fieldPrefix}.country`}
              control={control}
              render={({ field }) => (
                <Form.Control
                  {...field}
                  value={field.value ?? ''}
                  type="text"
                  placeholder="Enter country"
                  disabled={disabled}
                  isInvalid={!!errors?.country}
                />
              )}
            />
            {errors?.country && (
              <Form.Control.Feedback type="invalid">
                {errors.country.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
      </Row>
    </>
  );
};

export default AddressForm;
