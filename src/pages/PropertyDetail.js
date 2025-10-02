import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { propertyService } from '../services/propertyService';
import { FaBed, FaBath, FaRuler, FaMapMarkerAlt, FaCalendarAlt, FaArrowLeft, FaSpinner, FaExpand } from 'react-icons/fa';
import LoadingScreen from '../components/common/LoadingScreen';
import ImageModal from '../components/common/ImageModal';
import './PropertyDetail.css';

function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { state, dispatch } = useAppContext();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [renting, setRenting] = useState(false);
  const [rentSuccess, setRentSuccess] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  useEffect(() => {
    loadProperty();
  }, [id]);

  const loadProperty = async () => {
    try {
      setLoading(true);
      setError('');
      
      const propertyId = decodeURIComponent(id);
      console.log('Loading property with id:', propertyId);
      
      // Verificar si es un UUID (nuevo formato) o URL (formato anterior)
      let foundProperty;
      if (propertyId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        // Es un UUID, usar el nuevo método
        foundProperty = await propertyService.getPropertyById(propertyId);
      } else {
        // Es una URL, usar el método anterior para compatibilidad
        foundProperty = await propertyService.getPropertyByUrl(propertyId);
      }
      
      if (foundProperty) {
        console.log('Property loaded successfully:', foundProperty);
        setProperty(foundProperty);
      } else {
        setError('Propiedad no encontrada');
      }
    } catch (err) {
      console.error('Error loading property:', err);
      setError('No se pudo cargar la propiedad: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRent = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setRenting(true);
      // Obtener el groupId del usuario (puedes configurarlo como metadata en Auth0)
      const groupId = user?.['custom:group_id'] || user?.groupId || 'G8';
      
      // Usar ID si está disponible, sino usar URL para compatibilidad
      const propertyIdentifier = property.id || property.url;
      await propertyService.rentProperty(propertyIdentifier, groupId);
      setRentSuccess(true);
      
      // Agregar la propiedad a las solicitudes del usuario
      dispatch({
        type: 'ADD_USER_REQUEST',
        payload: {
          ...property,
          rental_id: Date.now().toString(),
          rental_date: new Date().toISOString(),
          status: 'pending'
        }
      });
    } catch (err) {
      setError('Error al procesar la solicitud de alquiler');
    } finally {
      setRenting(false);
    }
  };

  const formatPrice = (property) => {
    const { price_min, price_max, currency, price } = property;
    
    // Usar la nueva estructura price_min/price_max si está disponible
    if (price_min !== undefined && price_max !== undefined) {
      if (price_min === price_max) {
        return `${currency}${price_min.toLocaleString('es-CL')}`;
      } else {
        return `${currency}${price_min.toLocaleString('es-CL')} - ${currency}${price_max.toLocaleString('es-CL')}`;
      }
    }
    
    // Fallback a la estructura anterior
    if (price !== undefined) {
      if (currency === 'UF') {
        return `${price} UF`;
      } else if (currency === 'USD') {
        return `$${price.toLocaleString('en-US')} USD`;
      } else {
        return `$${price.toLocaleString('es-CL')} CLP`;
      }
    }
    
    return 'Precio consultar';
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Mostrar pantalla de carga mientras la autenticación inicializa
  if (authLoading) {
    return <LoadingScreen />;
  }

  if (loading) {
    return (
      <div className="property-detail-loading">
        <FaSpinner className="spinner-icon" />
        <p>Cargando propiedad...</p>
      </div>
    );
  }

  if (error && !property) {
    return (
      <div className="property-detail-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => navigate('/properties')}>
          Volver a Propiedades
        </button>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="property-detail-error">
        <h2>Propiedad no encontrada</h2>
        <button className="btn btn-primary" onClick={() => navigate('/properties')}>
          Volver a Propiedades
        </button>
      </div>
    );
  }

  return (
    <div className="property-detail">
      <div className="container">
        <button 
          className="back-button"
          onClick={() => navigate('/properties')}
        >
          <FaArrowLeft />
          Volver a Propiedades
        </button>

        <div className="property-detail-content">
          <div className="property-images">
            <div className="main-image">
              <img 
                src={property.img || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'} 
                alt={property.name}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
                }}
                onClick={() => setImageModalOpen(true)}
                style={{ cursor: 'pointer' }}
              />
              <div className="image-badge">
                {property.is_project ? 'Proyecto' : 'Disponible'}
              </div>
              <button 
                className="image-expand-btn"
                onClick={() => setImageModalOpen(true)}
                title="Ver imagen en tamaño completo"
              >
                <FaExpand />
              </button>
            </div>
          </div>

          <div className="property-info">
            <div className="property-header">
              <h1 className="property-title">{property.name}</h1>
              <div className="property-location">
                <FaMapMarkerAlt className="icon" />
                <span>{property.location}</span>
              </div>
            </div>

            <div className="property-price">
              <span className="price">
                {formatPrice(property)}
              </span>
              <span className="period">/mes</span>
            </div>

            <div className="property-features">
              <div className="feature">
                <FaBed className="icon" />
                <div>
                  <span className="value">{property.bedrooms}</span>
                  <span className="label">Dormitorios</span>
                </div>
              </div>
              <div className="feature">
                <FaBath className="icon" />
                <div>
                  <span className="value">{property.bathrooms}</span>
                  <span className="label">Baños</span>
                </div>
              </div>
              <div className="feature">
                <FaRuler className="icon" />
                <div>
                  <span className="value">{property.m2}</span>
                  <span className="label">m²</span>
                </div>
              </div>
            </div>

            <div className="property-description">
              <h3>Descripción</h3>
              <p>
                Esta hermosa propiedad ubicada en {property.location} ofrece {property.bedrooms} dormitorios 
                y {property.bathrooms} baños en {property.m2} m² de espacio bien distribuido. 
                {property.is_project 
                  ? ' Se trata de un proyecto en desarrollo que estará listo próximamente.' 
                  : ' La propiedad está disponible para ocupación inmediata.'
                }
              </p>
            </div>

            <div className="property-details">
              <h3>Detalles</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Tipo:</span>
                  <span className="detail-value">
                    {property.is_project ? 'Proyecto' : 'Propiedad Terminada'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Publicado:</span>
                  <span className="detail-value">
                    <FaCalendarAlt className="detail-icon" />
                    {formatDate(property.last_updated || property.timestamp)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">URL:</span>
                  <span className="detail-value">
                    <a href={property.url} target="_blank" rel="noopener noreferrer">
                      Ver anuncio original
                    </a>
                  </span>
                </div>
              </div>
            </div>

            {error && !loading && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}

            {rentSuccess && (
              <div className="alert alert-success">
                ¡Solicitud de alquiler enviada exitosamente! Te contactaremos pronto.
              </div>
            )}

            <div className="property-actions">
              {isAuthenticated ? (
                <button 
                  className="btn btn-success btn-lg"
                  onClick={handleRent}
                  disabled={renting || rentSuccess}
                >
                  {renting ? (
                    <>
                      <FaSpinner className="spinner" />
                      Procesando...
                    </>
                  ) : rentSuccess ? (
                    'Solicitud Enviada'
                  ) : (
                    'Solicitar Alquiler'
                  )}
                </button>
              ) : (
                <button 
                  className="btn btn-primary btn-lg"
                  onClick={handleRent}
                >
                  Iniciar Sesión para Alquilar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de imagen */}
      <ImageModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        src={property?.img || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'}
        alt={property?.name}
        title={property?.name}
      />
    </div>
  );
}

export default PropertyDetail;