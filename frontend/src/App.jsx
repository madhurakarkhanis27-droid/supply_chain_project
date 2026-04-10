import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ProductsList from './pages/ProductsList';
import ProductDetail from './pages/ProductDetail';
import RiskAnalysis from './pages/RiskAnalysis';
import FakeReviewDetector from './pages/FakeReviewDetector';
import Login from './pages/Login';
import { useAuth } from './auth/AuthContext';

function RequireAuth() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

function RequireRole({ allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'business' ? '/' : '/products'} replace />;
  }

  return <Outlet />;
}

function AppShell() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

function HomeRoute() {
  const { user } = useAuth();
  return <Navigate to={user?.role === 'business' ? '/dashboard' : '/products'} replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<RequireAuth />}>
          <Route path="/" element={<HomeRoute />} />

          <Route element={<AppShell />}>
            <Route path="/products" element={<ProductsList />} />
            <Route path="/products/:id" element={<ProductDetail />} />

            <Route element={<RequireRole allowedRoles={['business']} />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/risk-analysis" element={<RiskAnalysis />} />
              <Route path="/fake-review-detector" element={<FakeReviewDetector />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
