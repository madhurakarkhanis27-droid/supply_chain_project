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
        ROUND(AVG(avg_rating), 2) as avgRating,
        ROUND((AVG(return_rate) * 2) + ((5 - AVG(avg_rating)) * 5) + 15, 0) as avgRiskScore
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
      avgRiskScore: productStats[0].avgRiskScore,
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
router.get('/products/:id', async (req, res) => { console.log('API HIT FOR /products/', req.params.id);
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

    // Extract product type keyword to ensure alternatives are of the same type (e.g. watch -> watch)
    const getProductType = (name) => {
      const types = [
        'bean bag', 'watch', 'phone', 'laptop', 'headphones', 'earbuds', 'shoes', 
        'shirt', 't-shirt', 'jacket', 'monitor', 'keyboard', 'mouse', 'tablet', 'camera', 
        'tv', 'sneakers', 'boots', 'speaker', 'vacuum', 'saree', 'cookware', 'serum', 'jeans', 'chair'
      ];
      const lowerName = name.toLowerCase();
      // 1. Check known types
      for (const t of types) {
        if (lowerName.includes(t)) return t;
      }
      // 2. Fallback: use the longest word or last significant word
      const words = lowerName.split(/\s+/).filter(w => /^[a-z]+$/.test(w) && w.length > 3);
      return words.length > 0 ? words[words.length - 1] : '';
    };

    const typeKeyword = getProductType(product.name);
    const likePhrase = `%${typeKeyword}%`;

    // Find alternatives in the SAME category with LOWER return rates, AND matching the type
    const [alternatives] = await db.query(`
      SELECT * FROM products 
      WHERE category = ? 
        AND id != ? 
        AND name != ?
        AND return_rate < ?
        AND LOWER(name) LIKE ?
      ORDER BY avg_rating DESC, return_rate ASC
      LIMIT 3
    `, [product.category, productId, product.name, product.return_rate, likePhrase]);

    let recommendations = alternatives;

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


// ============================================================
// ROUTE 12: BUSINESS ACTION SUMMARY
// URL: GET /api/dashboard/action-summary
// PURPOSE: Provide prioritized category-level actions for the dashboard
// ============================================================
router.get('/dashboard/action-summary', async (req, res) => {
  try {
    const [categoryData] = await db.query(`
      SELECT p.category,
             COUNT(r.id) as returnCount,
             COALESCE(SUM(r.refund_amount), 0) as refundTotal,
             ROUND(AVG(p.return_rate), 2) as avgReturnRate
      FROM returns r
      JOIN products p ON r.product_id = p.id
      GROUP BY p.category
      ORDER BY returnCount DESC, refundTotal DESC
      LIMIT 5
    `);

    const priorities = [];

    for (const category of categoryData) {
      const [returns] = await db.query(`
        SELECT r.detailed_notes
        FROM returns r
        JOIN products p ON r.product_id = p.id
        WHERE p.category = ?
      `, [category.category]);

      const issueCounts = {};
      for (const ret of returns) {
        const issues = extractIssues(ret.detailed_notes || '');
        for (const issue of issues) {
          if (!issueCounts[issue.label]) {
            issueCounts[issue.label] = 0;
          }
          issueCounts[issue.label] += 1;
        }
      }

      const sortedIssues = Object.entries(issueCounts).sort((a, b) => b[1] - a[1]);
      const [topIssue = 'Under Analysis', topIssueCount = 0] = sortedIssues[0] || [];

      let priority = 'monitor';
      let impact = 'Low';
      let owner = 'Category Team';

      if (Number(category.avgReturnRate) >= 25 || Number(category.returnCount) >= 15) {
        priority = 'urgent';
        impact = 'High';
        owner = 'Ops Lead';
      } else if (Number(category.avgReturnRate) >= 15 || Number(category.returnCount) >= 8) {
        priority = 'soon';
        impact = 'Medium';
        owner = 'QA Team';
      }

      priorities.push({
        category: category.category,
        returnCount: Number(category.returnCount),
        refundTotal: Number(category.refundTotal),
        avgReturnRate: Number(category.avgReturnRate),
        topIssue,
        issueShare: returns.length > 0 ? Math.round((topIssueCount / returns.length) * 100) : 0,
        priority,
        impact,
        owner,
        actions: [
          `Audit ${category.category.toLowerCase()} listings for ${topIssue.toLowerCase()} complaints.`,
          `Review latest return notes and samples from ${category.category.toLowerCase()}.`,
          `Coordinate with ${owner.toLowerCase()} on the next corrective action cycle.`
        ]
      });
    }

    res.json({
      summary: priorities.length > 0
        ? `Focus first on the categories creating the highest combination of returns and refund pressure.`
        : 'No category priorities are available yet.',
      priorities
    });
  } catch (error) {
    console.error('Action summary error:', error);
    res.status(500).json({ error: 'Failed to load action summary' });
  }
});


// ============================================================
// ROUTE 13: ACTIVE ALERTS
// URL: GET /api/dashboard/alerts
// PURPOSE: Provide dashboard alert cards for the highest-risk categories
// ============================================================
router.get('/dashboard/alerts', async (req, res) => {
  try {
    const [categoryData] = await db.query(`
      SELECT p.category,
             COUNT(r.id) as returnCount,
             COALESCE(SUM(r.refund_amount), 0) as refundTotal,
             ROUND(AVG(p.return_rate), 2) as avgReturnRate
      FROM returns r
      JOIN products p ON r.product_id = p.id
      GROUP BY p.category
      HAVING COUNT(r.id) > 0
      ORDER BY avgReturnRate DESC, refundTotal DESC
      LIMIT 4
    `);

    const alerts = [];

    for (const category of categoryData) {
      const [returns] = await db.query(`
        SELECT r.detailed_notes
        FROM returns r
        JOIN products p ON r.product_id = p.id
        WHERE p.category = ?
      `, [category.category]);

      const issueCounts = {};
      for (const ret of returns) {
        const issues = extractIssues(ret.detailed_notes || '');
        for (const issue of issues) {
          if (!issueCounts[issue.label]) {
            issueCounts[issue.label] = 0;
          }
          issueCounts[issue.label] += 1;
        }
      }

      const sortedIssues = Object.entries(issueCounts).sort((a, b) => b[1] - a[1]);
      const [topIssue = 'Under Analysis'] = sortedIssues[0] || [];

      let severity = 'medium';
      let priority = 'monitor';
      let owner = 'Ops Lead';

      if (Number(category.avgReturnRate) >= 25) {
        severity = 'high';
        priority = 'urgent';
      } else if (Number(category.avgReturnRate) >= 15) {
        severity = 'medium';
        priority = 'soon';
      } else {
        severity = 'low';
      }

      alerts.push({
        id: `${category.category}-${topIssue}`.toLowerCase().replace(/\s+/g, '-'),
        category: category.category,
        issue: topIssue,
        severity,
        priority,
        owner,
        returnCount: Number(category.returnCount),
        refundTotal: Number(category.refundTotal),
        message: `${category.category} is showing elevated returns driven mainly by ${topIssue.toLowerCase()}.`
      });
    }

    res.json({
      summary: alerts.length > 0
        ? 'These categories need attention based on recent return intensity.'
        : 'No active alerts right now.',
      alerts
    });
  } catch (error) {
    console.error('Alerts error:', error);
    res.status(500).json({ error: 'Failed to load alerts' });
  }
});


// ============================================================
// ROUTE 14: ANALYZE REVIEWS (POST)
// URL: POST /api/analyze/reviews
// PURPOSE: AI analysis of an array of reviews or a single review text
// ============================================================
router.post('/analyze/reviews', (req, res) => {
  try {
    const { reviews, reviewText } = req.body;
    
    if (reviewText) {
      // Analyze a single text block
      const sentiment = analyzeSentiment(reviewText);
      const issues = extractIssues(reviewText);
      return res.json({ sentiment, issues });
    }
    
    if (reviews && Array.isArray(reviews)) {
      // Analyze multiple reviews
      const analyzedReviews = reviews.map(review => ({
        ...review,
        sentiment: analyzeSentiment(review.review_text || review.text || review),
        issues: extractIssues(review.review_text || review.text || review)
      }));
      return res.json({ analyzedReviews });
    }

    return res.status(400).json({ error: 'Please provide reviewText or an array of reviews.' });
  } catch (error) {
    console.error('Analyze reviews error:', error);
    res.status(500).json({ error: 'Failed to analyze reviews' });
  }
});


// ============================================================
// ROUTE 15: ANALYZE FAKE REVIEWS (POST)
// URL: POST /api/analyze/fake-reviews
// PURPOSE: Detect if a submitted review is fake or suspicious
// ============================================================
router.post('/analyze/fake-reviews', (req, res) => {
  try {
    const { review_text, rating, verified_purchase } = req.body;
    
    if (!review_text) {
      return res.status(400).json({ error: 'review_text is required.' });
    }

    // construct a review object matching what detectFakeReview expects
    const reviewObj = {
      review_text,
      rating: rating || 5, // Default to 5 to simulate common fake review pattern if omitted
      verified_purchase: verified_purchase !== undefined ? verified_purchase : true
    };

    const fakeAnalysis = detectFakeReview(reviewObj);

    res.json(fakeAnalysis);
  } catch (error) {
    console.error('Analyze fake reviews error:', error);
    res.status(500).json({ error: 'Failed to analyze fake review' });
  }
});


// Export the router so server.js can use it
module.exports = router;
