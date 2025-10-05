import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Control, FieldErrors } from 'react-hook-form';
import type { Telephone } from '../../types/models';
import TelephoneForm from './TelephoneForm';

interface SortableTelephoneFormProps {
  id: string;
  control: Control<Record<string, unknown>>;
  errors?: FieldErrors<Telephone>;
  fieldPrefix: string;
  onRemove: () => void;
  disabled?: boolean;
}

const SortableTelephoneForm: React.FC<SortableTelephoneFormProps> = ({
  id,
  control,
  errors,
  fieldPrefix,
  onRemove,
  disabled = false
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <TelephoneForm
        control={control}
        errors={errors}
        fieldPrefix={fieldPrefix}
        onRemove={onRemove}
        showRemoveButton={true}
        showDragHandle={true}
        disabled={disabled}
        dragListeners={listeners}
      />
    </div>
  );
};

export default SortableTelephoneForm;
