import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AppContext = createContext();

const initialState = {
  properties: [],
  filteredProperties: [],
  userRequests: [],
  user: null,
  isAuthenticated: false,
  wallet: {
    balance: 50000, // Saldo inicial para testing
    currency: 'CLP'
  },
  filters: {
    search: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: '',
    location: '',
    currency: ''
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    hasMore: false,
    itemsPerPage: 25
  },
  notifications: [], // Para notificaciones del broker
  loading: false,
  error: null
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: !!action.payload };
    
    case 'LOGOUT_USER':
      return { ...state, user: null, isAuthenticated: false };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_PROPERTIES':
      const propertiesArray = Array.isArray(action.payload.properties) ? action.payload.properties : [];
      return { 
        ...state, 
        properties: propertiesArray,
        filteredProperties: propertiesArray,
        pagination: {
          ...state.pagination,
          currentPage: action.payload.page || 1,
          totalPages: action.payload.totalPages || 1,
          hasMore: action.payload.hasMore || false
        },
        loading: false,
        error: null
      };
    
    case 'SET_PAGE':
      return {
        ...state,
        pagination: {
          ...state.pagination,
          currentPage: action.payload
        }
      };
    
    case 'SET_FILTERED_PROPERTIES':
      return { ...state, filteredProperties: action.payload };
    
    case 'UPDATE_FILTERS':
      return { 
        ...state, 
        filters: { ...state.filters, ...action.payload },
        currentPage: 1
      };
    
    case 'ADD_USER_REQUEST':
      return { 
        ...state, 
        userRequests: [...state.userRequests, action.payload] 
      };
    
    case 'UPDATE_REQUEST_STATUS':
      return {
        ...state,
        userRequests: state.userRequests.map(request =>
          request.request_id === action.payload.request_id
            ? { ...request, status: action.payload.status, reason: action.payload.reason }
            : request
        )
      };
    
    case 'UPDATE_WALLET':
      return { 
        ...state, 
        wallet: { ...state.wallet, ...action.payload } 
      };
    
    case 'SET_CURRENT_PAGE':
      return { ...state, currentPage: action.payload };
    
    case 'RESERVE_PROPERTY_VISIT':
      return {
        ...state,
        properties: state.properties.map(property =>
          property.url === action.payload.url
            ? { ...property, availableVisits: Math.max(0, (property.availableVisits || 1) - 1) }
            : property
        )
      };
    
    case 'RELEASE_PROPERTY_VISIT':
      return {
        ...state,
        properties: state.properties.map(property =>
          property.url === action.payload.url
            ? { ...property, availableVisits: (property.availableVisits || 0) + 1 }
            : property
        )
      };
    
    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: initialState.filters,
        currentPage: 1
      };

    // Nuevos reducers para eventos del broker
    case 'UPDATE_PROPERTIES_FROM_BROKER':
      return {
        ...state,
        properties: action.payload,
        filteredProperties: action.payload
      };

    case 'UPDATE_PROPERTY_VISITS':
      return {
        ...state,
        properties: state.properties.map(property =>
          property.id === action.payload.propertyId || property.url === action.payload.propertyId
            ? { ...property, availableVisits: action.payload.availableVisits }
            : property
        ),
        filteredProperties: state.filteredProperties.map(property =>
          property.id === action.payload.propertyId || property.url === action.payload.propertyId
            ? { ...property, availableVisits: action.payload.availableVisits }
            : property
        )
      };

    case 'RESERVE_VISIT_FROM_BROKER':
      return {
        ...state,
        properties: state.properties.map(property => {
          const matches = property.id === action.payload.propertyId || property.url === action.payload.propertyId;
          if (matches) {
            const currentVisits = property.availableVisits || 0;
            return { 
              ...property, 
              availableVisits: Math.max(0, currentVisits - 1),
              reservedBy: action.payload.groupId,
              reservationId: action.payload.requestId
            };
          }
          return property;
        }),
        filteredProperties: state.filteredProperties.map(property => {
          const matches = property.id === action.payload.propertyId || property.url === action.payload.propertyId;
          if (matches) {
            const currentVisits = property.availableVisits || 0;
            return { 
              ...property, 
              availableVisits: Math.max(0, currentVisits - 1),
              reservedBy: action.payload.groupId,
              reservationId: action.payload.requestId
            };
          }
          return property;
        })
      };

    case 'RELEASE_RESERVED_VISIT':
      return {
        ...state,
        properties: state.properties.map(property => {
          const matches = (property.id === action.payload.propertyId || property.url === action.payload.propertyId) 
            && property.reservationId === action.payload.requestId;
          if (matches) {
            const { reservedBy, reservationId, ...cleanProperty } = property;
            return { 
              ...cleanProperty, 
              availableVisits: (property.availableVisits || 0) + 1
            };
          }
          return property;
        }),
        filteredProperties: state.filteredProperties.map(property => {
          const matches = (property.id === action.payload.propertyId || property.url === action.payload.propertyId) 
            && property.reservationId === action.payload.requestId;
          if (matches) {
            const { reservedBy, reservationId, ...cleanProperty } = property;
            return { 
              ...cleanProperty, 
              availableVisits: (property.availableVisits || 0) + 1
            };
          }
          return property;
        })
      };

    case 'UPDATE_REQUEST_STATUS':
      return {
        ...state,
        userRequests: state.userRequests.map(request =>
          request.rental_id === action.payload.requestId || request.broker_request_id === action.payload.requestId
            ? { 
                ...request, 
                status: action.payload.status,
                validationData: action.payload.validationData,
                updatedAt: new Date().toISOString()
              }
            : request
        )
      };

    case 'ADD_NOTIFICATION':
      const notifications = state.notifications || [];
      return {
        ...state,
        notifications: [...notifications, {
          id: Date.now(),
          ...action.payload
        }]
      };

    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: (state.notifications || []).filter(notification => 
          notification.id !== action.payload.notificationId
        )
      };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Aplicar filtros (solo para filtrado local, no para paginación del servidor)
  useEffect(() => {
    let filtered = state.properties;
    
    // Solo aplicar filtros si hay propiedades y algún filtro está activo
    const hasActiveFilters = Object.values(state.filters).some(value => value !== '');
    
    if (hasActiveFilters) {
      if (state.filters.search) {
        const searchLower = state.filters.search.toLowerCase();
        filtered = filtered.filter(property =>
          property.name.toLowerCase().includes(searchLower) ||
          property.location.toLowerCase().includes(searchLower)
        );
      }
      
      // Manejar nueva estructura de precios
      if (state.filters.minPrice) {
        filtered = filtered.filter(property => {
          let priceValue;
          if (property.price_min !== undefined) {
            priceValue = property.price_min; // Usar precio mínimo para filtros
          } else if (property.price !== undefined) {
            priceValue = property.price; // Fallback a estructura anterior
          } else {
            return true; // Si no hay precio, no filtrar
          }
          return priceValue >= parseFloat(state.filters.minPrice);
        });
      }
      
      if (state.filters.maxPrice) {
        filtered = filtered.filter(property => {
          let priceValue;
          if (property.price_max !== undefined) {
            priceValue = property.price_max; // Usar precio máximo para filtros
          } else if (property.price !== undefined) {
            priceValue = property.price; // Fallback a estructura anterior
          } else {
            return true; // Si no hay precio, no filtrar
          }
          return priceValue <= parseFloat(state.filters.maxPrice);
        });
      }
      
      if (state.filters.bedrooms) {
        filtered = filtered.filter(property => {
          // Extraer número de dormitorios del texto "3 dormitorios"
          const bedroomText = property.bedrooms || '';
          const bedroomNumber = bedroomText.toString().match(/\d+/)?.[0];
          return bedroomNumber === state.filters.bedrooms;
        });
      }
      
      if (state.filters.bathrooms) {
        filtered = filtered.filter(property => {
          // Extraer número de baños del texto "2 baños"
          const bathroomText = property.bathrooms || '';
          const bathroomNumber = bathroomText.toString().match(/\d+/)?.[0];
          return bathroomNumber === state.filters.bathrooms;
        });
      }
      
      if (state.filters.location) {
        filtered = filtered.filter(property => 
          property.location.toLowerCase().includes(state.filters.location.toLowerCase())
        );
      }
      
      if (state.filters.currency) {
        filtered = filtered.filter(property => property.currency === state.filters.currency);
      }
    }
    
    dispatch({ type: 'SET_FILTERED_PROPERTIES', payload: filtered });
  }, [state.properties, state.filters]);

  const contextValue = {
    state,
    dispatch
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext debe ser usado dentro de AppProvider');
  }
  return context;
}