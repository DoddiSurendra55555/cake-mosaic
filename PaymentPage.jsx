import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import apiClient from '../../services/apiClient.js';
import { useAuth } from '../../context/AuthContext.jsx';
import './PaymentPage.css';

const PaymentPage = () => {
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // --- Get the snapshot ---
  const { orderItem, totalPrice, shop_id, cakePrice, addOnsPrice, snapshot } = location.state || {};

  if (!orderItem || !shop_id) {
    navigate('/');
    return null; 
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to place an order.");
      return;
    }
    
    setIsSubmitting(true);

    const payload = {
      customer_id: user.id,
      total_price: totalPrice + 50, // Including delivery fee
      items: [orderItem],
      shop_id: shop_id,
      snapshot_image: snapshot // --- Pass snapshot to backend ---
    };

    try {
      const response = await apiClient.post('/customer/orders', payload);
      alert(`Order placed successfully! Your order ID is: ${response.data.orderId}`);
      navigate(`/order/${response.data.orderId}`); 
    } catch (error) {
      console.error("Failed to submit order:", error);
      alert("There was an error placing your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="payment-page-container">
      <nav className="payment-nav">
        <Link to="/add-ons" state={location.state} className="back-link">&larr; Back</Link>
        <img src="/logo-wordmark.png" alt="CakeMosaic" />
        <span className="secure-lock">🔒 Secure Payment</span>
      </nav>

      <div className="payment-body">
        <div className="payment-main">
          <h2>Complete Your Payment</h2>
          <p className="payment-subtitle">Choose your preferred payment method and confirm your order.</p>

          <div className="payment-options-card">
            <h3>Select Payment Method</h3>
            <label className={`payment-option ${paymentMethod === 'upi' ? 'selected' : ''}`}>
              <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} />
              <div className="payment-option-icon">📱</div>
              <div className="payment-option-details">
                <strong>UPI Payment</strong>
                <span>Pay using Google Pay, PhonePe, Paytm</span>
              </div>
            </label>
            <label className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}>
              <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
              <div className="payment-option-icon">💳</div>
              <div className="payment-option-details">
                <strong>Credit / Debit Card</strong>
                <span>Visa, Mastercard, Rupay accepted</span>
              </div>
            </label>
            <label className={`payment-option ${paymentMethod === 'wallet' ? 'selected' : ''}`}>
              <input type="radio" name="payment" value="wallet" checked={paymentMethod === 'wallet'} onChange={() => setPaymentMethod('wallet')} />
              <div className="payment-option-icon">👜</div>
              <div className="payment-option-details">
                <strong>Digital Wallet</strong>
                <span>Paytm, Amazon Pay, etc.</span>
              </div>
            </label>
          </div>

          <form onSubmit={handlePlaceOrder} className="payment-details-card" id="payment-details-form">
            <h3>Payment Details</h3>
            {paymentMethod === 'upi' && (
              <div className="form-group">
                <label htmlFor="upiId">UPI ID</label>
                <input
                  type="text"
                  id="upiId"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  required
                />
              </div>
            )}
            {paymentMethod !== 'upi' && (
              <p>This payment method is not yet implemented.</p>
            )}
          </form>
        </div>

        <div className="payment-sidebar">
          <div className="summary-card">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{cakePrice.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Fee</span>
              <span>₹50.00</span>
            </div>
            {addOnsPrice > 0 && (
              <div className="summary-row">
                <span>Add-ons</span>
                <span>₹{addOnsPrice.toFixed(2)}</span>
              </div>
            )}
            <div className="summary-total">
              <strong>Total</strong>
              <strong>₹{(totalPrice + 50).toFixed(2)}</strong>
            </div>
            <button 
              type="submit" 
              form="payment-details-form" 
              className="confirm-btn"
              disabled={isSubmitting || paymentMethod !== 'upi'}
            >
              {isSubmitting ? 'Placing Order...' : 'Confirm Payment'}
            </button>
            <p className="secure-text">
              🔒 Your payment is secured with 256-bit SSL encryption.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;