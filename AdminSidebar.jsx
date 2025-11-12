import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx'; // 1. Import useAuth
import './AdminLayout.css';

const AdminSidebar = () => {
  const { onLogout } = useAuth(); // 2. Get the onLogout function
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/'); // Redirect to homepage after logout
  };

  return (
    <div className="admin-sidebar">
      <Link to="/" className="sidebar-logo-link">
        <img src="/logo-icon.jpg" alt="CakeMosaic Icon" className="sidebar-logo" />
      </Link>
      <nav className="sidebar-nav">
        <NavLink to="/admin" end>Dashboard Home</NavLink>
        <NavLink to="/admin/manage-cakes">My Cakes</NavLink>
        <NavLink to="/admin/orders">Orders</NavLink>
        <NavLink to="/admin/chat">Customer Chat</NavLink>
        <NavLink to="/admin/analytics">Earnings / Payments</NavLink>
        <NavLink to="/admin/reviews">Ratings & Reviews</NavLink> 
        <NavLink to="/admin/settings">Settings</NavLink>
      </nav>
      <div className="sidebar-footer">
        {/* --- 3. Make this a functional button --- */}
        <button onClick={handleLogout} className="sidebar-logout-btn">
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;