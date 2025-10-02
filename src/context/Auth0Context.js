import React, { createContext, useContext, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useAppContext } from './AppContext';

const Auth0Context = createContext();

export function Auth0Provider({ children }) {
  const { dispatch } = useAppContext();
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
    getIdTokenClaims
  } = useAuth0();

  // Sincronizar el estado de Auth0 con nuestro contexto de aplicación
  useEffect(() => {
    if (isAuthenticated && user) {
      const userData = {
        id: user.sub,
        name: user.name || user.nickname,
        email: user.email,
        picture: user.picture,
        groupId: user['custom:group_id'] || 'G8', // Campo personalizado para el grupo
        auth0Id: user.sub
      };
      
      dispatch({ type: 'SET_USER', payload: userData });
    } else if (!isAuthenticated && !isLoading) {
      dispatch({ type: 'LOGOUT_USER' });
    }
  }, [isAuthenticated, user, isLoading, dispatch]);

  // Función para hacer login
  const login = () => {
    loginWithRedirect({
      appState: {
        returnTo: window.location.pathname
      }
    });
  };

  // Función para hacer logout
  const logoutUser = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
  };

  // Función para obtener token de acceso (útil para hacer requests al backend)
  const getToken = async () => {
    try {
      if (isAuthenticated) {
        return await getAccessTokenSilently();
      }
      return null;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  };

  // Función para obtener claims del token ID
  const getUserClaims = async () => {
    try {
      if (isAuthenticated) {
        return await getIdTokenClaims();
      }
      return null;
    } catch (error) {
      console.error('Error getting ID token claims:', error);
      return null;
    }
  };

  const contextValue = {
    // Estados de Auth0
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // Funciones de autenticación
    login,
    logout: logoutUser,
    
    // Funciones para tokens
    getToken,
    getUserClaims,
    
    // Funciones originales de Auth0 por si se necesitan
    loginWithRedirect,
    getAccessTokenSilently,
    getIdTokenClaims
  };

  return (
    <Auth0Context.Provider value={contextValue}>
      {children}
    </Auth0Context.Provider>
  );
}

export function useAuth() {
  const context = useContext(Auth0Context);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de Auth0Provider');
  }
  return context;
}