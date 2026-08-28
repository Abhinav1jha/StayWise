import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getFavorites, removeFavorite } from '../services/favoriteService';
import HostelCard from '../components/HostelCard';
import './Favorites.css';

function Favorites() {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFavs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getFavorites();
      setHostels(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFavs(); }, [fetchFavs]);

  const handleRemove = async (hostelId) => {
    try {
      await removeFavorite(hostelId);
      setHostels(prev => prev.filter(h => h._id !== hostelId));
    } catch {
      // silently fail — user can retry
    }
  };

  return (
    <div className="favorites-page">
      <div className="fav-header">
        <h1>My Favorites</h1>
        {!loading && <span className="fav-count">{hostels.length} saved</span>}
      </div>

      {loading && <p className="fav-loading">Loading favorites...</p>}
      {error && <p className="fav-error">{error}</p>}

      {!loading && !error && hostels.length === 0 && (
        <div className="fav-empty">
          <p>You haven't saved any hostels yet.</p>
          <Link to="/hostels" className="btn btn-primary btn-sm">Browse hostels</Link>
        </div>
      )}

      {!loading && !error && hostels.length > 0 && (
        <div className="fav-grid">
          {hostels.map(h => (
            <div key={h._id} className="fav-card-wrap">
              <HostelCard hostel={h} />
              <button
                className="fav-remove-btn"
                onClick={(e) => { e.preventDefault(); handleRemove(h._id); }}
                title="Remove from favorites"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Favorites;
