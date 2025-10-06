import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import PropertyCard from '../components/properties/PropertyCard';
import PropertyFilters from '../components/properties/PropertyFilters';
import { propertyService } from '../services/propertyService';
import { FaSpinner, FaWifi, FaExclamationTriangle } from 'react-icons/fa';
import './Properties.css';

function Properties() {
  const { state, dispatch } = useAppContext();
  const [apiStatus, setApiStatus] = useState(null);
  const [testingApi, setTestingApi] = useState(false);

  useEffect(() => {
    loadProperties(1);
  }, []);

  const loadProperties = async (page = 1) => {
    console.log(`Loading properties for page: ${page}`);
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await propertyService.getProperties(page);
      console.log('Properties received:', result);
      console.log(`Page ${page}: ${result.properties.length} properties, hasMore: ${result.hasMore}`);
      
      dispatch({ type: 'SET_PROPERTIES', payload: result });
      dispatch({ type: 'SET_PAGE', payload: page });
    } catch (error) {
      console.error('Error loading properties:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al cargar las propiedades' });
    }
  };

  const handlePageChange = (page) => {
    console.log(`Changing from page ${state.pagination.currentPage} to page ${page}`);
    if (page !== state.pagination.currentPage && page > 0) {
      loadProperties(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const testApiConnection = async () => {
    setTestingApi(true);
    setApiStatus(null);
    
    try {
      const result = await propertyService.testApiConnection();
      setApiStatus(result);
      console.log('API test result:', result);
    } catch (error) {
      console.error('Error testing API:', error);
      setApiStatus({
        success: false,
        error: error.message
      });
    } finally {
      setTestingApi(false);
    }
  };

  // Para la paginación del servidor, mostramos todas las propiedades cargadas
  const filteredProperties = Array.isArray(state.filteredProperties) ? state.filteredProperties : [];
  const currentProperties = filteredProperties; // No necesitamos slice aquí porque el servidor ya pagina

  if (state.loading) {
    return (
      <div className="properties-loading">
        <FaSpinner className="spinner-icon" />
        <p>Cargando propiedades...</p>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="properties-error">
        <h2>Error</h2>
        <p>{state.error}</p>
        <button 
          className="btn btn-primary"
          onClick={loadProperties}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="properties-page">
      <div className="container">
        <div className="properties-header">
          <h1>Propiedades Disponibles</h1>
          <p>Encuentra tu hogar ideal entre nuestras {Array.isArray(state.properties) ? state.properties.length : 0} propiedades</p>
          
          {/* Botón de prueba de API */}
          <div className="api-test-section">
            <button 
              className="btn btn-outline btn-sm"
              onClick={testApiConnection}
              disabled={testingApi}
            >
              {testingApi ? (
                <>
                  <FaSpinner className="spinner" />
                  Probando API...
                </>
              ) : (
                <>
                  <FaWifi />
                  Probar Conexión API
                </>
              )}
            </button>
            
            {apiStatus && (
              <div className={`api-status ${apiStatus.success ? 'success' : 'error'}`}>
                {apiStatus.success ? (
                  <>
                    <FaWifi className="status-icon" />
                    <span>API conectada exitosamente (Status: {apiStatus.status})</span>
                  </>
                ) : (
                  <>
                    <FaExclamationTriangle className="status-icon" />
                    <span>Error de conexión: {apiStatus.error}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <PropertyFilters />

        <div className="properties-results">
          <div className="results-header">
            <h2>
              {filteredProperties.length > 0 
                ? `${filteredProperties.length} propiedades encontradas (Página ${state.pagination.currentPage})`
                : 'No se encontraron propiedades'
              }
            </h2>
            {filteredProperties.length > 0 && (
              <p>
                Página {state.pagination.currentPage} - {filteredProperties.length} propiedades
                {filteredProperties.length === 25 && " (puede haber más páginas)"}
              </p>
            )}
          </div>

          {filteredProperties.length > 0 ? (
            <>
              <div className="properties-grid">
                {currentProperties.map((property, index) => (
                  <PropertyCard 
                    key={`${property.url}-${index}`} 
                    property={property} 
                  />
                ))}
              </div>

              {/* Mostrar paginación siempre que haya propiedades o potencialmente más páginas */}
              {(filteredProperties.length > 0 || state.pagination.currentPage > 1) && (
                <div className="pagination">
                  <button
                    className="btn btn-outline"
                    onClick={() => handlePageChange(state.pagination.currentPage - 1)}
                    disabled={state.pagination.currentPage === 1}
                  >
                    Anterior
                  </button>
                  
                  <div className="page-numbers">
                    <span className="current-page">
                      Página {state.pagination.currentPage}
                    </span>
                  </div>
                  
                  <button
                    className="btn btn-outline"
                    onClick={() => handlePageChange(state.pagination.currentPage + 1)}
                    disabled={state.loading || filteredProperties.length < 25}
                    title={filteredProperties.length < 25 ? "No hay más páginas" : `Ir a página ${state.pagination.currentPage + 1}`}
                  >
                    {state.loading ? "Cargando..." : "Siguiente"}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-properties">
              <div className="no-properties-content">
                <h3>No se encontraron propiedades</h3>
                <p>Intenta ajustar los filtros para ver más resultados</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => dispatch({ type: 'CLEAR_FILTERS' })}
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Properties;