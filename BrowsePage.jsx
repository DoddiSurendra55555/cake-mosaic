import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/apiClient.js';
import './BrowsePage.css';

const BrowsePage = () => {
  const [cakes, setCakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCakes = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/customer/cakes');
        setCakes(response.data);
      } catch (err) {
        setError("Failed to load cakes. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchCakes();
  }, []);

  if (loading) return <div className="browse-page-container"><p>Loading cakes...</p></div>;
  if (error) return <div className="browse-page-container error"><p>{error}</p></div>;

  return (
    <div className="browse-page-container">
      <h1>Choose Your Cake</h1>
      <p>Select a cake from one of our partner shops to start designing.</p>
      
      <div className="cake-grid">
        {cakes.length === 0 && <p>No cakes available at the moment.</p>}
        {cakes.map(cake => (
          <div key={cake.id} className="cake-card">
            <div className="cake-image-placeholder">
              <span>🎂</span>
            </div>
            <div className="cake-card-content">
              <h3>{cake.name}</h3>
              <p className="shop-name">from <strong>{cake.shop_name}</strong></p>
              {/* --- FIX: Changed $ to ₹ --- */}
              <p className="base-price">Starts at ₹{cake.base_price.toFixed(2)}</p>
              <Link to={`/designer/${cake.id}`} className="design-link">
                Customize This Cake
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrowsePage;