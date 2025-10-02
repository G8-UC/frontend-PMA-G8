import React from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaHome, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';
import './Home.css';

function Home() {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="container">
            <div className="hero-text">
              <h1 className="hero-title">
                Encuentra tu próximo hogar
              </h1>
              <p className="hero-subtitle">
                Descubre miles de propiedades disponibles para alquilar en las mejores ubicaciones. 
                Comienza tu búsqueda hoy mismo.
              </p>
              <div className="hero-actions">
                <Link to="/properties" className="btn btn-primary btn-lg">
                  <FaSearch className="btn-icon" />
                  Explorar Propiedades
                </Link>
                <Link to="/login" className="btn btn-outline btn-lg">
                  Iniciar Sesión
                </Link>
              </div>
            </div>
            <div className="hero-image">
              <img 
                src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                alt="Beautiful home" 
              />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Home;