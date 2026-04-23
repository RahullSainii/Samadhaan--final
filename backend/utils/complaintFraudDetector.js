const ABUSIVE_TERMS = [
  'idiot',
  'stupid',
  'useless',
  'hate you',
  'shut up',
  'fool',
  'moron',
  'bastard',
  'damn you',
  'abuse',
];

const SPAM_PHRASES = [
  'click here',
  'buy now',
  'urgent offer',
  'free money',
  'subscribe now',
  'visit this link',
  'promo code',
];

const LOW_SIGNAL_TERMS = [
  'test',
  'hello',
  'hi',
  'problem',
  'issue',
  'complaint',
  'random',
];

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(value) {
  return normalizeText(value)
    .split(' ')
    .filter((token) => token.length > 1);
}

function getTokenSet(value) {
  return new Set(tokenize(value));
}

function jaccardSimilarity(a, b) {
  if (!a.size || !b.size) return 0;

  let intersection = 0;
  for (const item of a) {
    if (b.has(item)) intersection += 1;
  }

  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function analyzeComplaintSubmission({
  category,
  description,
  location,
  attachments = [],
  recentComplaints = [],
}) {
  const combinedText = `${location || ''} ${description || ''}`.trim();
  const normalizedCombinedText = normalizeText(combinedText);
  const tokens = tokenize(combinedText);
  const tokenSet = new Set(tokens);

  let spamScore = 0;
  let abusiveScore = 0;
  let duplicateScore = 0;
  const reasons = [];
  const duplicateComplaintIds = [];

  const upperChars = (combinedText.match(/[A-Z]/g) || []).length;
  const alphaChars = (combinedText.match(/[A-Za-z]/g) || []).length;
  const uppercaseRatio = alphaChars ? upperChars / alphaChars : 0;

  if (uppercaseRatio > 0.65 && combinedText.length > 20) {
    spamScore += 20;
    reasons.push('Excessive use of uppercase text');
  }

  if (/(.)\1{5,}/.test(combinedText)) {
    spamScore += 20;
    reasons.push('Repeated characters detected');
  }

  if (/!{4,}|\?{4,}/.test(combinedText)) {
    spamScore += 10;
    reasons.push('Excessive punctuation detected');
  }

  if (/https?:\/\//i.test(combinedText) || /www\./i.test(combinedText)) {
    spamScore += 25;
    reasons.push('Contains external links');
  }

  for (const phrase of SPAM_PHRASES) {
    if (normalizedCombinedText.includes(phrase)) {
      spamScore += 25;
      reasons.push(`Contains spam phrase: "${phrase}"`);
    }
  }

  for (const term of ABUSIVE_TERMS) {
    if (normalizedCombinedText.includes(term)) {
      abusiveScore += 25;
      reasons.push(`Abusive language detected: "${term}"`);
    }
  }

  const uniqueTokens = new Set(tokens);
  if (tokens.length > 8 && uniqueTokens.size / tokens.length < 0.45) {
    spamScore += 20;
    reasons.push('Highly repetitive text pattern detected');
  }

  if (tokens.length <= 3 || LOW_SIGNAL_TERMS.includes(normalizedCombinedText)) {
    spamScore += 20;
    reasons.push('Complaint description is too low-detail');
  }

  if (attachments.length === 0 && (!location || location.trim().length < 3)) {
    spamScore += 10;
    reasons.push('Missing supporting detail such as location or attachment');
  }

  for (const complaint of recentComplaints) {
    const candidateText = `${complaint.location || ''} ${complaint.description || ''}`.trim();
    const similarity = jaccardSimilarity(tokenSet, getTokenSet(candidateText));
    const sameCategory = complaint.category === category;
    const exactTextMatch =
      normalizedCombinedText.length > 0 &&
      normalizeText(candidateText) === normalizedCombinedText;

    if (exactTextMatch && sameCategory) {
      duplicateScore = Math.max(duplicateScore, 100);
      duplicateComplaintIds.push(String(complaint._id));
      reasons.push('Exact duplicate of an existing complaint');
      continue;
    }

    if (similarity >= 0.85 && sameCategory) {
      duplicateScore = Math.max(duplicateScore, 90);
      duplicateComplaintIds.push(String(complaint._id));
      reasons.push('Very similar to an existing complaint');
      continue;
    }

    if (similarity >= 0.7 && sameCategory) {
      duplicateScore = Math.max(duplicateScore, 70);
      duplicateComplaintIds.push(String(complaint._id));
      reasons.push('Potential duplicate complaint');
    }
  }

  const dedupedReasons = [...new Set(reasons)];
  const status =
    abusiveScore >= 60 || spamScore >= 70 || duplicateScore >= 95
      ? 'blocked'
      : abusiveScore >= 25 || spamScore >= 40 || duplicateScore >= 70
        ? 'flagged'
        : 'clean';

  return {
    status,
    spamScore: clampScore(spamScore),
    abusiveScore: clampScore(abusiveScore),
    duplicateScore: clampScore(duplicateScore),
    reasons: dedupedReasons,
    duplicateComplaintIds: [...new Set(duplicateComplaintIds)],
    detectedAt: new Date(),
  };
}

module.exports = {
  analyzeComplaintSubmission,
};
