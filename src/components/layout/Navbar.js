import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaHome, FaBuilding, FaUser, FaSignInAlt, FaSignOutAlt, FaBars, FaTimes, FaWallet } from 'react-icons/fa';
import WalletBalance from '../WalletBalance';
import WalletRechargeModal from '../WalletRechargeModal';
import './Navbar.css';

function Navbar() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showWalletRecharge, setShowWalletRecharge] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    logout();
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
  if (loading) {
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
            {isAuthenticated && (
              <li className="nav-item">
                <Link 
                  to="/wallet" 
                  className={`nav-link ${isActive('/wallet') ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  <FaWallet className="nav-icon" />
                  <span>Mi Wallet</span>
                </Link>
              </li>
            )}
          </ul>

          <div className="navbar-auth">
            {isAuthenticated ? (
              <div className="user-menu">
                {/* Wallet Balance */}
                <div className="navbar-wallet">
                  <WalletBalance 
                    showRechargeButton={false}
                  />
                  <button 
                    className="wallet-recharge-btn"
                    onClick={() => setShowWalletRecharge(true)}
                    title="Recargar Wallet"
                  >
                    <FaWallet />
                  </button>
                </div>
                
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

      {/* Wallet Recharge Modal */}
      <WalletRechargeModal
        isOpen={showWalletRecharge}
        onClose={() => setShowWalletRecharge(false)}
      />
    </nav>
  );
}

export default Navbar;