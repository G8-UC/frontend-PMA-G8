import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const { login, register, isAuthenticated, loading, error, clearError } = useAuth();
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    clearError();
  }, [isLoginMode, clearError]);

  const validateForm = () => {
    const errors = {};

    if (!formData.email) {
      errors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'El email no es válido';
    }

    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!isLoginMode) {
      if (!formData.name) {
        errors.name = 'El nombre es requerido';
      }
      
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (isLoginMode) {
        await login(formData.email, formData.password);
      } else {
        await register({
          email: formData.email,
          password: formData.password,
          name: formData.name
        });
      }
    } catch (err) {
      console.error('Auth error:', err);
      // El error ya se maneja en el contexto
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setFormData({
      email: '',
      password: '',
      name: '',
      confirmPassword: ''
    });
    setFormErrors({});
  };
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>Bienvenido</h1>
            <p>Inicia sesión para acceder a tu cuenta y gestionar tus propiedades</p>
          </div>

          {error && (
            <div className="alert alert-danger">
              Error de autenticación: {error.message}
            </div>
          )}

          <div className="login-content">
            <div className="auth0-login">
              <button
                onClick={handleLogin}
                className="btn btn-primary btn-lg auth-button"
              >
                <FaUser className="btn-icon" />
                Iniciar Sesión con Auth0
              </button>
            </div>

            <div className="login-divider">
              <span>Métodos de autenticación disponibles</span>
            </div>

            <div className="auth-methods">
              <div className="auth-method">
                <FaGoogle className="auth-icon" />
                <span>Google</span>
              </div>
              <div className="auth-method">
                <FaGithub className="auth-icon" />
                <span>GitHub</span>
              </div>
              <div className="auth-method">
                <FaLinkedin className="auth-icon" />
                <span>LinkedIn</span>
              </div>
              <div className="auth-method">
                <FaLock className="auth-icon" />
                <span>Email/Password</span>
              </div>
            </div>

            <div className="login-info">
              <h4>🔐 Autenticación Segura con Auth0</h4>
              <ul>
                <li>✅ Autenticación multifactor disponible</li>
                <li>✅ Soporte para múltiples proveedores sociales</li>
                <li>✅ Gestión segura de sesiones</li>
                <li>✅ Encriptación de extremo a extremo</li>
              </ul>
            </div>
          </div>

          <div className="login-footer">
            <p>
              Al iniciar sesión, aceptas nuestros términos de servicio y política de privacidad.
            </p>
            <button 
              onClick={() => navigate('/')}
              className="link-button"
            >
              Volver al inicio
            </button>
          </div>
        </div>

        <div className="login-image">
          <img 
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
            alt="Modern apartment"
          />
          <div className="image-overlay">
            <h2>Gestiona tus propiedades</h2>
            <p>Accede a tu dashboard personalizado y encuentra las mejores oportunidades de alquiler</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;