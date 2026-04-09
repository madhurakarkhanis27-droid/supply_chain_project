// ============================================================
// FILE: frontend/src/main.jsx
// PURPOSE: Entry point — mounts React app to the DOM
// ============================================================
// This is the FIRST JavaScript file that runs.
// It does two things:
//   1. Imports our global CSS (index.css)
//   2. Renders the <App /> component into the #root div in index.html
//
// React.StrictMode:
//   - Runs extra checks during development (double-renders to catch bugs)
//   - Has NO effect in production builds
// ============================================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';   // Global styles — MUST import here so they apply everywhere

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
