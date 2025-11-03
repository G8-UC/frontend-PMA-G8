import axios from 'axios';

// URL base del backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.ics2173-2025-2-paurovira.me/api/v1';

class PurchaseRequestService {
  constructor() {
    this.setupAxiosInterceptors();
  }

  setupAxiosInterceptors() {
    // Interceptor para incluir token de Auth0 en las requests
    axios.interceptors.request.use(
      async (config) => {
        // Obtener token de Auth0 si está disponible
        if (window.auth0Client && window.auth0Client.getAccessTokenSilently) {
          try {
            const token = await window.auth0Client.getAccessTokenSilently();
            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
              console.log('Auth token added to request:', config.url);
            } else {
              console.log('No auth token available for request:', config.url);
            }
          } catch (error) {
            console.log('Could not get Auth0 token for request:', config.url, error);
          }
        } else {
          console.log('Auth0 client not available for request:', config.url);
        }
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );
  }

  // Crear una nueva solicitud de compra
  async createPurchaseRequest(propertyId, groupId = '8') {
    try {
      const requestData = {
        group_id: groupId,
        property_id: propertyId
      };

      const response = await axios.post(`${API_BASE_URL}/purchase-requests`, requestData);
      return response.data;
    } catch (error) {
      console.error('Error creating purchase request:', error);
      throw error;
    }
  }

  // Obtener solicitudes de compra con paginación y filtros
  async getPurchaseRequests(params = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        group_id,
        status
      } = params;

      const queryParams = new URLSearchParams();
      queryParams.append('page', page);
      queryParams.append('limit', limit);
      
      if (group_id) {
        queryParams.append('group_id', group_id);
      }
      if (status) {
        queryParams.append('status', status);
      }

      const url = `${API_BASE_URL}/purchase-requests?${queryParams}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching purchase requests:', error);
      throw error;
    }
  }

  // Obtener una solicitud específica por ID
  async getPurchaseRequestById(requestId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/purchase-requests/${requestId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching purchase request:', error);
      throw error;
    }
  }

  // Cancelar una solicitud (si el backend lo soporta)
  async cancelPurchaseRequest(requestId) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/purchase-requests/${requestId}`);
      return response.data;
    } catch (error) {
      console.error('Error canceling purchase request:', error);
      throw error;
    }
  }

  // Obtener estadísticas de solicitudes
  async getPurchaseRequestStats(groupId = '8') {
    try {
      const response = await axios.get(`${API_BASE_URL}/purchase-requests/stats?group_id=${groupId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching purchase request stats:', error);
      throw error;
    }
  }
}

// Crear instancia singleton
export const purchaseRequestService = new PurchaseRequestService();

export default purchaseRequestService;
