import React, { useEffect } from 'react';
import { FaTimes, FaSearchPlus } from 'react-icons/fa';
import './ImageModal.css';

function ImageModal({ isOpen, onClose, src, alt, title }) {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="image-modal-overlay" onClick={handleBackdropClick}>
      <div className="image-modal">
        <div className="image-modal-header">
          <h3 className="image-modal-title">{title || alt}</h3>
          <button 
            className="image-modal-close"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="image-modal-content">
          <img 
            src={src} 
            alt={alt}
            className="image-modal-img"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
            }}
          />
        </div>

        <div className="image-modal-footer">
          <div className="image-modal-hint">
            <FaSearchPlus />
            <span>Haz clic en la imagen para ver en tamaño completo</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageModal;