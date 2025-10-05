import React, { useState, useEffect } from 'react';
import { ListGroup, Button, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { db } from '../../services/database';
import { useKids } from '../../contexts/KidsContext';
import type { Kid } from '../../types/models';

const LeftPanel: React.FC = () => {
  const { kids, refreshKids } = useKids();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [kidToDelete, setKidToDelete] = useState<Kid | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    refreshKids();
  }, [refreshKids]);

  const handleView = (kid: Kid, event: React.MouseEvent) => {
    event.stopPropagation();
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

  return (
    <>
      <div className="left-panel p-3">
        <Button 
          variant="primary" 
          className="w-100 mb-3"
          onClick={() => navigate('/kids/add')}
        >
          Add Kid
        </Button>
        
        <h5>Kids List</h5>
        <ListGroup>
          {kids.map(kid => (
            <ListGroup.Item 
              key={kid.kid_id} 
              className="d-flex justify-content-between align-items-center py-2"
            >
              <span className="text-truncate me-2">
                {kid.name} {kid.surname}
              </span>
              <div className="d-flex gap-1">
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  className="p-1"
                  onClick={(e) => handleView(kid, e)}
                  title="View details"
                >
                  👁️
                </Button>
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  className="p-1"
                  onClick={(e) => handleEdit(kid, e)}
                  title="Edit"
                >
                  ✏️
                </Button>
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  className="p-1"
                  onClick={(e) => handleDeleteClick(kid, e)}
                  title="Delete"
                >
                  ✖️
                </Button>
              </div>
            </ListGroup.Item>
          ))}
          {kids.length === 0 && (
            <ListGroup.Item variant="light" className="text-center">
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
