import React, { useState, useMemo, useCallback } from 'react';
import { Accordion, Button, Modal, Form, Row, Col, Card } from 'react-bootstrap';
import { X } from 'react-bootstrap-icons';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { Guardian } from '../../types/models';
import { validationService } from '../../services/validation';
import AddressForm from '../common/AddressForm';
import TelephoneForm from '../common/TelephoneForm';
import { formatAddressString } from '../../utils/addressUtils';

interface GuardianAccordionItemProps {
  guardian?: Guardian;
  isNew?: boolean;
  eventKey: string;
  onSave: (guardian: Guardian) => void;
  onDelete: (guardian: Guardian) => void;
  onCancel?: () => void;
}

const GuardianAccordionItemComponent: React.FC<GuardianAccordionItemProps> = ({
  guardian,
  isNew = false,
  eventKey,
  onSave,
  onDelete,
  onCancel
}) => {
  const { t } = useTranslation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { 
    control, 
    handleSubmit, 
    formState: { errors }, 
    reset,
    watch 
  } = useForm<Guardian>({
    defaultValues: guardian || {
      first_name: '',
      last_name: '',
      relation_with_kid: 'mother',
      authorized_for_pickup: false,
      same_address_as_kid: true,
      telephones: []
    }
  });

  // Field array for managing telephones
  const { fields: telephoneFields, append: appendTelephone, remove: removeTelephone } = useFieldArray({
    control,
    name: 'telephones'
  });

  const onSubmit = useCallback((data: Guardian) => {
    setValidationError(null);
    
    // Validate guardian data
    const validationResult = validationService.validateGuardian(data);
    
    if (!validationResult.valid) {
      const errorMessages = validationResult.errors?.map(err => 
        `${err.instancePath || ''} ${err.message}`
      ).join(', ') || 'Validation failed';
      setValidationError(errorMessages);
      return;
    }

    onSave(data);
    // Only reset if it's a new guardian - existing guardians should keep their data
    if (isNew) {
      reset();
    }
  }, [onSave, isNew, reset]);

  const handleDelete = useCallback(() => {
    if (guardian) {
      onDelete(guardian);
    }
    setShowDeleteModal(false);
  }, [guardian, onDelete]);

  const headerTitle = useMemo(() => {
    if (isNew) return t('guardians:messages.newGuardian');
    if (guardian) {
      return (
        <>
          {guardian.first_name || 'Unnamed'} {guardian.last_name || ''} {' '}
          <span className="badge text-bg-secondary">
            {t(`guardians:relationDisplay.${guardian.relation_with_kid}`)}
          </span>
        </>
      );
    }
    return t('guardians:messages.guardian');
  }, [isNew, guardian?.first_name, guardian?.last_name, guardian?.relation_with_kid, t]);

  // Memoized address title for guardian
  const guardianAddressTitle = useMemo(() => {
    const addressString = formatAddressString(guardian?.address);
    return addressString ? `${t('guardians:messages.addressTitle')}: ${addressString}` : t('guardians:messages.addressTitle');
  }, [guardian?.address, t]);

  // Address accordion expanded state for guardian
  const guardianAddressExpanded = useMemo(() => {
    const addressString = formatAddressString(guardian?.address);
    return !addressString; // Expanded if no address, collapsed if address exists
  }, [guardian?.address]);

  return (
    <>
      <Accordion.Item eventKey={eventKey}>
        <Accordion.Header>
          <div className="d-flex justify-content-between align-items-center w-100">
            <span>{headerTitle}</span>
            {!isNew && guardian && (
              <Button variant="outline-danger" size="sm" className="p-2 me-3" title={t('guardians:actions.deleteGuardian')}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteModal(true);
                }}>
                  <X size={20} />
            </Button>
            )}
          </div>
        </Accordion.Header>
        <Accordion.Body>
          <div>
            {validationError && (
              <div className="alert alert-danger">{validationError}</div>
            )}
            
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>{t('guardians:form.firstName')}</Form.Label>
                  <Controller
                    name="first_name"
                    control={control}
                    rules={{ required: t('guardians:validation.firstNameRequired') }}
                    render={({ field }) => (
                      <Form.Control
                        {...field}
                        value={field.value ?? ''}
                        type="text"
                        placeholder={t('guardians:form.placeholders.firstName')}
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
                  <Form.Label>{t('guardians:form.lastName')}</Form.Label>
                  <Controller
                    name="last_name"
                    control={control}
                    rules={{ required: t('guardians:validation.lastNameRequired') }}
                    render={({ field }) => (
                      <Form.Control
                        {...field}
                        value={field.value ?? ''}
                        type="text"
                        placeholder={t('guardians:form.placeholders.lastName')}
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
                  <Form.Label>{t('guardians:form.relationWithKid')}</Form.Label>
                  <Controller
                    name="relation_with_kid"
                    control={control}
                    render={({ field }) => (
                      <Form.Select {...field}>
                        <option value="father">{t('guardians:relations.father')}</option>
                        <option value="mother">{t('guardians:relations.mother')}</option>
                        <option value="sibling">{t('guardians:relations.sibling')}</option>
                        <option value="grandparent">{t('guardians:relations.grandparent')}</option>
                        <option value="extended family">{t('guardians:relations.extendedFamily')}</option>
                        <option value="friend">{t('guardians:relations.friend')}</option>
                      </Form.Select>
                    )}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Controller
                    name="authorized_for_pickup"
                    control={control}
                    render={({ field }) => (
                      <Form.Check
                        type="checkbox"
                        label={t('guardians:form.authorizedForPickup')}
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  <Controller
                    name="same_address_as_kid"
                    control={control}
                    render={({ field }) => (
                      <Form.Check
                        type="checkbox"
                        label={t('guardians:form.sameAddressAsKid')}
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>{t('guardians:form.email')}</Form.Label>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <Form.Control
                        {...field}
                        value={field.value ?? ''}
                        type="email"
                        placeholder={t('guardians:form.placeholders.email')}
                        isInvalid={!!errors.email}
                      />
                    )}
                  />
                  {errors.email && (
                    <Form.Control.Feedback type="invalid">
                      {errors.email.message}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>{t('guardians:form.profession')}</Form.Label>
                  <Controller
                    name="profession"
                    control={control}
                    render={({ field }) => (
                      <Form.Control
                        {...field}
                        value={field.value ?? ''}
                        type="text"
                        placeholder={t('guardians:form.placeholders.profession')}
                        isInvalid={!!errors.profession}
                      />
                    )}
                  />
                  {errors.profession && (
                    <Form.Control.Feedback type="invalid">
                      {errors.profession.message}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
            </Row>

            {/* Address Section - Only show if NOT same address as kid */}
            {!watch('same_address_as_kid') && (
              <Accordion className="mb-3" defaultActiveKey={guardianAddressExpanded ? "0" : undefined}>
                <Accordion.Item eventKey="0">
                  <Accordion.Header>{guardianAddressTitle}</Accordion.Header>
                  <Accordion.Body>
                    <AddressForm 
                      control={control as any}
                      errors={errors.address}
                    />
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            )}

            {/* Show message when same address as kid is checked */}
            {watch('same_address_as_kid') && (
              <div className="mb-3 p-3 bg-body-secondary rounded">
                <small className="text-muted">
                  {t('guardians:messages.sameAddress')}
                </small>
              </div>
            )}

            {/* Telephone Section */}
            <Card className="mb-4">
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">📞 {t('guardians:telephone.title')} <span className="badge text-bg-secondary">{telephoneFields.length}</span></h6>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => appendTelephone({ 
                      country_code: '+30', 
                      number: '', 
                      telephone_type: 'mobile' as const 
                    })}
                  >
                    + {t('guardians:telephone.addTelephone')}
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                {telephoneFields.length === 0 ? (
                  <div className="mb-0 p-3 bg-body-tertiary rounded text-muted">
                    {t('guardians:messages.noTelephones')}
                  </div>
                ) : (
                  <>
                    {telephoneFields.map((field, index) => (
                      <TelephoneForm
                        key={field.id}
                        control={control as any}
                        errors={errors.telephones?.[index]}
                        fieldPrefix={`telephones.${index}`}
                        onRemove={() => removeTelephone(index)}
                        showRemoveButton={true}
                      />
                    ))}
                  </>
                )}
              </Card.Body>
            </Card>

            <div className="d-flex gap-2">
              <Button variant="primary" onClick={handleSubmit(onSubmit)}>
                {isNew ? t('guardians:actions.addGuardian') : t('guardians:actions.updateGuardian')}
              </Button>
              {isNew && onCancel && (
                <Button variant="secondary" onClick={onCancel}>
                  {t('common:buttons.cancel')}
                </Button>
              )}
            </div>
          </div>
        </Accordion.Body>
      </Accordion.Item>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('guardians:messages.confirmDelete')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {t('guardians:messages.deleteMessage', { name: `${guardian?.first_name} ${guardian?.last_name}` })}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            {t('common:buttons.cancel')}
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            {t('common:buttons.delete')}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export const GuardianAccordionItem = React.memo(GuardianAccordionItemComponent);
export default GuardianAccordionItem;
