import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useClass } from '../../hooks/useClass';
import { useClassKids } from '../../hooks/useClassKids';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { formatClassDisplay } from '../../utils/classUtils';

const KidListView: React.FC = () => {
  const { t } = useTranslation();
  const { classes, selectedClass } = useClass();
  const classKids = useClassKids();
  const navigate = useNavigate();

  const kidCount = classKids.length;

  const handleAddKid = () => {
    navigate('/kids/add');
  };

  // Determine the current state
  const hasNoClasses = classes.length === 0;
  const hasNoSelectedClass = !selectedClass && classes.length > 0;

  // Keyboard navigation - only allow 'n' shortcut when a class is selected
  useKeyboardNavigation([
    {
      key: ['n', 'ν'],
      handler: () => {
        if (selectedClass) {
          handleAddKid();
        }
      }
    },
  ]);

  return (
    <Container className="mt-3">
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Card className="text-center border-0" style={{ maxWidth: '500px', width: '100%' }}>
          <Card.Body className="p-5">
            <div className="mb-4">
              <h2 className="text-muted">{t('appName')}</h2>
            </div>
            
            {hasNoClasses ? (
              <>
                <div className="mb-4">
                  <p className="text-muted">
                    {t('noClassesAvailable')}
                  </p>
                </div>
              </>
            ) : hasNoSelectedClass ? (
              <>
                <div className="mb-4">
                  <p className="text-muted">
                    {t('noClassSelected')}
                  </p>
                </div>
              </>
            ) : kidCount === 0 ? (
              <>
                <div className="mb-4">
                  <h5 className="text-body-secondary mb-3">{formatClassDisplay(selectedClass)}</h5>
                  <p className="lead text-muted">
                    {t('noKidsInClass')}
                  </p>
                  <p className="text-muted">
                    {t('getStarted')}
                  </p>
                </div>
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={handleAddKid}
                >
                  {t('addFirstKid')}
                </Button>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <h5 className="text-body-secondary mb-3">{formatClassDisplay(selectedClass)}</h5>
                  <h4 className="text-primary">{t('kidsInClass', { count: kidCount })}</h4>
                  <p className="text-muted">
                    {t('selectFromPanel')}
                  </p>
                </div>
                <Button 
                  variant="outline-primary"
                  onClick={handleAddKid}
                >
                  {t('addAnotherKid')}
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
