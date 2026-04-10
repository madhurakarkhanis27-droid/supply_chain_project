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
const { verifyPassword } = require('./auth-utils');

// Import our AI/NLP engine (the brain!)
const { 
  extractIssues, 
  analyzeSentiment, 
  detectFakeReview, 
  calculateRiskScore, 
  generateRootCauseAnalysis,
  generateSellerActionPlan
} = require('./nlp-engine');

function normalizeReviewText(text = '') {
  return String(text)
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeName(name = '') {
  return String(name).toLowerCase().replace(/\s+/g, ' ').trim();
}

function buildReviewMetadataContext(reviews = [], returns = [], tickets = []) {
  const reviewContext = {};
  const reviewsByProduct = new Map();
  const returnsByProduct = new Map();
  const ticketsByProduct = new Map();

  for (const review of reviews) {
    const productId = review.product_id ?? 'global';
    if (!reviewsByProduct.has(productId)) reviewsByProduct.set(productId, []);
    reviewsByProduct.get(productId).push(review);
  }

  for (const ret of returns) {
    const productId = ret.product_id ?? 'global';
    if (!returnsByProduct.has(productId)) returnsByProduct.set(productId, []);
    returnsByProduct.get(productId).push(ret);
  }

  for (const ticket of tickets) {
    const productId = ticket.product_id ?? 'global';
    if (!ticketsByProduct.has(productId)) ticketsByProduct.set(productId, []);
    ticketsByProduct.get(productId).push(ticket);
  }

  for (const [productId, productReviews] of reviewsByProduct.entries()) {
    const productReturns = returnsByProduct.get(productId) || [];
    const productTickets = ticketsByProduct.get(productId) || [];
    const textCounts = new Map();
    const reviewerCounts = new Map();
    const returnNames = new Set(productReturns.map((ret) => normalizeName(ret.customer_name)));
    const ticketNames = new Set(productTickets.map((ticket) => normalizeName(ticket.customer_name)));
    const reviewDates = productReviews
      .map((review) => ({
        id: review.id,
        time: review.review_date ? new Date(review.review_date).getTime() : NaN
      }))
      .filter((item) => Number.isFinite(item.time))
      .sort((a, b) => a.time - b.time);

    for (const review of productReviews) {
      const normalizedText = normalizeReviewText(review.review_text);
      if (normalizedText) {
        textCounts.set(normalizedText, (textCounts.get(normalizedText) || 0) + 1);
      }

      const normalizedReviewer = normalizeName(review.customer_name);
      if (normalizedReviewer) {
        reviewerCounts.set(normalizedReviewer, (reviewerCounts.get(normalizedReviewer) || 0) + 1);
      }
    }

    const burstCounts = new Map();
    for (let index = 0; index < reviewDates.length; index++) {
      const current = reviewDates[index];
      let nearbyCount = 1;

      for (let left = index - 1; left >= 0; left--) {
        if (current.time - reviewDates[left].time <= 24 * 60 * 60 * 1000) nearbyCount++;
        else break;
      }

      for (let right = index + 1; right < reviewDates.length; right++) {
        if (reviewDates[right].time - current.time <= 24 * 60 * 60 * 1000) nearbyCount++;
        else break;
      }

      burstCounts.set(current.id, nearbyCount);
    }

    const firstReviewTime = reviewDates[0]?.time;

    for (const review of productReviews) {
      const normalizedText = normalizeReviewText(review.review_text);
      const normalizedReviewer = normalizeName(review.customer_name);
      const reviewTime = review.review_date ? new Date(review.review_date).getTime() : NaN;
      const daysSinceFirstReviewForProduct = Number.isFinite(firstReviewTime) && Number.isFinite(reviewTime)
        ? Math.round((reviewTime - firstReviewTime) / (24 * 60 * 60 * 1000))
        : null;

      reviewContext[review.id] = {
        duplicateTextCount: normalizedText ? (textCounts.get(normalizedText) || 0) : 0,
        reviewerReviewCount: normalizedReviewer ? (reviewerCounts.get(normalizedReviewer) || 0) : 0,
        burstReviewCount: burstCounts.get(review.id) || 1,
        hasRelatedReturn: normalizedReviewer ? returnNames.has(normalizedReviewer) : false,
        hasSupportTicket: normalizedReviewer ? ticketNames.has(normalizedReviewer) : false,
        daysSinceFirstReviewForProduct,
      };
    }
  }

  return reviewContext;
}


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
// ROUTE 1B: LOGIN
// URL: POST /api/auth/login
// PURPOSE: Authenticate a user by login id + password stored in MySQL
// ============================================================
router.post('/auth/login', async (req, res) => {
  try {
    const { loginId, password } = req.body;

    if (!loginId || !password) {
      return res.status(400).json({ error: 'loginId and password are required.' });
    }

    const [users] = await db.query(
      `SELECT id, login_id, display_name, role, password_hash, password_salt
       FROM users
       WHERE login_id = ?
       LIMIT 1`,
      [loginId]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid login ID or password.' });
    }

    const user = users[0];
    const isValid = verifyPassword(password, user.password_salt, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid login ID or password.' });
    }

    res.json({
      user: {
        id: user.id,
        loginId: user.login_id,
        name: user.display_name,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to sign in.' });
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
    const [returns] = await db.query(`SELECT * FROM returns`);
    const [tickets] = await db.query(`SELECT * FROM customer_support_tickets`);
    const reviewContext = buildReviewMetadataContext(reviews, returns, tickets);
    let suspiciousCount = 0;
    for (const review of reviews) {
      const result = detectFakeReview(review, reviewContext[review.id]);
      if (result.isSuspicious) suspiciousCount++;
    }

    // Query 4: Count support tickets
    const [ticketStats] = await db.query(`
      SELECT COUNT(*) as totalTickets,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolvedTickets
      FROM customer_support_tickets
    `);

    const [monthlyReturns] = await db.query(`
      SELECT DATE_FORMAT(return_date, '%Y-%m') as month, COUNT(*) as returnCount
      FROM returns
      GROUP BY DATE_FORMAT(return_date, '%Y-%m')
      ORDER BY month ASC
    `);

    const currentMonthReturns = Number(monthlyReturns[monthlyReturns.length - 1]?.returnCount || 0);
    const previousMonthReturns = Number(monthlyReturns[monthlyReturns.length - 2]?.returnCount || 0);
    const monthlyTrend = currentMonthReturns - previousMonthReturns;
    const totalSold = Number(productStats[0].totalSold || 0);
    const totalReturned = Number(productStats[0].totalReturned || 0);
    const integrityScore = reviews.length > 0
      ? Math.round(((reviews.length - suspiciousCount) / reviews.length) * 100)
      : 100;
    const refundPressure = totalSold > 0
      ? Math.round((totalReturned / totalSold) * 10000) / 100
      : 0;

    // Send all stats as one JSON response
    res.json({
      totalProducts: Number(productStats[0].totalProducts || 0),
      totalSold,
      totalReturned,
      avgReturnRate: Number(productStats[0].avgReturnRate || 0),
      avgRating: Number(productStats[0].avgRating || 0),
      avgRiskScore: Number(productStats[0].avgRiskScore || 0),
      totalRefundCost: Number(refundStats[0].totalRefundCost || 0),
      suspiciousReviews: suspiciousCount,
      totalReviews: reviews.length,
      totalTickets: Number(ticketStats[0].totalTickets || 0),
      resolvedTickets: Number(ticketStats[0].resolvedTickets || 0),
      integrityScore,
      refundPressure,
      monthlyTrend
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

    const enrichedProducts = [];
    for (const product of products) {
      const [reviews] = await db.query(
        'SELECT * FROM reviews WHERE product_id = ? ORDER BY review_date DESC',
        [product.id]
      );
      const [returns] = await db.query(
        'SELECT * FROM returns WHERE product_id = ? ORDER BY return_date DESC',
        [product.id]
      );
      const [tickets] = await db.query(
        'SELECT * FROM customer_support_tickets WHERE product_id = ? ORDER BY ticket_date DESC',
        [product.id]
      );

      const rootCause = generateRootCauseAnalysis(product, reviews, returns, tickets);
      const mainIssue = rootCause.issueBreakdown?.[0] || null;

      enrichedProducts.push({
        ...product,
        mainIssue: mainIssue ? mainIssue.label : 'Under Analysis',
        mainIssueIcon: mainIssue ? mainIssue.icon : '🔍',
        rootCauseSummary: rootCause.summary,
        rootCauseIssueShare: mainIssue ? mainIssue.percentage : 0
      });
    }

    res.json(enrichedProducts);
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
    const reviewContext = buildReviewMetadataContext(reviews, returns, tickets);
    const analyzedReviews = reviews.map(review => {
      const sentiment = analyzeSentiment(review.review_text);
      const fakeCheck = detectFakeReview(review, reviewContext[review.id]);
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
    const sellerActionPlan = generateSellerActionPlan(product, rootCause, riskScore);

    const enrichedReturns = returns.map((ret) => {
      if (ret.ai_extracted_issue) return ret;

      const issues = extractIssues(`${ret.return_reason || ''} ${ret.detailed_notes || ''}`);
      const topIssue = issues[0];

      return {
        ...ret,
        ai_extracted_issue: topIssue?.label || 'Under Analysis',
        ai_confidence: topIssue?.confidence ?? 0
      };
    });

    // Send everything
    res.json({
      product,
      reviews: analyzedReviews,
      returns: enrichedReturns,
      tickets,
      aiAnalysis: {
        riskScore,
        rootCause,
        sellerActionPlan,
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
    const [returns] = await db.query(
      'SELECT * FROM returns WHERE product_id = ? ORDER BY return_date DESC',
      [productId]
    );
    const [tickets] = await db.query(
      'SELECT * FROM customer_support_tickets WHERE product_id = ? ORDER BY ticket_date DESC',
      [productId]
    );
    const reviewContext = buildReviewMetadataContext(reviews, returns, tickets);

    // Run fake detection on each review
    const analyzedReviews = reviews.map(review => {
      const fakeResult = detectFakeReview(review, reviewContext[review.id]);
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
        AND return_rate < ?
        AND (
          subcategory = ?
          OR LOWER(name) LIKE ?
        )
      ORDER BY
        CASE WHEN subcategory = ? THEN 0 ELSE 1 END,
        avg_rating DESC,
        return_rate ASC
      LIMIT 3
    `, [product.category, productId, product.return_rate, product.subcategory, likePhrase, product.subcategory]);

    let recommendations = alternatives;

    if (recommendations.length === 0) {
      const [fallbackAlternatives] = await db.query(`
        SELECT * FROM products
        WHERE category = ?
          AND id != ?
          AND return_rate < ?
        ORDER BY avg_rating DESC, return_rate ASC
        LIMIT 3
      `, [product.category, productId, product.return_rate]);

      recommendations = fallbackAlternatives;
    }

    const enrichedRecommendations = await Promise.all(recommendations.map(async (rec) => {
        const [recReviews] = await db.query(
          'SELECT * FROM reviews WHERE product_id = ? ORDER BY review_date DESC',
          [rec.id]
        );
        const [recReturns] = await db.query(
          'SELECT * FROM returns WHERE product_id = ? ORDER BY return_date DESC',
          [rec.id]
        );
        const [recTickets] = await db.query(
          'SELECT * FROM customer_support_tickets WHERE product_id = ? ORDER BY ticket_date DESC',
          [rec.id]
        );

        const recRootCause = generateRootCauseAnalysis(rec, recReviews, recReturns, recTickets);
        const topIssue = recRootCause.issueBreakdown?.[0] || null;
        const totalDataPoints = recReviews.length + recReturns.length + recTickets.length;

        return {
          ...rec,
          // Calculate how much better this alternative is
          returnRateImprovement: product.return_rate - rec.return_rate,
          ratingImprovement: rec.avg_rating - product.avg_rating,
          sameSubcategory: rec.subcategory === product.subcategory,
          similarityLabel: rec.subcategory === product.subcategory ? 'Closest match' : 'Same category',
          comparisonPoints: [
            `${Number(product.return_rate - rec.return_rate).toFixed(2)}% lower return rate`,
            `${Number(rec.avg_rating - product.avg_rating).toFixed(1)} better rating`,
            rec.subcategory === product.subcategory ? 'Same subcategory' : `Same category: ${rec.category}`
          ],
          rootCauseSummary: recRootCause.summary,
          rootCauseTopIssue: topIssue ? topIssue.label : 'No major recurring issue detected',
          rootCauseIssueShare: topIssue ? topIssue.percentage : 0,
          totalDataPoints
        };
      }));

    const recommendationsWithEvidence = enrichedRecommendations.filter((rec) => rec.totalDataPoints > 0);
    const finalRecommendations = recommendationsWithEvidence.length > 0
      ? recommendationsWithEvidence
      : enrichedRecommendations;

    res.json({
      currentProduct: product,
      recommendations: finalRecommendations
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
    const { review_text, rating, verified_purchase, helpful_votes, customer_name, review_date } = req.body;
    
    if (!review_text) {
      return res.status(400).json({ error: 'review_text is required.' });
    }

    // construct a review object matching what detectFakeReview expects
    const reviewObj = {
      review_text,
      rating: rating || 5, // Default to 5 to simulate common fake review pattern if omitted
      verified_purchase: verified_purchase !== undefined ? verified_purchase : true,
      helpful_votes: helpful_votes || 0,
      customer_name: customer_name || '',
      review_date: review_date || null
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
