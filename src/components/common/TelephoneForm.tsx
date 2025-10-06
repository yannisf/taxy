import React, { useState } from 'react';
import { Form, Row, Col, Button, Modal } from 'react-bootstrap';
import { Controller } from 'react-hook-form';
import { X, GripVertical } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import type { Control, FieldErrors } from 'react-hook-form';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import type { Telephone } from '../../types/models';
import { validateTelephoneNumber, validateCountryCode, getTelephoneTypeIcon } from '../../utils/telephoneUtils';

interface TelephoneFormProps {
  control: Control<Record<string, unknown>>;
  errors?: FieldErrors<Telephone>;
  fieldPrefix: string;
  onRemove: () => void;
  disabled?: boolean;
  showRemoveButton?: boolean;
  showDragHandle?: boolean;
  dragListeners?: SyntheticListenerMap;
}

const TelephoneForm: React.FC<TelephoneFormProps> = ({ 
  control, 
  errors, 
  fieldPrefix,
  onRemove,
  disabled = false,
  showRemoveButton = true,
  showDragHandle = false,
  dragListeners
}) => {
  const { t } = useTranslation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteConfirm = () => {
    onRemove();
    setShowDeleteModal(false);
  };

  return (
    <div className="d-flex align-items-start gap-2 mb-3">
      {showDragHandle && (
        <div className="pt-2" style={{ cursor: 'grab' }} {...dragListeners}>
          <GripVertical size={16} className="text-muted" />
        </div>
      )}
      
      <div className="flex-grow-1">
        <Row>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>{t('forms:telephone.countryCode')}</Form.Label>
              <Controller
                name={`${fieldPrefix}.country_code`}
                control={control}
                rules={{ 
                  required: t('forms:telephone.validation.countryCodeRequired'),
                  validate: (value) => validateCountryCode(value || '') || t('forms:telephone.validation.invalidCountryCode')
                }}
                render={({ field }) => (
                  <Form.Control
                    {...field}
                    value={field.value ?? '+30'}
                    type="text"
                    placeholder={t('forms:telephone.placeholders.countryCode')}
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
              <Form.Label>{t('forms:telephone.number')}</Form.Label>
              <Controller
                name={`${fieldPrefix}.number`}
                control={control}
                rules={{ 
                  required: t('forms:telephone.validation.numberRequired'),
                  validate: (value) => validateTelephoneNumber(value || '') || t('forms:telephone.validation.invalidNumber')
                }}
                render={({ field }) => (
                  <Form.Control
                    {...field}
                    value={field.value ?? ''}
                    type="text"
                    placeholder={t('forms:telephone.placeholders.number')}
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
              <Form.Label>{t('forms:telephone.type')}</Form.Label>
              <Controller
                name={`${fieldPrefix}.telephone_type`}
                control={control}
                rules={{ required: t('forms:telephone.validation.typeRequired') }}
                render={({ field }) => (
                  <Form.Select 
                    {...field} 
                    value={field.value ?? 'mobile'}
                    disabled={disabled}
                    isInvalid={!!errors?.telephone_type}
                  >
                    <option value="mobile">{getTelephoneTypeIcon('mobile')} {t('forms:telephone.mobile')}</option>
                    <option value="home">{getTelephoneTypeIcon('home')} {t('forms:telephone.home')}</option>
                    <option value="work">{getTelephoneTypeIcon('work')} {t('forms:telephone.work')}</option>
                    <option value="other">{getTelephoneTypeIcon('other')} {t('forms:telephone.other')}</option>
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
            variant="outline-danger"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            className="p-2"
            title={t('forms:telephone.actions.removeTelephone')}
            disabled={disabled}
          >
            <X size={20} />
          </Button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('forms:telephone.actions.confirmDelete')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {t('forms:telephone.actions.deleteMessage')}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            {t('common:buttons.cancel')}
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            {t('common:buttons.delete')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TelephoneForm;
