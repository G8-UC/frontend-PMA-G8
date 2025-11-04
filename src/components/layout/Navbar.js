import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useAuth } from '../../context/Auth0Context';
import { FaHome, FaBuilding, FaUser, FaSignInAlt, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import './Navbar.css';

function Navbar() {
  // Preferir el wrapper local para mantener la configuración (logoutParams) centralizada
  const { user, isAuthenticated, isLoading } = useAuth0();
  const { logout: logoutFromContext } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    // Usar el logout definido en Auth0Context (ya maneja returnTo)
    try {
      logoutFromContext();
    } catch (err) {
      // Fallback: registrar y redirigir a la página de inicio
      console.error('Logout failed:', err);
      try {
        window.location.href = '/';
      } catch (e) {
        // nothing else we can do
      }
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Mostrar loading si la autenticación está cargando
  if (isLoading) {
    return (
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand">
            <FaBuilding className="brand-icon" />
            <span>PropertyRental</span>
          </Link>
          <div className="navbar-loading">
            <span>Cargando...</span>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={closeMobileMenu}>
          <FaBuilding className="brand-icon" />
          <span>PropertyRental</span>
        </Link>

        <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link 
                to="/" 
                className={`nav-link ${isActive('/') ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <FaHome className="nav-icon" />
                <span>Inicio</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/properties" 
                className={`nav-link ${isActive('/properties') ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <FaBuilding className="nav-icon" />
                <span>Propiedades</span>
              </Link>
            </li>
            {isAuthenticated && (
              <li className="nav-item">
                <Link 
                  to="/my-rentals" 
                  className={`nav-link ${isActive('/my-rentals') ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  <FaUser className="nav-icon" />
                  <span>Mis Alquileres</span>
                </Link>
              </li>
            )}
          </ul>

          <div className="navbar-auth">
            {isAuthenticated ? (
              <div className="user-menu">
                <div className="user-info">
                  {user?.picture && (
                    <img 
                      src={user.picture} 
                      alt={user.name} 
                      className="user-avatar"
                    />
                  )}
                  <span className="user-greeting">
                    Hola, {user?.name || 'Usuario'}
                  </span>
                </div>
                <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                  <FaSignOutAlt className="nav-icon" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={handleLogin}>
                <FaSignInAlt className="nav-icon" />
                <span>Iniciar Sesión</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu button */}
        <button 
          className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;