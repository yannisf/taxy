import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { ErrorBoundary } from 'react-error-boundary';

// Import layout components
import AppLayout from './components/layout/AppLayout';
import { ErrorFallback } from './components/common/ErrorFallback';

// Import views
import KidListView from './components/kids/KidListView';
import KidAddView from './components/kids/KidAddView';
import KidDetailsView from './components/kids/KidDetailsView';
import KidEditView from './components/kids/KidEditView';

// Import contexts
import { KidsProvider } from './contexts/KidsContext';
import { ClassProvider } from './contexts/ClassContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';
// Import React Toastify CSS
import 'react-toastify/dist/ReactToastify.css';

import './App.css';

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <AppLayout />,
      children: [
        { index: true, element: <Navigate to="/kids" replace /> },
        { path: 'kids', element: <KidListView /> },
        { path: 'kids/add', element: <KidAddView /> },
        { path: 'kids/:kidId', element: <KidDetailsView /> },
        { path: 'kids/:kidId/edit', element: <KidEditView /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL }
);

const App: React.FC = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
      <ThemeProvider>
        <ClassProvider>
          <KidsProvider>
            <RouterProvider router={router} />
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </KidsProvider>
        </ClassProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
