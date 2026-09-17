import React, { useState } from 'react';
import { Form, Button, Modal, InputGroup } from 'react-bootstrap';
import { Controller, useWatch } from 'react-hook-form';
import { X } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import type { Control, FieldErrors } from 'react-hook-form';
import type { Telephone } from '../../types/models';
import { validateTelephoneNumber, validateCountryCode, getTelephoneTypeIcon, formatPhoneNumberGrouped } from '../../utils/telephoneUtils';

interface TelephoneFormProps {
  control: Control<Record<string, unknown>>;
  errors?: FieldErrors<Telephone>;
  fieldPrefix: string;
  onRemove: () => void;
  disabled?: boolean;
  showRemoveButton?: boolean;
}

const DEFAULT_COUNTRY_CODE = '+30';

const telephoneTypeLabelKeys: Record<Telephone['telephone_type'], string> = {
  mobile: 'telephoneMobile',
  home: 'telephoneHome',
  work: 'telephoneWork',
  other: 'telephoneOther'
};

// One compact row per telephone: [type icon][country code][number] ×.
// The country code is almost always the local one, so while it is the default
// it shows as a quiet prefix; clicking it (or having any other code) makes it editable.
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
  const [editingCountryCode, setEditingCountryCode] = useState(false);
  const countryCode = (useWatch({ control, name: `${fieldPrefix}.country_code` }) as string | undefined) ?? DEFAULT_COUNTRY_CODE;
  const showCountryCodeInput = editingCountryCode || countryCode !== DEFAULT_COUNTRY_CODE || !!errors?.country_code;

  const handleDeleteConfirm = () => {
    onRemove();
    setShowDeleteModal(false);
  };

  const errorMessages = [errors?.telephone_type?.message, errors?.country_code?.message, errors?.number?.message]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="mb-2" style={{ maxWidth: '26rem' }}>
      <div className="d-flex align-items-center gap-1">
        <InputGroup hasValidation>
          <Controller
            name={`${fieldPrefix}.telephone_type`}
            control={control}
            rules={{ required: t('telephoneTypeRequired') }}
            render={({ field }) => {
              const type = (field.value as Telephone['telephone_type'] | undefined) ?? 'mobile';
              return (
                <Form.Select
                  {...field}
                  value={type}
                  aria-label={`${t('telephoneType')}: ${t(telephoneTypeLabelKeys[type])}`}
                  title={t(telephoneTypeLabelKeys[type])}
                  disabled={disabled}
                  isInvalid={!!errors?.telephone_type}
                  style={{ flex: '0 0 4.25rem' }}
                >
                  {(Object.keys(telephoneTypeLabelKeys) as Telephone['telephone_type'][]).map((option) => (
                    <option key={option} value={option} aria-label={t(telephoneTypeLabelKeys[option])}>
                      {getTelephoneTypeIcon(option)}
                    </option>
                  ))}
                </Form.Select>
              );
            }}
          />

          {showCountryCodeInput ? (
            <Controller
              name={`${fieldPrefix}.country_code`}
              control={control}
              rules={{
                required: t('countryCodeRequired'),
                validate: (value) => validateCountryCode((value as string | undefined) || '') || t('invalidCountryCode')
              }}
              render={({ field }) => (
                <Form.Control
                  {...field}
                  value={(field.value as string | undefined) ?? DEFAULT_COUNTRY_CODE}
                  onBlur={() => {
                    field.onBlur();
                    setEditingCountryCode(false);
                  }}
                  type="text"
                  aria-label={t('telephoneCountryCode')}
                  title={t('telephoneCountryCode')}
                  placeholder={t('enterCountryCode')}
                  disabled={disabled}
                  isInvalid={!!errors?.country_code}
                  autoFocus={editingCountryCode}
                  style={{ flex: '0 0 3.75rem', textAlign: 'center' }}
                />
              )}
            />
          ) : (
            <Button
              variant="outline-secondary"
              className="text-body-secondary"
              style={{ flex: '0 0 3.75rem', borderColor: 'var(--bs-border-color)' }}
              title={t('telephoneCountryCode')}
              aria-label={`${t('telephoneCountryCode')}: ${countryCode}`}
              disabled={disabled}
              onClick={() => setEditingCountryCode(true)}
            >
              {countryCode}
            </Button>
          )}

          <Controller
            name={`${fieldPrefix}.number`}
            control={control}
            rules={{
              required: t('telephoneNumberRequired'),
              validate: (value) => validateTelephoneNumber((value as string | undefined) || '') || t('invalidTelephoneNumber')
            }}
            render={({ field }) => (
              <Form.Control
                name={field.name}
                ref={field.ref}
                onBlur={field.onBlur}
                value={formatPhoneNumberGrouped((field.value as string | undefined) ?? '')}
                onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                type="tel"
                inputMode="tel"
                aria-label={t('telephoneNumber')}
                placeholder="___ ___ ____"
                disabled={disabled}
                isInvalid={!!errors?.number}
                style={{ fontVariantNumeric: 'tabular-nums' }}
              />
            )}
          />
        </InputGroup>

        {showRemoveButton && (
          <Button
            variant="link"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            className="p-2 text-danger"
            title={t('removeTelephone')}
            aria-label={t('removeTelephone')}
            disabled={disabled}
          >
            <X size={20} />
          </Button>
        )}
      </div>

      {errorMessages && <div className="small text-danger mt-1">{errorMessages}</div>}

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
