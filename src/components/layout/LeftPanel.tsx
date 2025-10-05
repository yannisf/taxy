import React, { useState, useEffect } from 'react';
import { ListGroup, Button, Modal, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { PencilSquare, XLg, PersonFill, Plus } from 'react-bootstrap-icons';
import { db } from '../../services/database';
import { useKids } from '../../contexts/KidsContext';
import type { Kid } from '../../types/models';

const LeftPanel: React.FC = () => {
  const { kids, refreshKids } = useKids();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [kidToDelete, setKidToDelete] = useState<Kid | null>(null);
  const [hoveredKidId, setHoveredKidId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    refreshKids();
  }, [refreshKids]);

  const handleKidClick = (kid: Kid) => {
    navigate(`/kids/${kid.kid_id}`);
  };

  const handleEdit = (kid: Kid, event: React.MouseEvent) => {
    event.stopPropagation();
    navigate(`/kids/${kid.kid_id}/edit`);
  };

  const handleDeleteClick = (kid: Kid, event: React.MouseEvent) => {
    event.stopPropagation();
    setKidToDelete(kid);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (kidToDelete) {
      try {
        await db.deleteKid(kidToDelete.kid_id);
        await refreshKids(); // Refresh the list using context
        setShowDeleteModal(false);
        setKidToDelete(null);
        // Navigate to default view if the deleted kid was currently selected
        navigate('/kids');
      } catch (error) {
        console.error('Error deleting kid:', error);
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setKidToDelete(null);
  };

  // Sort kids by preferred name (if exists) or legal name, then by surname
  const sortedKids = [...kids].sort((a, b) => {
    const aFirstName = a.preferred_name || a.name;
    const bFirstName = b.preferred_name || b.name;
    
    if (aFirstName.toLowerCase() !== bFirstName.toLowerCase()) {
      return aFirstName.toLowerCase().localeCompare(bFirstName.toLowerCase());
    }
    
    return a.surname.toLowerCase().localeCompare(b.surname.toLowerCase());
  });

  return (
    <>
      <div className="left-panel p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Class</h5>
          <Button 
            variant="link" 
            className="p-0 text-decoration-none"
            onClick={() => navigate('/kids/add')}
            title="Add Kid"
          >
            <Plus size={20} />
          </Button>
        </div>
        
        <ListGroup variant="flush">
          {sortedKids.map(kid => (
            <ListGroup.Item 
              key={kid.kid_id} 
              className="kid-list-item d-flex justify-content-between align-items-center py-2 px-0 border-0"
              style={{ 
                cursor: 'pointer',
                backgroundColor: hoveredKidId === kid.kid_id ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={() => setHoveredKidId(kid.kid_id)}
              onMouseLeave={() => setHoveredKidId(null)}
              onClick={() => handleKidClick(kid)}
            >
              <div className="kid-name-area flex-grow-1 d-flex align-items-center gap-2">
                <span className="text-truncate">
                  {(kid.preferred_name || kid.name)} {kid.surname}
                </span>
                <Badge bg="secondary" className="d-flex align-items-center gap-1">
                  <PersonFill size={12} />
                  {kid.guardians.length}
                </Badge>
              </div>
              <div className="action-icons d-flex gap-1">
                <Button 
                  variant="link" 
                  size="sm"
                  className={`p-1 text-decoration-none icon-button edit-icon ${hoveredKidId === kid.kid_id ? 'visible' : 'invisible'}`}
                  onClick={(e) => handleEdit(kid, e)}
                  title="Edit"
                >
                  <PencilSquare size={16} />
                </Button>
                <Button 
                  variant="link" 
                  size="sm"
                  className={`p-1 text-decoration-none icon-button delete-icon ${hoveredKidId === kid.kid_id ? 'visible' : 'invisible'}`}
                  onClick={(e) => handleDeleteClick(kid, e)}
                  title="Delete"
                >
                  <XLg size={16} />
                </Button>
              </div>
            </ListGroup.Item>
          ))}
          {kids.length === 0 && (
            <ListGroup.Item variant="light" className="text-center border-0">
              No kids added yet
            </ListGroup.Item>
          )}
        </ListGroup>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={cancelDelete}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete <strong>{kidToDelete?.name} {kidToDelete?.surname}</strong>? 
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelDelete}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default LeftPanel;
