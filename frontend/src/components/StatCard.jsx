// ============================================================
// FILE: frontend/src/components/StatCard.jsx
// PURPOSE: A single KPI (Key Performance Indicator) card
// ============================================================
// These are the numbered cards at the top of the Dashboard:
//   "Total Returns: 1,920"  "Avg Return Rate: 15.6%"  etc.
//
// Each card shows:
//   - An icon (to quickly identify the metric)
//   - The metric name (e.g., "Total Returns")
//   - The value (e.g., "1,920")
//   - A color accent based on whether the value is good/bad
//
// PROPS:
//   title    — Name of the metric (string)
//   value    — The number to display (string or number)
//   icon     — Lucide icon component
//   color    — Accent color: 'indigo', 'purple', 'emerald', 'amber', 'red', 'blue'
//   subtitle — Extra context shown below the value (optional)
// ============================================================

import React from 'react';

// Color mappings — each card type gets its own color scheme
const colorMap = {
  indigo:  { bg: 'rgba(183, 121, 67, 0.12)',  text: '#9a6233', glow: 'rgba(183, 121, 67, 0.16)' },
  purple:  { bg: 'rgba(210, 166, 121, 0.18)',  text: '#b77943', glow: 'rgba(210, 166, 121, 0.16)' },
  emerald: { bg: 'rgba(16, 185, 129, 0.1)',  text: '#10b981', glow: 'rgba(16, 185, 129, 0.2)' },
  amber:   { bg: 'rgba(245, 158, 11, 0.1)',  text: '#f59e0b', glow: 'rgba(245, 158, 11, 0.2)' },
  red:     { bg: 'rgba(239, 68, 68, 0.1)',   text: '#ef4444', glow: 'rgba(239, 68, 68, 0.2)' },
  blue:    { bg: 'rgba(111, 146, 175, 0.14)',   text: '#55748f', glow: 'rgba(111, 146, 175, 0.16)' },
  cyan:    { bg: 'rgba(122, 164, 152, 0.14)',    text: '#4f7d72', glow: 'rgba(122, 164, 152, 0.16)' },
};

function StatCard({ title, value, icon: Icon, color = 'indigo', subtitle }) {
  const colors = colorMap[color] || colorMap.indigo;

  return (
    <div 
      className="glass-card animate-in"
      style={{ 
        position: 'relative', 
        overflow: 'hidden',
        cursor: 'default',
      }}
    >
      {/* Subtle gradient glow in top-right corner */}
      <div style={{
        position: 'absolute',
        top: '-30px',
        right: '-30px',
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: colors.glow,
        filter: 'blur(40px)',
        pointerEvents: 'none',  /* Don't block clicks */
      }} />

      {/* Card content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Icon + Title row */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '12px' 
        }}>
          <span style={{ 
            fontSize: '0.8rem', 
            fontWeight: '500', 
            color: 'var(--text-secondary)' 
          }}>
            {title}
          </span>
          
          {/* Icon in a colored circle */}
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: colors.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.text,
          }}>
            {Icon && <Icon size={18} />}
          </div>
        </div>

        {/* Value — the big number */}
        <div style={{ 
          fontSize: '1.75rem', 
          fontWeight: '800', 
          color: 'var(--text-heading)',
          lineHeight: '1.2',
          marginBottom: subtitle ? '4px' : '0',
        }}>
          {value}
        </div>

        {/* Optional subtitle */}
        {subtitle && (
          <div style={{ 
            fontSize: '0.75rem', 
            color: 'var(--text-tertiary)' 
          }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard;
