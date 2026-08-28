import { useState } from 'react';
import { createReview } from '../services/reviewService';
import './ReviewForm.css';

const CATEGORIES = ['cleanliness', 'food', 'location', 'safety', 'staff', 'valueForMoney', 'overall'];

function ReviewForm({ hostelId, onReviewCreated }) {
  const [ratings, setRatings] = useState(
    Object.fromEntries(CATEGORIES.map((c) => [c, 0]))
  );
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRating = (category, value) => {
    setRatings((prev) => ({ ...prev, [category]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    const unrated = CATEGORIES.filter((c) => ratings[c] < 1);
    if (unrated.length > 0) {
      setError(`Please rate: ${unrated.join(', ')}`);
      return;
    }
    if (text.trim().length < 20) {
      setError('Review must be at least 20 characters');
      return;
    }

    setLoading(true);
    try {
      await createReview(hostelId, { ratings, text: text.trim() });
      setSuccess(true);
      setText('');
      setRatings(Object.fromEntries(CATEGORIES.map((c) => [c, 0])));
      if (onReviewCreated) onReviewCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h3>Write a Review</h3>
      {error && <p className="rf-error">{error}</p>}
      {success && <p className="rf-success">Review submitted!</p>}

      <div className="rf-ratings">
        {CATEGORIES.map((cat) => (
          <div key={cat} className="rf-rating-row">
            <span className="rf-cat-label">{cat.replace(/([A-Z])/g, ' $1')}</span>
            <div className="rf-stars">
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  type="button"
                  className={`rf-star ${ratings[cat] >= v ? 'active' : ''}`}
                  onClick={() => handleRating(cat, v)}
                >★</button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <textarea
        className="rf-text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Share your experience (min 20 characters)..."
        rows={4}
      />

      <button type="submit" className="rf-submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}

export default ReviewForm;
