import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AlertTriangle, Shield, Star } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

function FakeReviewDetector() {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoadingProducts(true);
        setError(null);
        const response = await axios.get('/api/products');
        const loadedProducts = response.data;
        setProducts(loadedProducts);
        if (loadedProducts.length > 0) {
          setSelectedProductId(String(loadedProducts[0].id));
        }
      } catch (err) {
        console.error('Failed to load products for fake review detector:', err);
        setError('Unable to load products. Check the backend and database connection.');
      } finally {
        setLoadingProducts(false);
      }
    }

    fetchProducts();
  }, []);

  useEffect(() => {
    if (!selectedProductId) return;

    async function fetchAnalysis() {
      try {
        setLoadingAnalysis(true);
        const response = await axios.get(`/api/products/${selectedProductId}/fake-reviews`);
        setAnalysis(response.data);
      } catch (err) {
        console.error('Failed to load fake review analysis:', err);
        setAnalysis(null);
      } finally {
        setLoadingAnalysis(false);
      }
    }

    fetchAnalysis();
  }, [selectedProductId]);

  const selectedProduct = useMemo(
    () => products.find((product) => String(product.id) === String(selectedProductId)),
    [products, selectedProductId]
  );

  if (loadingProducts) return <LoadingSpinner message="Loading fake review detector..." />;

  if (error) {
    return (
      <div className="empty-state">
        <div className="empty-icon">!</div>
        <h3>Fake review detector unavailable</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Fake Review Detector</h1>
        <p>Audit review trustworthiness product by product using the built-in rule-based AI checks.</p>
      </div>

      <div className="glass-card" style={{ marginBottom: '24px' }}>
        <div className="filters-bar" style={{ marginBottom: 0 }}>
          <select
            className="filter-select"
            value={selectedProductId}
            onChange={(event) => setSelectedProductId(event.target.value)}
          >
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>

          {selectedProduct && (
            <button
              className="back-btn"
              style={{ marginBottom: 0 }}
              onClick={() => navigate(`/products/${selectedProduct.id}`)}
            >
              Open Product Detail
            </button>
          )}
        </div>
      </div>

      {loadingAnalysis ? (
        <LoadingSpinner message="Analyzing review reliability..." />
      ) : analysis ? (
        <>
          <div className="stats-grid">
            <div className="glass-card">
              <div className="insight-stat-label">
                <Shield size={16} />
                Reliability score
              </div>
              <div className="insight-stat-value">{analysis.reliabilityScore}%</div>
              <p>Higher is better. This is based on suspicious review share.</p>
            </div>

            <div className="glass-card">
              <div className="insight-stat-label">
                <AlertTriangle size={16} />
                Suspicious reviews
              </div>
              <div className="insight-stat-value">{analysis.suspiciousCount}</div>
              <p>Reviews flagged by the rule-based detector.</p>
            </div>

            <div className="glass-card">
              <div className="insight-stat-label">
                <Star size={16} />
                Total reviews scanned
              </div>
              <div className="insight-stat-value">{analysis.totalReviews}</div>
              <p>All reviews checked for suspicious patterns.</p>
            </div>
          </div>

          <div className="section-header">
            <h2>
              <AlertTriangle size={18} />
              Flagged Reviews
            </h2>
          </div>

          {analysis.suspiciousReviews.length > 0 ? (
            <div className="data-table-wrapper" style={{ marginBottom: '24px' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Reviewer</th>
                    <th>Rating</th>
                    <th>Suspicion</th>
                    <th>Reasons</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.suspiciousReviews.map((review) => (
                    <tr key={review.id}>
                      <td>{review.customer_name}</td>
                      <td>{review.rating}/5</td>
                      <td>
                        <span className="badge badge-danger">
                          {Math.round(Number(review.fakeAnalysis.suspicionScore || 0) * 100)}%
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {(review.fakeAnalysis.reasons || []).join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">OK</div>
              <h3>No suspicious reviews detected</h3>
              <p>This product currently looks healthy from a review-integrity perspective.</p>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">!</div>
          <h3>No analysis available</h3>
          <p>Once the backend can read reviews from MySQL, fake review analysis will appear here.</p>
        </div>
      )}
    </div>
  );
}

export default FakeReviewDetector;
