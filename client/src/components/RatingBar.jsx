import './RatingBar.css';

function RatingBar({ label, value, max = 5 }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  const color = value >= 4 ? '#16a34a' : value >= 3 ? '#d97706' : value >= 1 ? '#dc2626' : '#ccc';

  return (
    <div className="rating-bar">
      <span className="rating-bar-label">{label}</span>
      <div className="rating-bar-track">
        <div className="rating-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="rating-bar-value">{value > 0 ? value.toFixed(1) : '—'}</span>
    </div>
  );
}

export default RatingBar;
