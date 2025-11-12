import React from 'react';
import './ConfirmationModal.css';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, orderItem, totalPrice }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content-lg">
        <button onClick={onClose} className="modal-close-btn">X</button>
        <h2>Confirm Your Design</h2>
        <p>Please review your custom cake before proceeding to add-ons.</p>
        
        <div className="receipt-details">
          <ul>
            <li><strong>Shape:</strong> {orderItem.shape}</li>
            <li><strong>Size:</strong> {orderItem.size}</li>
            <li><strong>Flavor:</strong> {orderItem.flavor}</li>
            <li><strong>Coating:</strong> {orderItem.coating}</li>
            <li><strong>Text:</strong> "{orderItem.custom_text}"</li>
            {orderItem.top_decoration !== 'None' && (
              <li><strong>Top Decoration:</strong> {orderItem.top_decoration}</li>
            )}
            {orderItem.side_decoration !== 'None' && (
              <li><strong>Side Decoration:</strong> {orderItem.side_decoration}</li>
            )}
            {orderItem.topping !== 'None' && (
              <li><strong>Topping:</strong> {orderItem.topping}</li>
            )}
          </ul>
        </div>

        <div className="receipt-total">
          <strong>Cake Price:</strong>
          <span>₹{totalPrice.toFixed(2)}</span>
        </div>
        
        <div className="preview-actions">
          <button onClick={onClose} className="edit-btn">
            &larr; Go Back & Edit
          </button>
          <button onClick={onConfirm} className="confirm-btn">
            Confirm & Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;