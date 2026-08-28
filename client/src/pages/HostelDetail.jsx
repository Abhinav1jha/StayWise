import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { getHostelReviews } from '../services/reviewService';
import { addFavorite, removeFavorite, getFavorites } from '../services/favoriteService';
import { formatRupees } from '../utils/helpers';
import RatingBar from '../components/RatingBar';
import ReviewCard from '../components/ReviewCard';
import ReviewForm from '../components/ReviewForm';
import AiInsights from '../components/AiInsights';
import './HostelDetail.css';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80';

function HostelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Hostel
  const [hostel, setHostel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [reviewPagination, setReviewPagination] = useState({ page: 1, pages: 1 });
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Favorites
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  // Fetch hostel
  const fetchHostel = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/hostels/${id}`);
      setHostel(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load hostel');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Fetch reviews
  const fetchReviews = useCallback(async () => {
    setReviewsLoading(true);
    try {
      const result = await getHostelReviews(id, { page: reviewPage, limit: 5 });
      setReviews(result.data || []);
      setReviewPagination(result.pagination || { page: 1, pages: 1 });
    } catch {
      // Silently handle — reviews are secondary
    } finally {
      setReviewsLoading(false);
    }
  }, [id, reviewPage]);

  // Check favorite status
  useEffect(() => {
    if (!user) return;
    const checkFav = async () => {
      try {
        const result = await getFavorites();
        const favIds = (result.data || []).map((h) => h._id);
        setIsFavorite(favIds.includes(id));
      } catch {
        // ignore
      }
    };
    checkFav();
  }, [user, id]);

  useEffect(() => { fetchHostel(); }, [fetchHostel]);
  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleFavoriteToggle = async () => {
    setFavLoading(true);
    try {
      if (isFavorite) {
        await removeFavorite(id);
        setIsFavorite(false);
      } else {
        await addFavorite(id);
        setIsFavorite(true);
      }
    } catch {
      // ignore
    } finally {
      setFavLoading(false);
    }
  };

  const handleReviewCreated = () => {
    fetchHostel();
    setReviewPage(1);
    fetchReviews();
  };

  const handleReviewAnalyzed = () => {
    fetchReviews();
  };

  const handleAddToCompare = () => {
    // Store in sessionStorage for the compare page to pick up
    const existing = JSON.parse(sessionStorage.getItem('compareIds') || '[]');
    if (!existing.includes(id) && existing.length < 3) {
      existing.push(id);
      sessionStorage.setItem('compareIds', JSON.stringify(existing));
      navigate('/compare');
    } else if (existing.includes(id)) {
      navigate('/compare');
    }
  };

  if (loading) return <div className="page"><p>Loading hostel...</p></div>;
  if (error) return <div className="page"><p className="detail-error">{error}</p><button onClick={fetchHostel}>Retry</button></div>;
  if (!hostel) return <div className="page"><p>Hostel not found.</p></div>;

  const img = hostel.images?.[0] || FALLBACK_IMG;
  const r = hostel.ratings || {};

  return (
    <div className="hostel-detail">
      {/* Hero */}
      <div className="detail-hero">
        <img src={img} alt={hostel.name} className="detail-hero-img" />
        <div className="detail-hero-overlay">
          <span className="detail-type">{hostel.type?.toUpperCase()}</span>
          <span className={`detail-avail status-${hostel.availability?.status || 'unknown'}`}>
            {hostel.availability?.status}
            {hostel.availability?.bedsAvailable > 0 && ` (${hostel.availability.bedsAvailable} beds)`}
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="detail-header">
        <div>
          <h1>{hostel.name}</h1>
          <p className="detail-location">
            {[hostel.location?.address, hostel.location?.area, hostel.location?.city].filter(Boolean).join(', ')}
          </p>
        </div>
        <div className="detail-actions">
          {user && (
            <button
              className={`fav-btn ${isFavorite ? 'fav-active' : ''}`}
              onClick={handleFavoriteToggle}
              disabled={favLoading}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFavorite ? '❤️' : '🤍'}
            </button>
          )}
          <button className="compare-btn" onClick={handleAddToCompare}>⚖️ Compare</button>
          {user && (hostel.createdBy?._id === user._id || user.role === 'admin') && (
            <button
              className="owner-delete-btn"
              onClick={async () => {
                if (!window.confirm('Delete this listing permanently?')) return;
                try {
                  await api.delete(`/hostels/${id}`);
                  navigate('/hostels');
                } catch (err) {
                  alert(err.response?.data?.message || 'Delete failed');
                }
              }}
            >
              🗑 Delete
            </button>
          )}
        </div>
      </div>

      {/* Main grid */}
      <div className="detail-grid">
        {/* Left column */}
        <div className="detail-main">
          {hostel.description && (
            <section className="detail-section">
              <h2>About</h2>
              <p className="detail-desc">{hostel.description}</p>
            </section>
          )}

          {/* Pricing */}
          <section className="detail-section">
            <h2>Pricing</h2>
            <div className="detail-pricing">
              <div className="price-item">
                <span className="price-label">Monthly Rent</span>
                <span className="price-value">{formatRupees(hostel.pricing?.monthlyRent || 0)}</span>
              </div>
              <div className="price-item">
                <span className="price-label">Security Deposit</span>
                <span className="price-value">{formatRupees(hostel.pricing?.securityDeposit || 0)}</span>
              </div>
            </div>
          </section>

          {/* Room Types */}
          {hostel.roomTypes?.length > 0 && (
            <section className="detail-section">
              <h2>Room Types</h2>
              <div className="room-types">
                {hostel.roomTypes.map((rt, i) => (
                  <div key={i} className="room-chip">
                    <strong>{rt.name}</strong>
                    {rt.occupancy && <span>{rt.occupancy}-bed</span>}
                    {rt.price != null && <span>{formatRupees(rt.price)}</span>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Amenities */}
          {hostel.amenities?.length > 0 && (
            <section className="detail-section">
              <h2>Amenities</h2>
              <div className="amenity-list">
                {hostel.amenities.map((a) => (
                  <span key={a} className="amenity-chip">{a}</span>
                ))}
              </div>
            </section>
          )}

          {/* Details */}
          <section className="detail-section">
            <h2>Details</h2>
            <div className="detail-meta-grid">
              <div><span className="meta-label">Gender</span><span className="meta-value">{hostel.gender}</span></div>
              <div><span className="meta-label">Total Reviews</span><span className="meta-value">{hostel.totalReviews}</span></div>
            </div>
          </section>
        </div>

        {/* Right column */}
        <div className="detail-sidebar">
          {/* Ratings */}
          <section className="detail-section">
            <h2>Ratings</h2>
            <div className="overall-rating-big">
              <span className="big-num">{r.overall > 0 ? r.overall.toFixed(1) : '—'}</span>
              <span className="big-label">/ 5</span>
            </div>
            <RatingBar label="Cleanliness" value={r.cleanliness || 0} />
            <RatingBar label="Food" value={r.food || 0} />
            <RatingBar label="Location" value={r.location || 0} />
            <RatingBar label="Safety" value={r.safety || 0} />
            <RatingBar label="Staff" value={r.staff || 0} />
            <RatingBar label="Value" value={r.valueForMoney || 0} />
          </section>

          {/* AI Insights */}
          <AiInsights hostelId={id} />
        </div>
      </div>

      {/* Reviews Section */}
      <section className="detail-section reviews-section">
        <h2>Reviews ({hostel.totalReviews || 0})</h2>

        {user && <ReviewForm hostelId={id} onReviewCreated={handleReviewCreated} />}
        {!user && <p className="login-prompt">Log in to write a review.</p>}

        {reviewsLoading && <p className="review-loading">Loading reviews...</p>}

        {!reviewsLoading && reviews.length === 0 && (
          <p className="no-reviews">No reviews yet. Be the first!</p>
        )}

        {reviews.map((rev) => (
          <ReviewCard key={rev._id} review={rev} onAnalyzed={handleReviewAnalyzed} />
        ))}

        {reviewPagination.pages > 1 && (
          <div className="review-pagination">
            <button disabled={reviewPage <= 1} onClick={() => setReviewPage(reviewPage - 1)}>← Prev</button>
            <span>Page {reviewPagination.page} of {reviewPagination.pages}</span>
            <button disabled={reviewPage >= reviewPagination.pages} onClick={() => setReviewPage(reviewPage + 1)}>Next →</button>
          </div>
        )}
      </section>
    </div>
  );
}

export default HostelDetail;
