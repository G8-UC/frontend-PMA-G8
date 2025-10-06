import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Mock data para desarrollo
const mockProperties = [
  {
    id: "mock-1",
    name: "Moderno Departamento en Las Condes",
    price: 450000,
    currency: "CLP",
    bedrooms: "2 dormitorios",
    bathrooms: "2 baños",
    m2: "85 m² útiles",
    location: "Las Condes",
    img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    url: "https://example.com/property/1",
    is_project: false,
    timestamp: "2024-01-15T10:30:00Z",
    created_at: "2024-01-15T10:30:00Z"
  },
  {
    id: "mock-2",
    name: "Casa Familiar en Providencia",
    price: 850000,
    currency: "CLP",
    bedrooms: "4 dormitorios",
    bathrooms: "3 baños",
    m2: "150 m² útiles",
    location: "Providencia",
    img: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    url: "https://example.com/property/2",
    is_project: false,
    timestamp: "2024-01-14T14:20:00Z",
    created_at: "2024-01-14T14:20:00Z"
  },
  {
    id: "mock-3",
    name: "Loft Industrial Santiago Centro",
    price: 380000,
    currency: "CLP",
    bedrooms: "1 dormitorios",
    bathrooms: "1 baños",
    m2: "65 m² útiles",
    location: "Santiago Centro",
    img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    url: "https://example.com/property/3",
    is_project: true,
    timestamp: "2024-01-13T09:15:00Z",
    created_at: "2024-01-13T09:15:00Z"
  },
  {
    name: "Apartamento con Vista al Mar",
    price: 1200,
    currency: "USD",
    bedrooms: "3",
    bathrooms: "2",
    m2: "120",
    location: "Viña del Mar",
    img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    url: "https://example.com/property/4",
    is_project: false,
    timestamp: "2024-01-12T16:45:00Z"
  },
  {
    name: "Departamento Ejecutivo Ñuñoa",
    price: 320000,
    currency: "CLP",
    bedrooms: "2",
    bathrooms: "1",
    m2: "70",
    location: "Ñuñoa",
    img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    url: "https://example.com/property/5",
    is_project: false,
    timestamp: "2024-01-11T11:30:00Z"
  },
  {
    name: "Casa Moderna en Maipú",
    price: 550000,
    currency: "CLP",
    bedrooms: "3",
    bathrooms: "2",
    m2: "110",
    location: "Maipú",
    img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    url: "https://example.com/property/6",
    is_project: true,
    timestamp: "2024-01-10T13:20:00Z"
  },
  {
    name: "Penthouse de Lujo",
    price: 25,
    currency: "UF",
    bedrooms: "4",
    bathrooms: "4",
    m2: "200",
    location: "Las Condes",
    img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    url: "https://example.com/property/7",
    is_project: false,
    timestamp: "2024-01-09T15:45:00Z"
  },
  {
    name: "Estudio Compacto",
    price: 280000,
    currency: "CLP",
    bedrooms: "1",
    bathrooms: "1",
    m2: "45",
    location: "Santiago Centro",
    img: "https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    url: "https://example.com/property/8",
    is_project: false,
    timestamp: "2024-01-08T08:15:00Z"
  }
];

// URL base del backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://nicoriquelmecti.space/api/v1';

class PropertyService {
  constructor() {
    // Configurar axios interceptor para incluir el token de Auth0
    this.setupAxiosInterceptors();
  }

  setupAxiosInterceptors() {
    // El interceptor ya está configurado en authService.js
    // No necesitamos duplicar la lógica aquí
  }

  async getProperties(page = 1) {
    try {
      console.log(`Fetching properties from API: ${API_BASE_URL}/properties?page=${page}`);
      
      // Llamada real al backend con paginación
      const response = await axios.get(`${API_BASE_URL}/properties?page=${page}`, {
        timeout: 10000, // 10 segundos de timeout
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Backend response status:', response.status);
      console.log('Backend response:', response);
      console.log('Response data:', response.data);
      console.log('Response data type:', typeof response.data);
      console.log('Is response.data array?', Array.isArray(response.data));
      
      // Verificar la estructura de la respuesta
      let properties = response.data;
      let totalPages = 1;
      let hasMore = false;
      
      // Si la respuesta tiene una estructura anidada, extraer el array de propiedades
      if (properties && typeof properties === 'object' && !Array.isArray(properties)) {
        console.log('Response has nested structure, extracting properties...');
        
        if (Array.isArray(properties.data)) {
          properties = properties.data;
          console.log('Found properties in data field');
        } else if (Array.isArray(properties.properties)) {
          properties = properties.properties;
          console.log('Found properties in properties field');
        } else if (Array.isArray(properties.results)) {
          properties = properties.results;
          console.log('Found properties in results field');
        }
        
        // Extraer metadatos de paginación si están disponibles
        if (properties.total_pages !== undefined) {
          totalPages = properties.total_pages;
        }
        if (properties.has_more !== undefined) {
          hasMore = properties.has_more;
        }
      }
      
      // Asegurar que tenemos un array
      if (!Array.isArray(properties)) {
        console.warn('Backend response is not an array, converting to array:', properties);
        properties = [];
      }
      
      // Calcular metadatos de paginación si no están disponibles
      if (totalPages === 1 && properties.length > 0) {
        hasMore = properties.length === 25; // Asumir que hay más si devuelve exactamente 25
      }
      
      console.log('Properties loaded from backend (page', page, '):', properties);
      console.log('Pagination metadata - totalPages:', totalPages, 'hasMore:', hasMore);
      
      return {
        properties: properties,
        page: page,
        totalPages: totalPages,
        hasMore: hasMore
      };
    } catch (error) {
      console.error('Error fetching properties from backend:', error);
      
      if (error.response) {
        // El servidor respondió con un código de error
        console.error('Server responded with error status:', error.response.status);
        console.error('Error response data:', error.response.data);
      } else if (error.request) {
        // La petición se hizo pero no se recibió respuesta
        console.error('No response received from server:', error.request);
      } else {
        // Algo más causó el error
        console.error('Error setting up request:', error.message);
      }
      
      console.log('Using mock data as fallback');
      // Fallback a datos mock si el backend no está disponible
      const startIndex = (page - 1) * 25;
      const endIndex = startIndex + 25;
      const paginatedMock = mockProperties.slice(startIndex, endIndex);
      
      return new Promise((resolve) => {
        setTimeout(() => resolve({
          properties: paginatedMock,
          page: page,
          totalPages: Math.ceil(mockProperties.length / 25),
          hasMore: endIndex < mockProperties.length
        }), 1000);
      });
    }
  }

  async getPropertyById(id) {
    try {
      console.log('Searching for property with ID:', id);
      
      // Buscar en la primera página
      let result = await this.getProperties(1);
      let allProperties = result.properties;
      console.log('First page properties:', allProperties.length);
      
      // Buscar la propiedad específica por ID
      let foundProperty = allProperties.find(p => p.id === id);
      
      if (foundProperty) {
        console.log('Property found in first page:', foundProperty);
        return foundProperty;
      }
      
      // Si no se encuentra y hay más páginas, buscar en las siguientes
      if (result.hasMore) {
        console.log('Property not found in first page, searching in more pages...');
        let page = 2;
        let maxPages = 10; // Límite de seguridad
        
        while (page <= maxPages) {
          try {
            result = await this.getProperties(page);
            if (result.properties.length === 0) break;
            
            foundProperty = result.properties.find(p => p.id === id);
            if (foundProperty) {
              console.log(`Property found in page ${page}:`, foundProperty);
              return foundProperty;
            }
            
            if (!result.hasMore) break;
            page++;
          } catch (error) {
            console.error(`Error fetching page ${page}:`, error);
            break;
          }
        }
      }
      
      console.log('No property found for ID:', id);
      throw new Error('Property not found');
    } catch (error) {
      console.error('Error fetching property by ID:', error);
      // Fallback a datos mock
      console.log('Using mock data as fallback');
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const property = mockProperties.find(p => p.id === id);
          if (property) {
            resolve(property);
          } else {
            reject(new Error('Property not found in mock data'));
          }
        }, 500);
      });
    }
  }

  async getPropertyByUrl(url) {
    try {
      console.log('Searching for property with URL:', url);
      
      // Primero intentar buscar por ID si el parámetro parece ser un UUID
      if (url.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        return await this.getPropertyById(url);
      }
      
      // Buscar en la primera página
      let result = await this.getProperties(1);
      let allProperties = result.properties;
      console.log('First page properties:', allProperties.length);
      
      // Buscar la propiedad específica
      let foundProperty = allProperties.find(p => p.url === url);
      
      if (foundProperty) {
        console.log('Property found in first page:', foundProperty);
        return foundProperty;
      }
      
      // Si no se encuentra y hay más páginas, buscar en las siguientes
      if (result.hasMore) {
        console.log('Property not found in first page, searching in more pages...');
        let page = 2;
        let maxPages = 10; // Límite de seguridad
        
        while (page <= maxPages) {
          try {
            result = await this.getProperties(page);
            if (result.properties.length === 0) break;
            
            foundProperty = result.properties.find(p => p.url === url);
            if (foundProperty) {
              console.log(`Property found in page ${page}:`, foundProperty);
              return foundProperty;
            }
            
            if (!result.hasMore) break;
            page++;
          } catch (error) {
            console.error(`Error fetching page ${page}:`, error);
            break;
          }
        }
      }
      
      // Si no se encuentra, intentar búsqueda parcial en la primera página
      const partialMatch = allProperties.find(p => 
        p.url.includes(url) || url.includes(p.url)
      );
      
      if (partialMatch) {
        console.log('Property found by partial URL match:', partialMatch);
        return partialMatch;
      }
      
      console.log('No property found for URL:', url);
      throw new Error('Property not found');
    } catch (error) {
      console.error('Error fetching property by URL:', error);
      // Fallback a datos mock
      console.log('Using mock data as fallback');
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const property = mockProperties.find(p => p.url === url);
          if (property) {
            resolve(property);
          } else {
            reject(new Error('Property not found in mock data'));
          }
        }, 500);
      });
    }
  }

  async rentProperty(propertyId, groupId = '8', getAccessToken = null) {
    try {
      const requestData = {
        group_id: groupId,
        property_id: propertyId
      };

      // Llamada real al backend
      const headers = {};
      if (getAccessToken) {
        try {
          const token = await getAccessToken();
          if (token) {
            headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.log('Could not get access token:', error);
        }
      }
      
      const response = await axios.post(`${API_BASE_URL}/purchase-requests`, requestData, { headers });
      return response.data;
      
      // Para testing con datos mock, comenta las líneas de arriba y descomenta estas:
      // return new Promise((resolve) => {
      //   setTimeout(() => {
      //     resolve({
      //       success: true,
      //       request_id: requestData.request_id,
      //       message: 'Solicitud de alquiler enviada exitosamente',
      //       requestData
      //     });
      //   }, 1000);
      // });
    } catch (error) {
      console.error('Error renting property:', error);
      // Fallback a mock si el backend no está disponible
      const requestData = {
        request_id: uuidv4(),
        group_id: groupId,
        timestamp: new Date().toISOString(),
        property_id: propertyId, // Usar property_id en lugar de url
        origin: 0,
        operation: "BUY"
      };
      
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            request_id: requestData.request_id,
            message: 'Solicitud de alquiler enviada exitosamente (modo mock)',
            requestData
          });
        }, 1000);
      });
    }
  }

  async getUserRentals(userId) {
    try {
      // Llamada real al backend
      const response = await axios.get(`${API_BASE_URL}/users/${userId}/rentals`);
      return response.data;
      
      // Para testing con datos mock, comenta las líneas de arriba y descomenta estas:
      // return new Promise((resolve) => {
      //   setTimeout(() => {
      //     const rentals = mockProperties.slice(0, 2).map(property => ({
      //       ...property,
      //       rental_id: uuidv4(),
      //       rental_date: new Date().toISOString(),
      //       status: 'active'
      //     }));
      //     resolve(rentals);
      //   }, 800);
      // });
    } catch (error) {
      console.error('Error fetching user rentals:', error);
      // Fallback a datos mock si el backend no está disponible
      return new Promise((resolve) => {
        setTimeout(() => {
          const rentals = mockProperties.slice(0, 2).map(property => ({
            ...property,
            rental_id: uuidv4(),
            rental_date: new Date().toISOString(),
            status: 'active'
          }));
          resolve(rentals);
        }, 800);
      });
    }
  }

  // Método para probar la conectividad con la API
  async testApiConnection() {
    try {
      console.log('Testing API connection...');
      const response = await axios.get(`${API_BASE_URL}/properties?page=1`, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('API connection successful!');
      console.log('Response status:', response.status);
      console.log('Response data structure:', {
        isArray: Array.isArray(response.data),
        hasData: response.data?.data ? 'Yes' : 'No',
        hasProperties: response.data?.properties ? 'Yes' : 'No',
        hasResults: response.data?.results ? 'Yes' : 'No',
        keys: Object.keys(response.data || {})
      });
      
      return {
        success: true,
        status: response.status,
        data: response.data
      };
    } catch (error) {
      console.error('API connection test failed:', error);
      return {
        success: false,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      };
    }
  }

  // Método para actualizar el cliente de Auth0 (llamar desde el contexto)
  setAuth0Client(auth0Client) {
    window.auth0Client = auth0Client;
  }
}

export const propertyService = new PropertyService();