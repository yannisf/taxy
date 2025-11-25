import React, { useState } from 'react';
import { Form, Row, Col, Button, Modal } from 'react-bootstrap';
import { Controller } from 'react-hook-form';
import { X } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import type { Control, FieldErrors } from 'react-hook-form';
import type { Telephone } from '../../types/models';
import { validateTelephoneNumber, validateCountryCode, getTelephoneTypeIcon } from '../../utils/telephoneUtils';

interface TelephoneFormProps {
  control: Control<Record<string, unknown>>;
  errors?: FieldErrors<Telephone>;
  fieldPrefix: string;
  onRemove: () => void;
  disabled?: boolean;
  showRemoveButton?: boolean;
}

const TelephoneForm: React.FC<TelephoneFormProps> = ({
  control,
  errors,
  fieldPrefix,
  onRemove,
  disabled = false,
  showRemoveButton = true
}) => {
  const { t } = useTranslation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteConfirm = () => {
    onRemove();
    setShowDeleteModal(false);
  };

  return (
    <div className="d-flex align-items-start gap-2 mb-3">
      <div className="flex-grow-1">
        <Row>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>{t('telephoneCountryCode')}</Form.Label>
              <Controller
                name={`${fieldPrefix}.country_code`}
                control={control}
                rules={{ 
                  required: t('countryCodeRequired'),
                  validate: (value) => validateCountryCode(value || '') || t('invalidCountryCode')
                }}
                render={({ field }) => (
                  <Form.Control
                    {...field}
                    value={field.value ?? '+30'}
                    type="text"
                    placeholder={t('enterCountryCode')}
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
              <Form.Label>{t('telephoneNumber')}</Form.Label>
              <Controller
                name={`${fieldPrefix}.number`}
                control={control}
                rules={{ 
                  required: t('telephoneNumberRequired'),
                  validate: (value) => validateTelephoneNumber(value || '') || t('invalidTelephoneNumber')
                }}
                render={({ field }) => (
                  <Form.Control
                    {...field}
                    value={field.value ?? ''}
                    type="text"
                    placeholder={t('enterTelephoneNumber')}
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
              <Form.Label>{t('telephoneType')}</Form.Label>
              <Controller
                name={`${fieldPrefix}.telephone_type`}
                control={control}
                rules={{ required: t('telephoneTypeRequired') }}
                render={({ field }) => (
                  <Form.Select 
                    {...field} 
                    value={field.value ?? 'mobile'}
                    disabled={disabled}
                    isInvalid={!!errors?.telephone_type}
                  >
                    <option value="mobile">{getTelephoneTypeIcon('mobile')} {t('telephoneMobile')}</option>
                    <option value="home">{getTelephoneTypeIcon('home')} {t('telephoneHome')}</option>
                    <option value="work">{getTelephoneTypeIcon('work')} {t('telephoneWork')}</option>
                    <option value="other">{getTelephoneTypeIcon('other')} {t('telephoneOther')}</option>
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
            variant="link"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            className="p-2 text-danger"
            title={t('removeTelephone')}
            disabled={disabled}
          >
            <X size={20} />
          </Button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('confirmDelete')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {t('confirmDeleteTelephone')}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            {t('cancel')}
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            {t('delete')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TelephoneForm;
