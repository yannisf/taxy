import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import type { UseFormRegister } from 'react-hook-form';
import type { Kid } from '../../../types/models';

interface AdditionalInfoSectionProps {
  register: UseFormRegister<Kid>;
}

const AdditionalInfoSection: React.FC<AdditionalInfoSectionProps> = ({ register }) => {
  const { t } = useTranslation();

  return (
    <>
      <Form.Group className="mb-3">
        <Form.Check
          type="checkbox"
          label={t('extendedDayCare')}
          {...register('extended_day_care')}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Check
          type="checkbox"
          label={t('specialEducation')}
          {...register('special_education')}
        />
      </Form.Group>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label>{t('notes')}</Form.Label>
            <Form.Control
              {...register('notes')}
              as="textarea"
              placeholder={t('enterNotes')}
              rows={4}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label>{t('privateNotes')}</Form.Label>
            <Form.Control
              {...register('private_notes')}
              as="textarea"
              placeholder={t('enterPrivateNotes')}
              rows={4}
            />
          </Form.Group>
        </Col>
      </Row>
    </>
  );
};

export default AdditionalInfoSection;
