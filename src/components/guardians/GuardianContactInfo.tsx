import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { Controller } from 'react-hook-form';
import type { Control, FieldErrors } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { Guardian, Kid } from '../../types/models';

interface GuardianContactInfoProps {
  control: Control<Kid>;
  errors?: FieldErrors<Guardian>;
  index: number;
}

const GuardianContactInfo: React.FC<GuardianContactInfoProps> = ({ control, errors, index }) => {
  const { t } = useTranslation();

  return (
    <Row>
      <Col>
        <Form.Group className="mb-3">
          <Form.Label>{t('email')}</Form.Label>
          <Controller
            name={`guardians.${index}.email`}
            control={control}
            render={({ field }) => (
              <Form.Control
                {...field}
                value={field.value ?? ''}
                type="email"
                placeholder={t('enterEmail')}
                isInvalid={!!errors?.email}
              />
            )}
          />
          {errors?.email && (
            <Form.Control.Feedback type="invalid">
              {errors.email.message}
            </Form.Control.Feedback>
          )}
        </Form.Group>
      </Col>
      <Col>
        <Form.Group className="mb-3">
          <Form.Label>{t('profession')}</Form.Label>
          <Controller
            name={`guardians.${index}.profession`}
            control={control}
            render={({ field }) => (
              <Form.Control
                {...field}
                value={field.value ?? ''}
                type="text"
                placeholder={t('enterProfession')}
                isInvalid={!!errors?.profession}
              />
            )}
          />
          {errors?.profession && (
            <Form.Control.Feedback type="invalid">
              {errors.profession.message}
            </Form.Control.Feedback>
          )}
        </Form.Group>
      </Col>
    </Row>
  );
};

export default GuardianContactInfo;
