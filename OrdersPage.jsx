import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient.js';
import { useAuth } from '../../context/AuthContext.jsx';
import './OrdersPage.css';
import OrderDetailsModal from '../../components/admin/OrderDetailsModal.jsx'; // 1. Import modal

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  
  // --- 2. State for modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    if (!user?.shop_id) return; 
    
    try {
      setLoading(true);
      const response = await apiClient.get('/shopkeeper/orders', {
        params: { shop_id: user.shop_id }
      });
      setOrders(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]); 

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await apiClient.post(`/shopkeeper/orders/${orderId}/status`, { 
        status: newStatus,
        shop_id: user.shop_id 
      });
      fetchOrders(); 
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status.");
    }
  };
  
  // --- 3. Functions to open/close modal ---
  const handleOpenModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  if (loading) return <div className="admin-orders-page">Loading orders...</div>;
  if (error) return <div className="admin-orders-page error">{error}</div>;

  return (
    <>
      {/* --- 4. Render the modal --- */}
      {isModalOpen && (
        <OrderDetailsModal 
          order={selectedOrder}
          onClose={handleCloseModal}
        />
      )}

      <div className="admin-orders-page">
        <h1 className="page-title">Manage All Orders</h1>
        
        {orders.length === 0 ? (
          <p>You have no orders yet.</p>
        ) : (
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Email</th>
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
                    <td>{order.customer_email}</td>
                    <td>{new Date(order.created_at).toLocaleString()}</td>
                    <td>₹{order.total_price.toFixed(2)}</td>
                    <td><span className={`status status-${order.status.toLowerCase()}`}>{order.status}</span></td>
                    <td className="actions-cell">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="status-select"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Accepted">Accepted</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                      {/* --- 5. New "View" Button --- */}
                      <button 
                        className="btn-view-order"
                        onClick={() => handleOpenModal(order)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default OrdersPage;