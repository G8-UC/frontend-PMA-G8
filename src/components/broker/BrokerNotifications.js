import React, { useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useBrokerEvents } from '../../hooks/useBrokerEvents';
import { FaTimes, FaCheckCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import './BrokerNotifications.css';

function BrokerNotifications() {
  const { state, dispatch } = useAppContext();
  const { eventsReceived, getEventStats } = useBrokerEvents();
  const notifications = state.notifications || [];

  // Auto-remove notifications after 5 seconds
  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.id) {
        setTimeout(() => {
          dispatch({
            type: 'REMOVE_NOTIFICATION',
            payload: { notificationId: notification.id }
          });
        }, 5000);
      }
    });
  }, [notifications, dispatch]);

  const removeNotification = (notificationId) => {
    dispatch({
      type: 'REMOVE_NOTIFICATION',
      payload: { notificationId }
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="notification-icon success" />;
      case 'error':
        return <FaExclamationTriangle className="notification-icon error" />;
      case 'warning':
        return <FaExclamationTriangle className="notification-icon warning" />;
      default:
        return <FaInfoCircle className="notification-icon info" />;
    }
  };

  const formatEventTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const eventStats = getEventStats();

  if (notifications.length === 0 && eventsReceived.length === 0) {
    return null;
  }

  return (
    <div className="broker-notifications">
      {/* Notificaciones activas */}
      {notifications.length > 0 && (
        <div className="notifications-container">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`notification notification-${notification.type}`}
            >
              {getNotificationIcon(notification.type)}
              <div className="notification-content">
                <span className="notification-message">{notification.message}</span>
                <span className="notification-time">
                  {formatEventTime(notification.timestamp)}
                </span>
              </div>
              <button 
                className="notification-close"
                onClick={() => removeNotification(notification.id)}
              >
                <FaTimes />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Stats de eventos del broker (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && eventsReceived.length > 0 && (
        <div className="broker-events-debug">
          <div className="debug-header">
            <h4>Broker Events Debug</h4>
            <span className="events-count">
              Total: {eventStats.total} eventos
            </span>
          </div>
          
          <div className="events-stats">
            {Object.entries(eventStats.byType).map(([type, count]) => (
              <span key={type} className={`event-stat event-${type}`}>
                {type}: {count}
              </span>
            ))}
          </div>

          <div className="recent-events">
            <h5>Últimos eventos:</h5>
            {eventsReceived.slice(-3).map((event, index) => (
              <div key={index} className="recent-event">
                <span className={`event-type event-${event.type}`}>
                  {event.type}
                </span>
                <span className="event-time">
                  {formatEventTime(event.timestamp)}
                </span>
                <span className="event-data">
                  {event.data.property_id || event.data.request_id || 'N/A'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default BrokerNotifications;