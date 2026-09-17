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
  // Commits any pending edits on every guardian item (open or collapsed),
  // including an in-progress "new guardian" draft. Returns false (without
  // committing the kid) if any guardian has unsaved invalid data.
  flushActiveGuardian: () => Promise<boolean>;
}

const GuardiansSection = forwardRef<GuardiansSectionHandle, GuardiansSectionProps>(({ initialGuardians, onChange }, ref) => {
  const { t } = useTranslation();
  const [guardians, setGuardians] = useState<Guardian[]>(initialGuardians || []);
  const [showNewGuardian, setShowNewGuardian] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  // Mirrors `guardians` synchronously. A submit can flush two or more dirty
  // guardians back-to-back (e.g. one edited, then another); React batches
  // those setGuardians calls, so a second commit computed from the `guardians`
  // closure would still see the pre-flush array and clobber the first commit.
  // Reading/writing this ref instead keeps each commit building on the last.
  const guardiansRef = useRef<Guardian[]>(initialGuardians || []);
  // Every guardian item (not just the currently open one) is kept mounted by
  // the accordion, so every item gets a persistent ref here. This lets a
  // submit flush edits left dirty on a guardian the user already navigated
  // away from, not just whichever one happens to be open.
  const itemRefs = useRef<Map<string, GuardianAccordionItemHandle>>(new Map());
  const refSetters = useRef<Map<string, (handle: GuardianAccordionItemHandle | null) => void>>(new Map());

  const getItemRefSetter = (eventKey: string) => {
    let setter = refSetters.current.get(eventKey);
    if (!setter) {
      setter = (handle: GuardianAccordionItemHandle | null) => {
        if (handle) {
          itemRefs.current.set(eventKey, handle);
        } else {
          itemRefs.current.delete(eventKey);
        }
      };
      refSetters.current.set(eventKey, setter);
    }
    return setter;
  };

  useImperativeHandle(ref, () => ({
    flushActiveGuardian: async () => {
      for (const [eventKey, handle] of itemRefs.current) {
        const succeeded = await handle.commitIfDirty();
        if (!succeeded) {
          // Surface the validation error even if the user navigated away to
          // another guardian (or collapsed the accordion) since it happened.
          setActiveKey(eventKey);
          return false;
        }
      }
      return true;
    }
  }));

  const guardianCount = guardians.length;

  const commitGuardians = (newGuardians: Guardian[]) => {
    guardiansRef.current = newGuardians;
    setGuardians(newGuardians);
    onChange(newGuardians);
  };

  const handleSaveGuardian = (index: number, updatedGuardian: Guardian) => {
    const newGuardians = [...guardiansRef.current];
    newGuardians[index] = updatedGuardian;
    commitGuardians(newGuardians);
    setActiveKey(null);
  };

  const handleDeleteGuardian = (guardian: Guardian) => {
    const newGuardians = guardiansRef.current.filter(g => g !== guardian);
    commitGuardians(newGuardians);
    setActiveKey(null);
  };

  const handleSaveNewGuardian = (newGuardian: Guardian) => {
    const newGuardians = [...guardiansRef.current, newGuardian];
    commitGuardians(newGuardians);
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
                ref={getItemRefSetter(eventKey)}
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
              ref={getItemRefSetter('new-guardian')}
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
