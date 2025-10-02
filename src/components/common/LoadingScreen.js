import React from 'react';
import { FaSpinner } from 'react-icons/fa';
import './LoadingScreen.css';

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <FaSpinner className="loading-spinner" />
        <h2>Cargando...</h2>
        <p>Verificando autenticación</p>
      </div>
    </div>
  );
}

export default LoadingScreen;