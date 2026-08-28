import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyzeReview } from '../services/reviewService';
import './ReviewCard.css';

function ReviewCard({ review, onAnalyzed }) {
  const { user } = useAuth();
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState('');

  const isOwner = user && review.user?._id === user._id;
  const ai = review.aiAnalysis;
  const hasAi = ai && ai.analyzedAt;
  const date = new Date(review.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setAnalyzeError('');
    try {
      const result = await analyzeReview(review._id);
      if (onAnalyzed) onAnalyzed(result.data);
    } catch (err) {
      setAnalyzeError(err.response?.data?.message || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const sentimentColor = (s) =>
    s === 'positive' ? '#16a34a' : s === 'negative' ? '#dc2626' : '#d97706';

  return (
    <div className="review-card">
      <div className="review-header">
        <strong className="reviewer-name">{review.user?.name || 'Student'}</strong>
        <span className="review-date">{date}</span>
      </div>

      <div className="review-ratings-mini">
        {Object.entries(review.ratings || {}).map(([key, val]) => (
          <span key={key} className="mini-rating" title={key}>
            {key.slice(0, 3)}: <strong>{val}</strong>
          </span>
        ))}
      </div>

      <p className="review-text">{review.text}</p>

      {/* AI Analysis */}
      {hasAi && (
        <div className="review-ai">
          <div className="ai-badge">
            <span className="ai-label">AI Analysis</span>
            <span className="ai-sentiment" style={{ color: sentimentColor(ai.sentiment) }}>
              {ai.sentiment}
            </span>
          </div>
          <p className="ai-summary">{ai.summary}</p>
          {ai.aspects?.length > 0 && (
            <div className="ai-aspects">
              {ai.aspects.map((a, i) => (
                <span key={i} className="aspect-chip" style={{ borderColor: sentimentColor(a.sentiment) }}>
                  {a.topic}
                  <span style={{ color: sentimentColor(a.sentiment) }}> {a.sentiment}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Analyze button (owner only, no existing analysis) */}
      {isOwner && !hasAi && (
        <div className="review-actions">
          <button className="analyze-btn" onClick={handleAnalyze} disabled={analyzing}>
            {analyzing ? 'Analyzing...' : '🤖 Analyze with AI'}
          </button>
          {analyzeError && <span className="analyze-error">{analyzeError}</span>}
        </div>
      )}
    </div>
  );
}

export default ReviewCard;
