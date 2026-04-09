// ============================================================
// FILE: frontend/src/pages/ProductsList.jsx
// PURPOSE: Browse all products with search, filter, and sort
// ============================================================
// This page shows a filterable table/grid of ALL products.
//
// FEATURES:
//   - Search by product name or brand
//   - Filter by category
//   - Sort by return rate, rating, or price
//   - Visual return rate bars for quick scanning
//   - Click any product → navigate to Product Detail page
//
// DATA FLOW:
//   1. Fetch all products from GET /api/products
//   2. Apply client-side search/filter/sort
//   3. Render filtered results
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Filter, ArrowUpDown, Package, TrendingDown } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';


function ProductsList() {
  // ---- STATE ----
  const [products, setProducts] = useState([]);     // All products from API
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');   // Search input value
  const [categoryFilter, setCategoryFilter] = useState('all');  // Category dropdown
  const [sortBy, setSortBy] = useState('return_rate'); // Sort field
  const [sortOrder, setSortOrder] = useState('desc');  // asc or desc

  const navigate = useNavigate();

  // ---- FETCH PRODUCTS ----
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const response = await axios.get('/api/products');
        setProducts(response.data);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // ---- EXTRACT UNIQUE CATEGORIES for filter dropdown ----
  // useMemo caches this so it doesn't recalculate on every render
  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category))];
    return ['all', ...cats.sort()];
  }, [products]);

  // ---- FILTER + SORT PRODUCTS ----
  // useMemo ensures this only recalculates when inputs change
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Step 1: Search filter (name or brand)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(term) ||
        (p.brand && p.brand.toLowerCase().includes(term))
      );
    }

    // Step 2: Category filter
    if (categoryFilter !== 'all') {
      result = result.filter(p => p.category === categoryFilter);
    }

    // Step 3: Sort
    result.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      // Handle string vs number comparison
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortOrder === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

    return result;
  }, [products, searchTerm, categoryFilter, sortBy, sortOrder]);


  // ---- HELPERS ----
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

  // Toggle sort order when clicking same column
  function handleSort(field) {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  }


  // ---- RENDER ----
  if (loading) return <LoadingSpinner message="Loading products..." />;

  return (
    <div>
      {/* ---- Page Header ---- */}
      <div className="page-header">
        <h1>Products Catalog</h1>
        <p>Browse all {products.length} products • Click any product for AI analysis</p>
      </div>

      {/* ---- Search & Filters Bar ---- */}
      <div className="filters-bar">
        {/* Search input */}
        <div className="search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by name or brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            id="product-search"
          />
        </div>

        {/* Category filter */}
        <select
          className="filter-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          id="category-filter"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? '📦 All Categories' : cat}
            </option>
          ))}
        </select>

        {/* Sort dropdown */}
        <select
          className="filter-select"
          value={sortBy}
          onChange={(e) => handleSort(e.target.value)}
          id="sort-select"
        >
          <option value="return_rate">Sort: Return Rate</option>
          <option value="avg_rating">Sort: Rating</option>
          <option value="price">Sort: Price</option>
          <option value="total_sold">Sort: Units Sold</option>
          <option value="name">Sort: Name</option>
        </select>
      </div>

      {/* ---- Results Count ---- */}
      <div style={{ 
        fontSize: '0.8rem', 
        color: 'var(--text-tertiary)', 
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <Package size={14} />
        Showing {filteredProducts.length} of {products.length} products
        {sortBy && (
          <span style={{ color: 'var(--accent-primary)' }}>
            • Sorted by {sortBy.replace('_', ' ')} ({sortOrder === 'desc' ? '↓' : '↑'})
          </span>
        )}
      </div>

      {/* ---- Products Table ---- */}
      {filteredProducts.length > 0 ? (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th 
                  onClick={() => handleSort('name')} 
                  style={{ cursor: 'pointer' }}
                >
                  Product {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th>Category</th>
                <th 
                  onClick={() => handleSort('price')} 
                  style={{ cursor: 'pointer' }}
                >
                  Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  onClick={() => handleSort('return_rate')} 
                  style={{ cursor: 'pointer' }}
                >
                  Return Rate {sortBy === 'return_rate' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th>Risk Level</th>
                <th 
                  onClick={() => handleSort('avg_rating')} 
                  style={{ cursor: 'pointer' }}
                >
                  Rating {sortBy === 'avg_rating' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  onClick={() => handleSort('total_sold')} 
                  style={{ cursor: 'pointer' }}
                >
                  Sold {sortBy === 'total_sold' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
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
                    {/* Row number */}
                    <td style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
                      {idx + 1}
                    </td>

                    {/* Product name + brand */}
                    <td>
                      <div style={{ fontWeight: '600' }}>{product.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        {product.brand} • {product.total_reviews} reviews
                      </div>
                    </td>

                    {/* Category */}
                    <td>
                      <span className="badge badge-neutral">{product.category}</span>
                    </td>

                    {/* Price */}
                    <td style={{ fontWeight: '500' }}>
                      ₹{Number(product.price).toLocaleString('en-IN')}
                    </td>

                    {/* Return Rate with bar */}
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

                    {/* Risk Level Badge */}
                    <td>
                      <span className={`badge ${risk.class}`}>{risk.label}</span>
                    </td>

                    {/* Star Rating */}
                    <td>
                      <span style={{ color: '#fbbf24' }}>★</span> {product.avg_rating}
                    </td>

                    {/* Units Sold */}
                    <td>{Number(product.total_sold).toLocaleString('en-IN')}</td>
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
          <p>Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}

export default ProductsList;
