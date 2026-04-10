// ============================================================
// FILE: frontend/src/pages/Dashboard.jsx
// PURPOSE: Main dashboard page — the HOME view of our app
// ============================================================
// This is the first thing the user sees. It provides:
//
//   1. KPI STAT CARDS (top row):
//      - Total Products, Total Returns, Avg Return Rate,  
//        Refund Cost, Suspicious Reviews, Avg Rating
//
//   2. CHARTS (middle row):
//      - Return Trends (line chart — how returns change over time)
//      - Issue Distribution (bar chart — what problems are most common)
//      - Category Issues (horizontal bar — which categories have most returns)
//
//   3. TOP RETURNED PRODUCTS TABLE (bottom):
//      - Table of products with highest return rates
//      - Click any product to see its detailed AI analysis
//
// DATA FLOW:
//   1. Component mounts → calls 4 API endpoints in parallel
//   2. Shows loading spinner while waiting
//   3. Renders all widgets once data arrives
//   4. User can click on products to navigate to detail page
// ============================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Recharts components for professional charts
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

// Lucide icons
import {
  Package, RotateCcw, TrendingDown, DollarSign,
  AlertTriangle, Star, ShieldAlert, ArrowRight,
  BarChart3, PieChart as PieChartIcon
} from 'lucide-react';

// Our components
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import AnimatedCounter from '../components/AnimatedCounter';

// ---- Chart color palette ----
const CHART_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#f97316'];

// ---- Custom tooltip style for charts ----
const customTooltipStyle = {
  background: 'rgba(17, 24, 39, 0.95)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  padding: '10px 14px',
  fontSize: '0.8rem',
  color: '#e2e8f0',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
};


function Dashboard() {
  // ---- STATE ----
  // Each piece of dashboard data gets its own state
  const [stats, setStats] = useState(null);           // KPI numbers
  const [topReturned, setTopReturned] = useState([]); // Top returned products
  const [trends, setTrends] = useState([]);            // Monthly return trends
  const [issueDistribution, setIssueDistribution] = useState([]); // Issue breakdown
  const [categoryIssues, setCategoryIssues] = useState([]); // Category breakdown
  const [loading, setLoading] = useState(true);        // Loading flag
  const [error, setError] = useState(null);            // Error message

  const navigate = useNavigate();  // For navigating to product detail

  // ---- FETCH DATA ON MOUNT ----
  // useEffect with [] runs ONCE when the component first appears on screen
  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      setLoading(true);

      // Fetch ALL dashboard data in parallel using Promise.all
      // This is faster than fetching sequentially (one after another)
      const [statsRes, topRes, trendsRes, issuesRes, catRes] = await Promise.all([
        axios.get('/api/dashboard/stats'),
        axios.get('/api/dashboard/top-returned'),
        axios.get('/api/dashboard/trends'),
        axios.get('/api/dashboard/issue-distribution'),
        axios.get('/api/dashboard/category-issues'),
      ]);

      setStats(statsRes.data);
      setTopReturned(topRes.data);
      setTrends(trendsRes.data);
      setIssueDistribution(issuesRes.data);
      setCategoryIssues(catRes.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError('Failed to load dashboard data. Make sure the backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  }

  // ---- LOADING STATE ----
  if (loading) return <LoadingSpinner message="Loading AI Dashboard..." />;

  // ---- ERROR STATE ----
  if (error) {
    return (
      <div className="empty-state">
        <div className="empty-icon">⚠️</div>
        <h3>Connection Error</h3>
        <p>{error}</p>
        <button 
          onClick={fetchDashboardData}
          style={{
            marginTop: '16px',
            padding: '10px 24px',
            background: 'var(--accent-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '600',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // ---- HELPER: Format large numbers ----
  // 1920 → "1,920" and 125000 → "₹1.25L"
  function formatNumber(num) {
    if (num === null || num === undefined) return '0';
    return Number(num).toLocaleString('en-IN');
  }

  function formatCurrency(num) {
    if (!num) return '₹0';
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
    return `₹${num}`;
  }

  // ---- HELPER: Get color for return rate ----
  function getRateColor(rate) {
    if (rate <= 10) return '#10b981';  // Green
    if (rate <= 20) return '#f59e0b';  // Amber
    if (rate <= 30) return '#f97316';  // Orange
    return '#ef4444';                   // Red
  }

  // Custom tooltip component for the line chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={customTooltipStyle}>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>{label}</div>
          {payload.map((entry, idx) => (
            <div key={idx} style={{ color: entry.color, fontSize: '0.75rem' }}>
              {entry.name}: {entry.name === 'Refund Cost' ? formatCurrency(entry.value) : entry.value}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };


  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div>
      {/* ---- Page Header ---- */}
      <div className="page-header">
        <h1>Returns Intelligence Dashboard</h1>
        <p>AI-powered insights across {stats?.totalProducts || 0} products • Real-time analysis</p>
      </div>

      {/* ===== SECTION 1: KPI STAT CARDS ===== */}
      <div className="stats-grid">
        <StatCard
          title="Total Products"
          value={<AnimatedCounter value={stats?.totalProducts || 0} />}
          icon={Package}
          color="indigo"
          subtitle={`${formatNumber(stats?.totalSold)} units sold`}
        />
        <StatCard
          title="Total Returns"
          value={<AnimatedCounter value={stats?.totalReturned || 0} />}
          icon={RotateCcw}
          color="red"
          subtitle="Across all categories"
        />
        <StatCard
          title="Avg Return Rate"
          value={<AnimatedCounter value={stats?.avgReturnRate || 0} suffix="%" decimals={2} />}
          icon={TrendingDown}
          color="amber"
          subtitle={stats?.avgReturnRate > 15 ? 'Above industry avg' : 'Within normal range'}
        />
        <StatCard
          title="Cost Impact"
          value={<AnimatedCounter value={stats?.totalRefundCost || 0} currency={true} />}
          icon={DollarSign}
          color="purple"
          subtitle="Total refunds processed"
        />
        <StatCard
          title="Suspicious Reviews"
          value={<AnimatedCounter value={stats?.suspiciousReviews || 0} />}
          icon={ShieldAlert}
          color="red"
          subtitle={`of ${stats?.totalReviews || 0} total reviews`}
        />
        <StatCard
          title="Avg Risk Score"
          value={<AnimatedCounter value={stats?.avgRiskScore || 0} suffix="/100" />}
          icon={AlertTriangle}
          color="amber"
          subtitle="Global product return risk"
        />
      </div>

      {/* ===== SECTION 2: CHARTS ===== */}
      <div className="charts-grid">
        {/* ---- Chart 1: Return Trends Over Time ---- */}
        <div className="chart-card">
          <h3>
            <BarChart3 size={18} style={{ color: 'var(--accent-primary)' }} />
            Return Trends
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis 
                dataKey="month" 
                stroke="var(--text-tertiary)" 
                fontSize={11}
                tickFormatter={(value) => {
                  const [year, month] = value.split('-');
                  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                  return months[parseInt(month) - 1] || value;
                }}
              />
              <YAxis stroke="var(--text-tertiary)" fontSize={11} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="returnCount" 
                stroke="#6366f1" 
                strokeWidth={2.5}
                dot={{ fill: '#6366f1', r: 4 }}
                activeDot={{ r: 6, stroke: '#6366f1', strokeWidth: 2 }}
                name="Returns"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ---- Chart 2: Issue Distribution ---- */}
        <div className="chart-card">
          <h3>
            <PieChartIcon size={18} style={{ color: 'var(--accent-secondary)' }} />
            Issue Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={issueDistribution.slice(0, 6)}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={55}     /* Donut chart (hollow center) */
                outerRadius={85}
                paddingAngle={3}
                stroke="none"
              >
                {issueDistribution.slice(0, 6).map((entry, index) => (
                  <Cell 
                    key={index} 
                    fill={CHART_COLORS[index % CHART_COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={customTooltipStyle}
                formatter={(value, name) => [`${value} returns`, name]}
              />
              <Legend 
                wrapperStyle={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}
                iconSize={8}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ---- Category Issues (Horizontal Bars) ---- */}
      <div className="chart-card" style={{ marginBottom: '32px' }}>
        <h3>
          <BarChart3 size={18} style={{ color: '#10b981' }} />
          Returns by Category
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={categoryIssues} layout="vertical" barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
            <XAxis type="number" stroke="var(--text-tertiary)" fontSize={11} />
            <YAxis 
              type="category" 
              dataKey="category" 
              stroke="var(--text-tertiary)" 
              fontSize={11} 
              width={110}
            />
            <Tooltip contentStyle={customTooltipStyle} />
            <Bar 
              dataKey="returnCount" 
              fill="#6366f1" 
              radius={[0, 4, 4, 0]} 
              name="Returns"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ===== SECTION 3: TOP RETURNED PRODUCTS TABLE ===== */}
      <div className="section-header">
        <h2>
          <AlertTriangle size={20} style={{ color: '#f59e0b' }} />
          Top Returned Products
        </h2>
        <span 
          className="section-action"
          onClick={() => navigate('/products')}
        >
          View All Products <ArrowRight size={14} style={{ display: 'inline' }} />
        </span>
      </div>

      <div className="chart-card animate-in" style={{ marginBottom: '24px' }}>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={topReturned} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="var(--text-tertiary)" 
              fontSize={10} 
              tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
              angle={-25}
              textAnchor="end"
            />
            <YAxis stroke="var(--text-tertiary)" fontSize={11} yAxisId="left" orientation="left" />
            <YAxis stroke="var(--text-tertiary)" fontSize={11} yAxisId="right" orientation="right" />
            <Tooltip contentStyle={customTooltipStyle} />
            <Legend wrapperStyle={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }} />
            <Bar yAxisId="left" dataKey="total_returned" name="Returns Count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            <Bar yAxisId="right" dataKey="return_rate" name="Return Rate %" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="data-table-wrapper animate-in" style={{ animationDelay: '0.1s' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Return Rate</th>
              <th>Returns / Sold</th>
              <th>Main Issue</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {topReturned.map((product, idx) => (
              <tr 
                key={product.id}
                onClick={() => navigate(`/products/${product.id}`)}
                className="animate-in"
              >
                {/* Product Name + Brand */}
                <td>
                  <div style={{ fontWeight: '600' }}>{product.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    {product.brand}
                  </div>
                </td>

                {/* Category Badge */}
                <td>
                  <span className="badge badge-neutral">{product.category}</span>
                </td>

                {/* Price */}
                <td style={{ fontWeight: '500' }}>₹{Number(product.price).toLocaleString('en-IN')}</td>

                {/* Return Rate with visual bar */}
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
                    <span className="rate-value" style={{ color: getRateColor(product.return_rate) }}>
                      {product.return_rate}%
                    </span>
                  </div>
                </td>

                {/* Returns / Sold count */}
                <td>
                  <span style={{ color: 'var(--color-danger)', fontWeight: '600' }}>
                    {product.total_returned}
                  </span>
                  <span style={{ color: 'var(--text-tertiary)' }}> / {product.total_sold}</span>
                </td>

                {/* Main Issue (from AI analysis) */}
                <td>
                  <span className={`badge ${
                    product.mainIssue?.includes('mismatch') ? 'badge-warning' :
                    product.mainIssue?.includes('Defective') ? 'badge-danger' :
                    'badge-info'
                  }`}>
                    {product.mainIssueIcon} {product.mainIssue}
                  </span>
                </td>

                {/* Star rating */}
                <td>
                  <span style={{ color: '#fbbf24' }}>★</span> {product.avg_rating}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
