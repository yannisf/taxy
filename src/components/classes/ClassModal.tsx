import React, { useState, useMemo, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useClass } from '../../contexts/ClassContext';
import {
  extractUniqueSchoolNames,
  extractUniqueClassNames,
  filterNamesByQuery
} from '../../utils/nameUtils';
import ClassFormField from './ClassFormField';

interface ClassModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (classData: {
    school_name: string;
    class_name: string;
    school_year: string;
  }) => Promise<void>;
  loading?: boolean;
  mode?: 'create' | 'edit';
  initialData?: {
    school_name: string;
    class_name: string;
    school_year: string;
  };
}

const ClassModal: React.FC<ClassModalProps> = ({
  show,
  onHide,
  onSubmit,
  loading = false,
  mode = 'create',
  initialData
}) => {
  const { t } = useTranslation();
  const { classes } = useClass();
  const [formData, setFormData] = useState({
    school_name: initialData?.school_name || '',
    class_name: initialData?.class_name || '',
    school_year: initialData?.school_year || ''
  });
  const [error, setError] = useState<string | null>(null);
  const [validated, setValidated] = useState(false);

  // Extract unique school and class names for autocomplete
  const allSchoolNames = useMemo(() => extractUniqueSchoolNames(classes), [classes]);
  const allClassNames = useMemo(() => extractUniqueClassNames(classes), [classes]);

  // Generate default school year (current year - next year)
  const currentYear = new Date().getFullYear();
  const defaultSchoolYear = `${currentYear}-${currentYear + 1}`;

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const form = event.currentTarget;
    if (!form.checkValidity()) {
      setValidated(true);
      return;
    }

    // Validate school year format
    const schoolYearPattern = /^[0-9]{4}-[0-9]{4}$/;
    if (!schoolYearPattern.test(formData.school_year)) {
      setError(t('schoolYearFormat'));
      return;
    }

    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error('Error creating class:', error);
      setError(error instanceof Error ? error.message : t('failedToCreateClass'));
    }
  };

  const handleClose = () => {
    if (mode === 'create') {
      setFormData({
        school_name: '',
        class_name: '',
        school_year: ''
      });
    } else {
      setFormData({
        school_name: initialData?.school_name || '',
        class_name: initialData?.class_name || '',
        school_year: initialData?.school_year || ''
      });
    }
    setError(null);
    setValidated(false);
    onHide();
  };

  const handleShow = () => {
    if (mode === 'create') {
      // Set default school year when modal opens for create mode
      if (show && !formData.school_year) {
        setFormData(prev => ({
          ...prev,
          school_year: defaultSchoolYear
        }));
      }
    } else if (mode === 'edit' && initialData) {
      // Set initial data for edit mode
      setFormData({
        school_name: initialData.school_name,
        class_name: initialData.class_name,
        school_year: initialData.school_year
      });
    }
  };

  // Update data when modal shows or mode/initialData changes
  useEffect(() => {
    if (show) {
      handleShow();
    }
  }, [show, mode, initialData]);

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {mode === 'create' ? t('createClass') : t('editClass')}
        </Modal.Title>
      </Modal.Header>

      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}

          <ClassFormField
            label={`${t('schoolName')} ${t('required')}`}
            value={formData.school_name}
            onChange={(value) => handleInputChange('school_name', value)}
            placeholder={t('enterSchoolName')}
            required={true}
            disabled={loading}
            validated={validated}
            errorMessage={t('schoolNameRequired')}
            useAutocomplete={true}
            suggestions={filterNamesByQuery(allSchoolNames, formData.school_name)}
          />

          <ClassFormField
            label={`${t('className')} ${t('required')}`}
            value={formData.class_name}
            onChange={(value) => handleInputChange('class_name', value)}
            placeholder={t('enterClassName')}
            required={true}
            disabled={loading}
            validated={validated}
            errorMessage={t('classNameRequired')}
            useAutocomplete={true}
            suggestions={filterNamesByQuery(allClassNames, formData.class_name)}
          />

          <ClassFormField
            label={`${t('schoolYear')} ${t('required')}`}
            value={formData.school_year}
            onChange={(value) => handleInputChange('school_year', value)}
            placeholder={t('enterSchoolYear')}
            pattern="[0-9]{4}-[0-9]{4}"
            required={true}
            disabled={loading}
            validated={validated}
            errorMessage={t('schoolYearRequired')}
            helpText={t('schoolYearFormatHelp')}
            useAutocomplete={false}
          />
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            {t('cancel')}
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading
              ? (mode === 'create' ? t('creating') : t('updating'))
              : (mode === 'create' ? t('createClassAction') : t('updateClass'))
            }
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ClassModal;
