// ============================================================
// FILE: backend/nlp-engine.js
// PURPOSE: The "AI Brain" of our system
// ============================================================
// This file contains all the NLP (Natural Language Processing)
// logic that analyzes text from reviews, returns, and support tickets.
//
// HOW IT WORKS:
// Instead of calling expensive AI APIs (like ChatGPT), we use
// "rule-based NLP" — smart keyword matching, pattern detection,
// and scoring algorithms. This is:
//   1. FAST (instant results, no API calls)
//   2. FREE (no API costs)
//   3. OFFLINE (works without internet)
//   4. EXPLAINABLE (we know exactly WHY it made each decision)
// ============================================================

// ============================================================
// SECTION 1: ISSUE EXTRACTION
// Given review/return text, figure out WHAT the problem is
// ============================================================

// These are the "issue categories" our AI can detect
// Each category has keywords that indicate that specific issue
const ISSUE_KEYWORDS = {
  color_mismatch: {
    label: 'Color Mismatch',           // Human-readable name
    icon: '🎨',                         // Icon for the dashboard
    // Keywords that suggest color problems:
    keywords: ['color', 'colour', 'shade', 'hue', 'tint', 'dye', 'faded', 'fade',
      'different color', 'wrong color', 'not the same color', 'looks different',
      'navy', 'blue', 'red', 'green', 'brown', 'grey', 'gray', 'magenta', 'pink',
      'photo', 'picture', 'screen', 'real life', 'in person', 'edited', 'misleading'],
    weight: 1.0  // How important is this category (used in scoring)
  },
  size_mismatch: {
    label: 'Size / Fit Issues',
    icon: '📏',
    keywords: ['size', 'sizing', 'fit', 'tight', 'loose', 'small', 'large', 'big',
      'short', 'long', 'narrow', 'wide', 'baggy', 'boxy', 'slim', 'runs small',
      'runs large', 'size chart', 'measurement', 'length', 'waist', 'chest',
      'shoulders', 'sleeves'],
    weight: 1.0
  },
  quality_poor: {
    label: 'Poor Quality',
    icon: '⚠️',
    keywords: ['quality', 'cheap', 'flimsy', 'thin', 'broke', 'broken', 'tear',
      'rip', 'scratch', 'peel', 'crack', 'fragile', 'fell apart', 'poor quality',
      'low quality', 'stitching', 'thread', 'seam', 'durable', 'durability',
      'plasticky', 'coming off', 'deteriorate', 'wear out'],
    weight: 0.9
  },
  defective: {
    label: 'Defective Product',
    icon: '🔧',
    keywords: ['defective', 'defect', 'broken', 'not working', 'stopped working',
      'malfunction', 'faulty', 'dead', 'doesnt work', 'wont turn on', 'buzzing',
      'noise', 'manufacturing defect', 'dent', 'damaged'],
    weight: 1.0
  },
  misleading_specs: {
    label: 'Misleading Description',
    icon: '📝',
    keywords: ['misleading', 'false', 'advertised', 'claimed', 'not as described',
      'nothing like', 'false advertising', 'fake specs', 'fabricated', 'exaggerated',
      'overpromise', 'marketing', 'listing', 'description wrong', 'specs wrong',
      'battery life', 'hours claimed'],
    weight: 0.8
  },
  material_quality: {
    label: 'Material Quality Issue',
    icon: '🧵',
    keywords: ['material', 'fabric', 'cotton', 'polyester', 'silk', 'leather',
      'synthetic', 'genuine', 'fake material', 'not real', 'feels like', 'rough',
      'scratchy', 'uncomfortable material', 'blend', 'mixed'],
    weight: 0.9
  },
  connectivity_issue: {
    label: 'Connectivity Problems',
    icon: '📡',
    keywords: ['bluetooth', 'wifi', 'wi-fi', 'connection', 'disconnect', 'sync',
      'pair', 'pairing', 'signal', 'connectivity', 'drops', 'unstable', 'loses connection'],
    weight: 0.7
  },
  software_issue: {
    label: 'Software / App Issues',
    icon: '💻',
    keywords: ['app', 'software', 'crash', 'bug', 'glitch', 'update', 'firmware',
      'freezes', 'hangs', 'slow', 'unresponsive', 'interface'],
    weight: 0.7
  },
  safety_concern: {
    label: 'Safety Concern',
    icon: '🚨',
    keywords: ['safety', 'dangerous', 'hazard', 'burn', 'hot', 'chemical', 'smell',
      'toxic', 'irritation', 'allergic', 'breakout', 'rash', 'fell', 'injury',
      'health', 'unsafe'],
    weight: 1.2  // Higher weight because safety issues are critical
  },
  shipping_damage: {
    label: 'Shipping / Packaging Issue',
    icon: '📦',
    keywords: ['shipping', 'delivery', 'packaging', 'arrived damaged', 'transit',
      'box', 'wrinkled', 'stain', 'leaked', 'broken in shipping', 'poor packaging'],
    weight: 0.6
  },
  sensor_inaccurate: {
    label: 'Sensor Inaccuracy',
    icon: '📊',
    keywords: ['sensor', 'inaccurate', 'accuracy', 'wrong reading', 'heart rate',
      'step counter', 'gps', 'tracking', 'calibration', 'measurement wrong',
      'off by', 'unreliable'],
    weight: 0.8
  }
};

/**
 * extractIssues(text)
 * 
 * Takes a piece of text (review, return note, etc.) and figures out
 * what issues/problems are being described.
 * 
 * HOW IT WORKS:
 * 1. Convert text to lowercase (so "Color" and "color" both match)
 * 2. For each issue category, count how many of its keywords appear in the text
 * 3. Calculate a "match score" based on keyword matches
 * 4. Return all matching issues, sorted by relevance
 * 
 * @param {string} text - The text to analyze
 * @returns {Array} - List of detected issues with scores
 */
function extractIssues(text) {
  // If no text provided, return empty
  if (!text) return [];

  // Convert to lowercase for matching
  const lowerText = text.toLowerCase();
  const results = [];

  // Check each issue category
  for (const [issueKey, issueData] of Object.entries(ISSUE_KEYWORDS)) {
    let matchCount = 0;    // How many keywords matched
    let matchedWords = []; // Which specific keywords matched

    // Check each keyword in this category
    for (const keyword of issueData.keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        matchCount++;
        matchedWords.push(keyword);
      }
    }

    // If at least 2 keywords matched, consider this issue detected
    if (matchCount >= 2) {
      // Calculate confidence score (0 to 1)
      // More keyword matches = higher confidence
      const confidence = Math.min(
        (matchCount / issueData.keywords.length) * issueData.weight * 3, // Scale up
        1.0 // Cap at 1.0
      );

      results.push({
        issue: issueKey,              // e.g., "color_mismatch"
        label: issueData.label,       // e.g., "Color Mismatch"
        icon: issueData.icon,         // e.g., "🎨"
        confidence: Math.round(confidence * 100) / 100, // Round to 2 decimals
        matchedKeywords: matchedWords, // Which keywords were found
        matchCount: matchCount         // How many keywords matched
      });
    }
  }

  // Sort by confidence (highest first)
  results.sort((a, b) => b.confidence - a.confidence);

  return results;
}


// ============================================================
// SECTION 2: SENTIMENT ANALYSIS
// Determine if text is positive, negative, or neutral
// ============================================================

// Words that indicate POSITIVE sentiment
const POSITIVE_WORDS = [
  'good', 'great', 'excellent', 'amazing', 'perfect', 'love', 'best',
  'wonderful', 'fantastic', 'awesome', 'happy', 'satisfied', 'comfortable',
  'worth', 'recommend', 'impressed', 'beautiful', 'premium', 'reliable',
  'durable', 'smooth', 'fast', 'easy', 'convenient', 'helpful', 'nice',
  'superb', 'outstanding', 'brilliant', 'value for money', 'stylish'
];

// Words that indicate NEGATIVE sentiment
const NEGATIVE_WORDS = [
  'bad', 'terrible', 'horrible', 'worst', 'hate', 'poor', 'awful',
  'disappointing', 'disappointed', 'waste', 'useless', 'cheap', 'broken',
  'defective', 'fake', 'fraud', 'scam', 'misleading', 'uncomfortable',
  'returned', 'refund', 'regret', 'annoying', 'frustrating', 'unreliable',
  'flimsy', 'overpriced', 'dangerous', 'damaged', 'stiff', 'rough',
  'weak', 'dull', 'noisy', 'hot', 'slow', 'crashes', 'stuck'
];

// Words that make sentiment STRONGER (intensifiers)
const INTENSIFIERS = ['very', 'extremely', 'absolutely', 'completely', 'totally', 'really', 'highly'];

// Words that FLIP sentiment direction (negators)
const NEGATORS = ['not', 'no', 'never', 'dont', "don't", 'doesnt', "doesn't", 'neither', 'nor', 'barely'];

/**
 * analyzeSentiment(text)
 * 
 * Calculates a sentiment score from -1.0 (very negative) to 1.0 (very positive)
 * 
 * HOW IT WORKS:
 * 1. Count positive words found in text
 * 2. Count negative words found in text
 * 3. Check for intensifiers (boost the score)
 * 4. Check for negators (might flip the meaning)
 * 5. Calculate final score
 * 
 * @param {string} text - Text to analyze
 * @returns {object} - { score, label, positiveCount, negativeCount }
 */
function analyzeSentiment(text) {
  if (!text) return { score: 0, label: 'Neutral', positiveCount: 0, negativeCount: 0 };

  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/); // Split text into individual words

  let positiveCount = 0;
  let negativeCount = 0;
  let intensifierCount = 0;

  // Count positive word matches
  for (const word of POSITIVE_WORDS) {
    if (lowerText.includes(word)) positiveCount++;
  }

  // Count negative word matches
  for (const word of NEGATIVE_WORDS) {
    if (lowerText.includes(word)) negativeCount++;
  }

  // Count intensifiers
  for (const word of INTENSIFIERS) {
    if (lowerText.includes(word)) intensifierCount++;
  }

  // Check for negators (they can flip positive to negative)
  let hasNegator = false;
  for (const word of NEGATORS) {
    if (words.includes(word)) {
      hasNegator = true;
      break;
    }
  }

  // Calculate raw score
  const total = positiveCount + negativeCount;
  if (total === 0) return { score: 0, label: 'Neutral', positiveCount: 0, negativeCount: 0 };

  // Score formula: (positive - negative) / total, adjusted by intensifiers
  let score = (positiveCount - negativeCount) / total;
  
  // Intensifiers push the score further from zero
  if (intensifierCount > 0) {
    score *= (1 + intensifierCount * 0.1);
  }

  // If negators present and score is positive, reduce it
  if (hasNegator && score > 0) {
    score *= -0.5;
  }

  // Clamp score between -1 and 1
  score = Math.max(-1, Math.min(1, score));
  score = Math.round(score * 100) / 100;

  // Determine label based on score
  let label;
  if (score >= 0.3) label = 'Positive';
  else if (score <= -0.3) label = 'Negative';
  else label = 'Neutral';

  return { score, label, positiveCount, negativeCount };
}


// ============================================================
// SECTION 3: FAKE REVIEW DETECTION
// Detect suspicious/fake reviews
// ============================================================

/**
 * detectFakeReview(review)
 * 
 * Analyzes a review to determine if it's likely fake/suspicious
 * 
 * DETECTION CRITERIA:
 * 1. Excessive exclamation marks (!!!!)
 * 2. Overly promotional language ("must buy!", "best ever!")
 * 3. Very generic (no specific details about the product)
 * 4. Superlatives overuse ("best", "perfect", "amazing" repeated)
 * 5. Very short with high rating
 * 6. Non-verified purchase
 * 7. Rating vs sentiment mismatch
 * 
 * @param {object} review - Review object with text, rating, verified_purchase, etc.
 * @returns {object} - { isSuspicious, suspicionScore, reasons }
 */
function detectFakeReview(review) {
  const reasons = [];     // List of reasons why we think it's fake
  let suspicionScore = 0; // 0 = genuine, 1 = definitely fake

  const text = (review.review_text || '').toLowerCase();
  const words = text.split(/\s+/);
  const wordCount = words.length;

  // --- Check 1: Excessive exclamation marks ---
  // Real reviews rarely have more than 1-2 exclamation marks
  const exclamationCount = (text.match(/!/g) || []).length;
  if (exclamationCount >= 3) {
    suspicionScore += 0.15;
    reasons.push(`Excessive exclamation marks (${exclamationCount} found)`);
  }

  // --- Check 2: Overly promotional language ---
  // Fake reviews often use sales-like language
  const promotionalPhrases = [
    'must buy', 'buy now', 'buy immediately', 'everyone should buy',
    'don\'t miss', 'best purchase', 'life changing', 'highly recommended',
    'must have', 'you won\'t regret', 'grab it', 'order now'
  ];
  let promoCount = 0;
  for (const phrase of promotionalPhrases) {
    if (text.includes(phrase)) promoCount++;
  }
  if (promoCount >= 2) {
    suspicionScore += 0.25;
    reasons.push(`Overly promotional language (${promoCount} promotional phrases)`);
  }

  // --- Check 3: Repetitive superlatives ---
  // "Amazing amazing amazing" or "best best best"
  const superlatives = ['amazing', 'best', 'perfect', 'excellent', 'superb', 'outstanding', 'wonderful'];
  let superlativeCount = 0;
  for (const word of superlatives) {
    const regex = new RegExp(word, 'gi');
    const matches = text.match(regex);
    if (matches) superlativeCount += matches.length;
  }
  if (superlativeCount >= 3) {
    suspicionScore += 0.20;
    reasons.push(`Excessive superlatives (${superlativeCount} superlative words used)`);
  }

  // --- Check 4: Lack of specific details ---
  // Real reviews mention specific features; fake ones are generic
  const specificWords = ['battery', 'screen', 'size', 'color', 'weight', 'sound',
    'camera', 'speed', 'fit', 'fabric', 'material', 'feature', 'setting',
    'button', 'port', 'strap', 'sole', 'stitching', 'pocket'];
  let specificCount = 0;
  for (const word of specificWords) {
    if (text.includes(word)) specificCount++;
  }
  if (specificCount === 0 && wordCount > 10) {
    suspicionScore += 0.15;
    reasons.push('No specific product details mentioned');
  }

  // --- Check 5: Very short 5-star review ---
  // Genuine detailed reviews tend to be longer
  if (review.rating === 5 && wordCount < 20) {
    suspicionScore += 0.10;
    reasons.push('Very short review with maximum rating');
  }

  // --- Check 6: Non-verified purchase ---
  // Reviews from non-buyers are more likely fake
  if (!review.verified_purchase) {
    suspicionScore += 0.15;
    reasons.push('Not a verified purchase');
  }

  // --- Check 7: Generic customer name ---
  // Real people have real names; fakes often use generic names
  const genericNames = ['customer', 'buyer', 'shopper', 'user', 'fan', 'lover',
    'expert', 'happy', 'satisfied', 'great purchase', 'best product'];
  const nameLower = (review.customer_name || '').toLowerCase();
  for (const generic of genericNames) {
    if (nameLower.includes(generic)) {
      suspicionScore += 0.10;
      reasons.push(`Generic/suspicious reviewer name: "${review.customer_name}"`);
      break;
    }
  }

  // --- Check 8: Low helpful votes on positive review ---
  // If nobody found a glowing review helpful, it might be fake
  if (review.rating >= 4 && review.helpful_votes <= 1) {
    suspicionScore += 0.05;
    reasons.push('Low helpful votes despite positive review');
  }

  // --- Check 9: Repetitive word patterns ---
  // "Amazing product amazing quality amazing everything"
  const wordFreq = {};
  for (const word of words) {
    if (word.length > 3) { // Only count meaningful words
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  }
  const repeatedWords = Object.values(wordFreq).filter(count => count >= 3).length;
  if (repeatedWords >= 2) {
    suspicionScore += 0.15;
    reasons.push('Repetitive word patterns detected');
  }

  // Cap score at 1.0
  suspicionScore = Math.min(suspicionScore, 1.0);
  suspicionScore = Math.round(suspicionScore * 100) / 100;

  // Determine if suspicious (threshold: 0.4)
  const isSuspicious = suspicionScore >= 0.4;

  return {
    isSuspicious,
    suspicionScore,
    reasons,
    // Severity level for display
    severity: suspicionScore >= 0.7 ? 'High' : suspicionScore >= 0.4 ? 'Medium' : 'Low'
  };
}


// ============================================================
// SECTION 4: RISK SCORE CALCULATION
// Calculate how likely a product is to be returned
// ============================================================

/**
 * calculateRiskScore(product, reviews, returns)
 * 
 * Generates a "Return Risk Score" for a product (0-100)
 * Higher score = higher chance of being returned
 * 
 * FACTORS CONSIDERED:
 * 1. Historical return rate (most important)
 * 2. Average review sentiment (negative = higher risk)
 * 3. Fake review percentage (more fakes = higher real risk)
 * 4. Issue severity from returns
 * 5. Recent trend (are returns increasing?)
 * 
 * @param {object} product - Product data with return_rate, avg_rating etc.
 * @param {Array} reviews - All reviews for this product
 * @param {Array} returns - All returns for this product
 * @returns {object} - { score, level, factors, recommendation }
 */
function calculateRiskScore(product, reviews, returns) {
  const factors = []; // Breakdown of what contributes to the score
  let totalScore = 0;

  // --- Factor 1: Historical Return Rate (40% weight) ---
  // This is the most direct indicator
  const returnRate = product.return_rate || 0;
  const returnRateScore = Math.min(returnRate * 2, 40); // Max 40 points
  totalScore += returnRateScore;
  factors.push({
    name: 'Historical Return Rate',
    value: `${returnRate}%`,
    contribution: Math.round(returnRateScore),
    maxPoints: 40,
    description: `Product has a ${returnRate}% return rate`
  });

  // --- Factor 2: Review Sentiment (20% weight) ---
  // Lots of negative reviews = higher risk
  let avgSentiment = 0;
  if (reviews && reviews.length > 0) {
    const sentiments = reviews.map(r => analyzeSentiment(r.review_text).score);
    avgSentiment = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
  }
  // Convert sentiment (-1 to 1) to risk contribution (0 to 20)
  // Negative sentiment = higher risk
  const sentimentScore = Math.max(0, Math.min(20, (1 - avgSentiment) * 10));
  totalScore += sentimentScore;
  factors.push({
    name: 'Review Sentiment',
    value: avgSentiment > 0 ? 'Mostly Positive' : avgSentiment < -0.3 ? 'Mostly Negative' : 'Mixed',
    contribution: Math.round(sentimentScore),
    maxPoints: 20,
    description: `Average sentiment score: ${avgSentiment.toFixed(2)}`
  });

  // --- Factor 3: Fake Review Impact (15% weight) ---
  // If product has many fake positive reviews, customers are being misled
  let fakeCount = 0;
  if (reviews && reviews.length > 0) {
    for (const review of reviews) {
      const fakeResult = detectFakeReview(review);
      if (fakeResult.isSuspicious) fakeCount++;
    }
  }
  const fakePercentage = reviews && reviews.length > 0 ? (fakeCount / reviews.length) * 100 : 0;
  const fakeScore = Math.min(fakePercentage, 15); // Max 15 points
  totalScore += fakeScore;
  factors.push({
    name: 'Fake Review Influence',
    value: `${fakeCount} suspicious reviews (${fakePercentage.toFixed(0)}%)`,
    contribution: Math.round(fakeScore),
    maxPoints: 15,
    description: fakeCount > 0 
      ? 'Fake reviews are inflating this product\'s perceived quality' 
      : 'No suspicious reviews detected'
  });

  // --- Factor 4: Issue Severity (15% weight) ---
  // Safety issues are more serious than cosmetic issues
  let maxSeverity = 0;
  if (returns && returns.length > 0) {
    for (const ret of returns) {
      const issues = extractIssues(ret.detailed_notes);
      for (const issue of issues) {
        if (issue.issue === 'safety_concern') maxSeverity = Math.max(maxSeverity, 15);
        else if (issue.issue === 'defective') maxSeverity = Math.max(maxSeverity, 12);
        else if (issue.issue === 'misleading_specs') maxSeverity = Math.max(maxSeverity, 10);
        else maxSeverity = Math.max(maxSeverity, 7);
      }
    }
  }
  totalScore += maxSeverity;
  factors.push({
    name: 'Issue Severity',
    value: maxSeverity >= 12 ? 'Critical' : maxSeverity >= 8 ? 'Moderate' : 'Low',
    contribution: Math.round(maxSeverity),
    maxPoints: 15,
    description: 'Based on the severity of reported issues (safety > defects > cosmetic)'
  });

  // --- Factor 5: Rating Gap (10% weight) ---
  // Big gap between expected rating (from reviews) and actual experience suggests misleading listing
  const ratingGap = (5 - (product.avg_rating || 3)) * 2; // Lower rating = higher risk
  const ratingScore = Math.min(Math.max(ratingGap, 0), 10);
  totalScore += ratingScore;
  factors.push({
    name: 'Rating Quality Gap',
    value: `${product.avg_rating || 0}/5 average rating`,
    contribution: Math.round(ratingScore),
    maxPoints: 10,
    description: 'Lower ratings indicate higher return risk'
  });

  // Cap total at 100
  totalScore = Math.min(Math.round(totalScore), 100);

  // Determine risk level
  let level, color, recommendation;
  if (totalScore >= 70) {
    level = 'High Risk';
    color = '#ff4757';
    recommendation = '⚠️ This product has a high probability of return. Consider purchasing alternatives with lower risk scores.';
  } else if (totalScore >= 40) {
    level = 'Medium Risk';
    color = '#ffa502';
    recommendation = '⚡ This product has some reported issues. Check reviews carefully before purchasing.';
  } else {
    level = 'Low Risk';
    color = '#2ed573';
    recommendation = '✅ This product has good satisfaction rates. Most customers are happy with their purchase.';
  }

  return {
    score: totalScore,
    level,
    color,
    recommendation,
    factors
  };
}


// ============================================================
// SECTION 5: ROOT CAUSE ANALYSIS
// Combine all data sources to explain WHY returns happen
// ============================================================

/**
 * generateRootCauseAnalysis(product, reviews, returns, tickets)
 * 
 * This is the CORE VALUE of our system.
 * Instead of just saying "17% return rate", we explain:
 * "Most returns are due to color mismatch (45%) and size issues (30%)"
 * 
 * It combines data from ALL sources:
 * - Reviews (what customers say publicly)
 * - Returns (what customers say when returning)
 * - Support tickets (what customers complain about)
 * 
 * @returns {object} - Complete root cause analysis with breakdowns
 */
function generateRootCauseAnalysis(product, reviews, returns, tickets) {
  // Count issues across all data sources
  const issueCounts = {};
  const allTexts = [];

  // Analyze return notes (most important source)
  if (returns) {
    for (const ret of returns) {
      allTexts.push(ret.detailed_notes);
      const issues = extractIssues(ret.detailed_notes);
      for (const issue of issues) {
        if (!issueCounts[issue.issue]) {
          issueCounts[issue.issue] = { count: 0, label: issue.label, icon: issue.icon, sources: [] };
        }
        issueCounts[issue.issue].count++;
        issueCounts[issue.issue].sources.push('return');
      }
    }
  }

  // Analyze negative reviews (rating <= 3)
  if (reviews) {
    const negativeReviews = reviews.filter(r => r.rating <= 3);
    for (const rev of negativeReviews) {
      allTexts.push(rev.review_text);
      const issues = extractIssues(rev.review_text);
      for (const issue of issues) {
        if (!issueCounts[issue.issue]) {
          issueCounts[issue.issue] = { count: 0, label: issue.label, icon: issue.icon, sources: [] };
        }
        issueCounts[issue.issue].count++;
        issueCounts[issue.issue].sources.push('review');
      }
    }
  }

  // Analyze support tickets
  if (tickets) {
    for (const ticket of tickets) {
      allTexts.push(ticket.message);
      const issues = extractIssues(ticket.message);
      for (const issue of issues) {
        if (!issueCounts[issue.issue]) {
          issueCounts[issue.issue] = { count: 0, label: issue.label, icon: issue.icon, sources: [] };
        }
        issueCounts[issue.issue].count++;
        issueCounts[issue.issue].sources.push('support');
      }
    }
  }

  // Calculate percentages and sort by frequency
  const totalMentions = Object.values(issueCounts).reduce((sum, i) => sum + i.count, 0);
  const issueBreakdown = Object.entries(issueCounts)
    .map(([key, value]) => ({
      issue: key,
      label: value.label,
      icon: value.icon,
      count: value.count,
      percentage: totalMentions > 0 ? Math.round((value.count / totalMentions) * 100) : 0,
      dataSources: [...new Set(value.sources)] // unique sources
    }))
    .sort((a, b) => b.count - a.count);

  // Generate human-readable summary
  let summary = '';
  if (issueBreakdown.length > 0) {
    const topIssue = issueBreakdown[0];
    summary = `Most returns for "${product.name}" are caused by ${topIssue.label.toLowerCase()} (${topIssue.percentage}% of all reported issues).`;
    if (issueBreakdown.length > 1) {
      summary += ` This is followed by ${issueBreakdown[1].label.toLowerCase()} (${issueBreakdown[1].percentage}%).`;
    }
  } else {
    summary = `Insufficient data to determine root causes for "${product.name}".`;
  }

  // Generate actionable recommendations
  const recommendations = generateRecommendations(issueBreakdown, product);

  return {
    productId: product.id,
    productName: product.name,
    summary,
    issueBreakdown,
    totalDataPointsAnalyzed: allTexts.length,
    recommendations,
    analysisTimestamp: new Date().toISOString()
  };
}


// ============================================================
// SECTION 6: SMART RECOMMENDATIONS
// Suggest improvements based on identified issues
// ============================================================

/**
 * generateRecommendations(issues, product)
 * 
 * Based on the issues found, suggest specific actions
 * for both the BUSINESS and the CUSTOMER
 */
function generateRecommendations(issues, product) {
  const businessRecs = [];  // Recommendations for the seller/business
  const customerRecs = [];  // Recommendations for the buyer/customer

  for (const issue of issues) {
    switch (issue.issue) {
      case 'color_mismatch':
        businessRecs.push('📸 Update product photos to show accurate colors under natural lighting');
        businessRecs.push('🏷️ Add color disclaimer: "Colors may vary slightly from screen display"');
        customerRecs.push('🔍 Read recent reviews about color accuracy before purchasing');
        break;

      case 'size_mismatch':
        businessRecs.push('📏 Revise size chart based on actual customer measurements');
        businessRecs.push('📝 Add detailed measurement guide with body type recommendations');
        customerRecs.push('📐 Check the size chart carefully and order based on your measurements, not usual size');
        break;

      case 'quality_poor':
        businessRecs.push('🔍 Implement stricter quality control in manufacturing');
        businessRecs.push('🧪 Conduct durability testing before listing products');
        customerRecs.push('⚠️ Check low-star reviews for quality complaints before buying');
        break;

      case 'defective':
        businessRecs.push('🏭 Review manufacturing process for defects');
        businessRecs.push('✅ Add pre-shipment quality inspection');
        customerRecs.push('📋 Test product immediately upon delivery and report issues within return window');
        break;

      case 'misleading_specs':
        businessRecs.push('📝 Update product listing to match actual specifications');
        businessRecs.push('⚖️ Conduct independent testing to verify advertised claims');
        customerRecs.push('🔬 Cross-reference specs with independent reviews before purchasing');
        break;

      case 'material_quality':
        businessRecs.push('🏷️ Accurately label all materials and fabric composition');
        businessRecs.push('🔄 Source higher quality materials or adjust pricing accordingly');
        customerRecs.push('🧵 Look for verified purchase reviews that discuss material feel and quality');
        break;

      case 'safety_concern':
        businessRecs.push('🚨 URGENT: Address safety issues immediately — potential liability');
        businessRecs.push('🔒 Conduct safety audit and consider product recall if needed');
        customerRecs.push('⛔ Exercise extreme caution. Multiple safety issues reported.');
        break;

      case 'software_issue':
        businessRecs.push('💻 Release software/firmware update to fix reported bugs');
        businessRecs.push('📱 Improve app stability and compatibility testing');
        customerRecs.push('🔄 Check if firmware/app updates are available before purchasing');
        break;

      case 'sensor_inaccurate':
        businessRecs.push('🔧 Recalibrate sensors and update accuracy claims');
        businessRecs.push('📊 Add accuracy tolerance ranges to product listing');
        customerRecs.push('📈 Be aware that sensor accuracy may not match advertised specs');
        break;
    }
  }

  // Remove duplicates
  return {
    forBusiness: [...new Set(businessRecs)],
    forCustomer: [...new Set(customerRecs)]
  };
}


// ============================================================
// EXPORT everything so other files can use these functions
// ============================================================
module.exports = {
  extractIssues,
  analyzeSentiment,
  detectFakeReview,
  calculateRiskScore,
  generateRootCauseAnalysis,
  ISSUE_KEYWORDS
};
const express = require('express');
const cors = require('cors');
require('./load-env');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
