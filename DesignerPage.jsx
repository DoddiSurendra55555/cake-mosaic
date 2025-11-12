import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient.js';
import CakeCanvas from '../../components/studio/CakeCanvas.jsx';
import './DesignerPage.css';
import { useAuth } from '../../context/AuthContext.jsx';
import DesignerTopbar from '../../components/layout/DesignerTopbar.jsx';
import ConfirmationModal from '../../components/modals/ConfirmationModal.jsx';

// --- Definitions (Unchanged) ---
const topDecorationStyles = { 'none': { name: 'None' }, 'shell': { name: 'Shell Border' }, 'rosette': { name: 'Rosettes' }, 'dots': { name: 'Dotted Border' }, 'flower': { name: 'Drop Flowers' }, 'leaf': { name: 'Leaf Border' } };
const sideDecorationStyles = { 'none': { name: 'None' }, 'shell': { name: 'Bottom Shells' }, 'beads': { name: 'Bead Border' } };
const toppingStyles = { 'none': { name: 'None' }, 'chocoSprinkles': { name: 'Choco Sprinkles' }, 'pineSprinkles': { name: 'Pineapple Sprinkles' } };
const coatingAssets = { 'none': { name: 'None (Flavor)', props: { color: null } }, 'darkChoco': { name: 'Dark Choco', props: { color: '#3C2F2F', roughness: 0.1, clearcoat: 0.8 } }, 'whiteChoco': { name: 'White Choco', props: { color: '#FFF8F0', roughness: 0.2, clearcoat: 0.5 } }, 'strawberryGlaze': { name: 'Strawberry Glaze', props: { color: '#FF4D6D', roughness: 0.1, clearcoat: 0.7 } }, 'lemonCream': { name: 'Lemon Cream', props: { color: '#FFFACD', roughness: 0.4, clearcoat: 0.2 } }, 'mintGreen': { name: 'Mint Green', props: { color: '#98FF98', roughness: 0.4, clearcoat: 0.2 } }, 'blueberry': { name: 'Blueberry', props: { color: '#4F86F7', roughness: 0.2, clearcoat: 0.5 } } };
// --- End Definitions ---

const DesignerPage = () => {
  const { cakeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canvasRef = useRef(null); // --- Re-added ref ---
  
  const [cakeData, setCakeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [flavors, setFlavors] = useState([]);
  const [selectedFlavor, setSelectedFlavor] = useState(null);
  const [size, setSize] = useState('1kg');
  const [customText, setCustomText] = useState('Happy Birthday!');
  const [shape, setShape] = useState('circle');
  const [selectedCoating, setSelectedCoating] = useState('none');
  const [topDecoration, setTopDecoration] = useState('none');
  const [sideDecoration, setSideDecoration] = useState('none');
  const [topping, setTopping] = useState('none');
  const [occasion, setOccasion] = useState('Birthday');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderSummary, setOrderSummary] = useState(null);

  useEffect(() => {
    const fetchCakeData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/customer/cakes/${cakeId}`);
        setCakeData(response.data);
        setShape(response.data.cake.shape);
        setFlavors(response.data.flavors);
        setSelectedFlavor(response.data.flavors[0]);
      } catch (err) {
        setError('Failed to load cake data.');
      } finally {
        setLoading(false);
      }
    };
    fetchCakeData();
  }, [cakeId]);
  
  const flavorProps = useMemo(() => {
    if (!selectedFlavor) return { color: '#CCCCCC', roughness: 0.8 };
    return { color: selectedFlavor.color_hex, roughness: 0.8 };
  }, [selectedFlavor]);
  
  const coatingProps = useMemo(() => {
    return coatingAssets[selectedCoating].props;
  }, [selectedCoating]);

  const handleOccasionClick = (occName) => {
    setOccasion(occName);
    if (occName === 'Birthday') setCustomText('Happy Birthday!');
    else if (occName === 'Anniversary') setCustomText('Happy Anniversary!');
    else if (occName === 'Engagement') setCustomText('Congratulations!');
    else if (occName === 'Wedding') setCustomText('Our Wedding Day');
    else setCustomText('');
  };

  const handleReviewOrder = () => {
    if (!user) { alert("Please log in."); navigate('/login'); return; }
    
    const snapshot = canvasRef.current.takeSnapshot(); // --- Re-added snapshot ---
    
    const basePrice = cakeData.cake.base_price;
    const sizeModifier = size === '1kg' ? 10 : size === '2kg' ? 20 : 0;
    let decoPrice = 0;
    if (topDecoration !== 'none') decoPrice += 3;
    if (sideDecoration !== 'none') decoPrice += 4;
    if (topping !== 'none') decoPrice += 2;
    const finalPrice = basePrice + sizeModifier + decoPrice;
    
    const orderItem = {
      cake_id: cakeData.cake.id,
      flavor: selectedFlavor.name,
      coating: coatingAssets[selectedCoating].name,
      shape: shape,
      size: size,
      custom_text: customText,
      price: finalPrice, 
      top_decoration: topDecorationStyles[topDecoration].name,
      side_decoration: sideDecorationStyles[sideDecoration].name,
      topping: toppingStyles[topping].name,
      basePrice: basePrice,
      occasion: occasion
    };
    
    setOrderSummary({ 
      orderItem, 
      totalPrice: finalPrice, 
      snapshot: snapshot // --- Pass snapshot to modal ---
    });
    setIsModalOpen(true);
  };

  const handleConfirmOrder = () => {
    setIsModalOpen(false);
    navigate('/add-ons', { 
      state: {
        ...orderSummary,
        shop_id: cakeData.cake.shop_id
      } 
    });
  };

  if (loading) return <div className="designer-page-wrapper"><p>Loading designer...</p></div>;
  if (error) return <div className="designer-page-wrapper"><p>{error}</p></div>;
  if (!cakeData || !selectedFlavor) return <div className="designer-page-wrapper"><p>Could not load cake.</p></div>;

  return (
    <div className="designer-page-container">
      <DesignerTopbar />
      <div className="designer-page-body">
        <div className="designer-canvas-container">
          <CakeCanvas 
            ref={canvasRef}
            flavorProps={flavorProps} 
            coatingProps={coatingProps}
            pipingColor={flavorProps.color} 
            customText={customText} 
            cakeSize={size} 
            cakeShape={shape} 
            topDecoration={topDecoration}
            sideDecoration={sideDecoration}
            topping={topping}
          />
          <div className="canvas-footer">
            Size: {size} | Shape: {shape} | Flavor: {selectedFlavor.name}
            <span>Drag to rotate + Scroll to zoom</span>
          </div>
        </div>
        
        <div className="designer-ui-panel">
          {/* ... (All UI sections remain the same) ... */}
          <div className="designer-header">
            <h2>{cakeData.cake.name}</h2>
            <button onClick={handleReviewOrder} className="finalize-btn">
              Finalize Design
            </button>
          </div>
          <div className="ui-section">
            <h4>Occasion Type</h4>
            <div className="option-grid-small">
              {['Birthday', 'Anniversary', 'Engagement', 'Wedding'].map((s) => (
                <button 
                  key={s} 
                  className={`option-btn ${occasion === s ? 'active' : ''}`}
                  onClick={() => handleOccasionClick(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="ui-section">
            <h4>Name or Message</h4>
            <input type="text" className="text-input" value={customText} onChange={(e) => setCustomText(e.target.value)} maxLength={25} />
          </div>
          <div className="ui-section">
            <h4>Cake Size</h4>
            <div className="option-grid-small">
              {['½ kg', '1 kg', '2 kg', '3 kg'].map((s) => (
                <button key={s} className={`option-btn ${size === s ? 'active' : ''}`} onClick={() => setSize(s)}>{s}</button>
              ))}
            </div>
          </div>
          <div className="ui-section">
            <h4>Flavor</h4>
            <div className="option-grid-small flavor-grid">
              {flavors.map((flavor) => (
                <button
                  key={flavor.id}
                  className={`option-btn flavor-btn ${selectedFlavor.id === flavor.id ? 'active' : ''}`}
                  onClick={() => setSelectedFlavor(flavor)}
                >
                  <span className="flavor-color-dot" style={{ backgroundColor: flavor.color_hex }}></span>
                  {flavor.name}
                </button>
              ))}
            </div>
          </div>
          <div className="ui-section">
            <h4>Coating</h4>
            <div className="option-grid-small">
              {Object.entries(coatingAssets).map(([id, { name, props }]) => (
                <button key={id} className={`option-btn ${selectedCoating === id ? 'active' : ''}`} onClick={() => setSelectedCoating(id)}>
                  <span className="flavor-color-dot" style={{ backgroundColor: props.color || 'transparent', border: props.color ? '1px solid var(--dark-color)' : '1px dashed var(--dark-color)' }}></span>
                  {name}
                </button>
              ))}
            </div>
          </div>
          <div className="ui-section">
            <h4>Top Surface & Flowers</h4>
            <div className="option-grid-small">
              {Object.entries(topDecorationStyles).map(([id, { name }]) => (
                <button key={id} className={`option-btn deco-btn ${topDecoration === id ? 'active' : ''}`} onClick={() => setTopDecoration(id)}>{name}</button>
              ))}
            </div>
          </div>
          <div className="ui-section">
            <h4>Bottom Surface / Sides</h4>
            <div className="option-grid-small">
              {Object.entries(sideDecorationStyles).map(([id, { name }]) => (
                <button key={id} className={`option-btn deco-btn ${sideDecoration === id ? 'active' : ''}`} onClick={() => setSideDecoration(id)}>{name}</button>
              ))}
            </div>
          </div>
          <div className="ui-section">
            <h4>Toppings</h4>
            <div className="option-grid-small">
              {Object.entries(toppingStyles).map(([id, { name }]) => (
                <button key={id} className={`option-btn deco-btn ${topping === id ? 'active' : ''}`} onClick={() => setTopping(id)}>{name}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <ConfirmationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmOrder}
        orderItem={orderSummary?.orderItem}
        totalPrice={orderSummary?.totalPrice}
      />
    </div>
  );
};

export default DesignerPage;