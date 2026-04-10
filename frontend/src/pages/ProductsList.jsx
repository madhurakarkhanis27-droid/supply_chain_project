// ============================================================
// FILE: frontend/src/pages/ProductsList.jsx
// PURPOSE: Browse all products with category-first navigation
// ============================================================

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Grid2x2, Package, Search } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

function ProductsList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [issueFilter, setIssueFilter] = useState('all');
  const [sortBy, setSortBy] = useState('return_rate');
  const [sortOrder, setSortOrder] = useState('desc');

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    const issueFromUrl = searchParams.get('issue');
    const searchFromUrl = searchParams.get('search');
    const sortByFromUrl = searchParams.get('sortBy');
    const sortOrderFromUrl = searchParams.get('sortOrder');

    if (categoryFromUrl) {
      setCategoryFilter(categoryFromUrl);
    } else {
      setCategoryFilter('all');
    }
    if (issueFromUrl) {
      setIssueFilter(issueFromUrl);
    } else {
      setIssueFilter('all');
    }
    if (searchFromUrl) {
      setSearchTerm(searchFromUrl);
    }
    if (sortByFromUrl) {
      setSortBy(sortByFromUrl);
    }
    if (sortOrderFromUrl === 'asc' || sortOrderFromUrl === 'desc') {
      setSortOrder(sortOrderFromUrl);
    }
  }, [searchParams]);

  function updateSearchParams(nextState) {
    const params = new URLSearchParams(searchParams);

    if (nextState.categoryFilter && nextState.categoryFilter !== 'all') {
      params.set('category', nextState.categoryFilter);
    } else {
      params.delete('category');
    }

    if (nextState.issueFilter && nextState.issueFilter !== 'all') {
      params.set('issue', nextState.issueFilter);
    } else {
      params.delete('issue');
    }

    if (nextState.searchTerm) {
      params.set('search', nextState.searchTerm);
    } else {
      params.delete('search');
    }

    params.set('sortBy', nextState.sortBy);
    params.set('sortOrder', nextState.sortOrder);
    setSearchParams(params);
  }

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const response = await axios.get(`/api/products?t=${Date.now()}`);
        setProducts(response.data);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map((product) => product.category))];
    return ['all', ...uniqueCategories.sort()];
  }, [products]);

  const categoryStats = useMemo(() => {
    return categories.map((category) => ({
      key: category,
      label: category === 'all' ? 'All Products' : category,
      count: category === 'all'
        ? products.length
        : products.filter((product) => product.category === category).length,
    }));
  }, [categories, products]);

  const issues = useMemo(() => {
    const uniqueIssues = [...new Set(
      products
        .map((product) => product.mainIssue)
        .filter((issue) => issue && issue !== 'Under Analysis')
    )];
    return ['all', ...uniqueIssues.sort()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((product) =>
        product.name.toLowerCase().includes(term) ||
        (product.brand && product.brand.toLowerCase().includes(term))
      );
    }

    if (categoryFilter !== 'all') {
      result = result.filter((product) => product.category === categoryFilter);
    }

    if (issueFilter !== 'all') {
      result = result.filter((product) => product.mainIssue === issueFilter);
    }

    result.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortOrder === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

    return result;
  }, [products, searchTerm, categoryFilter, issueFilter, sortBy, sortOrder]);

  function getRateColor(rate) {
    if (rate <= 10) return '#10b981';
    if (rate <= 20) return '#f59e0b';
    if (rate <= 30) return '#f97316';
    return '#ef4444';
  }

  function getRateBadge(rate) {
    if (rate <= 10) return { label: 'Low Risk', class: 'badge-success' };
    if (rate <= 20) return { label: 'Moderate', class: 'badge-warning' };
    if (rate <= 30) return { label: 'High Risk', class: 'badge-danger' };
    return { label: 'Critical', class: 'badge-danger' };
  }

  function handleSort(field) {
    let nextSortBy = field;
    let nextSortOrder = 'desc';

    if (sortBy === field) {
      nextSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      setSortOrder(nextSortOrder);
    } else {
      setSortBy(nextSortBy);
      setSortOrder(nextSortOrder);
    }

    updateSearchParams({
      categoryFilter,
      issueFilter,
      searchTerm,
      sortBy: nextSortBy,
      sortOrder: nextSortOrder,
    });
  }

  if (loading) return <LoadingSpinner message="Loading products..." />;

  return (
    <div>
      <div className="page-header">
        <h1>Products Catalog</h1>
        <p>Start from a category, then open any product for deeper AI analysis.</p>
      </div>

      <div className="glass-card" style={{ marginBottom: '24px', padding: '18px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '14px',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            fontWeight: '600',
          }}
        >
          <Grid2x2 size={16} />
          Categories
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          {categoryStats.map((category) => (
            <button
              key={category.key}
              type="button"
              onClick={() => {
                setCategoryFilter(category.key);
                updateSearchParams({
                  categoryFilter: category.key,
                  issueFilter,
                  searchTerm,
                  sortBy,
                  sortOrder,
                });
              }}
              style={{
                padding: '10px 14px',
                borderRadius: '9999px',
                border:
                  categoryFilter === category.key
                    ? '1px solid rgba(99, 102, 241, 0.45)'
                    : '1px solid var(--border-color)',
                background:
                  categoryFilter === category.key
                    ? 'rgba(99, 102, 241, 0.14)'
                    : 'var(--bg-elevated)',
                color:
                  categoryFilter === category.key
                    ? 'var(--text-heading)'
                    : 'var(--text-secondary)',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.82rem',
                fontWeight: categoryFilter === category.key ? '600' : '500',
                transition: 'all var(--transition-fast)',
              }}
            >
              {category.label} ({category.count})
            </button>
          ))}
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by name or brand..."
            value={searchTerm}
            onChange={(event) => {
              const nextSearchTerm = event.target.value;
              setSearchTerm(nextSearchTerm);
              updateSearchParams({
                categoryFilter,
                issueFilter,
                searchTerm: nextSearchTerm,
                sortBy,
                sortOrder,
              });
            }}
            id="product-search"
          />
        </div>

        <select
          className="filter-select"
          value={issueFilter}
          onChange={(event) => {
            const nextIssueFilter = event.target.value;
            setIssueFilter(nextIssueFilter);
            updateSearchParams({
              categoryFilter,
              issueFilter: nextIssueFilter,
              searchTerm,
              sortBy,
              sortOrder,
            });
          }}
          id="issue-select"
        >
          {issues.map((issue) => (
            <option key={issue} value={issue}>
              {issue === 'all' ? 'Issue: All' : `Issue: ${issue}`}
            </option>
          ))}
        </select>

        <select
          className="filter-select"
          value={sortBy}
          onChange={(event) => handleSort(event.target.value)}
          id="sort-select"
        >
          <option value="return_rate">Sort: Return Rate</option>
          <option value="avg_rating">Sort: Rating</option>
          <option value="price">Sort: Price</option>
          <option value="total_sold">Sort: Units Sold</option>
          <option value="name">Sort: Name</option>
        </select>
      </div>

      <div
        style={{
          fontSize: '0.8rem',
          color: 'var(--text-tertiary)',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        <Package size={14} />
        Showing {filteredProducts.length} of {products.length} products
        {issueFilter !== 'all' && (
          <span style={{ color: 'var(--text-secondary)' }}>
            Issue: {issueFilter}
          </span>
        )}
        {categoryFilter !== 'all' && (
          <span style={{ color: 'var(--text-secondary)' }}>
            • Category: {categoryFilter}
          </span>
        )}
        <span style={{ color: 'var(--accent-primary)' }}>
          • Sorted by {sortBy.replace('_', ' ')} ({sortOrder === 'desc' ? '↓' : '↑'})
        </span>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                  Product {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th>Category</th>
                <th onClick={() => handleSort('price')} style={{ cursor: 'pointer' }}>
                  Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('return_rate')} style={{ cursor: 'pointer' }}>
                  Return Rate {sortBy === 'return_rate' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th>Risk Level</th>
                <th onClick={() => handleSort('avg_rating')} style={{ cursor: 'pointer' }}>
                  Rating {sortBy === 'avg_rating' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('total_sold')} style={{ cursor: 'pointer' }}>
                  Sold {sortBy === 'total_sold' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th>Main Issue</th>
                <th>Root Cause Analysis</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product, idx) => {
                const risk = getRateBadge(product.return_rate);
                return (
                  <tr
                    key={product.id}
                    onClick={() => navigate(`/products/${product.id}`)}
                    className="animate-in"
                  >
                    <td style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
                      {idx + 1}
                    </td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{product.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        {product.brand} • {product.total_reviews} reviews
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-neutral">{product.category}</span>
                    </td>
                    <td style={{ fontWeight: '500' }}>
                      ₹{Number(product.price).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <div className="return-rate-bar">
                        <div className="bar-track">
                          <div
                            className="bar-fill"
                            style={{
                              width: `${Math.min(product.return_rate, 100)}%`,
                              background: getRateColor(product.return_rate),
                            }}
                          />
                        </div>
                        <span
                          className="rate-value"
                          style={{ color: getRateColor(product.return_rate) }}
                        >
                          {product.return_rate}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${risk.class}`}>{risk.label}</span>
                    </td>
                    <td>
                      <span style={{ color: '#fbbf24' }}>★</span> {product.avg_rating}
                    </td>
                    <td>{Number(product.total_sold).toLocaleString('en-IN')}</td>
                    <td>
                      <span className="badge badge-info">
                        {product.mainIssueIcon} {product.mainIssue}
                      </span>
                    </td>
                    <td style={{ maxWidth: '320px' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                        {product.rootCauseSummary || 'No recurring root-cause pattern detected yet.'}
                      </div>
                      {product.rootCauseIssueShare ? (
                        <div style={{ marginTop: '6px' }}>
                          <span className="badge badge-neutral">
                            {product.rootCauseIssueShare}% of issue mentions
                          </span>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No products found</h3>
          <p>Try another category or a different search term.</p>
        </div>
      )}
    </div>
  );
}

export default ProductsList;
