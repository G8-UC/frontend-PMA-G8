import { useState, useEffect, useCallback } from 'react';
import { purchaseRequestService } from '../services/purchaseRequestService';

export function usePurchaseRequests(groupId = '8') {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    status: null,
    group_id: groupId
  });

  // Cargar solicitudes
  const loadRequests = useCallback(async (page = 1, newFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit: pagination.limit,
        ...filters,
        ...newFilters
      };

      const response = await purchaseRequestService.getPurchaseRequests(params);
      
      setRequests(response.requests || []);
      setPagination({
        page: response.page || page,
        limit: response.limit || pagination.limit,
        totalCount: response.total_count || 0,
        totalPages: response.total_pages || 0
      });

    } catch (err) {
      console.error('Error loading purchase requests:', err);
      setError(err.message || 'Error al cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit]);

  // Crear nueva solicitud
  const createRequest = useCallback(async (propertyId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await purchaseRequestService.createPurchaseRequest(propertyId, groupId);
      
      // Recargar la lista después de crear
      await loadRequests(pagination.page);
      
      return response;
    } catch (err) {
      console.error('Error creating purchase request:', err);
      setError(err.message || 'Error al crear la solicitud');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [groupId, pagination.page, loadRequests]);

  // Cambiar página
  const changePage = useCallback((newPage) => {
    loadRequests(newPage);
  }, [loadRequests]);

  // Aplicar filtros
  const applyFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    loadRequests(1, newFilters);
  }, [loadRequests]);

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    const defaultFilters = { status: null, group_id: groupId };
    setFilters(defaultFilters);
    loadRequests(1, defaultFilters);
  }, [groupId, loadRequests]);

  // Refrescar datos
  const refresh = useCallback(() => {
    loadRequests(pagination.page);
  }, [loadRequests, pagination.page]);

  // Cargar datos iniciales
  useEffect(() => {
    loadRequests(1);
  }, []);

  // Obtener estadísticas por estado
  const getStatusStats = useCallback(() => {
    const stats = requests.reduce((acc, request) => {
      acc[request.status] = (acc[request.status] || 0) + 1;
      return acc;
    }, {});

    return {
      PENDING: stats.PENDING || 0,
      VALIDATED: stats.VALIDATED || 0,
      REJECTED: stats.REJECTED || 0,
      EXPIRED: stats.EXPIRED || 0,
      total: requests.length
    };
  }, [requests]);

  return {
    // Estado
    requests,
    loading,
    error,
    pagination,
    filters,
    
    // Acciones
    createRequest,
    loadRequests,
    changePage,
    applyFilters,
    clearFilters,
    refresh,
    
    // Utilidades
    getStatusStats,
    hasNextPage: pagination.page < pagination.totalPages,
    hasPrevPage: pagination.page > 1
  };
}
