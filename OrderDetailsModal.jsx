import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient.js';
import { useAuth } from '../../context/AuthContext.jsx';
import './OrderDetailsModal.css';

const OrderDetailsModal = ({ order, onClose }) => {
  const { user } = useAuth();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/shopkeeper/order/${order.id}`, {
          params: { shop_id: user.shop_id }
        });
        setDetails(response.data);
      } catch (err) {
        console.error("Failed to load order details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [order.id, user.shop_id]);

  if (!details || loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content-lg"><p>Loading details...</p></div>
      </div>
    );
  }

  const orderItem = details.items[0]; // Assuming one item per order

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-lg" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="modal-close-btn">X</button>
        <h2>Order #{details.order.id}</h2>
        <p>Customer: {details.order.customer_email}</p>
        
        <div className="order-details-grid">
          {/* --- Snapshot Image --- */}
          <div className="order-snapshot">
            <h4>Custom Design</h4>
            <img src={orderItem.snapshot_image} alt="Cake Design" />
          </div>
          
          {/* --- Customization List --- */}
          <div className="receipt-details">
            <h4>Customizations</h4>
            <ul>
              <li><strong>Shape:</strong> {orderItem.shape}</li>
              <li><strong>Size:</strong> {orderItem.size}</li>
              <li><strong>Flavor:</strong> {orderItem.flavor}</li>
              <li><strong>Coating:</strong> {orderItem.coating}</li>
              <li><strong>Text:</strong> "{orderItem.custom_text}"</li>
              {orderItem.top_decoration !== 'None' && (
                <li><strong>Top:</strong> {orderItem.top_decoration}</li>
              )}
              {orderItem.side_decoration !== 'None' && (
                <li><strong>Side:</strong> {orderItem.side_decoration}</li>
              )}
              {orderItem.topping !== 'None' && (
                <li><strong>Topping:</strong> {orderItem.topping}</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;