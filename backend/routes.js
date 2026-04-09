// ============================================================
// FILE: backend/routes.js
// PURPOSE: All the API endpoints (URLs) our frontend will call
// ============================================================
// This file defines all the routes (URLs) our backend responds to.
// Think of each route as a "request" the frontend can make:
//   - GET = "give me data" (like loading a page)
//   - POST = "here's some data, process it" (like submitting a form)
//
// Each route:
//   1. Receives a request from the frontend
//   2. Queries the database for relevant data
//   3. Optionally runs AI/NLP analysis
//   4. Sends back a JSON response
// ============================================================

const express = require('express');
const router = express.Router();  // Router is like a sub-app for organizing routes

// Import our database connection
const db = require('./db');

// Import our AI/NLP engine (the brain!)
const { 
  extractIssues, 
  analyzeSentiment, 
  detectFakeReview, 
  calculateRiskScore, 
  generateRootCauseAnalysis 
} = require('./nlp-engine');


// ============================================================
// ROUTE 1: HEALTH CHECK
// URL: GET /api/health
// PURPOSE: Check if the server is running
// ============================================================
router.get('/health', (req, res) => {
  // Simply respond with "ok" — used to verify server is alive
  res.json({ status: 'ok', message: 'Server is running!' });
});

router.get('/health/db', async (req, res) => {
  try {
    await db.query('SELECT 1 as connected');
    res.json({
      status: 'ok',
      message: 'Database connection successful'
    });
  } catch (error) {
    console.error('Database health error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      details: error.message
    });
  }
});


// ============================================================
// ROUTE 2: DASHBOARD STATISTICS
// URL: GET /api/dashboard/stats
// PURPOSE: Get all the numbers for the main dashboard
// ============================================================
// This is the FIRST thing the dashboard page loads.
// It provides: total products, total returns, return rate, etc.
router.get('/dashboard/stats', async (req, res) => {
  try {
    // Query 1: Get overall totals from product table
    // SUM() adds up all values in a column
    // AVG() calculates the average
    const [productStats] = await db.query(`
      SELECT 
        COUNT(*) as totalProducts,
        SUM(total_sold) as totalSold,
        SUM(total_returned) as totalReturned,
        ROUND(AVG(return_rate), 2) as avgReturnRate,
        ROUND(AVG(avg_rating), 2) as avgRating
      FROM products
    `);

    // Query 2: Get total refund amount (cost of returns)
    const [refundStats] = await db.query(`
      SELECT COALESCE(SUM(refund_amount), 0) as totalRefundCost
      FROM returns
      WHERE return_status = 'completed'
    `);

    // Query 3: Count suspicious reviews detected
    // We'll run our fake detection on recent reviews
    const [reviews] = await db.query(`SELECT * FROM reviews`);
    let suspiciousCount = 0;
    for (const review of reviews) {
      const result = detectFakeReview(review);
      if (result.isSuspicious) suspiciousCount++;
    }

    // Query 4: Count support tickets
    const [ticketStats] = await db.query(`
      SELECT COUNT(*) as totalTickets,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolvedTickets
      FROM customer_support_tickets
    `);

    // Send all stats as one JSON response
    res.json({
      totalProducts: productStats[0].totalProducts,
      totalSold: productStats[0].totalSold,
      totalReturned: productStats[0].totalReturned,
      avgReturnRate: productStats[0].avgReturnRate,
      avgRating: productStats[0].avgRating,
      totalRefundCost: refundStats[0].totalRefundCost,
      suspiciousReviews: suspiciousCount,
      totalReviews: reviews.length,
      totalTickets: ticketStats[0].totalTickets,
      resolvedTickets: ticketStats[0].resolvedTickets
    });
  } catch (error) {
    // If anything goes wrong, send error message
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to load dashboard statistics' });
  }
});


// ============================================================
// ROUTE 3: TOP RETURNED PRODUCTS
// URL: GET /api/dashboard/top-returned
// PURPOSE: Get the products with highest return rates
// ============================================================
router.get('/dashboard/top-returned', async (req, res) => {
  try {
    // ORDER BY return_rate DESC = sort from highest return rate to lowest
    // LIMIT 10 = only get top 10
    const [products] = await db.query(`
      SELECT id, name, category, brand, price, return_rate, total_returned, 
             total_sold, avg_rating, total_reviews
      FROM products
      WHERE total_returned > 0
      ORDER BY return_rate DESC
      LIMIT 10
    `);

    // For each product, also get the main issue
    const enrichedProducts = [];
    for (const product of products) {
      const [returns] = await db.query(
        `SELECT detailed_notes FROM returns WHERE product_id = ?`,
        [product.id]
      );
      
      // Combine all return notes and extract main issue
      const allNotes = returns.map(r => r.detailed_notes).join(' ');
      const issues = extractIssues(allNotes);
      const mainIssue = issues.length > 0 ? issues[0] : null;

      enrichedProducts.push({
        ...product,
        mainIssue: mainIssue ? mainIssue.label : 'Under Analysis',
        mainIssueIcon: mainIssue ? mainIssue.icon : '🔍'
      });
    }

    res.json(enrichedProducts);
  } catch (error) {
    console.error('Top returned error:', error);
    res.status(500).json({ error: 'Failed to load top returned products' });
  }
});


// ============================================================
// ROUTE 4: CATEGORY-WISE ISSUES
// URL: GET /api/dashboard/category-issues
// PURPOSE: Break down return issues by product category
// ============================================================
router.get('/dashboard/category-issues', async (req, res) => {
  try {
    // Get return data grouped by category
    const [categoryData] = await db.query(`
      SELECT p.category,
             COUNT(r.id) as returnCount,
             SUM(r.refund_amount) as refundTotal,
             ROUND(AVG(p.return_rate), 2) as avgReturnRate
      FROM returns r
      JOIN products p ON r.product_id = p.id
      GROUP BY p.category
      ORDER BY returnCount DESC
    `);

    // For each category, find the top issues
    const enrichedCategories = [];
    for (const cat of categoryData) {
      const [returns] = await db.query(`
        SELECT r.detailed_notes FROM returns r
        JOIN products p ON r.product_id = p.id
        WHERE p.category = ?
      `, [cat.category]);

      // Extract issues from all returns in this category
      const allNotes = returns.map(r => r.detailed_notes).join(' ');
      const issues = extractIssues(allNotes);

      enrichedCategories.push({
        ...cat,
        topIssues: issues.slice(0, 3) // Top 3 issues per category
      });
    }

    res.json(enrichedCategories);
  } catch (error) {
    console.error('Category issues error:', error);
    res.status(500).json({ error: 'Failed to load category issues' });
  }
});


// ============================================================
// ROUTE 5: RETURN TRENDS OVER TIME
// URL: GET /api/dashboard/trends
// PURPOSE: Show how returns change month by month
// ============================================================
router.get('/dashboard/trends', async (req, res) => {
  try {
    // Group returns by month
    // DATE_FORMAT converts a date to "2025-12" format
    const [trends] = await db.query(`
      SELECT 
        DATE_FORMAT(return_date, '%Y-%m') as month,
        COUNT(*) as returnCount,
        SUM(refund_amount) as refundTotal
      FROM returns
      GROUP BY DATE_FORMAT(return_date, '%Y-%m')
      ORDER BY month ASC
    `);

    res.json(trends);
  } catch (error) {
    console.error('Trends error:', error);
    res.status(500).json({ error: 'Failed to load trends' });
  }
});


// ============================================================
// ROUTE 6: ALL PRODUCTS LIST
// URL: GET /api/products
// PURPOSE: Get list of all products with basic stats
// ============================================================
router.get('/products', async (req, res) => {
  try {
    const [products] = await db.query(`
      SELECT * FROM products ORDER BY return_rate DESC
    `);
    res.json(products);
  } catch (error) {
    console.error('Products list error:', error);
    res.status(500).json({ error: 'Failed to load products' });
  }
});


// ============================================================
// ROUTE 7: SINGLE PRODUCT DETAIL + AI ANALYSIS
// URL: GET /api/products/:id
// PURPOSE: Get everything about one product + run AI analysis
// ============================================================
// The ":id" is a URL parameter — for example:
//   GET /api/products/7 → gets product with id=7
router.get('/products/:id', async (req, res) => {
  try {
    const productId = req.params.id; // Get the ID from the URL

    // Get product details
    const [products] = await db.query('SELECT * FROM products WHERE id = ?', [productId]);
    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const product = products[0];

    // Get all reviews for this product
    const [reviews] = await db.query(
      'SELECT * FROM reviews WHERE product_id = ? ORDER BY review_date DESC',
      [productId]
    );

    // Get all returns for this product
    const [returns] = await db.query(
      'SELECT * FROM returns WHERE product_id = ? ORDER BY return_date DESC',
      [productId]
    );

    // Get support tickets
    const [tickets] = await db.query(
      'SELECT * FROM customer_support_tickets WHERE product_id = ? ORDER BY ticket_date DESC',
      [productId]
    );

    // --- RUN AI ANALYSIS ---

    // 1. Analyze each review's sentiment and fake detection
    const analyzedReviews = reviews.map(review => {
      const sentiment = analyzeSentiment(review.review_text);
      const fakeCheck = detectFakeReview(review);
      return {
        ...review,
        sentiment,
        fakeCheck
      };
    });

    // 2. Calculate risk score
    const riskScore = calculateRiskScore(product, reviews, returns);

    // 3. Generate root cause analysis
    const rootCause = generateRootCauseAnalysis(product, reviews, returns, tickets);

    // Send everything
    res.json({
      product,
      reviews: analyzedReviews,
      returns,
      tickets,
      aiAnalysis: {
        riskScore,
        rootCause,
        totalDataPoints: reviews.length + returns.length + tickets.length
      }
    });
  } catch (error) {
    console.error('Product detail error:', error);
    res.status(500).json({ error: 'Failed to load product details' });
  }
});


// ============================================================
// ROUTE 8: FAKE REVIEW ANALYSIS
// URL: GET /api/products/:id/fake-reviews
// PURPOSE: Get detailed fake review analysis for a product
// ============================================================
router.get('/products/:id/fake-reviews', async (req, res) => {
  try {
    const productId = req.params.id;

    // Get all reviews for this product
    const [reviews] = await db.query(
      'SELECT * FROM reviews WHERE product_id = ? ORDER BY review_date DESC',
      [productId]
    );

    // Run fake detection on each review
    const analyzedReviews = reviews.map(review => {
      const fakeResult = detectFakeReview(review);
      const sentiment = analyzeSentiment(review.review_text);
      return {
        ...review,
        fakeAnalysis: fakeResult,
        sentiment
      };
    });

    // Separate into suspicious and genuine
    const suspicious = analyzedReviews.filter(r => r.fakeAnalysis.isSuspicious);
    const genuine = analyzedReviews.filter(r => !r.fakeAnalysis.isSuspicious);

    // Calculate the "Review Reliability Score"
    // This tells customers how trustworthy the reviews are overall
    const reliabilityScore = reviews.length > 0 
      ? Math.round(((reviews.length - suspicious.length) / reviews.length) * 100)
      : 100;

    res.json({
      totalReviews: reviews.length,
      suspiciousCount: suspicious.length,
      genuineCount: genuine.length,
      reliabilityScore,
      suspiciousReviews: suspicious,
      genuineReviews: genuine
    });
  } catch (error) {
    console.error('Fake review analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze reviews' });
  }
});


// ============================================================
// ROUTE 9: RISK SCORE FOR A PRODUCT
// URL: GET /api/products/:id/risk-score
// PURPOSE: Get detailed return risk breakdown
// ============================================================
router.get('/products/:id/risk-score', async (req, res) => {
  try {
    const productId = req.params.id;

    const [products] = await db.query('SELECT * FROM products WHERE id = ?', [productId]);
    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const [reviews] = await db.query('SELECT * FROM reviews WHERE product_id = ?', [productId]);
    const [returns] = await db.query('SELECT * FROM returns WHERE product_id = ?', [productId]);

    const riskScore = calculateRiskScore(products[0], reviews, returns);

    res.json({
      product: products[0],
      riskScore
    });
  } catch (error) {
    console.error('Risk score error:', error);
    res.status(500).json({ error: 'Failed to calculate risk score' });
  }
});


// ============================================================
// ROUTE 10: PRODUCT RECOMMENDATIONS
// URL: GET /api/products/:id/recommendations
// PURPOSE: Suggest better alternatives with lower return risk
// ============================================================
router.get('/products/:id/recommendations', async (req, res) => {
  try {
    const productId = req.params.id;

    // Get the current product
    const [products] = await db.query('SELECT * FROM products WHERE id = ?', [productId]);
    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const product = products[0];

    // Find alternatives in the SAME category with LOWER return rates
    // This helps customers find better options
    const [alternatives] = await db.query(`
      SELECT * FROM products 
      WHERE category = ? 
        AND id != ? 
        AND return_rate < ?
      ORDER BY avg_rating DESC, return_rate ASC
      LIMIT 3
    `, [product.category, productId, product.return_rate]);

    // If no better alternatives, get highest rated in same category
    let recommendations = alternatives;
    if (recommendations.length === 0) {
      const [fallback] = await db.query(`
        SELECT * FROM products 
        WHERE category = ? AND id != ?
        ORDER BY avg_rating DESC
        LIMIT 3
      `, [product.category, productId]);
      recommendations = fallback;
    }

    res.json({
      currentProduct: product,
      recommendations: recommendations.map(rec => ({
        ...rec,
        // Calculate how much better this alternative is
        returnRateImprovement: product.return_rate - rec.return_rate,
        ratingImprovement: rec.avg_rating - product.avg_rating
      }))
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});


// ============================================================
// ROUTE 11: OVERALL ISSUE DISTRIBUTION
// URL: GET /api/dashboard/issue-distribution
// PURPOSE: Show what types of issues are most common across ALL products
// ============================================================
router.get('/dashboard/issue-distribution', async (req, res) => {
  try {
    // Get all return notes
    const [returns] = await db.query(`SELECT detailed_notes FROM returns`);
    
    // Count each issue type
    const issueCounts = {};
    for (const ret of returns) {
      const issues = extractIssues(ret.detailed_notes);
      for (const issue of issues) {
        if (!issueCounts[issue.issue]) {
          issueCounts[issue.issue] = { label: issue.label, icon: issue.icon, count: 0 };
        }
        issueCounts[issue.issue].count++;
      }
    }

    // Convert to sorted array
    const distribution = Object.entries(issueCounts)
      .map(([key, value]) => ({
        issue: key,
        ...value,
        percentage: Math.round((value.count / returns.length) * 100)
      }))
      .sort((a, b) => b.count - a.count);

    res.json(distribution);
  } catch (error) {
    console.error('Issue distribution error:', error);
    res.status(500).json({ error: 'Failed to load issue distribution' });
  }
});


// Export the router so server.js can use it
module.exports = router;
