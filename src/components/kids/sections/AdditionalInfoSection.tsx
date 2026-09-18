import React, { useState } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { CaretDownFill, CaretUpFill } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import { useWatch } from 'react-hook-form';
import type { Control, UseFormRegister } from 'react-hook-form';
import type { Kid } from '../../../types/models';

interface AdditionalInfoSectionProps {
  register: UseFormRegister<Kid>;
  control: Control<Kid>;
}

const AdditionalInfoSection: React.FC<AdditionalInfoSectionProps> = ({ register, control }) => {
  const { t } = useTranslation();
  const [notes, privateNotes] = useWatch({ control, name: ['notes', 'private_notes'] });
  // Most kids have no notes, so the boxes stay out of the form until asked
  // for. Both kinds appear together: they are one thought, written in two
  // places. A kid who already has notes opens with them in view.
  const [showNotes, setShowNotes] = useState(() => !!(notes || privateNotes));

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

      <button
        type="button"
        className="btn btn-link p-0 mb-3 text-decoration-none text-body d-flex align-items-center gap-2"
        onClick={() => setShowNotes(!showNotes)}
        aria-expanded={showNotes}
        aria-label={showNotes ? t('hideNotes') : t('addNotes')}
      >
        <span className="h6 mb-0">📝 {t('notes')}</span>
        {showNotes ? <CaretUpFill size={12} /> : <CaretDownFill size={12} />}
      </button>

      {showNotes && (
        <Row>
          <Col>
            <Form.Group className="mb-3">
              <Form.Label>{t('notesGeneral')}</Form.Label>
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
              <Form.Label>{t('notesPrivate')}</Form.Label>
              <Form.Control
                {...register('private_notes')}
                as="textarea"
                placeholder={t('enterPrivateNotes')}
                rows={4}
              />
            </Form.Group>
          </Col>
        </Row>
      )}
    </>
  );
};

export default AdditionalInfoSection;
