import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.shop_id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [analyticsRes, ordersRes] = await Promise.all([
          apiClient.get('/shopkeeper/analytics', { params: { shop_id: user.shop_id } }),
          apiClient.get('/shopkeeper/orders', { params: { shop_id: user.shop_id } })
        ]);
        
        setAnalytics(analyticsRes.data);
        setOrders(ordersRes.data.slice(0, 5));
        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) return <div className="admin-dashboard-page">Loading dashboard...</div>;
  if (error) return <div className="admin-dashboard-page error">{error}</div>;
  if (!analytics) return <div className="admin-dashboard-page">No data available.</div>;

  return (
    <div className="admin-dashboard-page">
      <h1 className="page-title">Dashboard Overview</h1>
      <p className="page-subtitle">Welcome back! Here's your shop performance at a glance.</p>
      
      <div className="admin-stat-cards">
        <div className="admin-stat-card">
          <h4>Total Orders</h4>
          <p>{analytics.total_orders}</p>
        </div>
        <div className="admin-stat-card">
          <h4>Total Revenue</h4>
          {/* --- FIX: Changed $ to ₹ --- */}
          <p>₹{analytics.total_revenue.toFixed(2)}</p>
        </div>
        <div className="admin-stat-card">
          <h4>Average Rating</h4>
          <p>{analytics.average_rating.toFixed(1)} ★</p>
          <span>Based on {analytics.total_reviews} reviews</span>
        </div>
      </div>

      <div className="recent-orders-card">
        <div className="recent-orders-header">
          <div>
            <h2>Recent Orders</h2>
            <p>Your latest customer orders</p>
          </div>
          <Link to="/admin/orders" className="view-all-link">View All Orders &rarr;</Link>
        </div>
        <div className="recent-orders-list">
          {orders.length === 0 && <p>No recent orders.</p>}
          {orders.map(order => (
            <div key={order.id} className="recent-order-item">
              <div className="order-item-icon">🎂</div>
              <div className="order-item-details">
                <p><strong>Order #{order.id}</strong></p>
                <p>{order.customer_email}</p>
              </div>
              <div className="order-item-info">
                {/* --- FIX: Changed $ to ₹ --- */}
                <p><strong>₹{order.total_price.toFixed(2)}</strong></p>
                <p className={`status status-${order.status.toLowerCase()}`}>{order.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;