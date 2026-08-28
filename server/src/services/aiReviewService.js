import { GoogleGenAI } from '@google/genai';
import env from '../config/env.js';

const VALID_SENTIMENTS = ['positive', 'neutral', 'negative'];
const VALID_TOPICS = ['food', 'cleanliness', 'location', 'safety', 'staff', 'rooms', 'amenities'];

/**
 * Analyze a review's text using Google Gemini.
 * Returns validated, structured analysis ready for MongoDB storage.
 *
 * @param {string} reviewText - The review text to analyze
 * @returns {Object} { sentiment, summary, aspects, analyzedAt }
 */
export async function analyzeReview(reviewText) {
  if (!env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

  const prompt = `You are a review analysis assistant for a hostel/PG comparison platform used by students in India.

Analyze the following hostel review and return a JSON object with:

1. "sentiment": one of "positive", "neutral", or "negative" — the overall tone of the review.
2. "summary": a concise 1-2 sentence summary of the review (max 200 characters).
3. "aspects": an array of objects, each with:
   - "topic": one of "food", "cleanliness", "location", "safety", "staff", "rooms", "amenities"
   - "sentiment": one of "positive", "neutral", "negative"
   Only include aspects that are actually mentioned in the review. Do not invent aspects.

Return ONLY the raw JSON object. No markdown, no explanation, no code fences.

Review:
"""
${reviewText}
"""`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-lite',
    contents: prompt,
  });

  const text = response.text.trim();

  // Parse and validate the AI response
  let parsed;
  try {
    // Strip markdown code fences if present
    const cleaned = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('AI returned invalid JSON response');
  }

  return validateAnalysis(parsed);
}

/**
 * Validate and normalize AI analysis before MongoDB storage.
 * Never store arbitrary AI output directly.
 */
function validateAnalysis(raw) {
  // Validate sentiment
  const sentiment = VALID_SENTIMENTS.includes(raw.sentiment) ? raw.sentiment : 'neutral';

  // Validate summary
  const summary = typeof raw.summary === 'string'
    ? raw.summary.slice(0, 500)
    : 'Analysis completed';

  // Validate aspects
  const aspects = [];
  if (Array.isArray(raw.aspects)) {
    for (const aspect of raw.aspects) {
      if (
        aspect &&
        typeof aspect.topic === 'string' &&
        VALID_TOPICS.includes(aspect.topic.toLowerCase()) &&
        VALID_SENTIMENTS.includes(aspect.sentiment)
      ) {
        aspects.push({
          topic: aspect.topic.toLowerCase(),
          sentiment: aspect.sentiment,
        });
      }
    }
  }

  return {
    sentiment,
    summary,
    aspects,
    analyzedAt: new Date(),
  };
}
