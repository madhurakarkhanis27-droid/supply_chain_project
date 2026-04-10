// ============================================================
// FILE: frontend/src/components/ReviewCard.jsx
// PURPOSE: Display a single customer review with AI analysis
// ============================================================
// Each review card shows:
//   - Customer name and date
//   - Star rating (1-5 stars)
//   - Review text
//   - AI-detected flags: suspicious/genuine, sentiment score
//   - If flagged as fake: reasons WHY it was flagged
//
// PROPS:
//   review      — The review object from the API
//   showAnalysis — Whether to show AI analysis badges (default: true)
// ============================================================

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, ThumbsUp, Eye } from 'lucide-react';

function ReviewCard({ review, showAnalysis = true }) {
  // State to toggle showing detailed analysis
  const [showDetails, setShowDetails] = useState(false);

  // Extract AI analysis data (if available)
  const isSuspicious = review.fakeAnalysis?.isSuspicious || review.fakeCheck?.isSuspicious || false;
  const suspicionScore = review.fakeAnalysis?.suspicionScore || review.fakeCheck?.suspicionScore || review.fakeAnalysis?.score || review.fakeCheck?.score || 0;
  const reasons = review.fakeAnalysis?.reasons || review.fakeCheck?.reasons || [];
  const sentiment = review.sentiment || {};

  // Render star rating (★ for filled, ☆ for empty)
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= rating ? '' : 'empty'}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className={`review-card ${isSuspicious ? 'suspicious' : 'genuine'}`}>
      {/* ---- Header: Name + Date ---- */}
      <div className="review-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="reviewer-name">{review.customer_name}</span>

          {/* Verified purchase badge */}
          {review.verified_purchase ? (
            <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
              <CheckCircle size={10} /> Verified
            </span>
          ) : (
            <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>
              Unverified
            </span>
          )}
        </div>
        
        <span className="review-date">
          {review.review_date ? new Date(review.review_date).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
          }) : ''}
        </span>
      </div>

      {/* ---- Star Rating ---- */}
      <div className="star-rating">
        {renderStars(review.rating)}
      </div>

      {/* ---- Review Text ---- */}
      <p className="review-text">{review.review_text}</p>

      {/* ---- AI Analysis Flags ---- */}
      {showAnalysis && (
        <div className="review-flags">
          {/* Suspicious or Genuine badge */}
          {isSuspicious ? (
            <span className="badge badge-danger">
              <AlertTriangle size={11} /> Suspicious ({Math.round(suspicionScore * 100)}%)
            </span>
          ) : (
            <span className="badge badge-success">
              <CheckCircle size={11} /> Genuine
            </span>
          )}

          {/* Sentiment badge */}
          {sentiment.label && (
            <span className={`badge ${
              sentiment.label === 'positive' ? 'badge-success' :
              sentiment.label === 'negative' ? 'badge-danger' :
              'badge-neutral'
            }`}>
              {sentiment.label === 'positive' ? '😊' : 
               sentiment.label === 'negative' ? '😞' : '😐'}{' '}
              {sentiment.label}
            </span>
          )}

          {/* Helpful votes */}
          {review.helpful_votes > 0 && (
            <span className="badge badge-info">
              <ThumbsUp size={11} /> {review.helpful_votes} helpful
            </span>
          )}

          {/* Toggle details button */}
          {isSuspicious && reasons.length > 0 && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-primary)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              <Eye size={12} />
              {showDetails ? 'Hide' : 'Show'} details
            </button>
          )}
        </div>
      )}

      {/* ---- Detailed Reasons (expanded) ---- */}
      {showDetails && reasons.length > 0 && (
        <div style={{
          marginTop: '12px',
          padding: '10px',
          background: 'var(--color-danger-bg)',
          borderRadius: '6px',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
        }}>
          <div style={{ fontWeight: '600', marginBottom: '6px', color: 'var(--color-danger)' }}>
            🔍 Why this was flagged:
          </div>
          <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {reasons.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ReviewCard;
