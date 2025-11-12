import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Link, useNavigate } from 'react-router-dom';
import './AuthForm.css';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isShopkeeper, setIsShopkeeper] = useState(false);
  const [shopName, setShopName] = useState('');
  
  const { onRegister, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate(user.role === 'shopkeeper' ? '/admin' : '/');
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }
    
    const role = isShopkeeper ? 'shopkeeper' : 'customer';
    if (role === 'shopkeeper' && !shopName) {
      alert('Please enter a shop name.');
      return;
    }
    
    await onRegister(email, password, role, shopName);
  };

  return (
    <div className="auth-container">
      <div className="auth-logo-container">
        <img src="/logo-wordmark.png" alt="CakeMosaic" className="auth-logo" />
        <p className="auth-tagline">Design. Create. Celebrate.</p>
      </div>

      <div className="auth-form-card">
        <h2>Create Your Account</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-with-icon">
              <span>📧</span>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <span>🔒</span>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
              />
            </div>
          </div>
          
          <div className="form-group-checkbox">
            <input
              type="checkbox"
              id="isShopkeeper"
              checked={isShopkeeper}
              onChange={(e) => setIsShopkeeper(e.target.checked)}
            />
            <label htmlFor="isShopkeeper">I am a shopkeeper</label>
          </div>
          
          <div className={`form-group conditional ${isShopkeeper ? 'visible' : ''}`}>
            <label htmlFor="shopName">Shop Name</label>
            <div className="input-with-icon">
              <span>🏪</span>
              <input
                type="text"
                id="shopName"
                className="shop-name-input"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="Your Shop's Name"
              />
            </div>
          </div>
          
          <button type="submit" className="auth-button">
            Create Account
          </button>
          
          <p className="auth-switch">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;