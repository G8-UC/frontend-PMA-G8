import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { AppProvider } from './context/AppContext';
import { auth0Config } from './config/auth0';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Properties from './pages/Properties';
import Login from './pages/LoginNew';
import MyRentals from './pages/MyRentals';
import PropertyDetail from './pages/PropertyDetail';
import AuthCallback from './pages/AuthCallback';
import LoadingScreen from './components/common/LoadingScreen';
import ProtectedRoute from './components/common/ProtectedRoute';
import './App.css';

// Componente interno para configurar el cliente Auth0
function Auth0Setup() {
  const { getAccessTokenSilently } = useAuth0();
  
  // Configurar el cliente Auth0 globalmente para los interceptores
  React.useEffect(() => {
    window.auth0Client = {
      getAccessTokenSilently
    };
  }, [getAccessTokenSilently]);

  return (
    <AppProvider>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/properties/:id" element={<PropertyDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/callback" element={<AuthCallback />} />
            <Route 
              path="/my-rentals" 
              element={
                <ProtectedRoute>
                  <MyRentals />
                </ProtectedRoute>
              } 
            />
            <Route path="/loading" element={<LoadingScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </AppProvider>
  );
}

function App() {
  return (
    <Auth0Provider
      domain={auth0Config.domain}
      clientId={auth0Config.clientId}
      authorizationParams={{
        redirect_uri: auth0Config.redirectUri,
        audience: auth0Config.audience,
        scope: auth0Config.scope
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      <Auth0Setup />
    </Auth0Provider>
  );
}

export default App;