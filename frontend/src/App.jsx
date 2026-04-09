// ============================================================
// FILE: frontend/src/App.jsx
// PURPOSE: Root component — sets up routing and layout
// ============================================================
// This is the TOP-LEVEL component that wraps our entire app.
//
// STRUCTURE:
//   <BrowserRouter>         ← Enables URL-based navigation
//     <div class="app-layout">
//       <Sidebar />         ← Always visible on the left
//       <main>              ← Main content area (changes per page)
//         <Routes>          ← React Router decides which page to show
//           /              → Dashboard
//           /products      → ProductsList
//           /products/:id  → ProductDetail
//         </Routes>
//       </main>
//     </div>
//   </BrowserRouter>
//
// HOW ROUTING WORKS:
//   - User visits http://localhost:5173/         → sees Dashboard
//   - User visits http://localhost:5173/products → sees ProductsList
//   - User visits http://localhost:5173/products/7 → sees ProductDetail for product 7
//   - Sidebar links use <NavLink> to change the URL without page reload
// ============================================================

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layout component
import Sidebar from './components/Sidebar';

// Page components
import Dashboard from './pages/Dashboard';
import ProductsList from './pages/ProductsList';
import ProductDetail from './pages/ProductDetail';
import RiskAnalysis from './pages/RiskAnalysis';
import FakeReviewDetector from './pages/FakeReviewDetector';


function App() {
  return (
    <Router>
      <div className="app-layout">
        {/* Sidebar — always visible */}
        <Sidebar />

        {/* Main content — changes based on URL */}
        <main className="main-content">
          <Routes>
            {/* Route 1: Dashboard (home page) */}
            <Route path="/" element={<Dashboard />} />

            {/* Route 2: All products list */}
            <Route path="/products" element={<ProductsList />} />

            {/* Route 3: Portfolio-wide risk analysis */}
            <Route path="/risk-analysis" element={<RiskAnalysis />} />

            {/* Route 4: Fake review detector */}
            <Route path="/fake-review-detector" element={<FakeReviewDetector />} />

            {/* Route 5: Single product detail with AI analysis */}
            {/* The ":id" is a URL parameter — React Router captures it */}
            <Route path="/products/:id" element={<ProductDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
