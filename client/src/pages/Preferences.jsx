import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Preferences.css';

const PRIORITIES = [
  { key: 'budgetPriority', label: 'Budget', desc: 'How important is staying within your budget?' },
  { key: 'cleanlinessPriority', label: 'Cleanliness', desc: 'How important are clean rooms and bathrooms?' },
  { key: 'locationPriority', label: 'Location', desc: 'How important is proximity to campus or transit?' },
  { key: 'foodPriority', label: 'Food', desc: 'How important is meal quality?' },
  { key: 'safetyPriority', label: 'Safety', desc: 'How important are security measures?' },
];

function Preferences() {
  const [prefs, setPrefs] = useState({
    budgetPriority: 5, cleanlinessPriority: 5, locationPriority: 5,
    foodPriority: 5, safetyPriority: 5, maxBudget: 10000,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const { data } = await api.get('/auth/preferences');
        setPrefs(data.data || {});
      } catch {
        setError('Failed to load preferences');
      } finally {
        setLoading(false);
      }
    };
    fetchPrefs();
  }, []);

  const handleSlider = (key, value) => {
    setPrefs(prev => ({ ...prev, [key]: Number(value) }));
    setSuccess('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await api.put('/auth/preferences', prefs);
      setPrefs(data.data || prefs);
      setSuccess('Preferences saved');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page"><p>Loading preferences...</p></div>;

  return (
    <div className="preferences-page">
      <div className="pref-header">
        <div>
          <h1>Your Preferences</h1>
          <p className="pref-sub">Adjust your priorities to get better recommendations.</p>
        </div>
        <Link to="/recommendations" className="btn btn-secondary btn-sm">View recommendations</Link>
      </div>

      {error && <p className="pref-error">{error}</p>}
      {success && <p className="pref-success">{success}</p>}

      <div className="pref-card">
        <h2>Priority Weights</h2>
        <p className="pref-hint">0 = not important, 10 = most important</p>

        {PRIORITIES.map(({ key, label, desc }) => (
          <div key={key} className="pref-slider-group">
            <div className="pref-slider-header">
              <label>{label}</label>
              <span className="pref-val">{prefs[key] ?? 5}</span>
            </div>
            <p className="pref-desc">{desc}</p>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={prefs[key] ?? 5}
              onChange={(e) => handleSlider(key, e.target.value)}
              className="pref-range"
            />
            <div className="pref-range-labels">
              <span>0</span><span>5</span><span>10</span>
            </div>
          </div>
        ))}
      </div>

      <div className="pref-card">
        <h2>Budget</h2>
        <div className="pref-budget-group">
          <label>Maximum monthly rent (₹)</label>
          <input
            type="number"
            min="0"
            step="500"
            value={prefs.maxBudget ?? 10000}
            onChange={(e) => handleSlider('maxBudget', e.target.value)}
            className="pref-budget-input"
          />
        </div>
      </div>

      <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save preferences'}
      </button>
    </div>
  );
}

export default Preferences;
