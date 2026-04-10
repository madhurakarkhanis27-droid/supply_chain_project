// ============================================================
// FILE: frontend/src/pages/ProductDetail.jsx
// PURPOSE: Deep-dive into a single product with full AI analysis
// ============================================================
// This is the MOST IMPORTANT page — where all our AI shines.
// When a user clicks a product from Dashboard or Products List,
// they land here and see:
//
//   1. PRODUCT HEADER — Name, brand, price, category
//   2. RISK GAUGE — Visual semi-circular gauge (0-100)
//   3. ROOT CAUSE ANALYSIS — AI's breakdown of WHY returns happen
//   4. REVIEWS SECTION — All reviews with fake detection flags
//   5. RETURNS TABLE — All return records for this product
//   6. SUPPORT TICKETS — Customer complaints
//   7. RECOMMENDATIONS — Better alternatives with lower return rates
//
// DATA FLOW:
//   1. Extract product ID from URL (e.g., /products/7 → id=7)
//   2. Call GET /api/products/:id for full data + AI analysis
//   3. Call GET /api/products/:id/recommendations for alternatives
//   4. Render everything
// ============================================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  ArrowLeft, Package, Star, RotateCcw, AlertTriangle,
  Shield, CheckCircle, TrendingDown, MessageSquare,
  Award, ArrowRight
} from 'lucide-react';

// Our components
import RiskGauge from '../components/RiskGauge';
import ReviewCard from '../components/ReviewCard';
import LoadingSpinner from '../components/LoadingSpinner';
import AnimatedCounter from '../components/AnimatedCounter';


function ProductDetail() {
  const { id } = useParams();     // Get product ID from URL
  const navigate = useNavigate();

  // ---- STATE ----
  const [data, setData] = useState(null);               // Product + AI analysis
  const [recommendations, setRecommendations] = useState(null);  // Alternative products
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // Current tab
  const [error, setError] = useState(null);

  // ---- FETCH DATA ----
  useEffect(() => {
    async function fetchProductData() {
      try {
        setLoading(true);
        setError(null);

        // Product detail is required; recommendations are optional.
        const detailRes = await axios.get(`http://localhost:5001/api/products/${id}?t=${Date.now()}`);
        setData(detailRes.data);

        try {
          const recsRes = await axios.get(`http://localhost:5001/api/products/${id}/recommendations`);
          setRecommendations(recsRes.data);
        } catch (recsError) {
          console.error('Failed to load recommendations:', recsError);
          setRecommendations({ recommendations: [] });
        }
      } catch (err) {
        console.error('Failed to load product:', err);
        setData(null);
        setRecommendations(null);
        setError('We could not load this product analysis. Please check the backend and try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchProductData();
  }, [id]);  // Re-fetch if ID changes


  // ---- LOADING ----
  if (loading) return <LoadingSpinner message="Running AI analysis..." />;
  if (error) {
    return (
      <div className="empty-state">
        <div className="empty-icon">!</div>
        <h3>Product analysis unavailable</h3>
        <p>{error}</p>
        <button className="back-btn" onClick={() => navigate('/products')}>
          <ArrowLeft size={16} /> Back to Products
        </button>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="empty-state">
        <div className="empty-icon">❌</div>
        <h3>Product not found</h3>
        <button className="back-btn" onClick={() => navigate('/products')}>
          <ArrowLeft size={16} /> Back to Products
        </button>
      </div>
    );
  }

  // Destructure the data for easier access
  const { product, reviews, returns, tickets, aiAnalysis } = data;
  const { riskScore, rootCause } = aiAnalysis;
  const riskValue = riskScore?.score || 0;


  // ---- HELPERS ----
  function getRateColor(rate) {
    if (rate <= 10) return '#10b981';
    if (rate <= 20) return '#f59e0b';
    if (rate <= 30) return '#f97316';
    return '#ef4444';
  }

  // Count suspicious reviews
  const suspiciousReviews = reviews.filter(r => 
    r.fakeCheck?.isSuspicious || r.fakeAnalysis?.isSuspicious
  );
  const genuineReviews = reviews.filter(r => 
    !(r.fakeCheck?.isSuspicious || r.fakeAnalysis?.isSuspicious)
  );

  // Calculate Sentiment Breakdown
  const positiveCount = reviews.filter(r => r.sentiment?.label === 'Positive').length;
  const negativeCount = reviews.filter(r => r.sentiment?.label === 'Negative').length;
  const neutralCount = reviews.length - positiveCount - negativeCount;
  
  const sentimentData = [
    { name: 'Positive', value: positiveCount, color: '#10b981' },
    { name: 'Negative', value: negativeCount, color: '#ef4444' },
    { name: 'Neutral', value: neutralCount, color: '#94a3b8' }
  ].filter(d => d.value > 0);


  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div>
      {/* ---- Back Button ---- */}
      <button className="back-btn" onClick={() => navigate('/products')}>
        <ArrowLeft size={16} /> Back to Products
      </button>

      {/* ===== PRODUCT HEADER ===== */}
      <div className="product-info-header">
        <div className="product-meta">
          <h1 style={{
            background: 'var(--accent-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {product.name}
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {product.description}
          </p>
          
          {/* Product Badges */}
          <div className="product-badges">
            <span className="badge badge-neutral">
              <Package size={11} /> {product.category}
            </span>
            <span className="badge badge-neutral">
              {product.brand}
            </span>
            <span className="badge badge-info">
              ₹{Number(product.price).toLocaleString('en-IN')}
            </span>
            <span className="badge" style={{ 
              background: getRateColor(product.return_rate) + '1a',
              color: getRateColor(product.return_rate) 
            }}>
              <RotateCcw size={11} /> {product.return_rate}% return rate
            </span>
            <span className="badge badge-warning">
              <Star size={11} /> {product.avg_rating} rating
            </span>
          </div>
        </div>
      </div>

      {/* ===== TABS ===== */}
      <div className="tabs">
        {['overview', 'reviews', 'returns', 'support'].map(tab => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'overview' && '📊 Overview'}
            {tab === 'reviews' && `💬 Reviews (${reviews.length})`}
            {tab === 'returns' && `📦 Returns (${returns.length})`}
            {tab === 'support' && `🎫 Support (${tickets.length})`}
          </button>
        ))}
      </div>


      {/* ===== TAB: OVERVIEW ===== */}
      {activeTab === 'overview' && (
        <>
          <div className="product-detail-grid">
            {/* ---- Risk Score Gauge ---- */}
            <div className="glass-card animate-in">
              <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={18} style={{ color: 'var(--accent-primary)' }} />
                AI Risk Assessment
              </h3>
              <RiskGauge 
                score={riskValue}
                label="Overall Return Risk"
                details={riskScore?.factors || null}
              />
            </div>

            {/* ---- Key Metrics ---- */}
            <div className="glass-card animate-in">
              <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingDown size={18} style={{ color: '#f59e0b' }} />
                Key Metrics
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Total Sold */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px', background: 'var(--bg-elevated)', borderRadius: '8px',
                  border: '1px solid var(--border-color)'
                }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Units Sold</span>
                  <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>
                    <AnimatedCounter value={Number(product.total_sold)} />
                  </span>
                </div>

                {/* Total Returned */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px', background: 'var(--bg-elevated)', borderRadius: '8px',
                  border: '1px solid var(--border-color)'
                }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Units Returned</span>
                  <span style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--color-danger)' }}>
                    <AnimatedCounter value={Number(product.total_returned)} />
                  </span>
                </div>

                {/* Review Reliability */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px', background: 'var(--bg-elevated)', borderRadius: '8px',
                  border: '1px solid var(--border-color)'
                }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Suspicious Reviews</span>
                  <span style={{ fontWeight: '700', fontSize: '1.1rem', color: suspiciousReviews.length > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                    <AnimatedCounter value={suspiciousReviews.length} /> / <AnimatedCounter value={reviews.length} />
                  </span>
                </div>

                {/* Support Tickets */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px', background: 'var(--bg-elevated)', borderRadius: '8px',
                  border: '1px solid var(--border-color)'
                }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Support Tickets</span>
                  <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>
                    <AnimatedCounter value={tickets.length} />
                  </span>
                </div>

                {/* AI Data Points */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '8px',
                  border: '1px solid rgba(99, 102, 241, 0.1)'
                }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--accent-primary)' }}>AI Data Points Analyzed</span>
                  <span style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--accent-primary)' }}>
                    <AnimatedCounter value={aiAnalysis.totalDataPoints} />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ---- Root Cause Analysis ---- */}
          <div className="glass-card animate-in" style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} style={{ color: '#f59e0b' }} />
              AI Root Cause Analysis
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '16px' }}>
              Our AI analyzed {aiAnalysis.totalDataPoints} data points (reviews + returns + support tickets)
              to identify the primary reasons customers return this product.
            </p>

            {rootCause?.issueBreakdown && rootCause.issueBreakdown.length > 0 ? (
              rootCause.issueBreakdown.map((issue, idx) => (
                <div key={idx} className="root-cause-item">
                  <div className="cause-icon">{issue.icon}</div>
                  <div className="cause-info" style={{ flex: 1 }}>
                    <h4>{issue.label}</h4>
                    <p>
                      Reported across {issue.dataSources?.join(', ') || 'AI analysis'} and detected in {issue.percentage}% of feedback
                    </p>
                    <div className="cause-bar">
                      <div 
                        className="cause-bar-fill"
                        style={{ 
                          width: `${issue.percentage || 0}%`,
                          background: issue.percentage > 40 ? '#ef4444' : 
                                      issue.percentage > 20 ? '#f59e0b' : '#10b981',
                        }}
                      />
                    </div>
                  </div>
                  <span style={{ 
                    fontWeight: '700', 
                    fontSize: '1rem',
                    color: issue.percentage > 40 ? '#ef4444' : 
                           issue.percentage > 20 ? '#f59e0b' : '#10b981',
                  }}>
                    {issue.percentage}%
                  </span>
                </div>
              ))
            ) : (
              <div style={{
                padding: '18px',
                background: 'var(--bg-elevated)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                fontSize: '0.85rem',
                lineHeight: '1.7',
              }}>
                {rootCause?.summary || 'No recurring issue pattern has been detected yet for this product.'}
              </div>
            )}

            {/* AI Summary */}
            {rootCause?.summary && (
              <div style={{
                marginTop: '16px',
                padding: '16px',
                background: 'rgba(99, 102, 241, 0.05)',
                borderRadius: '8px',
                border: '1px solid rgba(99, 102, 241, 0.1)',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.7',
              }}>
                <strong style={{ color: 'var(--accent-primary)' }}>🤖 AI Summary: </strong>
                {rootCause.summary}
              </div>
            )}
          </div>

          {/* ---- Sentiment Breakdown ---- */}
          {sentimentData.length > 0 && (
            <div className="glass-card animate-in" style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={18} style={{ color: '#10b981' }} />
                Review Sentiment Breakdown
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '16px' }}>
                Feedback grouped by overall emotional sentiment, tracked across all {reviews.length} reviews.
              </p>
              
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    border="none"
                    stroke="none"
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{
                      background: 'rgba(17, 24, 39, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#e2e8f0',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
                    }} 
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    wrapperStyle={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ---- Recommendations ---- */}
          {recommendations?.recommendations && recommendations.recommendations.length > 0 && (
            <div className="glass-card animate-in">
              <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} style={{ color: '#10b981' }} />
                Better Alternatives
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '16px' }}>
                We first look for very similar products from the same subcategory, then use safer options from the same category only.
              </p>

              {recommendations.recommendations.map((rec) => (
                <div 
                  key={rec.id} 
                  className="recommendation-card"
                  onClick={() => navigate(`/products/${rec.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="improvement">
                    <div className="value">
                      -{Number(rec.returnRateImprovement).toFixed(0)}%
                    </div>
                    <div className="label">Lower returns</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{rec.name}</div>
                      <span className={`recommendation-badge ${rec.sameSubcategory ? 'closest' : 'category'}`}>
                        {rec.similarityLabel}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                      {rec.brand} | {rec.subcategory} | Rs {Number(rec.price).toLocaleString('en-IN')} | 
                      Rating {rec.avg_rating} | {rec.return_rate}% return rate
                    </div>
                    {rec.comparisonPoints?.length > 0 && (
                      <div className="recommendation-comparison">
                        {rec.comparisonPoints.map((point) => (
                          <span key={`${rec.id}-${point}`} className="comparison-chip">
                            {point}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <ArrowRight size={16} style={{ color: 'var(--text-tertiary)' }} />
                </div>
              ))}
            </div>
          )}
        </>
      )}


      {/* ===== TAB: REVIEWS ===== */}
      {activeTab === 'reviews' && (
        <div>
          {/* Fake review summary */}
          <div className="glass-card animate-in" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield size={18} style={{ color: 'var(--accent-primary)' }} />
                  Review Integrity Analysis
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                  AI scanned {reviews.length} reviews for suspicious patterns
                </p>
              </div>
              <div style={{ display: 'flex', gap: '16px', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-success)' }}>
                    {genuineReviews.length}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Genuine</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-danger)' }}>
                    {suspiciousReviews.length}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Suspicious</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent-primary)' }}>
                    {reviews.length > 0 ? Math.round(((reviews.length - suspiciousReviews.length) / reviews.length) * 100) : 100}%
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Reliability</div>
                </div>
              </div>
            </div>
          </div>

          {/* Suspicious reviews first */}
          {suspiciousReviews.length > 0 && (
            <>
              <div className="section-header">
                <h2 style={{ color: 'var(--color-danger)' }}>
                  <AlertTriangle size={18} /> Flagged Reviews ({suspiciousReviews.length})
                </h2>
              </div>
              <div className="reviews-list" style={{ marginBottom: '24px' }}>
                {suspiciousReviews.map((review, idx) => (
                  <ReviewCard key={review.id || idx} review={review} />
                ))}
              </div>
            </>
          )}

          {/* Genuine reviews */}
          <div className="section-header">
            <h2 style={{ color: 'var(--color-success)' }}>
              <CheckCircle size={18} /> Verified Reviews ({genuineReviews.length})
            </h2>
          </div>
          <div className="reviews-list">
            {genuineReviews.map((review, idx) => (
              <ReviewCard key={review.id || idx} review={review} />
            ))}
          </div>
        </div>
      )}


      {/* ===== TAB: RETURNS ===== */}
      {activeTab === 'returns' && (
        <div>
          <div className="glass-card animate-in" style={{ marginBottom: '20px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RotateCcw size={18} style={{ color: 'var(--color-danger)' }} />
              Return History ({returns.length} returns)
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
              Total refund impact: ₹{returns.reduce((sum, r) => sum + Number(r.refund_amount || 0), 0).toLocaleString('en-IN')}
            </p>
          </div>

          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Reason</th>
                  <th>Details</th>
                  <th>AI Issue</th>
                  <th>Refund</th>
                </tr>
              </thead>
              <tbody>
                {returns.map((ret, idx) => (
                  <tr key={ret.id || idx} className="animate-in">
                    <td style={{ fontWeight: '500' }}>{ret.customer_name}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                      {ret.return_date ? new Date(ret.return_date).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      }) : '-'}
                    </td>
                    <td>
                      <span className="badge badge-warning">{ret.return_reason}</span>
                    </td>
                    <td style={{ maxWidth: '300px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {ret.detailed_notes}
                    </td>
                    <td>
                      <span className="badge badge-info">
                        {ret.ai_extracted_issue?.replace(/_/g, ' ') || 'Analyzing...'}
                      </span>
                    </td>
                    <td style={{ fontWeight: '600', color: 'var(--color-danger)' }}>
                      ₹{Number(ret.refund_amount).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* ===== TAB: SUPPORT TICKETS ===== */}
      {activeTab === 'support' && (
        <div>
          <div className="glass-card animate-in" style={{ marginBottom: '20px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={18} style={{ color: 'var(--color-info)' }} />
              Support Tickets ({tickets.length})
            </h3>
          </div>

          {tickets.length > 0 ? (
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Issue Type</th>
                    <th>Message</th>
                    <th>Resolution</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket, idx) => (
                    <tr key={ticket.id || idx} className="animate-in">
                      <td style={{ fontWeight: '500' }}>{ticket.customer_name}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                        {ticket.ticket_date ? new Date(ticket.ticket_date).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        }) : '-'}
                      </td>
                      <td>
                        <span className="badge badge-warning">{ticket.issue_type}</span>
                      </td>
                      <td style={{ maxWidth: '300px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {ticket.message}
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>{ticket.resolution}</td>
                      <td>
                        <span className={`badge ${
                          ticket.status === 'resolved' ? 'badge-success' :
                          ticket.status === 'closed' ? 'badge-neutral' :
                          'badge-warning'
                        }`}>
                          {ticket.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🎫</div>
              <h3>No support tickets</h3>
              <p>No customer support tickets found for this product</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProductDetail;



