import axios from 'axios';

// Create an Axios instance with the base URL of your Flask API
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:5000/api', // This must match your Flask server address
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;