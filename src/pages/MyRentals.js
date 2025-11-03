import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { usePurchaseRequests } from '../hooks/usePurchaseRequests';
import { FaMapMarkerAlt, FaCalendarAlt, FaSpinner, FaHome, FaFilter, FaSearch, FaChevronLeft, FaChevronRight, FaCheckCircle, FaTimesCircle, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import LoadingScreen from '../components/common/LoadingScreen';
import './MyRentals.css';

function MyRentals() {
  const { isAuthenticated, isLoading: authLoading } = useAuth0();
  const navigate = useNavigate();
  const { 
    requests, 
    loading, 
    error, 
    pagination, 
    filters, 
    changePage, 
    applyFilters, 
    clearFilters, 
    refresh,
    getStatusStats,
    hasNextPage,
    hasPrevPage
  } = usePurchaseRequests();
  
  const [showFilters, setShowFilters] = useState(false);
  const [localFilter, setLocalFilter] = useState('');

  useEffect(() => {
    if (authLoading) return; // Esperar a que la autenticación termine de cargar
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleStatusFilter = (status) => {
    applyFilters({ status: status === 'ALL' ? null : status });
    // Limpiar filtro local cuando se cambie el filtro de estado
    setLocalFilter('');
  };

  // Filtro local como fallback - combina filtros de API y local
  const getFilteredRequests = () => {
    let filtered = requests;

    // Aplicar filtro de estado si está activo
    if (filters.status) {
      filtered = filtered.filter(request => request.status === filters.status);
    }

    // Aplicar filtro de búsqueda local si está activo
    if (localFilter.trim()) {
      const searchTerm = localFilter.toLowerCase();
      filtered = filtered.filter(request => {
        return (
          request.property_name?.toLowerCase().includes(searchTerm) ||
          request.property_location?.toLowerCase().includes(searchTerm) ||
          request.request_id?.toLowerCase().includes(searchTerm) ||
          request.status?.toLowerCase().includes(searchTerm)
        );
      });
    }

    return filtered;
  };

  const filteredRequests = getFilteredRequests();

  const getStatusIcon = (status) => {
    switch (status) {
      case 'VALIDATED':
        return <FaCheckCircle className="status-icon validated" />;
      case 'REJECTED':
        return <FaTimesCircle className="status-icon rejected" />;
      case 'EXPIRED':
        return <FaExclamationTriangle className="status-icon expired" />;
      case 'PENDING':
      default:
        return <FaClock className="status-icon pending" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'VALIDATED':
        return 'Aprobada';
      case 'REJECTED':
        return 'Rechazada';
      case 'EXPIRED':
        return 'Expirada';
      case 'PENDING':
      default:
        return 'Pendiente';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price, currency) => {
    if (currency === 'UF') {
      return `${price} UF`;
    } else if (currency === 'USD') {
      return `$${price.toLocaleString()} USD`;
    } else {
      return `$${price.toLocaleString()} CLP`;
    }
  };

  const stats = getStatusStats();

  if (authLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="my-rentals-page">
      <div className="my-rentals-container">
        <div className="my-rentals-header">
          <h1>Mis Solicitudes de Arriendo</h1>
          <p>Gestiona y revisa el estado de tus solicitudes de arriendo</p>
        </div>

        {/* Filtros y controles */}
        <div className="rentals-controls">
          <div className="filters-section">
            <button 
              className={`filter-toggle ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter />
              Filtros
            </button>
            
            {showFilters && (
              <div className="filters-panel">
                <div className="filter-group">
                  <label>Estado:</label>
                  <div className="status-filters">
                    <button 
                      className={`status-filter ${!filters.status ? 'active' : ''}`}
                      onClick={() => handleStatusFilter('ALL')}
                    >
                      Todos ({stats.total})
                    </button>
                    <button 
                      className={`status-filter ${filters.status === 'PENDING' ? 'active' : ''}`}
                      onClick={() => handleStatusFilter('PENDING')}
                    >
                      Pendientes ({stats.PENDING})
                    </button>
                    <button 
                      className={`status-filter ${filters.status === 'VALIDATED' ? 'active' : ''}`}
                      onClick={() => handleStatusFilter('VALIDATED')}
                    >
                      Aprobadas ({stats.VALIDATED})
                    </button>
                    <button 
                      className={`status-filter ${filters.status === 'REJECTED' ? 'active' : ''}`}
                      onClick={() => handleStatusFilter('REJECTED')}
                    >
                      Rechazadas ({stats.REJECTED})
                    </button>
                    <button 
                      className={`status-filter ${filters.status === 'EXPIRED' ? 'active' : ''}`}
                      onClick={() => handleStatusFilter('EXPIRED')}
                    >
                      Expiradas ({stats.EXPIRED})
                    </button>
                  </div>
                </div>
                
                <div className="filter-group">
                  <label>Búsqueda Local:</label>
                  <div className="search-input">
                    <FaSearch className="search-icon" />
                    <input
                      type="text"
                      placeholder="Buscar por propiedad, ubicación o ID..."
                      value={localFilter}
                      onChange={(e) => setLocalFilter(e.target.value)}
                      className="form-control"
                    />
                  </div>
                  <small className="filter-help">
                    Búsqueda instantánea en los resultados cargados
                  </small>
                </div>
                
                <div className="filter-actions">
                  <button className="clear-filters" onClick={clearFilters}>
                    Limpiar Filtros
                  </button>
                  <button className="refresh-btn" onClick={refresh}>
                    <FaSearch />
                    Actualizar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lista de solicitudes */}
        <div className="rentals-content">
          {loading ? (
            <div className="loading-state">
              <FaSpinner className="spinner" />
              <p>Cargando solicitudes...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <FaExclamationTriangle />
              <p>{error}</p>
              <button onClick={refresh} className="retry-btn">
                Reintentar
              </button>
            </div>
          ) : requests.length === 0 ? (
            <div className="empty-state">
              <FaHome className="empty-icon" />
              <h3>No tienes solicitudes de arriendo</h3>
              <p>Explora nuestras propiedades y crea tu primera solicitud</p>
              <Link to="/properties" className="btn btn-primary">
                Ver Propiedades
              </Link>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="empty-state">
              <FaSearch className="empty-icon" />
              <h3>No se encontraron resultados</h3>
              <p>No hay solicitudes que coincidan con tu búsqueda.</p>
              <button 
                className="btn btn-outline" 
                onClick={() => setLocalFilter('')}
              >
                Limpiar búsqueda
              </button>
            </div>
          ) : (
            <>
              {(localFilter || filters.status) && (
                <div className="search-results-info">
                  <p>
                    Mostrando {filteredRequests.length} de {requests.length} solicitudes
                    {filters.status && ` (Estado: ${getStatusText(filters.status)})`}
                    {localFilter && ` (Búsqueda: "${localFilter}")`}
                  </p>
                  <div className="active-filters">
                    {filters.status && (
                      <span className="filter-tag">
                        Estado: {getStatusText(filters.status)}
                        <button 
                          onClick={() => handleStatusFilter('ALL')}
                          className="remove-filter"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {localFilter && (
                      <span className="filter-tag">
                        Búsqueda: "{localFilter}"
                        <button 
                          onClick={() => setLocalFilter('')}
                          className="remove-filter"
                        >
                          ×
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
              <div className="rentals-list">
                {filteredRequests.map((request) => (
                  <div key={request.request_id} className="rental-card">
                    <div className="rental-header">
                      <div className="rental-info">
                        <h3>{request.property_name}</h3>
                        <p className="property-location">
                          <FaMapMarkerAlt />
                          {request.property_location}
                        </p>
                      </div>
                      <div className="rental-status">
                        {getStatusIcon(request.status)}
                        <span className={`status-text ${request.status.toLowerCase()}`}>
                          {getStatusText(request.status)}
                        </span>
                      </div>
                    </div>

                    <div className="rental-details">
                      <div className="rental-price">
                        <span className="price-label">Precio:</span>
                        <span className="price-value">
                          {formatPrice(request.price, request.currency)}
                        </span>
                      </div>
                      
                      <div className="rental-dates">
                        <div className="date-item">
                          <FaCalendarAlt />
                          <span>Solicitado: {formatDate(request.created_at)}</span>
                        </div>
                        {request.validated_at && (
                          <div className="date-item">
                            <FaCheckCircle />
                            <span>Procesado: {formatDate(request.validated_at)}</span>
                          </div>
                        )}
                      </div>

                      {request.validation_message && (
                        <div className="validation-message">
                          <p>{request.validation_message}</p>
                        </div>
                      )}
                    </div>

                    <div className="rental-actions">
                      <Link 
                        to={request.property_url} 
                        className="btn btn-outline btn-sm"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Ver Propiedad
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginación */}
              {pagination.totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="pagination-btn"
                    onClick={() => changePage(pagination.page - 1)}
                    disabled={!hasPrevPage}
                  >
                    <FaChevronLeft />
                    Anterior
                  </button>
                  
                  <div className="pagination-info">
                    Página {pagination.page} de {pagination.totalPages}
                    <span className="total-count">
                      ({pagination.totalCount} solicitudes)
                    </span>
                  </div>
                  
                  <button 
                    className="pagination-btn"
                    onClick={() => changePage(pagination.page + 1)}
                    disabled={!hasNextPage}
                  >
                    Siguiente
                    <FaChevronRight />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyRentals;