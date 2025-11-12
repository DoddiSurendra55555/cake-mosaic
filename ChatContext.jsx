import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext.jsx';
import io from 'socket.io-client';

const ChatContext = createContext(null);
const SOCKET_URL = 'http://127.0.0.1:5000';

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState({}); // Stores messages { shop_id: [msgs...], customer_id: [msgs...] }
  
  const socketRef = useRef(null);

  useEffect(() => {
    if (user) {
      const newSocket = io(SOCKET_URL);
      socketRef.current = newSocket;
      setSocket(newSocket);

      // Register the user with the socket server
      newSocket.emit('register_user', {
        user_id: user.id,
        role: user.role,
        shop_id: user.shop_id // Will be null for customers, set for shopkeepers
      });

      // Listen for incoming messages
      newSocket.on('receive_message', (messageData) => {
        // messageData = { sender_id, message, customer_id (if to shop), shop_id (if to customer) }
        
        let conversationId;
        if (user.role === 'shopkeeper') {
          conversationId = messageData.customer_id; // Shopkeeper groups by customer_id
        } else {
          conversationId = messageData.shop_id; // Customer groups by shop_id
        }

        setConversations(prev => ({
          ...prev,
          [conversationId]: [...(prev[conversationId] || []), messageData]
        }));
      });
      
      return () => {
        newSocket.off('receive_message');
        newSocket.disconnect();
        socketRef.current = null;
      };
    } else {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
      setConversations({});
    }
  }, [user]);

  // Function to send a message (Customer)
  const sendCustomerMessage = (message, shop_id) => {
    if (socket && user) {
      const messageData = {
        sender_id: user.id,
        message: message,
        shop_id: shop_id
      };
      setConversations(prev => ({
        ...prev,
        [shop_id]: [...(prev[shop_id] || []), messageData]
      }));
      socket.emit('send_message', { message: message, shop_id: shop_id });
    }
  };

  // Function to send a message (Shopkeeper)
  const sendShopkeeperMessage = (message, customer_id) => {
    if (socket && user) {
      const messageData = {
        sender_id: user.id,
        message: message,
        customer_id: customer_id
      };
      setConversations(prev => ({
        ...prev,
        [customer_id]: [...(prev[customer_id] || []), messageData]
      }));
      socket.emit('send_message', { message: message, customer_id: customer_id });
    }
  };

  const value = {
    socket,
    conversations,
    setConversations,
    sendCustomerMessage,
    sendShopkeeperMessage
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};