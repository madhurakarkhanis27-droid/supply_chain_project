// ============================================================
// FILE: frontend/src/components/RiskGauge.jsx
// PURPOSE: Visual gauge that shows a product's return risk score
// ============================================================
// This component draws a semi-circular gauge using SVG.
// The needle/arc fills based on the risk score (0-100):
//   0-25   = LOW risk      (green)
//   26-50  = MEDIUM risk   (yellow/amber)
//   51-75  = HIGH risk     (orange)
//   76-100 = CRITICAL risk (red)
//
// PROPS:
//   score    — Number from 0 to 100
//   label    — Text label (e.g., "Return Risk Score")
//   details  — Object with breakdown factors (optional)
// ============================================================

import React from 'react';

// Determine risk level from score
function getRiskLevel(score) {
  if (score <= 25) return { level: 'LOW', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
  if (score <= 50) return { level: 'MEDIUM', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
  if (score <= 75) return { level: 'HIGH', color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)' };
  return { level: 'CRITICAL', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
}

function RiskGauge({ score = 0, label = 'Risk Score', details }) {
  const risk = getRiskLevel(score);

  // SVG gauge math:
  // We draw a semi-circle (180 degrees) using an SVG arc
  const radius = 80;           // Radius of the gauge arc
  const strokeWidth = 12;      // Thickness of the arc
  const circumference = Math.PI * radius;  // Half-circle circumference
  
  // How much of the arc to fill (based on score percentage)
  const fillAmount = (score / 100) * circumference;
  const dashOffset = circumference - fillAmount;

  return (
    <div className="risk-gauge-container">
      {/* --- SVG Gauge --- */}
      <svg 
        width="200" 
        height="120" 
        viewBox="0 0 200 120"
        style={{ overflow: 'visible' }}
      >
        {/* Background arc (gray track) */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="rgba(255, 255, 255, 0.06)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Colored fill arc (animated) */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={risk.color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{
            transition: 'stroke-dashoffset 1.5s ease',
            filter: `drop-shadow(0 0 6px ${risk.color}40)`,
          }}
        />

        {/* Score number in the center */}
        <text
          x="100"
          y="80"
          textAnchor="middle"
          fill="var(--text-heading)"
          fontSize="28"
          fontWeight="800"
          fontFamily="Inter, sans-serif"
        >
          {score}
        </text>

        {/* "out of 100" label */}
        <text
          x="100"
          y="98"
          textAnchor="middle"
          fill="var(--text-tertiary)"
          fontSize="11"
          fontFamily="Inter, sans-serif"
        >
          out of 100
        </text>
      </svg>

      {/* --- Risk Level Badge --- */}
      <div style={{
        marginTop: '8px',
        padding: '4px 14px',
        borderRadius: '9999px',
        background: risk.bg,
        color: risk.color,
        fontSize: '0.75rem',
        fontWeight: '700',
        letterSpacing: '0.05em',
      }}>
        {risk.level} RISK
      </div>

      {/* --- Label --- */}
      <div style={{
        marginTop: '8px',
        fontSize: '0.8rem',
        color: 'var(--text-tertiary)',
      }}>
        {label}
      </div>

      {/* --- Breakdown Factors (optional) --- */}
      {details && (
        <div style={{
          marginTop: '16px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          {Object.entries(details).map(([key, value]) => (
            <div key={key} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.75rem',
              padding: '6px 12px',
              background: 'var(--bg-elevated)',
              borderRadius: '6px',
            }}>
              <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span style={{ 
                fontWeight: '600', 
                color: value > 60 ? '#ef4444' : value > 30 ? '#f59e0b' : '#10b981' 
              }}>
                {typeof value === 'number' ? value.toFixed(0) : value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RiskGauge;
