import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const apiKey = localStorage.getItem('apiKey');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (apiKey) {
      config.headers['X-API-Key'] = apiKey;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  partnerRegister: (partnerData) => api.post('/auth/partner/register', partnerData),
  partnerLogin: (credentials) => api.post('/auth/partner/login', credentials),
  getProfile: () => api.get('/auth/profile'),
};

// Shipments API
export const shipmentsAPI = {
  create: (shipmentData) => api.post('/shipments', shipmentData),
  getByTracking: (trackingNumber) => api.get(`/shipments/${trackingNumber}`),
  getPartnerShipments: (params = {}) => api.get('/shipments', { params }),
  addEvent: (trackingNumber, eventData) => api.post(`/shipments/${trackingNumber}/events`, eventData),
  getEvents: (trackingNumber) => api.get(`/shipments/${trackingNumber}/events`),
  updateShipment: (trackingNumber, updateData) => api.put(`/shipments/${trackingNumber}`, updateData),
  getStats: (params = {}) => api.get('/shipments/stats/overview', { params }),
  searchByEmail: (email) => api.get('/shipments/search/by-email', { params: { email } }),
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (userData) => api.put('/users/me', userData),
  subscribe: (subscriptionData) => api.post('/users/me/subscriptions', subscriptionData),
  getPreferences: () => api.get('/users/me/preferences'),
  updatePreferences: (preferences) => api.put('/users/me/preferences', preferences),
};

// Partners API
export const partnersAPI = {
  getProfile: () => api.get('/partners/me'),
  updateProfile: (partnerData) => api.put('/partners/me', partnerData),
  getStats: (params = {}) => api.get('/partners/me/stats', { params }),
  regenerateCredentials: () => api.post('/partners/me/regenerate-credentials'),
  updateWebhook: (webhookUrl) => api.put('/partners/me/webhook', { webhookUrl }),
};

// Notifications API
export const notificationsAPI = {
  subscribe: (subscriptionData) => api.post('/notifications/subscribe', subscriptionData),
  getHistory: (trackingNumber) => api.get(`/notifications/history/${trackingNumber}`),
  getStats: (params = {}) => api.get('/notifications/stats', { params }),
};

export default api;
