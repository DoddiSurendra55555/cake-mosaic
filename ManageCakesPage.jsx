import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient.js';
import { useAuth } from '../../context/AuthContext.jsx';
import './ManageCakesPage.css';

const ManageCakesPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth(); 

  const [newCakeName, setNewCakeName] = useState('');
  const [newCakePrice, setNewCakePrice] = useState(20);
  const [newCakeShape, setNewCakeShape] = useState('circle');
  
  const [newFlavorName, setNewFlavorName] = useState({});
  const [newFlavorColor, setNewFlavorColor] = useState({});
  const [newFlavorPrice, setNewFlavorPrice] = useState({});

  const fetchProducts = async () => {
    if (!user?.shop_id) return;
    
    try {
      setLoading(true);
      const response = await apiClient.get('/shopkeeper/all-products', {
        params: { shop_id: user.shop_id }
      });
      setProducts(response.data);
    } catch (err) {
      setError('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [user]);

  const handleAddCake = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/shopkeeper/cakes', {
        name: newCakeName,
        base_price: parseFloat(newCakePrice),
        shape: newCakeShape,
        image_url: '',
        shop_id: user.shop_id 
      });
      setNewCakeName('');
      setNewCakePrice(20);
      setNewCakeShape('circle');
      fetchProducts(); 
    } catch (err) {
      alert('Failed to add cake.');
    }
  };

  const handleDeleteCake = async (cakeId) => {
    if (!window.confirm('Are you sure you want to delete this cake and all its flavors?')) return;
    
    try {
      await apiClient.delete(`/shopkeeper/cakes/${cakeId}`, {
        data: { shop_id: user.shop_id }
      });
      fetchProducts();
    } catch (err) {
      alert('Failed to delete cake.');
    }
  };

  const handleAddFlavor = async (e, cakeId) => {
    e.preventDefault();
    try {
      await apiClient.post(`/shopkeeper/cakes/${cakeId}/flavors`, {
        name: newFlavorName[cakeId] || '',
        color_hex: newFlavorColor[cakeId] || '#FFFFFF',
        price_modifier: parseFloat(newFlavorPrice[cakeId] || 0),
        shop_id: user.shop_id
      });
      setNewFlavorName(prev => ({ ...prev, [cakeId]: '' }));
      setNewFlavorColor(prev => ({ ...prev, [cakeId]: '' }));
      setNewFlavorPrice(prev => ({ ...prev, [cakeId]: 0 }));
      fetchProducts();
    } catch (err) {
      alert('Failed to add flavor.');
    }
  };
  
  const handleDeleteFlavor = async (flavorId) => {
    if (!window.confirm('Are you sure you want to delete this flavor?')) return;

    try {
      await apiClient.delete(`/shopkeeper/flavors/${flavorId}`, {
        data: { shop_id: user.shop_id }
      });
      fetchProducts();
    } catch (err) {
      alert('Failed to delete flavor.');
    }
  };

  const setFlavorName = (cakeId, value) => setNewFlavorName(prev => ({ ...prev, [cakeId]: value }));
  const setFlavorColor = (cakeId, value) => setNewFlavorColor(prev => ({ ...prev, [cakeId]: value }));
  const setFlavorPrice = (cakeId, value) => setNewFlavorPrice(prev => ({ ...prev, [cakeId]: value }));

  if (loading) return <div className="manage-cakes-page">Loading products...</div>;
  if (error) return <div className="manage-cakes-page error">{error}</div>;

  return (
    <div className="manage-cakes-page">
      <h1>Cake Management</h1>

      <div className="card-form">
        <h2>Add New Cake Product</h2>
        <form onSubmit={handleAddCake} className="cake-form">
          <div className="form-group">
            <label>Cake Name</label>
            <input
              type="text"
              value={newCakeName}
              onChange={(e) => setNewCakeName(e.target.value)}
              placeholder="e.g., Classic Birthday Cake"
              required
            />
          </div>
          <div className="form-group">
            {/* --- FIX: Changed ($) to (₹) --- */}
            <label>Base Price (₹)</label>
            <input
              type="number"
              value={newCakePrice}
              onChange={(e) => setNewCakePrice(e.target.value)}
              min="0"
              step="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label>Default Shape</label>
            <select value={newCakeShape} onChange={(e) => setNewCakeShape(e.target.value)}>
              <option value="circle">Circle</option>
              <option value="square">Square</option>
            </select>
          </div>
          
          <button type="submit" className="btn-add-cake">Add Cake</button>
        </form>
      </div>

      <h2>Existing Products</h2>
      <div className="product-list">
        {products.map(cake => (
          <div key={cake.id} className="product-card">
            <div className="product-header">
              {/* --- FIX: Changed $ to ₹ --- */}
              <h3>{cake.name} (Base: ₹{cake.base_price})</h3>
              <button onClick={() => handleDeleteCake(cake.id)} className="btn-delete-cake">Delete Cake</button>
            </div>
            
            <div className="flavors-section">
              <h4>Flavors</h4>
              <ul className="flavor-list">
                {cake.flavors.length === 0 && <li>No flavors added yet.</li>}
                {cake.flavors.map(flavor => (
                  <li key={flavor.id}>
                    <span className="color-swatch" style={{ backgroundColor: flavor.color_hex }}></span>
                    {/* --- FIX: Changed $ to ₹ --- */}
                    {flavor.name} (+₹{flavor.price_modifier.toFixed(2)})
                    <button onClick={() => handleDeleteFlavor(flavor.id)} className="btn-delete-flavor">X</button>
                  </li>
                ))}
              </ul>
              
              <form onSubmit={(e) => handleAddFlavor(e, cake.id)} className="flavor-form">
                <input
                  type="text"
                  value={newFlavorName[cake.id] || ''}
                  onChange={(e) => setFlavorName(cake.id, e.target.value)}
                  placeholder="Flavor Name"
                  required
                />
                <input
                  type="color"
                  value={newFlavorColor[cake.id] || '#FFFFFF'}
                  onChange={(e) => setFlavorColor(cake.id, e.target.value)}
                  title="Flavor Color"
                />
                <input
                  type="number"
                  value={newFlavorPrice[cake.id] || 0}
                  onChange={(e) => setFlavorPrice(cake.id, e.target.value)}
                  placeholder="Price Mod (+₹)"
                  min="0"
                  step="0.01"
                />
                <button type="submit" className="btn-add-flavor">+</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageCakesPage;