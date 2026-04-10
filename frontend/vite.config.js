// ============================================================
// FILE: frontend/vite.config.js
// PURPOSE: Configuration for Vite (our build tool / dev server)
// ============================================================
// Vite is like a turbo-charged development server.
// It serves our React app, handles hot-reloading (changes appear
// instantly without refresh), and bundles everything for production.
// ============================================================

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],   // Enable React support (JSX, Fast Refresh)
  
  server: {
    port: 5173,          // Frontend runs on http://localhost:5173
    
    // PROXY: Routes API calls to our backend automatically
    // When frontend calls "/api/anything", Vite forwards it to port 5000
    // This avoids CORS issues during development
    proxy: {
      '/api': {
        target: 'http://localhost:5001',  // Our Express backend
        changeOrigin: true,               // Needed for virtual hosted sites
      }
    }
  }
});
