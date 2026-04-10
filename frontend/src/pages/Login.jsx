import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Briefcase, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const PROFILE_OPTIONS = [
  {
    role: 'business',
    name: 'Business User',
    title: 'Business Account',
    subtitle: 'Internal business access profile',
    description: 'Open dashboards, risk analysis, fake review detection, seller action plans, returns, and support insights.',
    icon: Briefcase,
  },
  {
    role: 'customer',
    name: 'Customer User',
    title: 'Customer Account',
    subtitle: 'Product-facing customer profile',
    description: 'Browse products, read reviews, view root-cause analysis, compare alternatives, and shop with safer guidance.',
    icon: ShoppingBag,
  },
];

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  function continueWithProfile(profile) {
    login({
      name: profile.name,
      role: profile.role,
    });

    const nextPath = location.state?.from?.pathname;
    if (nextPath && nextPath !== '/login') {
      navigate(nextPath, { replace: true });
      return;
    }

    navigate(profile.role === 'business' ? '/' : '/products', { replace: true });
  }

  return (
    <div className="login-shell">
      <div className="login-panel login-panel-single">
        <div className="login-copy">
          <span className="hero-badge">PROFILE ACCESS</span>
          <h1>Choose how you want to enter Returns AI.</h1>
          <p>
            Business users see internal return operations and action plans. Customers only see product-facing insights relevant to buying decisions.
          </p>

          <div className="login-note">
            <ShieldCheck size={18} />
            <span>Role-based visibility keeps business-only recommendations out of the customer experience.</span>
          </div>

          <div style={{ marginTop: '26px' }} className="login-role-grid">
            {PROFILE_OPTIONS.map((option) => {
              const Icon = option.icon;

              return (
                <button
                  key={option.role}
                  type="button"
                  className="login-role-card active"
                  onClick={() => continueWithProfile(option)}
                >
                  <Icon size={20} />
                  <div>
                    <div className="login-role-title">{option.title}</div>
                    <div className="login-role-subtitle">{option.subtitle}</div>
                  </div>
                  <p>{option.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
