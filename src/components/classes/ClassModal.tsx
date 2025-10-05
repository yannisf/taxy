import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

interface ClassModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (classData: {
    school_name: string;
    class_name: string;
    school_year: string;
  }) => Promise<void>;
  loading?: boolean;
}

const ClassModal: React.FC<ClassModalProps> = ({ show, onHide, onSubmit, loading = false }) => {
  const { t } = useTranslation(['classes', 'common', 'messages']);
  const [formData, setFormData] = useState({
    school_name: '',
    class_name: '',
    school_year: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [validated, setValidated] = useState(false);

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
      setError(t('classes:form.validation.schoolYearFormat'));
      return;
    }

    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error('Error creating class:', error);
      setError(error instanceof Error ? error.message : t('messages:error.failedToCreateClass'));
    }
  };

  const handleClose = () => {
    setFormData({
      school_name: '',
      class_name: '',
      school_year: ''
    });
    setError(null);
    setValidated(false);
    onHide();
  };

  const handleShow = () => {
    // Set default school year when modal opens
    if (show && !formData.school_year) {
      setFormData(prev => ({
        ...prev,
        school_year: defaultSchoolYear
      }));
    }
  };

  // Update school year when modal shows
  React.useEffect(() => {
    if (show) {
      handleShow();
    }
  }, [show]);

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{t('classes:title.createClass')}</Modal.Title>
      </Modal.Header>
      
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}
          
          <Form.Group className="mb-3">
            <Form.Label>{t('classes:form.schoolName')} {t('common:labels.required')}</Form.Label>
            <Form.Control
              type="text"
              value={formData.school_name}
              onChange={(e) => handleInputChange('school_name', e.target.value)}
              placeholder={t('classes:form.placeholders.schoolName')}
              required
              disabled={loading}
            />
            <Form.Control.Feedback type="invalid">
              {t('classes:form.validation.schoolNameRequired')}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t('classes:form.className')} {t('common:labels.required')}</Form.Label>
            <Form.Control
              type="text"
              value={formData.class_name}
              onChange={(e) => handleInputChange('class_name', e.target.value)}
              placeholder={t('classes:form.placeholders.className')}
              required
              disabled={loading}
            />
            <Form.Control.Feedback type="invalid">
              {t('classes:form.validation.classNameRequired')}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t('classes:form.schoolYear')} {t('common:labels.required')}</Form.Label>
            <Form.Control
              type="text"
              value={formData.school_year}
              onChange={(e) => handleInputChange('school_year', e.target.value)}
              placeholder={t('classes:form.placeholders.schoolYear')}
              pattern="[0-9]{4}-[0-9]{4}"
              required
              disabled={loading}
            />
            <Form.Control.Feedback type="invalid">
              {t('classes:form.validation.schoolYearRequired')}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              {t('classes:form.help.schoolYearFormat')}
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            {t('common:buttons.cancel')}
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? t('common:buttons.creating') : t('classes:actions.createClass')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ClassModal;
