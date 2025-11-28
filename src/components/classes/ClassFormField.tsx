import React from 'react';
import { Form } from 'react-bootstrap';
import AutocompleteInput from '../common/AutocompleteInput';

interface ClassFormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  disabled?: boolean;
  validated?: boolean;
  errorMessage?: string;
  helpText?: string;
  suggestions?: string[];
  pattern?: string;
  useAutocomplete?: boolean;
}

const ClassFormField: React.FC<ClassFormFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  validated = false,
  errorMessage,
  helpText,
  suggestions = [],
  pattern,
  useAutocomplete = false
}) => {
  const showError = validated && required && !value;

  return (
    <Form.Group className="mb-3">
      <Form.Label>{label}</Form.Label>
      {useAutocomplete && !disabled ? (
        <AutocompleteInput
          value={value}
          onChange={onChange}
          onBlur={() => {}}
          suggestions={suggestions}
          placeholder={placeholder}
          isInvalid={showError}
        />
      ) : (
        <Form.Control
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          pattern={pattern}
          required={required}
          disabled={disabled}
          isInvalid={showError}
        />
      )}
      {showError && errorMessage && (
        <div className="invalid-feedback d-block">
          {errorMessage}
        </div>
      )}
      {!showError && helpText && (
        <Form.Text className="text-muted">
          {helpText}
        </Form.Text>
      )}
    </Form.Group>
  );
};

export default ClassFormField;
