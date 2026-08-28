import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { formatRupees } from '../utils/helpers';
import './Compare.css';

const RATING_CATS = [
  { key: 'overall', label: 'Overall' },
  { key: 'cleanliness', label: 'Cleanliness' },
  { key: 'food', label: 'Food' },
  { key: 'location', label: 'Location' },
  { key: 'safety', label: 'Safety' },
  { key: 'staff', label: 'Staff' },
  { key: 'valueForMoney', label: 'Value for Money' },
];

function Compare() {
  const [ids, setIds] = useState(() => JSON.parse(sessionStorage.getItem('compareIds') || '[]'));
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const syncIds = (newIds) => {
    setIds(newIds);
    sessionStorage.setItem('compareIds', JSON.stringify(newIds));
  };

  const fetchComparison = useCallback(async () => {
    if (ids.length < 2) { setHostels([]); return; }
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/hostels/compare', { params: { ids: ids.join(',') } });
      setHostels(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load comparison');
    } finally {
      setLoading(false);
    }
  }, [ids]);

  useEffect(() => { fetchComparison(); }, [fetchComparison]);

  const removeHostel = (removeId) => {
    syncIds(ids.filter((id) => id !== removeId));
  };

  const clearAll = () => {
    syncIds([]);
    setHostels([]);
  };

  // Helpers
  const bestVal = (getter, mode = 'max') => {
    const vals = hostels.map(getter).filter((v) => v != null && v > 0);
    if (vals.length === 0) return null;
    return mode === 'max' ? Math.max(...vals) : Math.min(...vals);
  };

  const cellClass = (val, best) => {
    if (val == null || best == null || val === 0) return '';
    return val === best ? 'cell-best' : '';
  };

  if (ids.length < 2) {
    return (
      <div className="compare-page">
        <h1>Compare Hostels</h1>
        <div className="compare-empty">
          <p>Select at least 2 hostels to compare.</p>
          {ids.length === 1 && <p className="compare-hint">You have 1 hostel selected. Add one more from the hostel detail page.</p>}
          <Link to="/hostels" className="compare-back">← Browse Hostels</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="compare-page">
      <div className="compare-header">
        <h1>Compare Hostels</h1>
        <div className="compare-actions">
          <button className="cmp-clear" onClick={clearAll}>Clear All</button>
          <Link to="/hostels" className="cmp-back">← Back to Hostels</Link>
        </div>
      </div>

      {loading && <p className="compare-loading">Loading comparison...</p>}
      {error && <p className="compare-error">{error}</p>}

      {!loading && !error && hostels.length >= 2 && (
        <div className="compare-scroll">
          <table className="compare-table">
            <thead>
              <tr>
                <th className="row-label"></th>
                {hostels.map((h) => (
                  <th key={h._id} className="hostel-col-head">
                    <Link to={`/hostels/${h._id}`} className="cmp-name">{h.name}</Link>
                    <button className="cmp-remove" onClick={() => removeHostel(h._id)} title="Remove">✕</button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Type */}
              <tr>
                <td className="row-label">Type</td>
                {hostels.map((h) => <td key={h._id} className="cmp-cell">{h.type?.toUpperCase()}</td>)}
              </tr>

              {/* Location */}
              <tr>
                <td className="row-label">Location</td>
                {hostels.map((h) => (
                  <td key={h._id} className="cmp-cell cmp-location">
                    {[h.location?.area, h.location?.city].filter(Boolean).join(', ') || '—'}
                  </td>
                ))}
              </tr>

              {/* Monthly Rent */}
              <tr>
                <td className="row-label">Monthly Rent</td>
                {(() => {
                  const best = bestVal((h) => h.pricing?.monthlyRent, 'min');
                  return hostels.map((h) => {
                    const v = h.pricing?.monthlyRent;
                    return <td key={h._id} className={`cmp-cell cmp-price ${cellClass(v, best)}`}>{formatRupees(v || 0)}</td>;
                  });
                })()}
              </tr>

              {/* Security Deposit */}
              <tr>
                <td className="row-label">Security Deposit</td>
                {hostels.map((h) => <td key={h._id} className="cmp-cell">{formatRupees(h.pricing?.securityDeposit || 0)}</td>)}
              </tr>

              {/* Gender */}
              <tr>
                <td className="row-label">Gender</td>
                {hostels.map((h) => <td key={h._id} className="cmp-cell cmp-cap">{h.gender || '—'}</td>)}
              </tr>

              {/* Availability */}
              <tr>
                <td className="row-label">Availability</td>
                {hostels.map((h) => (
                  <td key={h._id} className="cmp-cell">
                    <span className={`cmp-avail status-${h.availability?.status || 'unknown'}`}>
                      {h.availability?.status || '—'}
                    </span>
                    {h.availability?.bedsAvailable > 0 && <span className="cmp-beds"> ({h.availability.bedsAvailable} beds)</span>}
                  </td>
                ))}
              </tr>

              {/* Room Types */}
              <tr>
                <td className="row-label">Room Types</td>
                {hostels.map((h) => (
                  <td key={h._id} className="cmp-cell">
                    {h.roomTypes?.length > 0
                      ? h.roomTypes.map((rt) => rt.name).join(', ')
                      : '—'}
                  </td>
                ))}
              </tr>

              {/* Amenities */}
              <tr>
                <td className="row-label">Amenities</td>
                {hostels.map((h) => (
                  <td key={h._id} className="cmp-cell">
                    <div className="cmp-amenities">
                      {(h.amenities || []).map((a) => <span key={a} className="cmp-amenity">{a}</span>)}
                      {(!h.amenities || h.amenities.length === 0) && '—'}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Ratings */}
              <tr className="section-row"><td colSpan={hostels.length + 1}>Ratings</td></tr>
              {RATING_CATS.map(({ key, label }) => {
                const best = bestVal((h) => h.ratings?.[key], 'max');
                return (
                  <tr key={key}>
                    <td className="row-label">{label}</td>
                    {hostels.map((h) => {
                      const v = h.ratings?.[key] || 0;
                      return (
                        <td key={h._id} className={`cmp-cell cmp-rating ${cellClass(v, best)}`}>
                          {v > 0 ? v.toFixed(1) : '—'}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* Total Reviews */}
              <tr>
                <td className="row-label">Total Reviews</td>
                {hostels.map((h) => <td key={h._id} className="cmp-cell">{h.totalReviews || 0}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Compare;
