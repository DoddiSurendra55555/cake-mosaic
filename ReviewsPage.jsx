import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient.js';
import { useAuth } from '../../context/AuthContext.jsx';
import './ReviewsPage.css'; // We will create this

// Helper to render star ratings
const StarRating = ({ rating }) => {
  return (
    <div className="star-rating-display">
      {[...Array(5)].map((_, index) => (
        <span key={index} className={`star ${index < rating ? 'filled' : ''}`}>
          ★
        </span>
      ))}
    </div>
  );
};

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.shop_id) {
      const fetchReviews = async () => {
        try {
          setLoading(true);
          const response = await apiClient.get('/shopkeeper/reviews', {
            params: { shop_id: user.shop_id }
          });
          setReviews(response.data);
        } catch (err) {
          setError('Failed to load reviews.');
        } finally {
          setLoading(false);
        }
      };
      fetchReviews();
    }
  }, [user]);

  if (loading) return <div className="admin-reviews-page">Loading reviews...</div>;
  if (error) return <div className="admin-reviews-page error">{error}</div>;

  return (
    <div className="admin-reviews-page">
      <h1 className="page-title">Ratings & Reviews</h1>
      
      <div className="reviews-list">
        {reviews.length === 0 && (
          <p>You have not received any reviews yet.</p>
        )}
        {reviews.map(review => (
          <div key={review.id} className="review-card">
            <div className="review-header">
              <span className="review-customer">{review.customer_email}</span>
              <span className="review-date">
                {new Date(review.created_at).toLocaleDateString()}
              </span>
            </div>
            <StarRating rating={review.rating} />
            <p className="review-text">
              {review.review_text || <i>No comment left.</i>}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsPage;