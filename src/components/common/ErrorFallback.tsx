import React from 'react';
import { Container, Alert, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

interface ErrorFallbackProps {
  error: unknown;
  resetErrorBoundary: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  const { t } = useTranslation();
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  return (
    <Container className="mt-5">
      <Alert variant="danger">
        <Alert.Heading>{t('unexpectedError') || 'Something went wrong'}</Alert.Heading>
        <p>{message}</p>
        {import.meta.env.DEV && stack && (
          <details className="mt-3">
            <summary>Error Stack Trace</summary>
            <pre className="mt-2 text-small">
              {stack}
            </pre>
          </details>
        )}
        <hr />
        <div className="d-flex justify-content-end">
          <Button onClick={resetErrorBoundary} variant="outline-danger">
            {t('tryAgain') || 'Try again'}
          </Button>
        </div>
      </Alert>
    </Container>
  );
};
