import { useState, useEffect, useCallback } from 'react';
import { brokerService } from '../services/brokerService';
import { useAppContext } from '../context/AppContext';

export function useBrokerEvents() {
  const { dispatch } = useAppContext();
  const [eventsReceived, setEventsReceived] = useState([]);
  const [lastPropertyInfo, setLastPropertyInfo] = useState(null);
  const [lastValidation, setLastValidation] = useState(null);

  useEffect(() => {
    // Listener para properties/info - Información de propiedades actualizada
    const handlePropertyInfo = (event) => {
      const data = event.detail;
      console.log('Property info event received:', data);
      
      setLastPropertyInfo(data);
      setEventsReceived(prev => [...prev, {
        type: 'info',
        data,
        timestamp: new Date().toISOString()
      }]);

      // Actualizar propiedades en el contexto global
      if (data.properties) {
        dispatch({
          type: 'UPDATE_PROPERTIES_FROM_BROKER',
          payload: data.properties
        });
      }

      // Actualizar disponibilidad de visitas para propiedades específicas
      if (data.property_id && data.available_visits !== undefined) {
        dispatch({
          type: 'UPDATE_PROPERTY_VISITS',
          payload: {
            propertyId: data.property_id,
            availableVisits: data.available_visits
          }
        });
      }
    };

    // Listener para properties/requests - Solicitudes de otros grupos
    const handlePropertyRequest = (event) => {
      const data = event.detail;
      console.log('Property request event received:', data);
      
      setEventsReceived(prev => [...prev, {
        type: 'request',
        data,
        timestamp: new Date().toISOString()
      }]);

      // Si es una solicitud de otro grupo, reservar visitas temporalmente
      if (data.group_id !== 'G8' && data.property_id) {
        dispatch({
          type: 'RESERVE_VISIT_FROM_BROKER',
          payload: {
            propertyId: data.property_id,
            requestId: data.request_id,
            groupId: data.group_id,
            reserved: true
          }
        });

        // Mostrar notificación al usuario
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            type: 'info',
            message: `Otro grupo solicitó una visita para la propiedad ${data.property_id}`,
            timestamp: new Date().toISOString()
          }
        });
      }
    };

    // Listener para properties/validation - Validaciones de pago
    const handlePropertyValidation = (event) => {
      const data = event.detail;
      console.log('Property validation event received:', data);
      
      setLastValidation(data);
      setEventsReceived(prev => [...prev, {
        type: 'validation',
        data,
        timestamp: new Date().toISOString()
      }]);

      // Actualizar estado de solicitudes basado en validación
      if (data.request_id) {
        const isValid = data.valid === true || data.status === 'approved';
        
        dispatch({
          type: 'UPDATE_REQUEST_STATUS',
          payload: {
            requestId: data.request_id,
            status: isValid ? 'completed' : 'failed',
            validationData: data
          }
        });

        // Si la validación falló, devolver la visita al pool disponible
        if (!isValid && data.property_id) {
          dispatch({
            type: 'RELEASE_RESERVED_VISIT',
            payload: {
              propertyId: data.property_id,
              requestId: data.request_id
            }
          });
        }

        // Mostrar notificación al usuario
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            type: isValid ? 'success' : 'error',
            message: isValid ? 
              'Tu solicitud de visita ha sido aprobada' : 
              'Tu solicitud de visita fue rechazada',
            timestamp: new Date().toISOString()
          }
        });
      }
    };

    // Registrar todos los event listeners
    window.addEventListener('propertyInfoUpdated', handlePropertyInfo);
    window.addEventListener('propertyRequestReceived', handlePropertyRequest);
    window.addEventListener('propertyValidationReceived', handlePropertyValidation);

    return () => {
      // Limpiar event listeners
      window.removeEventListener('propertyInfoUpdated', handlePropertyInfo);
      window.removeEventListener('propertyRequestReceived', handlePropertyRequest);
      window.removeEventListener('propertyValidationReceived', handlePropertyValidation);
    };
  }, [dispatch]);

  // Función para obtener estadísticas de eventos
  const getEventStats = useCallback(() => {
    const stats = eventsReceived.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {});

    return {
      total: eventsReceived.length,
      byType: stats,
      lastEvent: eventsReceived[eventsReceived.length - 1] || null
    };
  }, [eventsReceived]);

  // Función para limpiar eventos antiguos (mantener solo los últimos 100)
  const cleanOldEvents = useCallback(() => {
    setEventsReceived(prev => prev.slice(-100));
  }, []);

  return {
    eventsReceived,
    lastPropertyInfo,
    lastValidation,
    getEventStats,
    cleanOldEvents
  };
}