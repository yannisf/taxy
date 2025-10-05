import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useKids } from '../../contexts/KidsContext';

const KidListView: React.FC = () => {
  const { kids } = useKids();
  const navigate = useNavigate();
  const kidCount = kids.length;

  const handleAddKid = () => {
    navigate('/kids/add');
  };

  return (
    <Container className="mt-3">
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Card className="text-center" style={{ maxWidth: '500px', width: '100%' }}>
          <Card.Body className="p-5">
            <div className="mb-4">
              <h2 className="text-muted">Class Management System</h2>
            </div>
            
            {kidCount === 0 ? (
              <>
                <div className="mb-4">
                  <p className="lead text-muted">
                    Welcome! You haven't added any kids to your class yet.
                  </p>
                  <p className="text-muted">
                    Get started by adding your first student.
                  </p>
                </div>
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={handleAddKid}
                >
                  Add Your First Kid
                </Button>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <h4 className="text-primary">{kidCount} Kid{kidCount > 1 ? 's' : ''} in Class</h4>
                  <p className="text-muted">
                    Select a kid from the left panel to view their details, edit their information, or add a new student.
                  </p>
                </div>
                <Button 
                  variant="outline-primary"
                  onClick={handleAddKid}
                >
                  Add Another Kid
                </Button>
              </>
            )}
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default KidListView;
