import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Simple error boundary for problematic browser extensions
window.addEventListener('error', function(event) {
  // Silently suppress specific extension errors that don't affect our app
  if (event.filename && event.filename.includes('chrome-extension://') && 
      event.message && event.message.includes('Cannot set property')) {
    console.debug('Suppressed extension error:', event.message);
    event.preventDefault();
    event.stopImmediatePropagation();
    return false;
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);