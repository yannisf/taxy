import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { Download } from 'react-bootstrap-icons';
import { Eye, EyeSlash } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';

interface ExportModalProps {
  show: boolean;
  onHide: () => void;
  onConfirmExport: (options: ExportOptions) => Promise<void>;
  loading?: boolean;
  className?: string;
  schoolName?: string;
  schoolYear?: string;
}

export interface ExportOptions {
  encrypt: boolean;
  password?: string;
}

const ExportModal: React.FC<ExportModalProps> = ({
  show,
  onHide,
  onConfirmExport,
  loading = false,
  className,
  schoolName,
  schoolYear
}) => {
  const { t } = useTranslation();
  const [encryptEnabled, setEncryptEnabled] = useState(true); // Checked by default
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validated, setValidated] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Real-time password matching validation
  useEffect(() => {
    if (encryptEnabled && password && confirmPassword) {
      if (password !== confirmPassword) {
        setPasswordError(t('passwordsDontMatch'));
      } else {
        setPasswordError(null);
      }
    } else {
      setPasswordError(null);
    }
  }, [password, confirmPassword, encryptEnabled, t]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const form = event.currentTarget;

    if (encryptEnabled) {
      // Validate passwords
      if (!password || password.length < 8) {
        setPasswordError(t('passwordTooShort'));
        setValidated(true);
        return;
      }

      if (!confirmPassword) {
        setPasswordError(t('passwordRequired'));
        setValidated(true);
        return;
      }

      if (password !== confirmPassword) {
        setPasswordError(t('passwordsDontMatch'));
        setValidated(true);
        return;
      }
    }

    if (!form.checkValidity()) {
      setValidated(true);
      return;
    }

    // Create a temporary copy of the password for the export
    const passwordCopy = encryptEnabled ? password : undefined;

    // Immediately clear passwords from state
    setPassword('');
    setConfirmPassword('');

    // Submit with the temporary password copy
    await onConfirmExport({
      encrypt: encryptEnabled,
      password: passwordCopy
    });

    // The passwordCopy will be garbage collected after this function completes
  };

  const handleClose = () => {
    // Reset form state
    setEncryptEnabled(true); // Reset to default checked
    setPassword('');
    setConfirmPassword('');
    setValidated(false);
    setPasswordError(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    onHide();
  };

  const handleEncryptChange = (checked: boolean) => {
    setEncryptEnabled(checked);
    if (!checked) {
      // Clear passwords when encryption is disabled
      setPassword('');
      setConfirmPassword('');
      setPasswordError(null);
      setValidated(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{t('exportOptions')}</Modal.Title>
      </Modal.Header>

      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Body>
          {schoolName && className && (
            <Alert variant="info" className="mb-3">
              <div>
                {schoolName} - {className} {schoolYear && `(${schoolYear})`}
              </div>
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              id="encrypt-checkbox"
              label={t('encryptThisExport')}
              checked={encryptEnabled}
              onChange={(e) => handleEncryptChange(e.target.checked)}
              disabled={loading}
            />
          </Form.Group>

          {encryptEnabled && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>{t('exportPassword')} *</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('enterPassword')}
                    required={encryptEnabled}
                    disabled={loading}
                    isInvalid={validated && encryptEnabled && (!password || password.length < 8)}
                  />
                  <Button
                    variant="link"
                    className="position-absolute end-0 top-0 text-muted"
                    style={{ zIndex: 10 }}
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
                <Form.Text className="text-muted">
                  {t('passwordSecurityNote')}
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>{t('confirmExportPassword')} *</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('confirmPasswordPlaceholder')}
                    required={encryptEnabled}
                    disabled={loading}
                    isInvalid={!!passwordError && validated}
                  />
                  <Button
                    variant="link"
                    className="position-absolute end-0 top-0 text-muted"
                    style={{ zIndex: 10 }}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
                {passwordError && (
                  <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
                    {passwordError}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            {t('cancel')}
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={loading || (encryptEnabled && (!password || !confirmPassword || password !== confirmPassword))}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                {t('encrypting')}
              </>
            ) : (
              <>
                <Download size={16} className="me-2" />
                {t('download')}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ExportModal;
