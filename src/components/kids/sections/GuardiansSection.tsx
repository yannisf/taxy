import React, { useState } from 'react';
import { Accordion } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import type { Guardian } from '../../../types/models';
import GuardianAccordionItem from '../../guardians/GuardianAccordionItem';
import GuardiansSectionHeader from './GuardiansSectionHeader';

interface GuardiansSectionProps {
  initialGuardians?: Guardian[];
  onChange: (guardians: Guardian[]) => void;
}

const GuardiansSection: React.FC<GuardiansSectionProps> = ({ initialGuardians, onChange }) => {
  const { t } = useTranslation();
  const [guardians, setGuardians] = useState<Guardian[]>(initialGuardians || []);
  const [showNewGuardian, setShowNewGuardian] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);

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
          {guardians.map((guardian, index) => (
            <GuardianAccordionItem
              key={index}
              guardian={guardian}
              eventKey={`guardian-${index}`}
              onSave={(updatedGuardian) => handleSaveGuardian(index, updatedGuardian)}
              onDelete={handleDeleteGuardian}
            />
          ))}

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
};

export default GuardiansSection;
