import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { addFavorite, removeFavorite } from '../services/favoriteService';
import { formatRupees } from '../utils/helpers';
import './HostelCard.css';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80';

function HostelCard({ hostel }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const img = hostel.images?.[0] || FALLBACK_IMG;
  const rating = hostel.ratings?.overall > 0 ? hostel.ratings.overall.toFixed(1) : null;
  const city = hostel.location?.city || '';
  const area = hostel.location?.area || '';
  const location = [area, city].filter(Boolean).join(', ');
  const amenities = (hostel.amenities || []).slice(0, 4);
  const status = hostel.availability?.status || 'unknown';

  const [fav, setFav] = useState(false);
  const [favBusy, setFavBusy] = useState(false);
  const [imgErr, setImgErr] = useState(false);

  const handleFav = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || favBusy) return;
    setFavBusy(true);
    try {
      if (fav) { await removeFavorite(hostel._id); setFav(false); }
      else { await addFavorite(hostel._id); setFav(true); }
    } catch { /* silent */ }
    finally { setFavBusy(false); }
  };

  const handleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const existing = JSON.parse(sessionStorage.getItem('compareIds') || '[]');
    if (!existing.includes(hostel._id) && existing.length < 3) {
      existing.push(hostel._id);
      sessionStorage.setItem('compareIds', JSON.stringify(existing));
    }
    navigate('/compare');
  };

  return (
    <div className="hc">
      <Link to={`/hostels/${hostel._id}`} className={`hc-img-link ${imgErr ? 'hc-img-link--fallback' : ''}`}>
        {!imgErr && <img src={img} alt={hostel.name} className="hc-img" loading="lazy" onError={() => setImgErr(true)} />}
        <div className="hc-badges">
          <span className="hc-type">{hostel.type?.toUpperCase()}</span>
          <span className={`hc-status hc-status--${status}`}>{status}</span>
        </div>
        {user && (
          <button className={`hc-fav ${fav ? 'hc-fav--active' : ''}`} onClick={handleFav} disabled={favBusy} title={fav ? 'Remove' : 'Save'}>
            {fav ? '♥' : '♡'}
          </button>
        )}
      </Link>

      <div className="hc-body">
        {hostel.matchScore != null && (
          <span className="hc-match">{Math.round(hostel.matchScore)}% match</span>
        )}
        <Link to={`/hostels/${hostel._id}`} className="hc-name">{hostel.name}</Link>
        <p className="hc-loc">{location || 'Location not specified'}</p>

        <div className="hc-price-row">
          <span className="hc-price">{formatRupees(hostel.pricing?.monthlyRent || 0)}<span className="hc-per">/mo</span></span>
          {rating && (
            <span className="hc-rating">★ {rating} <span className="hc-reviews">· {hostel.totalReviews || 0} reviews</span></span>
          )}
        </div>

        {amenities.length > 0 && (
          <p className="hc-amenities">{amenities.join(' · ')}</p>
        )}

        <div className="hc-actions">
          <Link to={`/hostels/${hostel._id}`} className="hc-btn hc-btn--primary">View Details</Link>
          <button className="hc-btn hc-btn--secondary" onClick={handleCompare}>Compare</button>
        </div>
      </div>
    </div>
  );
}

export default HostelCard;
