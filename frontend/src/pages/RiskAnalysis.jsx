import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowRight,
  Package,
  ShieldAlert,
  TrendingUp
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import AnimatedCounter from '../components/AnimatedCounter';

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

  const categoryGroups = useMemo(() => {
    const groupedProducts = products.reduce((acc, product) => {
      const category = product.category || 'Uncategorized';
      if (!acc[category]) acc[category] = [];
      acc[category].push(product);
      return acc;
    }, {});

    return Object.entries(groupedProducts)
      .map(([category, items]) => {
        const sortedItems = [...items].sort((a, b) => Number(b.return_rate) - Number(a.return_rate));
        const avgCategoryReturnRate = items.length > 0
          ? items.reduce((sum, item) => sum + Number(item.return_rate || 0), 0) / items.length
          : 0;

        return {
          category,
          items: sortedItems,
          productCount: items.length,
          highRiskCount: items.filter((item) => Number(item.return_rate) >= 20).length,
          avgReturnRate: avgCategoryReturnRate.toFixed(1)
        };
      })
      .sort((a, b) => Number(b.avgReturnRate) - Number(a.avgReturnRate));
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
          <div className="insight-stat-value"><AnimatedCounter value={products.length} /></div>
          <p>Products available for AI screening.</p>
        </div>

        <div className="glass-card">
          <div className="insight-stat-label">
            <ShieldAlert size={16} />
            High-risk products
          </div>
          <div className="insight-stat-value"><AnimatedCounter value={highRiskProducts.length} /></div>
          <p>Products with a return rate of 20% or more.</p>
        </div>

        <div className="glass-card">
          <div className="insight-stat-label">
            <TrendingUp size={16} />
            Average return rate
          </div>
          <div className="insight-stat-value"><AnimatedCounter value={averageReturnRate} suffix="%" decimals={1} /></div>
          <p>Portfolio-wide return pressure across all loaded products.</p>
        </div>
      </div>


      {sortedProducts.length > 0 ? (
        <>
          <div className="page-header" style={{ marginTop: '2rem' }}>
            <h2>Category-wise Risk View</h2>
            <p>See products grouped by category so it is easier to compare risk inside each segment.</p>
          </div>

          <div className="stats-grid" style={{ marginBottom: '2rem' }}>
            {categoryGroups.map((group) => (
              <div key={group.category} className="glass-card">
                <div className="insight-stat-label">
                  <Package size={16} />
                  {group.category}
                </div>
                <div className="insight-stat-value">
                  <AnimatedCounter value={group.avgReturnRate} suffix="%" decimals={1} />
                </div>
                <p>{group.productCount} products tracked, {group.highRiskCount} high-risk.</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '2rem' }}>
            {categoryGroups.map((group) => (
              <div key={group.category} className="glass-card">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1rem',
                    flexWrap: 'wrap'
                  }}
                >
                  <div>
                    <h3 style={{ marginBottom: '0.35rem' }}>{group.category}</h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                      {group.productCount} products in this category
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-neutral">Avg return rate: {group.avgReturnRate}%</span>
                    <span className="badge badge-warning">High risk: {group.highRiskCount}</span>
                  </div>
                </div>

                <div className="data-table-wrapper" style={{ marginBottom: 0 }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Return Rate</th>
                        <th>Risk Band</th>
                        <th>Returned</th>
                        <th>Rating</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.items.map((product) => {
                        const risk = getRiskMeta(Number(product.return_rate));
                        return (
                          <tr key={product.id} onClick={() => navigate(`/products/${product.id}`)}>
                            <td>
                              <div style={{ fontWeight: '600' }}>{product.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                {product.brand}
                              </div>
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
              </div>
            ))}
          </div>

          <div className="page-header" style={{ marginTop: '2rem' }}>
            <h2>Overall Ranking</h2>
            <p>Full portfolio view sorted by highest return risk.</p>
          </div>

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
        </>
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
