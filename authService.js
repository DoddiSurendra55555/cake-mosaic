import apiClient from './apiClient.js';

const authService = {
  register: async (email, password, role, shopName) => {
    try {
      const response = await apiClient.post('/auth/register', { 
        email, 
        password, 
        role, 
        shop_name: shopName 
      });
      return response.data;
    } catch (error) {
      console.error("Registration error:", error.response?.data);
      throw error.response?.data || new Error('Registration failed');
    }
  },
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      if (response.data.token && response.data.user) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error("Login error:", error.response?.data);
      throw error.response?.data || new Error('Login failed');
    }
  },
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  getAuthToken: () => {
    return localStorage.getItem('authToken');
  }
};
export default authService;