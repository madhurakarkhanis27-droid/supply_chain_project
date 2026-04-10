// ============================================================
// FILE: frontend/src/components/Sidebar.jsx
// PURPOSE: Navigation sidebar — always visible on the left
// ============================================================
// The sidebar provides navigation between our 3 main views:
//   1. Dashboard  — Overview with charts and KPIs
//   2. Products   — Browse all products with filters
//   3. (Product Detail is accessed by clicking a product)
//
// It uses React Router's NavLink to highlight the active page.
// ============================================================

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard,  // Dashboard icon
  Package,          // Products icon  
  AlertTriangle,    // Returns icon
  Shield,           // AI section icon
  Activity,
  LogOut,
  UserRound
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

// ---- Sidebar Styles (scoped to this component) ----
const styles = {
  sidebar: {
    width: 'var(--sidebar-width)',
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    background: 'var(--bg-secondary)',
    borderRight: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 100,
    overflow: 'hidden',
  },

  // --- Logo area at the top ---
  logo: {
    padding: '24px 20px',
    borderBottom: '1px solid var(--border-color)',
  },
  logoInner: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #b77943, #d2a679)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    flexShrink: 0,
  },
  logoText: {
    fontSize: '1rem',
    fontWeight: '700',
    color: 'var(--text-heading)',
    lineHeight: '1.2',
  },
  logoSubtext: {
    fontSize: '0.7rem',
    color: 'var(--text-tertiary)',
    fontWeight: '400',
  },

  // --- Navigation section ---
  nav: {
    padding: '16px 12px',
    flex: 1,
  },
  navLabel: {
    fontSize: '0.65rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--text-tertiary)',
    padding: '8px 12px 8px',
    marginTop: '8px',
  },

  // --- Individual nav link (default state) ---
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    borderRadius: '8px',
    color: 'var(--text-secondary)',
    fontSize: '0.875rem',
    fontWeight: '500',
    textDecoration: 'none',
    transition: 'all 150ms ease',
    marginBottom: '2px',
  },

  // --- Nav link - active state (current page) ---
  navLinkActive: {
    background: 'rgba(183, 121, 67, 0.14)',
    color: '#9a6233',
  },

  // --- Footer at bottom ---
  footer: {
    padding: '16px 20px',
    borderTop: '1px solid var(--border-color)',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#10b981',
    display: 'inline-block',
    marginRight: '8px',
    animation: 'pulse 2s ease infinite',
  },
  statusText: {
    fontSize: '0.75rem',
    color: 'var(--text-tertiary)',
  },
};

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isBusiness = user?.role === 'business';

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <aside style={styles.sidebar}>
      {/* ---- LOGO ---- */}
      <div style={styles.logo}>
        <div style={styles.logoInner}>
          <div style={styles.logoIcon}>
            <Activity size={22} />
          </div>
          <div>
            <div style={styles.logoText}>Returns AI</div>
            <div style={styles.logoSubtext}>{isBusiness ? 'Business Intelligence' : 'Customer Insights'}</div>
          </div>
        </div>
      </div>

      {/* ---- NAVIGATION LINKS ---- */}
      <nav style={styles.nav}>
        <div style={styles.navLabel}>Main Menu</div>

        {isBusiness && (
          <NavLink
            to="/dashboard"
            end
            style={({ isActive }) => ({
              ...styles.navLink,
              ...(isActive ? styles.navLinkActive : {}),
            })}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>
        )}

        <NavLink
          to="/products"
          style={({ isActive }) => ({
            ...styles.navLink,
            ...(isActive ? styles.navLinkActive : {}),
          })}
        >
          <Package size={18} />
          Products
        </NavLink>

        {isBusiness && (
          <>
            <div style={styles.navLabel}>AI Features</div>

            <NavLink
              to="/risk-analysis"
              style={({ isActive }) => ({
                ...styles.navLink,
                ...(isActive ? styles.navLinkActive : {}),
              })}
            >
              <AlertTriangle size={18} />
              Risk Analysis
            </NavLink>

            <NavLink
              to="/fake-review-detector"
              style={({ isActive }) => ({
                ...styles.navLink,
                ...(isActive ? styles.navLinkActive : {}),
              })}
            >
              <Shield size={18} />
              Fake Review Detector
            </NavLink>
          </>
        )}
      </nav>

      {/* ---- FOOTER — AI Engine Status ---- */}
      <div style={styles.footer}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <UserRound size={14} color="var(--text-secondary)" />
          <span style={styles.statusText}>{user?.name} • {isBusiness ? 'Business' : 'Customer'}</span>
        </div>
        {isBusiness && (
          <div style={{ marginBottom: '12px' }}>
            <span style={styles.statusDot}></span>
            <span style={styles.statusText}>AI Engine Active</span>
          </div>
        )}
        <button type="button" style={{ ...styles.navLink, width: '100%', border: 'none', background: 'transparent', paddingLeft: 0, paddingRight: 0, marginBottom: 0 }} onClick={handleLogout}>
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
