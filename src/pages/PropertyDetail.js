import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { usePurchaseRequests } from '../hooks/usePurchaseRequests';
import { purchaseRequestService } from '../services/purchaseRequestService';
import { useUFConverter } from '../hooks/useUFConverter';
import { propertyService } from '../services/propertyService';
import { FaBed, FaBath, FaRuler, FaMapMarkerAlt, FaCalendarAlt, FaArrowLeft, FaSpinner, FaExpand, FaExclamationTriangle, FaSync } from 'react-icons/fa';
import LoadingScreen from '../components/common/LoadingScreen';
import ImageModal from '../components/common/ImageModal';
import './PropertyDetail.css';

function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth0();
  // adicional: user y getAccessTokenSilently para envío de notificaciones
  const { user, getAccessTokenSilently } = useAuth0();
  const { createRequest, error: purchaseError } = usePurchaseRequests();
  const { getPriceInfo, calculate10PercentInCLP, formatPrice: formatUFPrice, refreshUFValue } = useUFConverter();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [renting, setRenting] = useState(false);
  const [rentSuccess, setRentSuccess] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [requestInProgress, setRequestInProgress] = useState(false);
  const [localRequestError, setLocalRequestError] = useState('');
  const [availableVisits, setAvailableVisits] = useState(null);
  const [visitPrice, setVisitPrice] = useState(null);
  const [priceInfo, setPriceInfo] = useState(null);
  const [loadingPriceInfo, setLoadingPriceInfo] = useState(false);

  // Nuevo estado para manejar notificación por correo
  const [requestId, setRequestId] = useState(null);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Nuevo estado: opción del usuario para recibir correo al confirmar la visita
  const [emailOptIn, setEmailOptIn] = useState(true);

  // Calcular información de visitas disponibles y precio (10% del arriendo)
  const calculateVisitInfo = useCallback(async (property) => {
    try {
      setLoadingPriceInfo(true);
      
      // Usar available_visits del backend, con fallback a simulación si no está disponible
      const visitsFromBackend = property.available_visits;
      if (visitsFromBackend !== undefined && visitsFromBackend !== null) {
        // Asegurar que el valor sea un número válido
        const validVisits = Math.max(0, parseInt(visitsFromBackend) || 0);
        setAvailableVisits(validVisits);
        console.log(`Visitas disponibles desde backend: ${validVisits}`);
      } else {
        // Fallback: simular visitas disponibles si no viene del backend
        const mockVisits = Math.floor(Math.random() * 10) + 1; // 1-10 visitas disponibles
        setAvailableVisits(mockVisits);
        console.log(`Visitas simuladas (fallback): ${mockVisits}`);
      }
      
      // Obtener información completa de precios con conversiones UF
      const basePrice = property.price || property.price_min || 0;
      const currency = property.currency || 'CLP';
      
      const fullPriceInfo = await getPriceInfo(basePrice, currency);
      setPriceInfo(fullPriceInfo);
      
      // Calcular precio de visita (10% del precio de arriendo)
      let visitCost = {
        amount: Math.round(basePrice * 0.1),
        currency: currency
      };

      // Si el precio original está en UF, calcular también el equivalente en CLP
      if (currency === 'UF') {
        try {
          const ufConversion = await calculate10PercentInCLP(basePrice);
          visitCost = {
            ufAmount: ufConversion.tenPercentUF,
            clpAmount: ufConversion.tenPercentCLP,
            currency: 'UF',
            clpEquivalent: true,
            ufValue: ufConversion.ufValue,
            ufDate: ufConversion.ufDate
          };
        } catch (error) {
          console.error('Error converting UF to CLP:', error);
          // Fallback al cálculo básico
        }
      }
      
      setVisitPrice(visitCost);
      
    } catch (error) {
      console.error('Error calculating visit info:', error);
      // Fallback básico
      const basePrice = property.price || property.price_min || 0;
      setVisitPrice({
        amount: Math.round(basePrice * 0.1),
        currency: property.currency || 'CLP'
      });
    } finally {
      setLoadingPriceInfo(false);
    }
  }, [getPriceInfo, calculate10PercentInCLP]);

  const loadProperty = useCallback(async () => {
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
        console.log('Available visits from backend:', foundProperty.available_visits);
        setProperty(foundProperty);
        
        // Calcular información de visitas (ahora async)
        await calculateVisitInfo(foundProperty);
      } else {
        setError('Propiedad no encontrada');
      }
    } catch (err) {
      console.error('Error loading property:', err);
      setError('No se pudo cargar la propiedad: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [id, calculateVisitInfo]);

  useEffect(() => {
    loadProperty();
  }, [loadProperty]);

  

  // Mostrar en consola el correo asociado a la cuenta de Auth0 cuando esté disponible
  useEffect(() => {
    if (!isAuthenticated) return;
    if (user?.email) {
      console.log('Auth0 user email:', user.email);
    } else {
      console.log('Auth0 user object (sin email):', user);
    }
  }, [isAuthenticated, user]);

  const handleRent = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Verificar visitas disponibles
    if (availableVisits <= 0) {
      setLocalRequestError('No hay visitas disponibles para esta propiedad');
      return;
    }

    try {
      setRenting(true);
      setRequestInProgress(true);
      setLocalRequestError('');
      
      // Usar ID si está disponible, sino usar URL para compatibilidad
      const propertyIdentifier = property.id || property.url;

      // Iniciar compra vía WebPay: backend devolverá webpay_url y token
      const response = await purchaseRequestService.createWebpayPurchase(propertyIdentifier);
      console.log('WebPay init response:', response);

      const webpayUrl = response?.webpay_url || response?.url || null;
      const webpayToken = response?.webpay_token || response?.token || null;

      // Guardar requestId si el backend lo retorna
      const returnedId = response?.request_id || response?.requestId || response?.request_id || response?.id || null;
      setRequestId(returnedId);

      setRentSuccess(true);

      // Si recibimos URL de WebPay, POSTEAMOS token_ws al endpoint de Webpay
      if (webpayUrl) {
        // Construir un formulario invisible y enviarlo por POST con token_ws
        try {
          const tokenValue = webpayToken || response?.token || response?.webpay_token || null;
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = webpayUrl;
          form.style.display = 'none';

          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = 'token_ws';
          input.value = tokenValue;
          form.appendChild(input);

          document.body.appendChild(form);
          form.submit();
          return; // la página se redirige a WebPay
        } catch (err) {
          console.error('Error submitting form to WebPay:', err);
        }
      } else if (webpayToken) {
        // Si solo tenemos token, redirigir a una ruta que muestre el estado esperando commit
        window.location.href = `/webpay/status?token_ws=${encodeURIComponent(webpayToken)}`;
        return;
      }

      // Si el usuario indicó que quiere notificación por correo, enviarla automáticamente
      if (emailOptIn) {
        // No bloquear la navegación; se intenta enviar en background
        handleSendEmail(returnedId).catch(err => {
          console.error('Error auto-enviando email tras solicitud:', err);
        });
      }
      
      // Redirigir a la lista de solicitudes después de un breve delay
      setTimeout(() => {
        navigate('/my-rentals');
      }, 2000);
      
    } catch (err) {
      console.error('Error creating purchase request:', err);
      setLocalRequestError(`Error al crear la solicitud: ${err.message}`);
    } finally {
      setRenting(false);
      setRequestInProgress(false);
    }
  };

  // Nueva función para enviar notificación por correo (se usa cuando la compra/solicitud está completada)
  const handleSendEmail = async (requestIdParam = null) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const idToUse = requestIdParam || requestId;
    if (!idToUse && !property) {
      setEmailError('No se encontró la información de la solicitud para notificar.');
      return;
    }

    try {
      setEmailSending(true);
      setEmailError('');

      // Obtener token si se usa autenticación para el endpoint de notificaciones
      let token;
      try {
        token = await getAccessTokenSilently();
      } catch (err) {
        // Si falla obtener token, continuamos sin él (dependiendo del backend puede ser público)
        token = null;
      }

      // Asegurar que tenemos el email del usuario.
      // Normalmente useAuth0().user contiene la claim "email" si en el login se pidió scope "email".
      // Si no está, intentar obtener /userinfo desde Auth0 usando el token (requiere REACT_APP_AUTH0_DOMAIN en env).
      let userEmail = user?.email || null;
      if (!userEmail && token) {
        try {
          const domain = process.env.REACT_APP_AUTH0_DOMAIN;
          if (domain) {
            const uiRes = await fetch(`https://${domain}/userinfo`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (uiRes.ok) {
              const ui = await uiRes.json();
              userEmail = ui?.email || userEmail;
            }
          }
        } catch (err) {
          console.warn('No se pudo obtener userinfo desde Auth0:', err);
        }
      }

      const payload = {
        requestId: idToUse,
        propertyId: property?.id || property?.url,
        user: {
          email: userEmail,
           name: user?.name
        }
      };

      const res = await fetch('/api/notify-visit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const text = await res.text().catch(() => null);
        throw new Error(text || `Error ${res.status} al enviar notificación`);
      }

      setEmailSent(true);
    } catch (err) {
      console.error('Error sending email notification:', err);
      setEmailError(err.message || 'Error al enviar notificación por correo');
    } finally {
      setEmailSending(false);
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
              
              {/* Información de conversión UF */}
              {priceInfo && priceInfo.conversions && (
                <div className="price-conversions">
                  {priceInfo.original.currency === 'UF' && priceInfo.conversions.clp && (
                    <div className="conversion-info">
                      <span className="conversion-label">Equivalente en CLP:</span>
                      <span className="conversion-value">
                        {formatUFPrice(priceInfo.conversions.clp.amount, 'CLP')}
                      </span>
                      <div className="uf-info">
                        <span className="uf-value">
                          UF: {formatUFPrice(priceInfo.conversions.clp.ufValue, 'CLP')}
                        </span>
                        <span className="uf-date">
                          ({new Date(priceInfo.conversions.clp.ufDate).toLocaleDateString('es-CL')})
                        </span>
                        <button 
                          className="uf-refresh"
                          onClick={refreshUFValue}
                          title="Actualizar valor UF"
                        >
                          <FaSync />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {priceInfo.original.currency === 'CLP' && priceInfo.conversions.uf && (
                    <div className="conversion-info">
                      <span className="conversion-label">Equivalente en UF:</span>
                      <span className="conversion-value">
                        {formatUFPrice(priceInfo.conversions.uf.amount, 'UF')}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Información de visitas disponibles */}
            <div className="visit-info">
              <div className="visit-availability">
                <h3>Visitas Disponibles</h3>
                <div className="visit-details">
                  <div className={`visit-count ${availableVisits === 0 ? 'no-visits' : ''}`}>
                    <span className="count">{availableVisits || 0}</span>
                    <span className="label">
                      {availableVisits === 0 ? 'sin visitas disponibles' : 'visitas disponibles'}
                    </span>
                  </div>
                  {visitPrice && !loadingPriceInfo && (
                    <div className="visit-price">
                      <span className="price-label">Costo por visita (10% del arriendo):</span>
                      
                      {visitPrice.clpEquivalent ? (
                        <div className="visit-price-uf">
                          <span className="price-value primary">
                            {formatUFPrice(visitPrice.ufAmount, 'UF')}
                          </span>
                          <span className="price-value secondary">
                            ≈ {formatUFPrice(visitPrice.clpAmount, 'CLP')}
                          </span>
                          <span className="price-note">
                            UF: {formatUFPrice(visitPrice.ufValue, 'CLP')} 
                            ({new Date(visitPrice.ufDate).toLocaleDateString('es-CL')})
                          </span>
                        </div>
                      ) : (
                        <div className="visit-price-normal">
                          <span className="price-value">
                            {visitPrice.currency === 'UF' ? 
                              formatUFPrice(visitPrice.amount, 'UF') : 
                              formatUFPrice(visitPrice.amount, visitPrice.currency)
                            }
                          </span>
                          <span className="price-note">(10% del precio de arriendo)</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {loadingPriceInfo && (
                    <div className="visit-price">
                      <span className="price-label">Calculando precio...</span>
                      <div className="price-loading">
                        <FaSpinner className="spinner" />
                        <span>Obteniendo valor UF actualizado</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

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
                  {typeof error === 'string' ? error : (error && (error.message || String(error)))}
                </div>
            )}

            {localRequestError && (
              <div className="alert alert-warning">
                <FaExclamationTriangle className="alert-icon" />
                {localRequestError}
              </div>
            )}
            
            {purchaseError && (
              <div className="alert alert-danger">
                <FaExclamationTriangle className="alert-icon" />
                {typeof purchaseError === 'string' ? purchaseError : (purchaseError && (purchaseError.message || String(purchaseError)))}
              </div>
            )}

            {rentSuccess && (
              <div className="alert alert-success">
                ¡Solicitud de arriendo enviada exitosamente! Te redirigiremos a tus solicitudes.
              </div>
            )}

            {/* Botón para enviar notificación por correo una vez creada la solicitud */}
            {rentSuccess && (
              <div className="email-notify">
                {emailError && (
                  <div className="alert alert-danger">
                    {emailError}
                  </div>
                )}
                {emailSent ? (
                  <div className="alert alert-info">
                    Notificación por correo enviada.
                  </div>
                ) : (
                  <button
                    className="btn btn-outline-primary"
                    onClick={handleSendEmail}
                    disabled={emailSending}
                    title="Enviar notificación por correo a los usuarios que solicitaron la visita"
                  >
                    {emailSending ? (
                      <>
                        <FaSpinner className="spinner" /> Enviando correo...
                      </>
                    ) : (
                      'Enviar notificación por correo'
                    )}
                  </button>
                )}
              </div>
            )}

            <div className="property-actions">
              {isAuthenticated ? (
                <div className="action-with-optin" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Casilla para que el usuario indique si quiere recibir correo */}
                  {!rentSuccess && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem' }}>
                      <input
                        type="checkbox"
                        checked={emailOptIn}
                        onChange={(e) => setEmailOptIn(e.target.checked)}
                      />
                      <span>Enviar notificación por correo</span>
                    </label>
                  )}

                  

                  <button 
                    className="btn btn-success btn-lg"
                    onClick={handleRent}
                    disabled={renting || rentSuccess || availableVisits <= 0}
                  >
                    {requestInProgress ? (
                      <>
                        <FaSpinner className="spinner" />
                        Enviando solicitud...
                      </>
                    ) : renting ? (
                      <>
                        <FaSpinner className="spinner" />
                        Procesando...
                      </>
                    ) : rentSuccess ? (
                      'Solicitud Enviada'
                    ) : availableVisits <= 0 ? (
                      'Sin visitas disponibles'
                    ) : (
                      `Solicitar Visita - ${visitPrice ? (
                        // Si el precio viene en UF con equivalente en CLP usamos ufAmount
                        visitPrice.clpEquivalent ?
                          `${visitPrice.ufAmount} UF` :
                          // En otros casos mostramos amount con formato según moneda
                          (visitPrice.currency === 'UF' ?
                            `${visitPrice.ufAmount ?? visitPrice.amount} UF` :
                            `$${(visitPrice.amount ?? 0).toLocaleString('es-CL')} ${visitPrice.currency}`)
                      ) : 'Precio calculando...'}` 
                    )}
                  </button>
                </div>
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