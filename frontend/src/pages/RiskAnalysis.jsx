import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  AlertTriangle,
  ArrowRight,
  Package,
  ShieldAlert,
  TrendingUp
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

function RiskAnalysis() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('/api/products');
        setProducts(response.data);
      } catch (err) {
        console.error('Failed to load risk analysis:', err);
        setError('Unable to load product risk data. Check the backend and database connection.');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => Number(b.return_rate) - Number(a.return_rate)),
    [products]
  );

  const highRiskProducts = useMemo(
    () => sortedProducts.filter((product) => Number(product.return_rate) >= 20),
    [sortedProducts]
  );

  const averageReturnRate = useMemo(() => {
    if (products.length === 0) return 0;
    const total = products.reduce((sum, product) => sum + Number(product.return_rate || 0), 0);
    return (total / products.length).toFixed(1);
  }, [products]);

  function getRiskMeta(rate) {
    if (rate >= 30) return { label: 'Critical', className: 'badge-danger', color: '#ef4444' };
    if (rate >= 20) return { label: 'High', className: 'badge-warning', color: '#f97316' };
    if (rate >= 10) return { label: 'Moderate', className: 'badge-warning', color: '#f59e0b' };
    return { label: 'Low', className: 'badge-success', color: '#10b981' };
  }

  if (loading) return <LoadingSpinner message="Loading risk analysis..." />;

  if (error) {
    return (
      <div className="empty-state">
        <div className="empty-icon">!</div>
        <h3>Risk analysis unavailable</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Risk Analysis</h1>
        <p>See which products are most likely to be returned and where to investigate first.</p>
      </div>

      <div className="stats-grid">
        <div className="glass-card">
          <div className="insight-stat-label">
            <Package size={16} />
            Products tracked
          </div>
          <div className="insight-stat-value">{products.length}</div>
          <p>Products available for AI screening.</p>
        </div>

        <div className="glass-card">
          <div className="insight-stat-label">
            <ShieldAlert size={16} />
            High-risk products
          </div>
          <div className="insight-stat-value">{highRiskProducts.length}</div>
          <p>Products with a return rate of 20% or more.</p>
        </div>

        <div className="glass-card">
          <div className="insight-stat-label">
            <TrendingUp size={16} />
            Average return rate
          </div>
          <div className="insight-stat-value">{averageReturnRate}%</div>
          <p>Portfolio-wide return pressure across all loaded products.</p>
        </div>
      </div>

      <div className="glass-card" style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={18} style={{ color: 'var(--color-warning)' }} />
          Phase 2 AI Checks
        </h3>
        <div className="insight-list">
          <div className="insight-list-item">Dashboard data loads without connection errors.</div>
          <div className="insight-list-item">Products list shows real data and can open details.</div>
          <div className="insight-list-item">High-return products appear at the top of this page.</div>
          <div className="insight-list-item">Each product detail page renders risk score, root causes, reviews, returns, and support tabs.</div>
        </div>
      </div>

      {sortedProducts.length > 0 ? (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Return Rate</th>
                <th>Risk Band</th>
                <th>Returned</th>
                <th>Rating</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedProducts.map((product) => {
                const risk = getRiskMeta(Number(product.return_rate));
                return (
                  <tr key={product.id} onClick={() => navigate(`/products/${product.id}`)}>
                    <td>
                      <div style={{ fontWeight: '600' }}>{product.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        {product.brand}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-neutral">{product.category}</span>
                    </td>
                    <td style={{ color: risk.color, fontWeight: '700' }}>{product.return_rate}%</td>
                    <td>
                      <span className={`badge ${risk.className}`}>{risk.label}</span>
                    </td>
                    <td>{product.total_returned}</td>
                    <td>{product.avg_rating}</td>
                    <td style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>
                      Review <ArrowRight size={14} style={{ display: 'inline' }} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">!</div>
          <h3>No risk data available</h3>
          <p>Once the backend can read products from MySQL, risk analysis will populate here.</p>
        </div>
      )}
    </div>
  );
}

export default RiskAnalysis;
