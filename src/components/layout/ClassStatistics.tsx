import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Collapse } from 'react-bootstrap';
import { 
  People, 
  GenderMale, 
  GenderFemale, 
  Mortarboard, 
  Stars,
  PersonHearts,
  ChevronUp,
  ChevronDown
} from 'react-bootstrap-icons';
import type { Kid } from '../../types/models';

interface ClassStatisticsProps {
  kids: Kid[];
}

const ClassStatistics: React.FC<ClassStatisticsProps> = ({ kids }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const statistics = useMemo(() => {
    const totalKids = kids.length;
    const boys = kids.filter(kid => kid.gender === 'male').length;
    const girls = kids.filter(kid => kid.gender === 'female').length;
    
    const preKindergartners = kids.filter(kid => kid.level === 'pre-kindergartner').length;
    const kindergartners = kids.filter(kid => kid.level === 'kindergartner').length;
    const kindergartnersRepeating = kids.filter(kid => kid.level === 'kindergartner-repeating').length;
    
    const specialEducationKids = kids.filter(kid => kid.special_education).length;
    
    const totalGuardians = kids.reduce((sum, kid) => sum + kid.guardians.length, 0);

    return {
      totalKids,
      boys,
      girls,
      preKindergartners,
      kindergartners,
      kindergartnersRepeating,
      specialEducationKids,
      totalGuardians
    };
  }, [kids]);

  if (kids.length === 0) {
    return null;
  }

  return (
    <div className="class-statistics mt-3 pt-3">
      {/* Toggle Button */}
      <Button
        variant="link"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-100 d-flex align-items-center justify-content-between p-2 text-decoration-none"
        style={{ 
          backgroundColor: 'rgba(108, 117, 125, 0.1)',
          border: 'none',
          borderRadius: '0.375rem'
        }}
      >
        <span className="d-flex align-items-center gap-2 text-muted">
          <People size={18} />
          <span className="fw-semibold">{t('classStatistics')}</span>
        </span>
        {isExpanded ? <ChevronUp size={18} className="text-muted" /> : <ChevronDown size={18} className="text-muted" />}
      </Button>

      {/* Collapsible Statistics Content */}
      <Collapse in={isExpanded}>
        <div className="statistics-list small mt-2">
        {/* Total Kids */}
        <div className="d-flex justify-content-between align-items-center mb-2 p-2 rounded" 
             style={{ backgroundColor: 'rgba(13, 110, 253, 0.1)' }}>
          <span className="d-flex align-items-center gap-2">
            <People size={16} className="text-primary" />
            <span className="fw-semibold">{t('totalKids')}:</span>
          </span>
          <span className="fw-bold text-primary">{statistics.totalKids}</span>
        </div>
        
        {/* Boys */}
        <div className="d-flex justify-content-between align-items-center mb-1 ps-3 pe-2 py-1">
          <span className="d-flex align-items-center gap-2">
            <GenderMale size={14} className="text-info" />
            <span>{t('boys')}:</span>
          </span>
          <span className="text-info">{statistics.boys}</span>
        </div>
        
        {/* Girls */}
        <div className="d-flex justify-content-between align-items-center mb-2 ps-3 pe-2 py-1">
          <span className="d-flex align-items-center gap-2">
            <GenderFemale size={14} className="text-danger" />
            <span>{t('girls')}:</span>
          </span>
          <span className="text-danger">{statistics.girls}</span>
        </div>
        
        {/* Pre-Kindergartners */}
        <div className="d-flex justify-content-between align-items-center mb-1 ps-2 pe-2 py-1">
          <span className="d-flex align-items-center gap-2">
            <Mortarboard size={14} className="text-success" />
            <span>{t('preKindergartners')}:</span>
          </span>
          <span className="text-success">{statistics.preKindergartners}</span>
        </div>
        
        {/* Kindergartners */}
        <div className="d-flex justify-content-between align-items-center mb-1 ps-2 pe-2 py-1">
          <span className="d-flex align-items-center gap-2">
            <Mortarboard size={14} className="text-success" />
            <span>{t('kindergartners')}:</span>
          </span>
          <span className="text-success">{statistics.kindergartners}</span>
        </div>
        
        {/* Kindergartners Repeating */}
        <div className="d-flex justify-content-between align-items-center mb-2 ps-2 pe-2 py-1">
          <span className="d-flex align-items-center gap-2">
            <Mortarboard size={14} className="text-success" />
            <span>{t('kindergartnersRepeating')}:</span>
          </span>
          <span className="text-success">{statistics.kindergartnersRepeating}</span>
        </div>
        
        {/* Special Education */}
        <div className="d-flex justify-content-between align-items-center mb-2 p-2 rounded" 
             style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)' }}>
          <span className="d-flex align-items-center gap-2">
            <Stars size={14} className="text-warning" />
            <span>{t('specialEducationKids')}:</span>
          </span>
          <span className="text-warning fw-semibold">{statistics.specialEducationKids}</span>
        </div>
        
        {/* Total Guardians */}
        <div className="d-flex justify-content-between align-items-center p-2 rounded" 
             style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)' }}>
          <span className="d-flex align-items-center gap-2">
            <PersonHearts size={16} className="text-danger" />
            <span className="fw-semibold">{t('totalGuardians')}:</span>
          </span>
          <span className="fw-bold text-danger">{statistics.totalGuardians}</span>
        </div>
        </div>
      </Collapse>
    </div>
  );
};

export default ClassStatistics;
