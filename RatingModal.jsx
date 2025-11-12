import React, { useState } from 'react';
import apiClient from '../../services/apiClient.js';
import { useAuth } from '../../context/AuthContext.jsx';
import './RatingModal.css';

const RatingModal = ({ order, onClose, onRatingSuccess }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a star rating.");
      return;
    }
    setIsSubmitting(true);
    try {
      // --- FIX: Removed /api ---
      await apiClient.post(`/customer/order/${order.id}/rate`, {
        customer_id: user.id,
        rating: rating,
        review_text: reviewText
      });
      onRatingSuccess(); 
      onClose(); 
    } catch (err) {
      alert("Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close-btn">X</button>
        <h2>Rate Your Order</h2>
        <p>Order #{order.id} from {order.shop_name}</p>
        
        <form onSubmit={handleSubmit}>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${star <= (hoverRating || rating) ? 'filled' : ''}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                ★
              </span>
            ))}
          </div>
          
          <textarea
            className="review-textarea"
            rows="5"
            placeholder="Tell us about your cake..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />
          
          <button type="submit" className="submit-review-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;