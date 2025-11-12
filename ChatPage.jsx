import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import apiClient from '../../services/apiClient.js';
import './ChatPage.css';

const ChatPage = () => {
  const { socket, conversations, setConversations, sendShopkeeperMessage } = useChat();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  
  const [customerList, setCustomerList] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user?.shop_id) {
      const fetchConversations = async () => {
        try {
          setLoading(true);
          const response = await apiClient.get('/shopkeeper/conversations', {
            params: { shop_id: user.shop_id }
          });
          setCustomerList(response.data);
        } catch (err) {
          console.error("Failed to fetch conversations", err);
        } finally {
          setLoading(false);
        }
      };
      fetchConversations();
    }
  }, [user]);

  const selectCustomer = async (customerId) => {
    setSelectedCustomerId(customerId);
    if (!conversations[customerId]) {
      try {
        const response = await apiClient.get(`/shopkeeper/chat/${customerId}`, {
          params: { shop_id: user.shop_id }
        });
        setConversations(prev => ({
          ...prev,
          [customerId]: response.data
        }));
      } catch (err) {
        console.error("Failed to fetch chat history", err);
      }
    }
  };
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversations, selectedCustomerId]);
  
  const handleSend = (e) => {
    e.preventDefault();
    if (newMessage.trim() && selectedCustomerId) {
      sendShopkeeperMessage(newMessage, selectedCustomerId);
      setNewMessage('');
    }
  };

  const currentMessages = conversations[selectedCustomerId] || [];

  return (
    <div className="chat-page-container">
      <div className="customer-list-panel">
        <div className="chat-header">
          <h3>Customer Chats</h3>
        </div>
        <div className="customer-list">
          {loading && <p>Loading...</p>}
          {customerList.length === 0 && !loading && <p>No customers have placed orders yet.</p>}
          {customerList.map(cust => (
            <button 
              key={cust.customer_id}
              className={`customer-item ${selectedCustomerId === cust.customer_id ? 'active' : ''}`}
              onClick={() => selectCustomer(cust.customer_id)}
            >
              {cust.customer_email}
            </button>
          ))}
        </div>
      </div>
      
      <div className="chat-main-panel">
        {!selectedCustomerId ? (
          <div className="no-chat-selected">
            <p>Select a customer to view messages.</p>
          </div>
        ) : (
          <div className="chat-window">
            <div className="chat-header">
              <h3>{customerList.find(c => c.customer_id === selectedCustomerId)?.customer_email}</h3>
            </div>
            <div className="chat-messages">
              {currentMessages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`message-bubble ${msg.sender_id === user.id ? 'sent' : 'received'}`}
                >
                  {msg.message}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} className="chat-input-form">
              <input
                type="text"
                value={newMessage}
                // --- THIS IS THE FIX ---
                onChange={(e) => setNewMessage(e.target.value)}
                // -----------------------
                placeholder="Type your message..."
              />
              <button type="submit">Send</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;