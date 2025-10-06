import React from 'react';
import { Container, Card, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useClass } from '../../contexts/ClassContext';
import { useClassKids } from '../../hooks/useClassKids';
import { formatClassDisplay } from '../../utils/classUtils';

const KidListView: React.FC = () => {
  const { t } = useTranslation(['common', 'kids']);
  const { selectedClass } = useClass();
  const classKids = useClassKids();
  const navigate = useNavigate();

  const kidCount = classKids.length;

  const handleAddKid = () => {
    navigate('/kids/add');
  };


  return (
    <Container className="mt-3">
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Card className="text-center" style={{ maxWidth: '500px', width: '100%' }}>
          <Card.Body className="p-5">
            <div className="mb-4">
              <h2 className="text-muted">{t('common:appName')}</h2>
            </div>
            
            {!selectedClass ? (
              <>
                <div className="mb-4">
                  <Alert variant="info" className="mb-3">
                    {t('common:messages.selectClass')}
                  </Alert>
                  <p className="text-muted">
                    {t('common:messages.noClassesAvailable')}
                  </p>
                </div>
              </>
            ) : kidCount === 0 ? (
              <>
                <div className="mb-4">
                  <h5 className="text-info mb-3">{formatClassDisplay(selectedClass)}</h5>
                  <p className="lead text-muted">
                    {t('kids:messages.noKidsInClass')}
                  </p>
                  <p className="text-muted">
                    {t('kids:messages.getStarted')}
                  </p>
                </div>
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={handleAddKid}
                >
                  {t('kids:title.addFirstKid')}
                </Button>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <h5 className="text-info mb-3">{formatClassDisplay(selectedClass)}</h5>
                  <h4 className="text-primary">{t('kids:messages.kidsInClass', { count: kidCount })}</h4>
                  <p className="text-muted">
                    {t('kids:messages.selectFromPanel')}
                  </p>
                </div>
                <Button 
                  variant="outline-primary"
                  onClick={handleAddKid}
                >
                  {t('kids:title.addAnotherKid')}
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
