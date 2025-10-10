import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
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

// Handle response errors
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

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

// Variant APIs
export const variantAPI = {
  getAll: (params) => api.get('/variants', { params }),
  getById: (id) => api.get(`/variants/${id}`),
  create: (data) => api.post('/variants', data),
  update: (id, data) => api.put(`/variants/${id}`, data),
  delete: (id) => api.delete(`/variants/${id}`),
  toggle: (id) => api.patch(`/variants/${id}/toggle`),
};

// Inventory APIs
export const inventoryAPI = {
  getAll: () => api.get('/inventory'),
  getById: (id) => api.get(`/inventory/${id}`),
  create: (data) => api.post('/inventory', data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  delete: (id) => api.delete(`/inventory/${id}`),
  getHistory: () => api.get('/inventory/history'),
  getForKasir: () => api.get('/inventory/kasir'),
};

// Kasir APIs
export const kasirAPI = {
  createTransaction: (data) => api.post('/kasir/transaction', data),
  getTransactions: (params) => api.get('/kasir/transactions', { params }),
  getTransaction: (id) => api.get(`/kasir/transaction/${id}`),
  deleteTransaction: (id) => api.delete(`/kasir/transaction/${id}`),
};

// Dashboard APIs
export const dashboardAPI = {
  getSummary: () => api.get('/dashboard/summary'),
  getSalesReport: (params) => api.get('/dashboard/sales-report', { params }),
  getStockReport: () => api.get('/dashboard/stock-report'),
  getTransactionReport: (params) => api.get('/dashboard/transaction-report', { params }),
};

// Export APIs
export const exportAPI = {
  salesExcel: (params) => api.get('/export/sales/excel', { params, responseType: 'blob' }),
  salesPDF: (params) => api.get('/export/sales/pdf', { params, responseType: 'blob' }),
  stockExcel: () => api.get('/export/stock/excel', { responseType: 'blob' }),
  stockPDF: () => api.get('/export/stock/pdf', { responseType: 'blob' }),
  transactionsExcel: (params) => api.get('/export/transactions/excel', { params, responseType: 'blob' }),
  transactionsPDF: (params) => api.get('/export/transactions/pdf', { params, responseType: 'blob' }),
  stockHistoryExcel: (data) => api.post('/export/stock-history/excel', data, { responseType: 'blob' }),
  stockHistoryPDF: (data) => api.post('/export/stock-history/pdf', data, { responseType: 'blob' }),
};

export default api;
