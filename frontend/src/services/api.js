// frontend/src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// attach Authorization header from localStorage if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || null;
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
};

export const transferAPI = {
  // Execute fund transfer
  transfer: async (senderId, receiverId, amount, userId) => {
    const response = await api.post('/transfer', {
      senderId,
      receiverId,
      amount,
      userId,
    });
    return response.data;
  },

  // Get all users
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  // Get specific user
  getUser: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
};

export const auditAPI = {
  // Get transaction history for a user
  getHistory: async (userId) => {
    const response = await api.get(`/audit/history/${userId}`);
    return response.data;
  },

  // Get all audit logs (admin)
  getAllLogs: async () => {
    const response = await api.get('/audit/all');
    return response.data;
  },
};

export function setToken(token) {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
}

export function getToken() {
  return localStorage.getItem('token');
}

export default api;