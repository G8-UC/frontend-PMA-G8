import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { FaUser, FaSpinner, FaGoogle, FaGithub } from 'react-icons/fa';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const { loginWithRedirect, isAuthenticated, isLoading, error } = useAuth0();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/properties');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = () => {
    loginWithRedirect();
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-content">
          <div className="login-header">
            <h1>Iniciar Sesión</h1>
            <p>Accede a tu cuenta para gestionar tus propiedades</p>
          </div>

          <div className="login-form">
            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            <button 
              type="button" 
              className="btn btn-primary btn-full auth0-login-btn"
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="spinner" />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <FaUser />
                  Iniciar Sesión con Auth0
                </>
              )}
            </button>

            <div className="login-divider">
              <span>O continúa con</span>
            </div>

            <div className="social-login">
              <button 
                type="button" 
                className="btn btn-social btn-google"
                onClick={handleLogin}
                disabled={isLoading}
              >
                <FaGoogle />
                Google
              </button>
              
              <button 
                type="button" 
                className="btn btn-social btn-github"
                onClick={handleLogin}
                disabled={isLoading}
              >
                <FaGithub />
                GitHub
              </button>
            </div>
          </div>

          <div className="login-footer">
            <p>
              Al iniciar sesión, aceptas nuestros términos de servicio
            </p>
            
            <Link to="/" className="back-link">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;