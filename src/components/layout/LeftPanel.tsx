import React from 'react';
import { ListGroup, Button, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { PersonFill, Plus } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
// useKids not needed in LeftPanel anymore; import in TopBar
import { useClass } from '../../contexts/ClassContext';
import { useClassKids } from '../../hooks/useClassKids';
import type { Kid } from '../../types/models';
// Import/Export moved to TopBar
// ClassModal moved to TopBar

const LeftPanel: React.FC = () => {
  const { t } = useTranslation();
  // refreshKids moved to TopBar's import flow
  const { selectedClass } = useClass();
  
  const classKids = useClassKids();
  // edit/close class moved to TopBar
  // file input handled in TopBar
  const navigate = useNavigate();

  const handleKidClick = (kid: Kid) => {
    navigate(`/kids/${kid.kid_id}`);
  };


  // Import/Export moved to TopBar


  // Kids are already sorted by the useClassKids hook
  const sortedKids = classKids;

  return (
    <>
      <div className="left-panel p-3">
        <div className="left-panel-content d-flex flex-column h-100">
        {/* Selected Class Display */}
        {selectedClass && (
          <div className="mb-1 py-1 px-0 rounded class-info">
            <div className="mb-2">
              <div className="text-primary fw-bold">{selectedClass.school_name}</div>
              <div>
                {selectedClass.class_name} 
                <small className="text-muted ms-2">({selectedClass.school_year})</small>
              </div>
            </div>
            {/* Import/Export actions moved to TopBar's Import/Export dropdown */}
            {/* Close Class moved to TopBar's Class dropdown */}
          </div>
        )}

        {selectedClass && (
          <div className="d-flex align-items-center mb-3 gap-1">
            <h5 className="mb-0">{t('kids')}</h5>
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip id="add-kid-tooltip">{t('addKid')}</Tooltip>}
            >
              <Button
                variant="link"
                size="sm"
                className="p-0 add-kid-icon-button"
                onClick={() => navigate('/kids/add')}
                aria-label={t('addKid')}
                title={t('addKid')}
              >
                <Plus size={18} />
              </Button>
            </OverlayTrigger>
          </div>
        )}
        
        <div className="kids-list">
        <ListGroup variant="flush">
          {sortedKids.map(kid => (
            <ListGroup.Item 
              key={kid.kid_id} 
              className="kid-list-item d-flex justify-content-between align-items-center py-2 px-0 border-0"
              style={{ 
                cursor: 'pointer',
                backgroundColor: 'transparent',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(40, 167, 69, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              onClick={() => handleKidClick(kid)}
            >
              <div className="kid-name-area flex-grow-1 d-flex align-items-center gap-2">
                <span className="text-truncate">
                  {(kid.preferred_name || kid.first_name)} {kid.last_name}
                </span>
                <Badge bg="secondary" className="d-flex align-items-center gap-1">
                  <PersonFill size={12} />
                  {kid.guardians.length}
                </Badge>
              </div>
            </ListGroup.Item>
          ))}
          {sortedKids.length === 0 && selectedClass && (
            <ListGroup.Item variant="light" className="text-center border-0">
              {t('noKidsInClass')}
            </ListGroup.Item>
          )}
        </ListGroup>
        </div>
        
        {selectedClass && (
          /* File input handled in TopBar */
          <></>
        )}
        </div>
      </div>


      {/* Import Confirmation Modal moved to TopBar */}

      {/* Edit Class Modal moved to TopBar */}
    </>
  );
};

export default LeftPanel;
