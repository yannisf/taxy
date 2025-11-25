import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { Control, FieldErrors } from 'react-hook-form';
import type { Kid } from '../../../types/models';

interface BasicInfoSectionProps {
  control: Control<Kid>;
  errors: FieldErrors<Kid>;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ control, errors }) => {
  const { t } = useTranslation();

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
              render={({ field }) => (
                <Form.Control
                  {...field}
                  type="text"
                  placeholder={t('enterFirstName')}
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
                <Form.Select {...field} isInvalid={!!errors.gender}>
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
                <Form.Select {...field} isInvalid={!!errors.level}>
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
    </>
  );
};

export default BasicInfoSection;
