import { GoogleGenAI } from '@google/genai';
import env from '../config/env.js';
import Review from '../models/Review.js';

const VALID_SENTIMENTS = ['positive', 'neutral', 'negative'];

/**
 * Generate hostel-level AI insights from already-analyzed reviews.
 *
 * Flow:
 *   1. Fetch reviews with aiAnalysis for the hostel
 *   2. Aggregate aspect sentiments locally (counts per topic)
 *   3. Send aggregated data to Gemini for a concise community summary
 *   4. Validate/normalize the response
 *
 * @param {string} hostelId
 * @returns {Object} { overallSentiment, summary, strengths, concerns, reviewsAnalyzed }
 */
export async function generateHostelInsights(hostelId) {
  if (!env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  // 1. Fetch analyzed reviews
  const reviews = await Review.find({
    hostel: hostelId,
    'aiAnalysis.analyzedAt': { $exists: true },
  }).select('aiAnalysis');

  if (reviews.length === 0) {
    return null; // No analyzed reviews — caller handles this
  }

  // 2. Aggregate locally to avoid sending raw reviews to AI
  const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
  const aspectMap = {}; // topic → { positive, neutral, negative }

  for (const review of reviews) {
    const { sentiment, aspects } = review.aiAnalysis;

    if (VALID_SENTIMENTS.includes(sentiment)) {
      sentimentCounts[sentiment]++;
    }

    if (Array.isArray(aspects)) {
      for (const { topic, sentiment: aspSentiment } of aspects) {
        if (!aspectMap[topic]) {
          aspectMap[topic] = { positive: 0, neutral: 0, negative: 0 };
        }
        if (VALID_SENTIMENTS.includes(aspSentiment)) {
          aspectMap[topic][aspSentiment]++;
        }
      }
    }
  }

  // 3. Build aggregated data summary for Gemini
  // Filter out aspects with fewer than 2 total mentions
  const MIN_MENTIONS = 2;
  const aggregatedData = {
    totalReviews: reviews.length,
    overallSentiment: sentimentCounts,
    aspects: Object.entries(aspectMap)
      .filter(([, counts]) => counts.positive + counts.neutral + counts.negative >= MIN_MENTIONS)
      .map(([topic, counts]) => ({
        topic,
        ...counts,
      })),
  };

  // 4. Call Gemini with aggregated data (not raw reviews)
  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

  const prompt = `You are a hostel/PG review insights assistant for a student accommodation platform in India.

Given the following aggregated review analysis data from ${reviews.length} student reviews, generate a concise community insights summary.

Aggregated data:
${JSON.stringify(aggregatedData, null, 2)}

Return a JSON object with:
1. "overallSentiment": one of "positive", "neutral", or "negative" — the dominant community sentiment.
2. "summary": a concise 2-3 sentence community summary (max 300 characters). Write naturally, as if describing what students generally feel about this hostel.
3. "strengths": array of strings — the top positive aspects mentioned by multiple reviewers. Each string should be a short phrase (e.g. "Clean rooms", "Helpful staff"). Max 5 items. Only include if there is real evidence.
4. "concerns": array of strings — the top negative aspects or common complaints. Same format. Max 5 items. Only include if there is real evidence.

Do not invent strengths or concerns that are not supported by the data. If an aspect has very few mentions, do not include it.

Return ONLY the raw JSON object. No markdown, no explanation, no code fences.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-lite',
    contents: prompt,
  });

  const text = response.text.trim();

  let parsed;
  try {
    const cleaned = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('AI returned invalid JSON response');
  }

  return validateInsights(parsed, reviews.length);
}

/**
 * Validate and normalize hostel insights before returning.
 */
function validateInsights(raw, reviewsAnalyzed) {
  const overallSentiment = VALID_SENTIMENTS.includes(raw.overallSentiment)
    ? raw.overallSentiment
    : 'neutral';

  const summary = typeof raw.summary === 'string'
    ? raw.summary.slice(0, 500)
    : 'Insights generated from community reviews';

  const strengths = Array.isArray(raw.strengths)
    ? raw.strengths.filter((s) => typeof s === 'string').slice(0, 5)
    : [];

  const concerns = Array.isArray(raw.concerns)
    ? raw.concerns.filter((s) => typeof s === 'string').slice(0, 5)
    : [];

  return {
    overallSentiment,
    summary,
    strengths,
    concerns,
    reviewsAnalyzed,
  };
}
