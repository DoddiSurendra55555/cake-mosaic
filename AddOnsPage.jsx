import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import './AddOnsPage.css';

// Placeholder for add-on items (matches your design)
const addOnItems = [
  { id: 'a1', name: 'Colorful birthday candles', price: 99 },
  { id: 'a2', name: 'Set of 10 festive balloons', price: 199 },
  { id: 'a3', name: 'Party Caps & Hats', description: 'Celebration party hats pack', price: 149 },
  { id: 'a4', name: 'Heart Cake Topper', description: 'Elegant heart-shaped topper', price: 249 },
  { id: 'a5', name: 'Ribbon & Bow Set', description: 'Decorative ribbons and bows', price: 129 },
  { id: 'a6', name: 'Gold Star Topper', description: 'Sparkling gold star decoration', price: 199 },
];

const AddOnsPage = () => {
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  // Get data from designer page
  const { orderItem, totalPrice, shop_id, snapshot } = location.state || {};

  if (!orderItem || !shop_id) {
    navigate('/');
    return null; 
  }

  // Calculate new total
  const addOnsTotal = selectedAddOns.reduce((sum, item) => sum + item.price, 0);
  const finalTotal = totalPrice + addOnsTotal;

  const handleToggleAddOn = (item) => {
    setSelectedAddOns(prev => {
      if (prev.find(i => i.id === item.id)) {
        return prev.filter(i => i.id !== item.id); // Remove item
      } else {
        return [...prev, item]; // Add item
      }
    });
  };

  const handleProceedToPayment = () => {
    // Add add-ons to the order item
    const finalOrderItem = {
      ...orderItem,
      addOns: selectedAddOns.map(item => item.name), // Store names
      price: finalTotal // Update price to include add-ons
    };
    
    // Pass all data to the payment page
    navigate('/payment', { 
      state: {
        orderItem: finalOrderItem,
        totalPrice: finalTotal, // This is the new total
        shop_id: shop_id,
        cakePrice: totalPrice, // This is the original cake price
        addOnsPrice: addOnsTotal,
        snapshot: snapshot
      } 
    });
  };

  return (
    <div className="addons-page-container">
      {/* --- New Top Bar --- */}
      <nav className="addons-nav">
        <Link to={`/designer/${orderItem.cake_id}`} state={location.state} className="back-link">&larr; Back to Design</Link>
        <Link to="/"><img src="/logo-wordmark.png" alt="CakeMosaic" className="payment-logo" /></Link>
        <div className="header-shop-info">
          <span>★ 4.8 (256 reviews)</span>
          <span>+91 98765 43210</span>
        </div>
      </nav>

      <div className="addons-body">
        {/* --- Column 1: Cake Design (Left) --- */}
        <div className="addons-col-left">
          <div className="addons-card">
            <h3>Your Cake Design</h3>
            <div className="cake-preview-box">
              <div className="cake-preview-img">
                <img src={snapshot} alt="Your Custom Cake Design" />
              </div>
            </div>
            <div className="cake-preview-details">
              <p><strong>Occasion:</strong> <span>{orderItem.occasion}</span></p>
              <p><strong>Size:</strong> <span>{orderItem.size}</span></p>
              <p><strong>Shape:</strong> <span>{orderItem.shape}</span></p>
              <p><strong>Flavor:</strong> <span>{orderItem.flavor}</span></p>
              <p><strong>Base Price:</strong> <span>₹{orderItem.basePrice.toFixed(2)}</span></p>
            </div>
            <Link to={`/designer/${orderItem.cake_id}`} className="edit-design-btn">
              Re-Edit Design
            </Link>
          </div>
        </div>

        {/* --- Column 2: Add Extra Delights (Middle) --- */}
        <div className="addons-col-middle">
          <h2>Add Extra Delights</h2>
          <p className="page-subtitle">Make your celebration even more special with these add-ons.</p>
          
          <div className="addon-items-grid">
            {addOnItems.map(item => (
              <div key={item.id} className="addon-item-card">
                <div className="addon-item-img">🎁</div> {/* Placeholder */}
                <div className="addon-item-details">
                  <h4>{item.name}</h4>
                  <p>{item.description || ' '}</p>
                  <strong>₹{item.price}</strong>
                </div>
                <button 
                  className={`addon-add-btn ${selectedAddOns.find(i => i.id === item.id) ? 'added' : ''}`}
                  onClick={() => handleToggleAddOn(item)}
                >
                  {selectedAddOns.find(i => i.id === item.id) ? 'Added' : 'Add'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* --- Column 3: Order Summary (Right) --- */}
        <div className="addons-col-right">
          <div className="addons-card summary-card">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Cake Price</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>
            {selectedAddOns.map(item => (
              <div key={item.id} className="summary-row">
                <span>{item.name}</span>
                <span>₹{item.price.toFixed(2)}</span>
              </div>
            ))}
            <div className="summary-total">
              <strong>Total</strong>
              <strong>₹{finalTotal.toFixed(2)}</strong>
            </div>
            <button className="proceed-btn" onClick={handleProceedToPayment}>
              Proceed to Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddOnsPage;