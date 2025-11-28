import React from 'react';
import { Form } from 'react-bootstrap';
import { Controller } from 'react-hook-form';
import type { Control, FieldError } from 'react-hook-form';
import AutocompleteInput from './AutocompleteInput';
import { filterNamesByQuery } from '../../utils/nameUtils';

interface AddressFieldInputProps {
  name: string;
  control: Control<any>;
  label: string;
  placeholder: string;
  suggestions: string[];
  error?: FieldError;
  disabled?: boolean;
}

const AddressFieldInput: React.FC<AddressFieldInputProps> = ({
  name,
  control,
  label,
  placeholder,
  suggestions,
  error,
  disabled = false
}) => {
  return (
    <Form.Group className="mb-3">
      <Form.Label>{label}</Form.Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const filteredSuggestions = filterNamesByQuery(suggestions, field.value || '');
          return disabled ? (
            <Form.Control
              {...field}
              value={field.value ?? ''}
              type="text"
              placeholder={placeholder}
              disabled={disabled}
              isInvalid={!!error}
            />
          ) : (
            <AutocompleteInput
              value={field.value || ''}
              onChange={field.onChange}
              onBlur={field.onBlur}
              suggestions={filteredSuggestions}
              placeholder={placeholder}
              isInvalid={!!error}
            />
          );
        }}
      />
      {error && (
        <Form.Control.Feedback type="invalid" className="d-block">
          {error.message}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
};

export default AddressFieldInput;
