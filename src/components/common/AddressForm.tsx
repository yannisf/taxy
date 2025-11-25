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
  extractUniqueCountries,
  filterNamesByQuery
} from '../../utils/nameUtils';
import AutocompleteInput from './AutocompleteInput';

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
          <Form.Group className="mb-3">
            <Form.Label>{t('streetName')}</Form.Label>
            <Controller
              name={`${fieldPrefix}.street_name`}
              control={control}
              render={({ field }) => {
                const filteredSuggestions = filterNamesByQuery(allStreetNames, field.value || '');
                return disabled ? (
                  <Form.Control
                    {...field}
                    value={field.value ?? ''}
                    type="text"
                    placeholder={t('enterStreetName')}
                    disabled={disabled}
                    isInvalid={!!errors?.street_name}
                  />
                ) : (
                  <AutocompleteInput
                    value={field.value || ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    suggestions={filteredSuggestions}
                    placeholder={t('enterStreetName')}
                    isInvalid={!!errors?.street_name}
                  />
                );
              }}
            />
            {errors?.street_name && (
              <Form.Control.Feedback type="invalid" className="d-block">
                {errors.street_name.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>
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
          <Form.Group className="mb-3">
            <Form.Label>{t('neighborhood')}</Form.Label>
            <Controller
              name={`${fieldPrefix}.neighborhood`}
              control={control}
              render={({ field }) => {
                const filteredSuggestions = filterNamesByQuery(allNeighborhoods, field.value || '');
                return disabled ? (
                  <Form.Control
                    {...field}
                    value={field.value ?? ''}
                    type="text"
                    placeholder={t('enterNeighborhood')}
                    disabled={disabled}
                    isInvalid={!!errors?.neighborhood}
                  />
                ) : (
                  <AutocompleteInput
                    value={field.value || ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    suggestions={filteredSuggestions}
                    placeholder={t('enterNeighborhood')}
                    isInvalid={!!errors?.neighborhood}
                  />
                );
              }}
            />
            {errors?.neighborhood && (
              <Form.Control.Feedback type="invalid" className="d-block">
                {errors.neighborhood.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>{t('postalCode')}</Form.Label>
            <Controller
              name={`${fieldPrefix}.postal_code`}
              control={control}
              render={({ field }) => {
                const filteredSuggestions = filterNamesByQuery(allPostalCodes, field.value || '');
                return disabled ? (
                  <Form.Control
                    {...field}
                    value={field.value ?? ''}
                    type="text"
                    placeholder={t('enterPostalCode')}
                    disabled={disabled}
                    isInvalid={!!errors?.postal_code}
                  />
                ) : (
                  <AutocompleteInput
                    value={field.value || ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    suggestions={filteredSuggestions}
                    placeholder={t('enterPostalCode')}
                    isInvalid={!!errors?.postal_code}
                  />
                );
              }}
            />
            {errors?.postal_code && (
              <Form.Control.Feedback type="invalid" className="d-block">
                {errors.postal_code.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>{t('city')}</Form.Label>
            <Controller
              name={`${fieldPrefix}.city`}
              control={control}
              render={({ field }) => {
                const filteredSuggestions = filterNamesByQuery(allCities, field.value || '');
                return disabled ? (
                  <Form.Control
                    {...field}
                    value={field.value ?? ''}
                    type="text"
                    placeholder={t('enterCity')}
                    disabled={disabled}
                    isInvalid={!!errors?.city}
                  />
                ) : (
                  <AutocompleteInput
                    value={field.value || ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    suggestions={filteredSuggestions}
                    placeholder={t('enterCity')}
                    isInvalid={!!errors?.city}
                  />
                );
              }}
            />
            {errors?.city && (
              <Form.Control.Feedback type="invalid" className="d-block">
                {errors.city.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>{t('country')}</Form.Label>
            <Controller
              name={`${fieldPrefix}.country`}
              control={control}
              render={({ field }) => {
                const filteredSuggestions = filterNamesByQuery(allCountries, field.value || '');
                return disabled ? (
                  <Form.Control
                    {...field}
                    value={field.value ?? ''}
                    type="text"
                    placeholder={t('enterCountry')}
                    disabled={disabled}
                    isInvalid={!!errors?.country}
                  />
                ) : (
                  <AutocompleteInput
                    value={field.value || ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    suggestions={filteredSuggestions}
                    placeholder={t('enterCountry')}
                    isInvalid={!!errors?.country}
                  />
                );
              }}
            />
            {errors?.country && (
              <Form.Control.Feedback type="invalid" className="d-block">
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
