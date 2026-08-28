import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <h1 className="hero-title">
          Find the right hostel or PG<br />
          <span className="hero-highlight">before you move in.</span>
        </h1>
        <p className="hero-sub">
          StayWise helps students compare accommodation, read verified reviews,
          and get personalized recommendations — so you pick the stay that fits.
        </p>
        <div className="hero-actions">
          <Link to="/hostels" className="btn btn-primary btn-lg">Explore stays</Link>
          <Link to="/recommendations" className="btn btn-secondary btn-lg">Find my match</Link>
        </div>
      </section>

      {/* How it works */}
      <section className="how-section">
        <h2 className="section-title">How StayWise helps</h2>
        <div className="how-grid">
          <div className="how-card">
            <div className="how-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <h3>Discover stays</h3>
            <p>Search and filter hostels and PGs by location, price, amenities, ratings, and availability.</p>
          </div>
          <div className="how-card">
            <div className="how-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="9"/><path d="M3 16h18M3 20h18"/></svg>
            </div>
            <h3>Compare properties</h3>
            <p>Put 2–3 hostels side-by-side and compare pricing, ratings, amenities, and room types at a glance.</p>
          </div>
          <div className="how-card">
            <div className="how-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <h3>Student reviews</h3>
            <p>Read honest reviews from students who actually lived there. AI-powered analysis highlights what matters.</p>
          </div>
          <div className="how-card">
            <div className="how-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            </div>
            <h3>Personalized match</h3>
            <p>Set your priorities — budget, cleanliness, food, safety — and get a ranked list tailored to you.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2>Ready to find your next stay?</h2>
        <p>Join thousands of students making smarter accommodation decisions.</p>
        <Link to="/register" className="btn btn-primary">Get started — it&apos;s free</Link>
      </section>
    </div>
  );
}

export default Home;
