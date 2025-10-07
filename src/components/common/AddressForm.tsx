import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { Control, FieldErrors } from 'react-hook-form';
import type { Address } from '../../types/models';

interface AddressFormProps {
  control: Control<any>;
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
  const { t } = useTranslation();
  return (
    <>
      <Row>
        <Col md={8}>
          <Form.Group className="mb-3">
            <Form.Label>{t('forms:address.streetName')}</Form.Label>
            <Controller
              name={`${fieldPrefix}.street_name`}
              control={control}
              render={({ field }) => (
                <Form.Control
                  {...field}
                  value={field.value ?? ''}
                  type="text"
                  placeholder={t('forms:address.placeholders.streetName')}
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
            <Form.Label>{t('forms:address.streetNumber')}</Form.Label>
            <Controller
              name={`${fieldPrefix}.street_number`}
              control={control}
              render={({ field }) => (
                <Form.Control
                  {...field}
                  value={field.value ?? ''}
                  type="text"
                  placeholder={t('forms:address.placeholders.streetNumber')}
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
            <Form.Label>{t('forms:address.neighborhood')}</Form.Label>
            <Controller
              name={`${fieldPrefix}.neighborhood`}
              control={control}
              render={({ field }) => (
                <Form.Control
                  {...field}
                  value={field.value ?? ''}
                  type="text"
                  placeholder={t('forms:address.placeholders.neighborhood')}
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
            <Form.Label>{t('forms:address.postalCode')}</Form.Label>
            <Controller
              name={`${fieldPrefix}.postal_code`}
              control={control}
              render={({ field }) => (
                <Form.Control
                  {...field}
                  value={field.value ?? ''}
                  type="text"
                  placeholder={t('forms:address.placeholders.postalCode')}
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
            <Form.Label>{t('forms:address.city')}</Form.Label>
            <Controller
              name={`${fieldPrefix}.city`}
              control={control}
              render={({ field }) => (
                <Form.Control
                  {...field}
                  value={field.value ?? ''}
                  type="text"
                  placeholder={t('forms:address.placeholders.city')}
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
            <Form.Label>{t('forms:address.country')}</Form.Label>
            <Controller
              name={`${fieldPrefix}.country`}
              control={control}
              render={({ field }) => (
                <Form.Control
                  {...field}
                  value={field.value ?? ''}
                  type="text"
                  placeholder={t('forms:address.placeholders.country')}
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
