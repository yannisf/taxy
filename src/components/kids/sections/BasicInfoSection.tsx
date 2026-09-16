import React, { useMemo } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import DatePicker from 'react-datepicker';
import type { Control, FieldErrors } from 'react-hook-form';
import type { Kid } from '../../../types/models';
import { useKids } from '../../../hooks/useKids';
import { extractUniqueFirstNames, filterNamesByQuery } from '../../../utils/nameUtils';
import AutocompleteInput from '../../common/AutocompleteInput';

interface BasicInfoSectionProps {
  control: Control<Kid>;
  errors: FieldErrors<Kid>;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ control, errors }) => {
  const { t } = useTranslation();
  const { kids } = useKids();

  // Extract unique first names from all kids
  const allFirstNames = useMemo(() => extractUniqueFirstNames(kids), [kids]);

  return (
    <>
      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label>{t('firstName')} <span style={{color: 'red'}}>{t('required')}</span></Form.Label>
            <Controller
              name="first_name"
              control={control}
              rules={{ required: t('fieldRequiredTemplate', { field: t('firstName') }) }}
              render={({ field }) => {
                const filteredSuggestions = filterNamesByQuery(allFirstNames, field.value || '');
                return (
                  <AutocompleteInput
                    value={field.value || ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    suggestions={filteredSuggestions}
                    placeholder={t('enterFirstName')}
                    isInvalid={!!errors.first_name}
                    autoFocus={true}
                  />
                );
              }}
            />
            {errors.first_name && (
              <Form.Control.Feedback type="invalid" className="d-block">
                {errors.first_name.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label>{t('lastName')} <span style={{color: 'red'}}>{t('required')}</span></Form.Label>
            <Controller
              name="last_name"
              control={control}
              rules={{ required: t('fieldRequiredTemplate', { field: t('lastName') }) }}
              render={({ field }) => (
                <Form.Control
                  {...field}
                  type="text"
                  placeholder={t('enterLastName')}
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
            <Form.Label>{t('gender')} <span style={{color: 'red'}}>{t('required')}</span></Form.Label>
            <Controller
              name="gender"
              control={control}
              rules={{ required: t('fieldRequiredTemplate', { field: t('gender') }) }}
              render={({ field }) => (
                <Form.Select {...field} value={field.value || ''} isInvalid={!!errors.gender}>
                  <option value="" disabled>{t('selectGender')}</option>
                  <option value="male">{t('male')}</option>
                  <option value="female">{t('female')}</option>
                  <option value="other">{t('other')}</option>
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
            <Form.Label>{t('level')} <span style={{color: 'red'}}>{t('required')}</span></Form.Label>
            <Controller
              name="level"
              control={control}
              rules={{ required: t('fieldRequiredTemplate', { field: t('level') }) }}
              render={({ field }) => (
                <Form.Select {...field} value={field.value || ''} isInvalid={!!errors.level}>
                  <option value="" disabled>{t('selectLevel')}</option>
                  <option value="pre-kindergartner">{t('levelPreKindergarten')}</option>
                  <option value="kindergartner">{t('levelKindergarten')}</option>
                  <option value="kindergartner-repeating">{t('levelKindergartenRepeating')}</option>
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
            <Form.Label>{t('preferredName')}</Form.Label>
            <Controller
              name="preferred_name"
              control={control}
              render={({ field }) => (
                <Form.Control
                  {...field}
                  value={field.value ?? ''}
                  type="text"
                  placeholder={t('enterPreferredName')}
                />
              )}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label>{t('dateOfBirth')}</Form.Label>
            <Controller
              name="date_of_birth"
              control={control}
              render={({ field }) => {
                const today = new Date();

                // Parse the field value (ISO string) to Date object
                const selectedDate = field.value ? new Date(field.value) : null;

                // Only set openToDate if there's no selected date (for new kids)
                // If a date is already selected, the calendar will open to that date automatically
                const openToDate = !selectedDate
                  ? new Date(new Date().getFullYear() - 5, 0, 1) // January 1st, current year - 5
                  : undefined;

                return (
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date: Date | null) => {
                      // Convert Date to ISO string (YYYY-MM-DD) for storage
                      field.onChange(date ? date.toISOString().split('T')[0] : '');
                    }}
                    onBlur={field.onBlur}
                    openToDate={openToDate}
                    maxDate={today}
                    dateFormat="dd/MM/yyyy"
                    showYearDropdown
                    scrollableYearDropdown
                    yearDropdownItemNumber={100}
                    placeholderText={t('dateOfBirth')}
                    className="form-control"
                    wrapperClassName="d-block"
                    isClearable
                  />
                );
              }}
            />
          </Form.Group>
        </Col>
      </Row>
    </>
  );
};

export default BasicInfoSection;
