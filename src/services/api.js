import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token & handle FormData headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
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
    // Only redirect to /login if it's NOT an auth request (login/register)
    // and if the status is 401 (Unauthorized)
    const isAuthRequest = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
    
    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // decide where to redirect based on current path? 
      // simple approach: don't force redirect here, let the component handle it or PrivateRoute
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateMe: (userData) => api.put('/auth/me', userData),
  getCustomers: () => api.get('/auth/customers'),
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

// Menu APIs
export const menuAPI = {
  getAll: (params) => api.get('/menu', { params }),
  getById: (id) => api.get(`/menu/${id}`),
  create: (data) => api.post('/menu', data),
  update: (id, data) => api.put(`/menu/${id}`, data),
  delete: (id) => api.delete(`/menu/${id}`),
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
  getStockReport: (params) => api.get('/dashboard/stock-report', { params }),
  getTransactionReport: (params) => api.get('/dashboard/transaction-report', { params }),
};

// Export APIs
export const exportAPI = {
  salesExcel: (params) => api.get('/export/sales/excel', { params, responseType: 'blob' }),
  salesPDF: (params) => api.get('/export/sales/pdf', { params, responseType: 'blob' }),
  stockExcel: (params) => api.get('/export/stock/excel', { params, responseType: 'blob' }),
  stockPDF: (params) => api.get('/export/stock/pdf', { params, responseType: 'blob' }),
  transactionsExcel: (params) => api.get('/export/transactions/excel', { params, responseType: 'blob' }),
  transactionsPDF: (params) => api.get('/export/transactions/pdf', { params, responseType: 'blob' }),
  stockHistoryExcel: (data) => api.post('/export/stock-history/excel', data, { responseType: 'blob' }),
  stockHistoryPDF: (data) => api.post('/export/stock-history/pdf', data, { responseType: 'blob' }),
};

export default api;
