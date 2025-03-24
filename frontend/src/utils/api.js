import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

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

export const addProduct = async (productData) => {
  const response = await api.post('/products/add', productData);
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

export const getAllUsers = async () => {
  const response = await api.get('/users/all');
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};

export default api;