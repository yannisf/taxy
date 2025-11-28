import React, { useMemo } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { Control, FieldErrors } from 'react-hook-form';
import type { Address } from '../../types/models';
import { useKids } from '../../contexts/KidsContext';
import {
  extractUniqueStreetNames,
  extractUniqueNeighborhoods,
  extractUniquePostalCodes,
  extractUniqueCities,
  extractUniqueCountries
} from '../../utils/nameUtils';
import AddressFieldInput from './AddressFieldInput';

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
  const { kids } = useKids();

  // Extract unique address field values from all kids and guardians
  const allStreetNames = useMemo(() => extractUniqueStreetNames(kids), [kids]);
  const allNeighborhoods = useMemo(() => extractUniqueNeighborhoods(kids), [kids]);
  const allPostalCodes = useMemo(() => extractUniquePostalCodes(kids), [kids]);
  const allCities = useMemo(() => extractUniqueCities(kids), [kids]);
  const allCountries = useMemo(() => extractUniqueCountries(kids), [kids]);

  return (
    <>
      <Row>
        <Col md={8}>
          <AddressFieldInput
            name={`${fieldPrefix}.street_name`}
            control={control}
            label={t('streetName')}
            placeholder={t('enterStreetName')}
            suggestions={allStreetNames}
            error={errors?.street_name}
            disabled={disabled}
          />
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>{t('streetNumber')}</Form.Label>
            <Controller
              name={`${fieldPrefix}.street_number`}
              control={control}
              render={({ field }) => (
                <Form.Control
                  {...field}
                  value={field.value ?? ''}
                  type="text"
                  placeholder={t('enterStreetNumber')}
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
          <AddressFieldInput
            name={`${fieldPrefix}.neighborhood`}
            control={control}
            label={t('neighborhood')}
            placeholder={t('enterNeighborhood')}
            suggestions={allNeighborhoods}
            error={errors?.neighborhood}
            disabled={disabled}
          />
        </Col>
        <Col md={6}>
          <AddressFieldInput
            name={`${fieldPrefix}.postal_code`}
            control={control}
            label={t('postalCode')}
            placeholder={t('enterPostalCode')}
            suggestions={allPostalCodes}
            error={errors?.postal_code}
            disabled={disabled}
          />
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <AddressFieldInput
            name={`${fieldPrefix}.city`}
            control={control}
            label={t('city')}
            placeholder={t('enterCity')}
            suggestions={allCities}
            error={errors?.city}
            disabled={disabled}
          />
        </Col>
        <Col md={6}>
          <AddressFieldInput
            name={`${fieldPrefix}.country`}
            control={control}
            label={t('country')}
            placeholder={t('enterCountry')}
            suggestions={allCountries}
            error={errors?.country}
            disabled={disabled}
          />
        </Col>
      </Row>
    </>
  );
};

export default AddressForm;
