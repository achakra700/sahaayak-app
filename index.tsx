import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initializeI18n } from './i18n'; // Import the new initializer function

// Wait for i18n to be initialized before rendering the app.
// This ensures that all translations are loaded and i18n instance is ready.
initializeI18n().then(() => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error("Could not find root element to mount to");
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <Suspense fallback="Loading...">
        <App />
      </Suspense>
    </React.StrictMode>
  );
});
