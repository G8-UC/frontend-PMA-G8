import React, { useEffect, useCallback, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import PropertyCard from '../components/properties/PropertyCard';
import PropertyFilters from '../components/properties/PropertyFilters';
import { propertyService } from '../services/propertyService';
import { getUserRecommendations } from '../services/recommendations';
import { FaSpinner } from 'react-icons/fa';
import { useAuth0 } from '@auth0/auth0-react';
import './Properties.css';

function Properties() {
  const { state, dispatch } = useAppContext();
  const [recommended, setRecommended] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [recsError, setRecsError] = useState(null);

  const loadProperties = useCallback(async (page = 1, filters = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await propertyService.getProperties(page, filters);
      
      dispatch({ type: 'SET_PROPERTIES', payload: result });
      dispatch({ type: 'SET_PAGE', payload: page });
    } catch (error) {
      console.error('Error loading properties:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al cargar las propiedades' });
    }
  }, [dispatch]);

  useEffect(() => {
    loadProperties(1);
  }, [loadProperties]);

  // Recargar propiedades cuando cambien los filtros
  useEffect(() => {
    if (state.filters && Object.keys(state.filters).length > 0) {
      loadProperties(1, state.filters);
    }
  }, [state.filters, loadProperties]);

  const handlePageChange = (page) => {
    if (page !== state.pagination.currentPage && page > 0) {
      loadProperties(page, state.filters);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const { user, isAuthenticated } = useAuth0();
  const userId = user?.sub;
  useEffect(() => {
    if (!userId || !isAuthenticated) return;

    const fetchRecs = async () => {
      try {
        setLoadingRecs(true);
        setRecsError(null);
        const recs = await getUserRecommendations(userId);
        setRecommended(Array.isArray(recs) ? recs : []);
      } catch (err) {
        console.error('Error cargando recomendaciones:', err);
        setRecsError('No se pudieron cargar las recomendaciones');
      } finally {
        setLoadingRecs(false);
      }
    };

    fetchRecs();
  }, [userId, isAuthenticated]);


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
        </div>
        <section className="recommended-section" style={{ marginBottom: '1.5rem' }}>
          <h2>Recomendado para ti</h2>

          {loadingRecs && <p>Cargando recomendaciones...</p>}

          {recsError && <p style={{ color: 'red' }}>{recsError}</p>}

          {!loadingRecs && !recsError && recommended.length === 0 && (
            <p>No hay recomendaciones disponibles todavía.</p>
          )}

          {!loadingRecs && recommended.length > 0 && (
            <div className="properties-grid">
              {recommended.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                />
              ))}
            </div>
          )}
        </section>

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