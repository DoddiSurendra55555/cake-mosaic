import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import './TopNavbar.css';

const TopNavbar = () => {
  const { user, onLogout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/'); // Redirect to home after logout
  };

  return (
    <nav className="top-navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo-link">
          <img src="/logo-icon.jpg" alt="CakeMosaic Icon" className="navbar-logo-icon" />
          <img src="/logo-wordmark.png" alt="CakeMosaic Logo" className="navbar-logo-wordmark" />
        </Link>
        <span className="navbar-tagline">Design. Create. Celebrate.</span>
      </div>
      
      {/* --- Search Bar Removed --- */}
      <div className="navbar-center"></div>
      
      <div className="navbar-right">
        {user ? (
          <>
            {user.role === 'customer' && (
              <Link to="/my-orders" className="navbar-link">My Orders</Link>
            )}
            <button onClick={handleLogout} className="navbar-logout-btn">
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="navbar-login-btn">
            Login / Register
          </Link>
        )}
      </div>
    </nav>
  );
};

export default TopNavbar;