import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <svg className="brand-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 10L10 3l7 7" /><path d="M5 8.5V16h4v-4h2v4h4V8.5" />
          </svg>
          Stay<span className="brand-accent">Wise</span>
        </Link>
        <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          {menuOpen ? '✕' : '☰'}
        </button>
        <div className={`navbar-links ${menuOpen ? 'navbar-open' : ''}`}>
          <Link to="/hostels" onClick={closeMenu}>Hostels</Link>
          <Link to="/compare" onClick={closeMenu}>Compare</Link>
          {user && <Link to="/favorites" onClick={closeMenu}>Favorites</Link>}
          {user && <Link to="/recommendations" onClick={closeMenu}>For You</Link>}
          {user && <Link to="/list-property" onClick={closeMenu}>List Property</Link>}
          <span className="navbar-divider" />
          {user ? (
            <>
              <span className="navbar-user">{user.name}</span>
              <button className="navbar-logout" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-auth" onClick={closeMenu}>Log in</Link>
              <Link to="/register" className="navbar-auth navbar-register" onClick={closeMenu}>Sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
