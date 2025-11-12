import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import apiClient from '../../services/apiClient.js';
import { Link } from 'react-router-dom';
import './MyOrdersPage.css';
import RatingModal from '../../components/reviews/RatingModal.jsx';

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    if (!user) {
      setError("You must be logged in to view your orders.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await apiClient.get(`/customer/orders/${user.id}`);
      setOrders(response.data);
    } catch (err) {
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);
  
  const handleOpenModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleRatingSuccess = () => {
    fetchOrders(); 
  };

  if (loading) return <div className="orders-container">Loading your orders...</div>;
  if (error) return <div className="orders-container error">{error}</div>;

  return (
    <>
      {isModalOpen && (
        <RatingModal 
          order={selectedOrder}
          onClose={handleCloseModal}
          onRatingSuccess={handleRatingSuccess}
        />
      )}
    
      <div className="orders-container">
        <h1>My Orders</h1>
        {orders.length === 0 ? (
          <p>You haven't placed any orders yet. <Link to="/">Browse cakes!</Link></p>
        ) : (
          <table className="my-orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Shop Name</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.shop_name}</td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  {/* --- FIX: Changed $ to ₹ --- */}
                  <td>₹{order.total_price.toFixed(2)}</td>
                  <td>
                    <span className={`status status-${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <Link to={`/order/${order.id}`} className="view-receipt-link">
                      View Details
                    </Link>
                    {order.status === 'Delivered' && !order.rating && (
                      <button 
                        className="rate-order-btn"
                        onClick={() => handleOpenModal(order)}
                      >
                        Rate Order
                      </button>
                    )}
                    {order.rating && (
                      <span className="order-rating">★ {order.rating}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Link to="/" className="home-link">Back to Browse</Link>
      </div>
    </>
  );
};

export default MyOrdersPage;