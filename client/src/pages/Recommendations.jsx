import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import HostelCard from '../components/HostelCard';
import './Recommendations.css';

function Recommendations() {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const { data } = await api.get('/recommendations');
        setRecs(data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, []);

  return (
    <div className="recs-page">
      <div className="recs-header">
        <div>
          <h1>For You</h1>
          <p className="recs-sub">Hostels ranked by your preferences</p>
        </div>
        <Link to="/preferences" className="btn btn-secondary btn-sm">Edit preferences</Link>
      </div>

      {loading && <p className="recs-loading">Finding your best matches...</p>}
      {error && <p className="recs-error">{error}</p>}

      {!loading && !error && recs.length === 0 && (
        <div className="recs-empty">
          <p>No recommendations yet.</p>
          <p className="recs-hint">Make sure hostels exist and your <Link to="/preferences">preferences</Link> are set.</p>
        </div>
      )}

      {!loading && !error && recs.length > 0 && (
        <div className="recs-list">
          {recs.map((rec, i) => (
            <div key={rec.hostel._id} className="rec-item">
              <div className="rec-rank">#{i + 1}</div>
              <div className="rec-card-wrap">
                <HostelCard hostel={{ ...rec.hostel, matchScore: rec.matchScore }} />
              </div>
              <div className="rec-meta">
                <div className="rec-score-box">
                  <span className="rec-score">{rec.matchScore}%</span>
                  <span className="rec-score-label">match</span>
                </div>
                {rec.explanation && (
                  <div className="rec-explain">
                    <span className="rec-explain-title">Why this matches you</span>
                    <p>{rec.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Recommendations;
