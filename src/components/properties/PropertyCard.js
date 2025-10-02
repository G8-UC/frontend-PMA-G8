import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBed, FaBath, FaRuler, FaMapMarkerAlt, FaCalendarAlt, FaExpand } from 'react-icons/fa';
import ImageModal from '../common/ImageModal';
import './PropertyCard.css';

function PropertyCard({ property }) {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  
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
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="property-card">
      <div className="property-image">
        <img 
          src={property.img || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'} 
          alt={property.name}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
          }}
          onClick={() => setImageModalOpen(true)}
          style={{ cursor: 'pointer' }}
        />
        <div className="property-badge">
          {property.is_project ? 'Proyecto' : 'Disponible'}
        </div>
        <button 
          className="property-image-expand-btn"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setImageModalOpen(true);
          }}
          title="Ver imagen en tamaño completo"
        >
          <FaExpand />
        </button>
      </div>

      <div className="property-content">
        <div className="property-header">
          <h3 className="property-name">{property.name}</h3>
          <div className="property-location">
            <FaMapMarkerAlt className="icon" />
            <span>{property.location}</span>
          </div>
        </div>

        <div className="property-features">
          <div className="feature">
            <FaBed className="icon" />
            <span>{property.bedrooms} dorm.</span>
          </div>
          <div className="feature">
            <FaBath className="icon" />
            <span>{property.bathrooms} baños</span>
          </div>
          <div className="feature">
            <FaRuler className="icon" />
            <span>{property.m2} m²</span>
          </div>
        </div>

        <div className="property-price">
          <span className="price">
            {formatPrice(property)}
          </span>
          <span className="period">/mes</span>
        </div>

        <div className="property-footer">
          <div className="property-date">
            <FaCalendarAlt className="icon" />
            <span>{formatDate(property.last_updated || property.timestamp)}</span>
          </div>
          
          <Link 
            to={`/properties/${property.id || encodeURIComponent(property.url)}`}
            className="btn btn-primary btn-sm"
          >
            Ver Detalles
          </Link>
        </div>
      </div>

      {/* Modal de imagen */}
      <ImageModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        src={property.img || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
        alt={property.name}
        title={property.name}
      />
    </div>
  );
}

export default PropertyCard;