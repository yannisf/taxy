import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Accordion } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import type { Guardian } from '../../../types/models';
import GuardianAccordionItem from '../../guardians/GuardianAccordionItem';
import type { GuardianAccordionItemHandle } from '../../guardians/GuardianAccordionItem';
import GuardiansSectionHeader from './GuardiansSectionHeader';

interface GuardiansSectionProps {
  initialGuardians?: Guardian[];
  onChange: (guardians: Guardian[]) => void;
}

export interface GuardiansSectionHandle {
  // Commits any pending edits on the currently open guardian. Returns false
  // (without committing) if that guardian has unsaved invalid data.
  flushActiveGuardian: () => Promise<boolean>;
}

const GuardiansSection = forwardRef<GuardiansSectionHandle, GuardiansSectionProps>(({ initialGuardians, onChange }, ref) => {
  const { t } = useTranslation();
  const [guardians, setGuardians] = useState<Guardian[]>(initialGuardians || []);
  const [showNewGuardian, setShowNewGuardian] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const activeItemRef = useRef<GuardianAccordionItemHandle | null>(null);

  useImperativeHandle(ref, () => ({
    flushActiveGuardian: async () => {
      // The "new guardian" draft is intentionally left out: it isn't part of
      // the guardians list until explicitly added, same as before.
      if (!activeKey || activeKey === 'new-guardian' || !activeItemRef.current) {
        return true;
      }
      return activeItemRef.current.commitIfDirty();
    }
  }));

  const guardianCount = guardians.length;

  const handleSaveGuardian = (index: number, updatedGuardian: Guardian) => {
    const newGuardians = [...guardians];
    newGuardians[index] = updatedGuardian;
    setGuardians(newGuardians);
    onChange(newGuardians);
    setActiveKey(null);
  };

  const handleDeleteGuardian = (guardian: Guardian) => {
    const newGuardians = guardians.filter(g => g !== guardian);
    setGuardians(newGuardians);
    onChange(newGuardians);
    setActiveKey(null);
  };

  const handleSaveNewGuardian = (newGuardian: Guardian) => {
    const newGuardians = [...guardians, newGuardian];
    setGuardians(newGuardians);
    onChange(newGuardians);
    setShowNewGuardian(false);
    setActiveKey(null);
  };

  const handleCancelNewGuardian = () => {
    setShowNewGuardian(false);
    setActiveKey(null);
  };

  const handleAddGuardianClick = () => {
    setShowNewGuardian(true);
    setActiveKey('new-guardian');
  };

  return (
    <div className="mb-4">
      <GuardiansSectionHeader
        guardianCount={guardianCount}
        onAddGuardian={handleAddGuardianClick}
        isAddingGuardian={showNewGuardian}
      />
      {guardians.length === 0 && !showNewGuardian ? (
        <div className="mb-0 p-3 bg-body-tertiary rounded text-muted">
          {t('noGuardiansYet')}
        </div>
      ) : (
        <Accordion activeKey={activeKey} onSelect={(key) => setActiveKey(key as string | null)}>
          {guardians.map((guardian, index) => {
            const eventKey = `guardian-${index}`;
            return (
              <GuardianAccordionItem
                key={index}
                ref={activeKey === eventKey ? activeItemRef : undefined}
                guardian={guardian}
                eventKey={eventKey}
                onSave={(updatedGuardian) => handleSaveGuardian(index, updatedGuardian)}
                onDelete={handleDeleteGuardian}
                onRequestCollapse={() => setActiveKey(null)}
              />
            );
          })}

          {showNewGuardian && (
            <GuardianAccordionItem
              isNew
              eventKey="new-guardian"
              onSave={handleSaveNewGuardian}
              onDelete={() => {}}
              onCancel={handleCancelNewGuardian}
            />
          )}
        </Accordion>
      )}
    </div>
  );
});

export default GuardiansSection;
