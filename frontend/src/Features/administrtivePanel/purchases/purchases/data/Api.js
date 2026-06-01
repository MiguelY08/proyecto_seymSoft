// Features/administrtivePanel/purchases/purchases/data/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const message = error.response.data?.message || 'Error en la petición';
      throw new Error(message);
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor');
    } else {
      throw new Error(error.message || 'Error desconocido');
    }
  }
);

export const api = {
  // Supplier Purchases (Compras a proveedores)
  getAllPurchases: (params) => apiClient.get('/supplier-purchases', { params }),
  getPurchaseById: (id) => apiClient.get(`/supplier-purchases/${id}`),
  createPurchase: (data) => apiClient.post('/supplier-purchases', data),
  annulPurchase: (id, data) => apiClient.patch(`/supplier-purchases/${id}/annul`, data),
  
  // Productos (para el formulario de creación)
  getProducts: (params) => apiClient.get('/products', { params }),
  getProductByBarcode: (barcode) => apiClient.get(`/products/barcode/${barcode}`),
  
  // Proveedores (para el formulario de creación)
  getProviders: (params) => apiClient.get('/providers', { params }),
};

export default api;