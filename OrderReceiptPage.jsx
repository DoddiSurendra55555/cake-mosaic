import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../../services/apiClient.js';
import { useAuth } from '../../context/AuthContext.jsx';
import './OrderReceiptPage.css';
import ChatWidget from '../../components/chat/ChatWidget.jsx';

const OrderReceiptPage = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setError("You must be logged in to view this page.");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/customer/order/${orderId}/${user.id}`);
        setOrder(response.data);
      } catch (err) {
        setError("Could not find order or you do not have permission to view it.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, user]);

  if (loading) return <div className="receipt-container">Loading receipt...</div>;
  if (error) return <div className="receipt-container error">{error}</div>;
  if (!order) return <div className="receipt-container">No order found.</div>;

  const orderItem = order.items[0]; 

  return (
    <>
      <div className="receipt-container">
        <div className="receipt-box">
          <h2>Thank You For Your Order!</h2>
          <p>A confirmation has been sent to {user.email}.</p>

          <div className="receipt-header">
            <h3>Order #{order.order.id}</h3>
            <span className={`status status-${order.order.status.toLowerCase()}`}>{order.order.status}</span>
          </div>

          <div className="receipt-details">
            <h4>Your Custom Cake</h4>
            <ul>
              <li><strong>Shape:</strong> {orderItem.shape || 'N/A'}</li>
              <li><strong>Size:</strong> {orderItem.size}</li>
              <li><strong>Flavor:</strong> {orderItem.flavor}</li>
              <li><strong>Coating:</strong> {orderItem.coating}</li>
              <li><strong>Text:</strong> "{orderItem.custom_text}"</li>
              {orderItem.top_decoration && orderItem.top_decoration !== 'None' && (
                <li><strong>Top Decoration:</strong> {orderItem.top_decoration}</li>
              )}
              {orderItem.side_decoration && orderItem.side_decoration !== 'None' && (
                <li><strong>Side Decoration:</strong> {orderItem.side_decoration}</li>
              )}
              {orderItem.topping && orderItem.topping !== 'None' && (
                <li><strong>Topping:</strong> {orderItem.topping}</li>
              )}
            </ul>
          </div>

          <div className="receipt-total">
            <strong>Total Price:</strong>
            {/* --- FIX: Changed $ to ₹ --- */}
            <span>₹{order.order.total_price.toFixed(2)}</span>
          </div>

          <Link to="/my-orders" className="back-link">&larr; Back to All Orders</Link>
        </div>
      </div>
      
      <ChatWidget shopId={order.order.shop_id} />
    </>
  );
};

export default OrderReceiptPage;