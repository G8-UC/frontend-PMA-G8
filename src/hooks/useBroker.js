import { useState, useEffect, useCallback } from 'react';
import { brokerService } from '../services/brokerService';
import { useAuth0 } from '@auth0/auth0-react';

export function useBroker() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [lastError, setLastError] = useState(null);
  const { user, isAuthenticated } = useAuth0();

  // Conectar al broker cuando el usuario esté autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      connectToBroker();
    } else {
      disconnectFromBroker();
    }

    return () => {
      disconnectFromBroker();
    };
  }, [isAuthenticated, user]);

  // Escuchar eventos del broker
  useEffect(() => {
    const handleConnectionLost = () => {
      setIsConnected(false);
      setConnectionStatus('disconnected');
      setLastError('Connection lost to broker');
    };

    const handlePropertyInfo = (event) => {
      console.log('Property info updated:', event.detail);
      // Aquí puedes actualizar el estado global de propiedades si es necesario
    };

    const handlePropertyRequest = (event) => {
      console.log('Property request received:', event.detail);
      // Manejar solicitudes de otros grupos
    };

    const handlePropertyValidation = (event) => {
      console.log('Property validation received:', event.detail);
      // Actualizar estado de solicitudes del usuario
    };

    // Registrar event listeners
    window.addEventListener('brokerConnectionLost', handleConnectionLost);
    window.addEventListener('propertyInfoUpdated', handlePropertyInfo);
    window.addEventListener('propertyRequestReceived', handlePropertyRequest);
    window.addEventListener('propertyValidationReceived', handlePropertyValidation);

    return () => {
      window.removeEventListener('brokerConnectionLost', handleConnectionLost);
      window.removeEventListener('propertyInfoUpdated', handlePropertyInfo);
      window.removeEventListener('propertyRequestReceived', handlePropertyRequest);
      window.removeEventListener('propertyValidationReceived', handlePropertyValidation);
    };
  }, []);

  const connectToBroker = useCallback(async () => {
    if (isConnected) return;

    try {
      setConnectionStatus('connecting');
      setLastError(null);
      
      await brokerService.connect();
      
      setIsConnected(true);
      setConnectionStatus('connected');
      console.log('Successfully connected to broker');
      
    } catch (error) {
      console.error('Failed to connect to broker:', error);
      setIsConnected(false);
      setConnectionStatus('error');
      setLastError(error.message);
    }
  }, [isConnected]);

  const disconnectFromBroker = useCallback(() => {
    brokerService.disconnect();
    setIsConnected(false);
    setConnectionStatus('disconnected');
    setLastError(null);
  }, []);

  const sendPurchaseRequest = useCallback(async (propertyId, visitType = 'VISIT') => {
    if (!isConnected) {
      throw new Error('Not connected to broker');
    }

    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await brokerService.sendPurchaseRequest(
        propertyId,
        user.id,
        visitType
      );
      
      return response;
      
    } catch (error) {
      console.error('Failed to send purchase request:', error);
      throw error;
    }
  }, [isConnected, user]);

  const retryConnection = useCallback(() => {
    if (connectionStatus === 'error') {
      connectToBroker();
    }
  }, [connectionStatus, connectToBroker]);

  return {
    isConnected,
    connectionStatus,
    lastError,
    connectToBroker,
    disconnectFromBroker,
    sendPurchaseRequest,
    retryConnection
  };
}