import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { propertyService } from '../services/propertyService';
import { FaBed, FaBath, FaRuler, FaMapMarkerAlt, FaCalendarAlt, FaSpinner, FaHome } from 'react-icons/fa';
import LoadingScreen from '../components/common/LoadingScreen';
import './MyRentals.css';

function MyRentals() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return; // Esperar a que la autenticación termine de cargar
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    loadRentals();
  }, [isAuthenticated, authLoading, navigate]);

  const loadRentals = async () => {
    try {
      setLoading(true);
      const userRentals = await propertyService.getUserRentals(user?.id);
      setRentals(userRentals);
    } catch (err) {
      setError('Error al cargar tus alquileres');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('es-CL').format(price);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Activo', className: 'status-active' },
      pending: { label: 'Pendiente', className: 'status-pending' },
      cancelled: { label: 'Cancelado', className: 'status-cancelled' },
      expired: { label: 'Expirado', className: 'status-expired' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`status-badge ${config.className}`}>
        {config.label}
      </span>
    );
  };

  // Mostrar pantalla de carga mientras la autenticación inicializa
  if (authLoading) {
    return <LoadingScreen />;
  }

  // Si no está autenticado, no mostrar nada (ya se redirige)
  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="my-rentals-loading">
        <FaSpinner className="spinner-icon" />
        <p>Cargando tus alquileres...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-rentals-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={loadRentals}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="my-rentals">
      <div className="container">
        <div className="my-rentals-header">
          <h1>Mis Alquileres</h1>
          <p>Gestiona tus propiedades alquiladas</p>
        </div>

        <div className="user-info">
          <div className="user-card">
            <div className="user-details">
              <div className="user-profile">
                {user?.picture && (
                  <img 
                    src={user.picture} 
                    alt={user.name} 
                    className="user-profile-image"
                  />
                )}
                <div>
                  <h3>Bienvenido, {user?.name}</h3>
                  <p>Email: {user?.email}</p>
                  <p>ID: {user?.auth0Id?.split('|')[1] || user?.id}</p>
                </div>
              </div>
            </div>
            <div className="rental-stats">
              <div className="stat">
                <span className="stat-number">{rentals.length}</span>
                <span className="stat-label">Propiedades</span>
              </div>
              <div className="stat">
                <span className="stat-number">
                  {rentals.filter(r => r.status === 'active').length}
                </span>
                <span className="stat-label">Activos</span>
              </div>
            </div>
          </div>
        </div>

        {rentals.length > 0 ? (
          <div className="rentals-grid">
            {rentals.map((rental) => (
              <div key={rental.rental_id} className="rental-card">
                <div className="rental-image">
                  <img 
                    src={rental.img || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'} 
                    alt={rental.name}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                  {getStatusBadge(rental.status)}
                </div>

                <div className="rental-content">
                  <div className="rental-header">
                    <h3 className="rental-name">{rental.name}</h3>
                    <div className="rental-location">
                      <FaMapMarkerAlt className="icon" />
                      <span>{rental.location}</span>
                    </div>
                  </div>

                  <div className="rental-features">
                    <div className="feature">
                      <FaBed className="icon" />
                      <span>{rental.bedrooms} dorm.</span>
                    </div>
                    <div className="feature">
                      <FaBath className="icon" />
                      <span>{rental.bathrooms} baños</span>
                    </div>
                    <div className="feature">
                      <FaRuler className="icon" />
                      <span>{rental.m2} m²</span>
                    </div>
                  </div>

                  <div className="rental-price">
                    <span className="price">
                      {formatPrice(rental.price, rental.currency)} {rental.currency}
                    </span>
                    <span className="period">/mes</span>
                  </div>

                  <div className="rental-dates">
                    <div className="rental-date">
                      <FaCalendarAlt className="icon" />
                      <span>Alquilado: {formatDate(rental.rental_date)}</span>
                    </div>
                  </div>

                  <div className="rental-actions">
                    <Link 
                      to={`/properties/${encodeURIComponent(rental.url)}`}
                      className="btn btn-outline btn-sm"
                    >
                      Ver Detalles
                    </Link>
                    {rental.url && (
                      <a 
                        href={rental.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
                      >
                        Ver Original
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-rentals">
            <div className="no-rentals-content">
              <FaHome className="no-rentals-icon" />
              <h3>No tienes alquileres aún</h3>
              <p>Explora nuestras propiedades y encuentra tu hogar ideal</p>
              <Link to="/properties" className="btn btn-primary btn-lg">
                Explorar Propiedades
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyRentals;