import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import LoadingScreen from '../components/common/LoadingScreen';

function AuthCallback() {
  const { isAuthenticated, isLoading, error } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // Usuario autenticado exitosamente, redirigir a properties
        navigate('/properties');
      } else if (error) {
        // Error en la autenticación, redirigir al login
        console.error('Auth0 error:', error);
        navigate('/login');
      } else {
        // No autenticado y sin error, redirigir al login
        navigate('/login');
      }
    }
  }, [isAuthenticated, isLoading, error, navigate]);

  // Mostrar loading mientras se procesa el callback
  return <LoadingScreen />;
}

export default AuthCallback;
