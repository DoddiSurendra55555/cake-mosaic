import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Link, useNavigate } from 'react-router-dom';
import './AuthForm.css'; // This CSS file will be updated

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { onLogin, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (user) {
    navigate(user.role === 'shopkeeper' ? '/admin' : '/');
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }
    await onLogin(email, password);
  };

  return (
    <div className="auth-container">
      <div className="auth-logo-container">
        <img src="/logo-wordmark.png" alt="CakeMosaic" className="auth-logo" />
        <p className="auth-tagline">Design. Create. Celebrate.</p>
      </div>

      <div className="auth-form-card">
        <h2>Welcome Back</h2>
        
        {/* --- Google Button and Divider Removed --- */}
        
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
                placeholder="Enter your password"
                required
              />
            </div>
          </div>
          
          <div className="form-options">
            <a href="#" className="forgot-password-link">Forgot Password?</a>
          </div>
          
          <button type="submit" className="auth-button">
            Login
          </button>
          
          <p className="auth-switch">
            Don't have an account? <Link to="/register">Create Account</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;