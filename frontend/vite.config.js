// ============================================================
// FILE: frontend/vite.config.js
// PURPOSE: Configuration for Vite (our build tool / dev server)
// ============================================================
// Vite is like a turbo-charged development server.
// It serves our React app, handles hot-reloading (changes appear
// instantly without refresh), and bundles everything for production.
// ============================================================

import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function getBackendTarget() {
  const backendEnvPath = path.resolve(__dirname, '../backend/.env');
  const fallbackPort = '5000';

  try {
    const envFile = fs.readFileSync(backendEnvPath, 'utf8');
    const portLine = envFile
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => line.startsWith('PORT='));

    const port = portLine?.split('=')[1]?.trim() || fallbackPort;
    return `http://localhost:${port}`;
  } catch {
    return `http://localhost:${fallbackPort}`;
  }
}

const backendTarget = getBackendTarget();

export default defineConfig({
  plugins: [react()],   // Enable React support (JSX, Fast Refresh)
  
  server: {
    port: 5173,          // Frontend runs on http://localhost:5173
    
    // PROXY: Routes API calls to our backend automatically
    // When frontend calls "/api/anything", Vite forwards it to the backend port
    // declared in ../backend/.env (falling back to port 5000).
    // This avoids CORS issues during development
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,               // Needed for virtual hosted sites
      }
    }
  }
});
