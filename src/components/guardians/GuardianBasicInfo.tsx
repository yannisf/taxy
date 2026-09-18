import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { Controller } from 'react-hook-form';
import type { Control, FieldErrors } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { Guardian, Kid } from '../../types/models';

interface GuardianBasicInfoProps {
  control: Control<Kid>;
  errors?: FieldErrors<Guardian>;
  index: number;
}

const GuardianBasicInfo: React.FC<GuardianBasicInfoProps> = ({ control, errors, index }) => {
  const { t } = useTranslation();

  return (
    <>
      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label>{t('firstName')}</Form.Label>
            <Controller
              name={`guardians.${index}.first_name`}
              control={control}
              rules={{ required: t('firstNameRequired') }}
              render={({ field }) => (
                <Form.Control
                  {...field}
                  value={field.value ?? ''}
                  type="text"
                  placeholder={t('enterGuardianFirstName')}
                  isInvalid={!!errors?.first_name}
                />
              )}
            />
            {errors?.first_name && (
              <Form.Control.Feedback type="invalid">
                {errors.first_name.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label>{t('lastName')}</Form.Label>
            <Controller
              name={`guardians.${index}.last_name`}
              control={control}
              rules={{ required: t('lastNameRequired') }}
              render={({ field }) => (
                <Form.Control
                  {...field}
                  value={field.value ?? ''}
                  type="text"
                  placeholder={t('enterGuardianLastName')}
                  isInvalid={!!errors?.last_name}
                />
              )}
            />
            {errors?.last_name && (
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
            <Form.Label>{t('relationWithKid')} <span style={{color: 'red'}}>{t('required')}</span></Form.Label>
            <Controller
              name={`guardians.${index}.relation_with_kid`}
              control={control}
              rules={{ required: t('relationRequired') }}
              render={({ field }) => (
                <Form.Select {...field} value={field.value || ''} isInvalid={!!errors?.relation_with_kid}>
                  <option value="" disabled>{t('selectRelation')}</option>
                  <option value="father">{t('relationFather')}</option>
                  <option value="mother">{t('relationMother')}</option>
                  <option value="brother">{t('relationBrother')}</option>
                  <option value="sister">{t('relationSister')}</option>
                  <option value="grandfather">{t('relationGrandfather')}</option>
                  <option value="grandmother">{t('relationGrandmother')}</option>
                  <option value="uncle">{t('relationUncle')}</option>
                  <option value="aunt">{t('relationAunt')}</option>
                  <option value="godfather">{t('relationGodfather')}</option>
                  <option value="godmother">{t('relationGodmother')}</option>
                  <option value="caregiver">{t('relationCaregiver')}</option>
                  <option value="extended family">{t('relationExtendedFamily')}</option>
                  <option value="friend">{t('relationFriend')}</option>
                  {/* Legacy values: only shown when already selected, so editing an existing guardian doesn't silently clear it. Pick a specific relation to replace it. */}
                  {field.value === 'sibling' && (
                    <option value="sibling">{t('relationSibling')}</option>
                  )}
                  {field.value === 'grandparent' && (
                    <option value="grandparent">{t('relationGrandparent')}</option>
                  )}
                </Form.Select>
              )}
            />
            {errors?.relation_with_kid && (
              <Form.Control.Feedback type="invalid">
                {errors.relation_with_kid.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
        <Col>
          <Form.Group className="mb-3">
            <Controller
              name={`guardians.${index}.authorized_for_pickup`}
              control={control}
              render={({ field }) => (
                <Form.Check
                  type="checkbox"
                  label={t('notAuthorizedForPickup')}
                  checked={!field.value}
                  onChange={(e) => field.onChange(!e.target.checked)}
                />
              )}
            />
          </Form.Group>
        </Col>
      </Row>
    </>
  );
};

export default GuardianBasicInfo;
