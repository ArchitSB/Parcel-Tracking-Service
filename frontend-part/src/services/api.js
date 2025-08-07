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
  register: (userData) => api.post('/v1/auth/register', userData),
  login: (credentials) => api.post('/v1/auth/login', credentials),
  partnerRegister: (partnerData) => api.post('/v1/auth/partner/register', partnerData),
  partnerLogin: (credentials) => api.post('/v1/auth/partner/login', credentials),
  getProfile: () => api.get('/v1/auth/profile'),
};

// Shipments API
export const shipmentsAPI = {
  create: (shipmentData) => api.post('/v1/shipments', shipmentData),
  getByTracking: (trackingNumber) => api.get(`/v1/shipments/${trackingNumber}`),
  getPartnerShipments: (params = {}) => api.get('/v1/shipments', { params }),
  addEvent: (trackingNumber, eventData) => api.post(`/v1/shipments/${trackingNumber}/events`, eventData),
  getEvents: (trackingNumber) => api.get(`/v1/shipments/${trackingNumber}/events`),
  updateShipment: (trackingNumber, updateData) => api.put(`/v1/shipments/${trackingNumber}`, updateData),
  getStats: (params = {}) => api.get('/v1/shipments/stats/overview', { params }),
  searchByEmail: (email) => api.get('/v1/shipments/search/by-email', { params: { email } }),
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/v1/users/me'),
  updateProfile: (userData) => api.put('/v1/users/me', userData),
  subscribe: (subscriptionData) => api.post('/v1/users/me/subscriptions', subscriptionData),
  getPreferences: () => api.get('/v1/users/me/preferences'),
  updatePreferences: (preferences) => api.put('/v1/users/me/preferences', preferences),
};

// Partners API
export const partnersAPI = {
  getProfile: () => api.get('/v1/partners/me'),
  updateProfile: (partnerData) => api.put('/v1/partners/me', partnerData),
  getStats: (params = {}) => api.get('/v1/partners/me/stats', { params }),
  regenerateCredentials: () => api.post('/v1/partners/me/regenerate-credentials'),
  updateWebhook: (webhookUrl) => api.put('/v1/partners/me/webhook', { webhookUrl }),
};

// Notifications API
export const notificationsAPI = {
  subscribe: (subscriptionData) => api.post('/v1/notifications/subscribe', subscriptionData),
  getHistory: (trackingNumber) => api.get(`/v1/notifications/history/${trackingNumber}`),
  getStats: (params = {}) => api.get('/v1/notifications/stats', { params }),
};

export default api;
