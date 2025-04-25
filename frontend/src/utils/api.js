import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

export const addProduct = async (formData) => {
  const response = await api.post('/products/add', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getFarmerProducts = async () => {
  const response = await api.get('/products/farmer-products');
  return response.data;
};

export const trackProduct = async (productId) => {
  const response = await api.get(`/products/track/${productId}`);
  return response.data;
};

// Get all users (admin only)
export const getAllUsers = async () => {
  const response = await api.get('/users'); // Already updated
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};

// New functions for verification
export const getPendingVerifications = async () => {
  const response = await api.get('/verifications/pending');
  return response.data;
};

export const updateVerificationStatus = async (userId, status) => {
  const response = await api.put(`/verifications/${userId}`, { status });
  return response.data;
};

export const deleteProduct = async (productId) => {
  const response = await api.delete(`/products/${productId}`);
  return response.data;
};

// New functions for direct product and RFID access
export const getProductByRFID = async (rfid) => {
  const response = await api.get(`/products/by-rfid?rfid=${rfid}`);
  return response.data;
};

export const getAllProducts = async () => {
  const response = await api.get('/products/all');
  return response.data;
};

export const completeRetailerProfile = async (formData) => {
  const response = await api.put('/auth/complete-retailer-profile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export default api;