/**
 * StayWise Recommendation Scoring Engine
 *
 * Scoring formula:
 *   1. Normalize each user preference weight so they sum to 1.
 *   2. For each hostel, compute a 0–1 score per criterion:
 *      - budget:      scored against user's maxBudget preference
 *      - cleanliness: hostel rating / 5
 *      - location:    hostel rating / 5
 *      - food:        hostel rating / 5
 *      - safety:      hostel rating / 5
 *   3. matchScore = sum(normalizedWeight_i × criterionScore_i) × 100
 *   4. Generate a human-readable explanation of the strongest weighted factors.
 */

const CRITERIA = [
  { key: 'budget',      prefKey: 'budgetPriority',      label: 'Budget' },
  { key: 'cleanliness', prefKey: 'cleanlinessPriority',  label: 'Cleanliness' },
  { key: 'location',    prefKey: 'locationPriority',     label: 'Location' },
  { key: 'food',        prefKey: 'foodPriority',         label: 'Food' },
  { key: 'safety',      prefKey: 'safetyPriority',       label: 'Safety' },
];

/**
 * Compute budget score against the user's preferred max budget.
 *
 * - rent <= maxBudget:  score = 1 - (rent / maxBudget) * 0.3
 *     → ranges from 1.0 (free) to 0.7 (exactly at budget). Cheap hostels
 *       score higher, but hitting the budget still gives a strong 0.7.
 *
 * - rent > maxBudget:   score = 0.7 * (maxBudget / rent)
 *     → progressively decays toward 0 as rent exceeds budget.
 *       At 2× budget → 0.35, at 3× → ~0.23, never negative.
 *
 * @param {number} rent      - Hostel's monthly rent
 * @param {number} maxBudget - User's preferred maximum budget
 * @returns {number} 0–1 score
 */
function computeBudgetScore(rent, maxBudget) {
  if (maxBudget <= 0) return rent === 0 ? 1 : 0;
  if (rent <= 0) return 1;

  if (rent <= maxBudget) {
    // Within budget: 0.7 to 1.0 (cheaper is better)
    return 1 - (rent / maxBudget) * 0.3;
  }
  // Over budget: smooth decay from 0.7 toward 0
  return 0.7 * (maxBudget / rent);
}

/**
 * Normalize user preference weights so they sum to 1.
 * If all weights are 0, distribute equally.
 */
function normalizeWeights(preferences) {
  const weights = CRITERIA.map((c) => preferences[c.prefKey] ?? 5);
  const total = weights.reduce((sum, w) => sum + w, 0);

  if (total === 0) {
    const equal = 1 / CRITERIA.length;
    return CRITERIA.map(() => equal);
  }

  return weights.map((w) => w / total);
}

/**
 * Score and rank hostels for a user.
 *
 * @param {Array} hostels  - Array of Hostel documents (with ratings and pricing)
 * @param {Object} preferences - User.preferences object
 * @returns {Array} Sorted array of { hostel, matchScore, explanation }
 */
export function scoreHostels(hostels, preferences) {
  if (hostels.length === 0) return [];

  const maxBudget = preferences.maxBudget ?? 10000;
  const normalizedWeights = normalizeWeights(preferences);

  const scored = hostels.map((hostel) => {
    const rent = hostel.pricing?.monthlyRent ?? 0;
    const ratings = hostel.ratings || {};

    // Compute raw 0–1 scores per criterion
    const criterionScores = {
      budget:      computeBudgetScore(rent, maxBudget),
      cleanliness: (ratings.cleanliness || 0) / 5,
      location:    (ratings.location || 0) / 5,
      food:        (ratings.food || 0) / 5,
      safety:      (ratings.safety || 0) / 5,
    };

    // Weighted sum → 0–100
    let matchScore = 0;
    const contributions = [];

    CRITERIA.forEach((criterion, i) => {
      const weight = normalizedWeights[i];
      const score = criterionScores[criterion.key];
      const contribution = weight * score;
      matchScore += contribution;

      contributions.push({
        label: criterion.label,
        score: Math.round(score * 100),
        weight: Math.round(weight * 100),
        contribution: Math.round(contribution * 100),
      });
    });

    matchScore = Math.round(matchScore * 100);

    // Build explanation from top weighted contributions
    contributions.sort((a, b) => b.contribution - a.contribution);
    const topFactors = contributions.slice(0, 3).filter((c) => c.contribution > 0);
    const explanation = topFactors.length > 0
      ? topFactors.map((f) => `${f.label}: ${f.contribution}pts (${f.score}% score × ${f.weight}% weight)`).join(', ')
      : 'No rating data available yet';

    return {
      hostel,
      matchScore,
      explanation,
    };
  });

  // Sort by matchScore descending
  scored.sort((a, b) => b.matchScore - a.matchScore);

  return scored;
}
