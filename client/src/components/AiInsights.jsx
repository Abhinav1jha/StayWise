import { useState, useEffect } from 'react';
import api from '../services/api';
import './AiInsights.css';

function AiInsights({ hostelId }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/hostels/${hostelId}/ai-insights`);
        setInsights(data.data);
      } catch (err) {
        const msg = err.response?.data?.message || '';
        if (err.response?.status === 404) {
          setInsights(null); // No analyzed reviews
        } else {
          setError(msg || 'Failed to load AI insights');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, [hostelId]);

  if (loading) return <div className="ai-insights-box"><p className="ai-loading">Loading AI insights...</p></div>;
  if (error) return <div className="ai-insights-box"><p className="ai-error-msg">{error}</p></div>;
  if (!insights) return <div className="ai-insights-box"><p className="ai-none">No AI insights available yet. Reviews need to be analyzed first.</p></div>;

  const sentimentColor = insights.overallSentiment === 'positive' ? '#16a34a'
    : insights.overallSentiment === 'negative' ? '#dc2626' : '#d97706';

  return (
    <div className="ai-insights-box">
      <div className="ai-insights-header">
        <h3>🤖 Community AI Insights</h3>
        <span className="ai-reviewed">{insights.reviewsAnalyzed} reviews analyzed</span>
      </div>
      <div className="ai-overall">
        <span>Overall Sentiment: </span>
        <strong style={{ color: sentimentColor, textTransform: 'capitalize' }}>
          {insights.overallSentiment}
        </strong>
      </div>
      <p className="ai-insights-summary">{insights.summary}</p>

      <div className="ai-lists">
        {insights.strengths?.length > 0 && (
          <div className="ai-list">
            <h4>💪 Strengths</h4>
            <ul>{insights.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </div>
        )}
        {insights.concerns?.length > 0 && (
          <div className="ai-list">
            <h4>⚠️ Concerns</h4>
            <ul>{insights.concerns.map((c, i) => <li key={i}>{c}</li>)}</ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default AiInsights;
