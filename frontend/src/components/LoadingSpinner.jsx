// ============================================================
// FILE: frontend/src/components/LoadingSpinner.jsx
// PURPOSE: Display a loading spinner while data is being fetched
// ============================================================
// Shown whenever we're waiting for an API response.
// Uses CSS animation defined in index.css
// ============================================================

import React from 'react';

function LoadingSpinner({ message = 'Loading data...' }) {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p className="loading-text">{message}</p>
    </div>
  );
}

export default LoadingSpinner;
