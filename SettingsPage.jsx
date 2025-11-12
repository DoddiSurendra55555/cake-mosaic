import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient.js';
import { useAuth } from '../../context/AuthContext.jsx';
import './SettingsPage.css'; // We will create this

const SettingsPage = () => {
  const { user, updateShopName } = useAuth();
  const [shopName, setShopName] = useState(user?.shop_name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setShopName(user?.shop_name || '');
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shopName) {
      alert("Shop name cannot be empty.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await apiClient.put('/shopkeeper/settings', {
        shop_id: user.shop_id,
        shop_name: shopName
      });
      // Update the local auth state
      updateShopName(shopName);
      alert("Settings updated successfully!");
    } catch (err) {
      alert("Failed to update settings.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-settings-page">
      <h1 className="page-title">Shop Settings</h1>
      
      <div className="card-form">
        <h2>Update Shop Details</h2>
        <form onSubmit={handleSubmit} className="settings-form">
          <div className="form-group">
            <label htmlFor="shopName">Shop Name</label>
            <input
              type="text"
              id="shopName"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="shopEmail">Account Email</label>
            <input
              type="email"
              id="shopEmail"
              value={user?.email || ''}
              disabled
            />
            <small>Email cannot be changed.</small>
          </div>
          
          <button type="submit" className="btn-save-settings" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
