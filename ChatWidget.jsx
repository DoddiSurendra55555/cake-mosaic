import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import apiClient from '../../services/apiClient.js';
import './ChatWidget.css';

const ChatWidget = ({ shopId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const { conversations, setConversations, sendCustomerMessage } = useChat();
  const { user } = useAuth();
  const messages = conversations[shopId] || [];
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const fetchHistory = async () => {
        try {
          // --- FIX: Removed /api ---
          const response = await apiClient.get(`/customer/chat/${shopId}/${user.id}`);
          setConversations(prev => ({
            ...prev,
            [shopId]: response.data
          }));
        } catch (err) {
          console.error("Failed to fetch chat history", err);
        }
      };
      fetchHistory();
    }
  }, [isOpen, shopId, user.id, setConversations]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendCustomerMessage(newMessage, shopId);
      setNewMessage('');
    }
  };

  if (!user || !shopId) return null;

  return (
    <div className="chat-widget-container">
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>Chat with Shop</h3>
            <button onClick={() => setIsOpen(false)} className="close-btn">X</button>
          </div>
          <div className="chat-messages">
            {messages.map((msg, index) => (
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
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
      <button onClick={() => setIsOpen(!isOpen)} className="chat-bubble-toggle">
        {isOpen ? 'Close' : 'Chat'}
      </button>
    </div>
  );
};

export default ChatWidget;