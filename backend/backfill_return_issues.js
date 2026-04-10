require('./load-env.js');
const db = require('./db');
const { extractIssues, ISSUE_KEYWORDS } = require('./nlp-engine');

const ISSUE_REASON_PATTERNS = [
  { issue: 'color_mismatch', patterns: ['color mismatch', 'wrong color', 'different color', 'shade mismatch'] },
  { issue: 'size_mismatch', patterns: ['wrong size', 'size issue', 'wrong fit', 'fit issue', 'too small', 'too large', 'not comfortable'] },
  { issue: 'connectivity_issue', patterns: ['connectivity issue', 'connection issue', 'pairing issue', 'bluetooth issue', 'wifi issue'] },
  { issue: 'software_issue', patterns: ['app issue', 'app issues', 'software issue', 'software bug', 'firmware issue'] },
  { issue: 'safety_concern', patterns: ['safety concern', 'skin reaction', 'adverse reaction', 'allergic reaction', 'unsafe'] },
  { issue: 'shipping_damage', patterns: ['damaged in transit', 'damaged delivery', 'shipping damage', 'packaging issue'] },
  { issue: 'misleading_specs', patterns: ['not as described', 'not as expected', 'fake product', 'incomplete/wrong'] },
  { issue: 'defective', patterns: ['product malfunction', 'defective product', 'defective', 'damaged product'] },
  { issue: 'quality_poor', patterns: ['quality issue', 'poor quality'] },
];

const GENERIC_ISSUE_KEYS = new Set(['quality_poor', 'defective']);

function inferIssueFromReason(returnReason = '') {
  const lowerReason = String(returnReason).toLowerCase().trim();
  if (!lowerReason) return null;

  const matchedRule = ISSUE_REASON_PATTERNS.find((rule) =>
    rule.patterns.some((pattern) => lowerReason.includes(pattern))
  );

  return matchedRule ? matchedRule.issue : null;
}

function inferIssueKey(returnRecord) {
  const reasonIssue = inferIssueFromReason(returnRecord.return_reason);
  if (reasonIssue && !GENERIC_ISSUE_KEYS.has(reasonIssue)) {
    return reasonIssue;
  }

  const text = `${returnRecord.return_reason || ''} ${returnRecord.detailed_notes || ''}`.trim();
  const detected = extractIssues(text);
  const specificDetected = detected.find((issue) => !GENERIC_ISSUE_KEYS.has(issue.issue));
  if (specificDetected) return specificDetected.issue;

  if (reasonIssue) return reasonIssue;

  if (returnRecord.ai_extracted_issue && ISSUE_KEYWORDS[returnRecord.ai_extracted_issue]) {
    return returnRecord.ai_extracted_issue;
  }

  if (detected.length > 0) return detected[0].issue;

  const lowerText = text.toLowerCase();
  for (const [issueKey, issueData] of Object.entries(ISSUE_KEYWORDS)) {
    if (issueData.keywords.some((keyword) => lowerText.includes(keyword.toLowerCase()))) {
      return issueKey;
    }
  }

  return null;
}

async function backfillReturnIssues() {
  try {
    const [returns] = await db.query(`
      SELECT id, return_reason, detailed_notes, ai_extracted_issue
      FROM returns
    `);

    let updatedCount = 0;

    for (const ret of returns) {
      const inferredIssue = inferIssueKey(ret);
      if (!inferredIssue || inferredIssue === ret.ai_extracted_issue) continue;

      await db.query(
        'UPDATE returns SET ai_extracted_issue = ? WHERE id = ?',
        [inferredIssue, ret.id]
      );
      updatedCount++;
    }

    console.log(`Normalization complete. Updated ${updatedCount} return rows.`);
    process.exit(0);
  } catch (error) {
    console.error('Backfill failed:', error);
    process.exit(1);
  }
}

backfillReturnIssues();
