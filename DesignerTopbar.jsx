import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import './DesignerTopbar.css'; // We will create this CSS file

const DesignerTopbar = () => {
  const { onLogout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault(); 
    onLogout();
    navigate('/'); // Redirect to homepage after logout
  };

  return (
    <header className="designer-topbar">
      <div className="topbar-left">
        <Link to="/" className="topbar-back-btn">
          &larr; Back to Browse
        </Link>
        <div className="topbar-logo-container">
          <img src="/logo-icon.jpg" alt="Logo" className="topbar-logo" />
          <span className="topbar-logo-text">CakeMosaic</span>
          <span className="topbar-tagline">Design. Create. Celebrate.</span>
        </div>
      </div>
      <div className="topbar-right">
        {/* Search bar removed */}
        <a href="#" onClick={handleLogout} className="topbar-logout-link">
          Logout
        </a>
      </div>
    </header>
  );
};

export default DesignerTopbar;
