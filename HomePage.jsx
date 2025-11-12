import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx'; 
import './HomePage.css';

const HomePage = () => {
  const { user, onLogout } = useAuth(); 

  return (
    <div className="home-container">
      <header className="home-hero">
        <div className="hero-content">
          <h1 className="hero-title">CakeMosaic</h1>
          <p className="hero-subtitle">Design Your Dream Cake from Local Shops</p>
          <div className="hero-cta">
            {user ? (
              // User is logged in
              <div>
                <p>Welcome back, {user.email}!</p>
                {user.role === 'shopkeeper' ? (
                  <Link to="/admin" className="hero-btn">Go to Admin Panel</Link>
                ) : (
                  <>
                    {/* --- UPDATED LINK --- */}
                    <Link to="/" className="hero-btn">Browse Cakes</Link>
                    <Link to="/my-orders" className="hero-btn secondary">My Orders</Link>
                  </>
                )}
                <button onClick={onLogout} className="hero-btn secondary logout">Logout</button>
              </div>
            ) : (
              // User is not logged in
              <>
                {/* --- UPDATED LINK --- */}
                <Link to="/" className="hero-btn">Browse Cakes</Link>
                <Link to="/login" className="hero-btn secondary">Login / Register</Link>
              </>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};

export default HomePage;