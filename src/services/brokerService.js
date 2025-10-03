import { v4 as uuidv4 } from 'uuid';

const BROKER_URL = process.env.REACT_APP_BROKER_URL || 'ws://localhost:8000/ws';

class BrokerService {
  constructor() {
    this.websocket = null;
    this.isConnected = false;
    this.messageCallbacks = new Map();
    this.eventListeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Initial delay in ms
  }

  // Conectar al broker WebSocket
  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.websocket = new WebSocket(BROKER_URL);
        
        this.websocket.onopen = () => {
          console.log('Connected to broker');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          
          // Suscribirse a los canales necesarios
          this.subscribeToChannels();
          resolve();
        };

        this.websocket.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.websocket.onclose = () => {
          console.log('Disconnected from broker');
          this.isConnected = false;
          this.handleReconnection();
        };

        this.websocket.onerror = (error) => {
          console.error('Broker connection error:', error);
          reject(error);
        };

      } catch (error) {
        console.error('Failed to connect to broker:', error);
        reject(error);
      }
    });
  }

  // Manejar reconexión automática
  handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = this.calculateFibonacciDelay(this.reconnectAttempts);
      console.log(`Attempting reconnection in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);
      
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect().catch(() => {
          // Si falla, se intentará de nuevo automáticamente
        });
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.notifyConnectionLost();
    }
  }

  // Calcular delay usando secuencia Fibonacci
  calculateFibonacciDelay(attempt) {
    const fibonacci = (n) => {
      if (n <= 1) return n;
      let a = 0, b = 1;
      for (let i = 2; i <= n; i++) {
        [a, b] = [b, a + b];
      }
      return b;
    };
    
    return Math.min(fibonacci(attempt + 1) * this.reconnectDelay, 30000); // Max 30 seconds
  }

  // Suscribirse a canales del broker
  subscribeToChannels() {
    const channels = ['properties/info', 'properties/requests', 'properties/validation'];
    
    channels.forEach(channel => {
      this.subscribe(channel);
    });
  }

  // Suscribirse a un canal específico
  subscribe(channel) {
    if (!this.isConnected) {
      console.error('Not connected to broker');
      return;
    }

    const subscribeMessage = {
      type: 'subscribe',
      channel: channel,
      timestamp: new Date().toISOString()
    };

    this.websocket.send(JSON.stringify(subscribeMessage));
    console.log(`Subscribed to channel: ${channel}`);
  }

  // Enviar solicitud de compra por properties/requests
  async sendPurchaseRequest(propertyId, userId, visitType = 'VISIT', groupId = 'G8') {
    if (!this.isConnected) {
      throw new Error('Not connected to broker');
    }

    const requestId = uuidv4();
    const requestData = {
      request_id: requestId,
      group_id: groupId,
      timestamp: new Date().toISOString(),
      property_id: propertyId,
      user_id: userId,
      visit_type: visitType,
      origin: 0,
      operation: "VISIT_REQUEST"
    };

    // Crear una promesa que se resuelve cuando llegue la respuesta
    return new Promise((resolve, reject) => {
      // Registrar callback para esta solicitud específica
      this.messageCallbacks.set(requestId, { resolve, reject });

      // Enviar mensaje al canal properties/requests
      const message = {
        type: 'publish',
        channel: 'properties/requests',
        data: requestData,
        timestamp: new Date().toISOString()
      };

      try {
        this.websocket.send(JSON.stringify(message));
        console.log('Purchase request sent:', requestData);

        // Timeout para la respuesta (30 segundos)
        setTimeout(() => {
          if (this.messageCallbacks.has(requestId)) {
            this.messageCallbacks.delete(requestId);
            reject(new Error('Request timeout - no response from broker'));
          }
        }, 30000);

      } catch (error) {
        this.messageCallbacks.delete(requestId);
        reject(error);
      }
    });
  }

  // Manejar mensajes recibidos del broker
  handleMessage(event) {
    try {
      const message = JSON.parse(event.data);
      console.log('Received broker message:', message);

      // Manejar respuestas a solicitudes específicas
      if (message.request_id && this.messageCallbacks.has(message.request_id)) {
        const callback = this.messageCallbacks.get(message.request_id);
        this.messageCallbacks.delete(message.request_id);

        if (message.status === 'success' || message.valid === true) {
          callback.resolve(message);
        } else {
          callback.reject(new Error(message.message || 'Request failed'));
        }
        return;
      }

      // Manejar eventos por canal
      if (message.channel) {
        this.handleChannelMessage(message.channel, message.data || message);
      }

    } catch (error) {
      console.error('Error parsing broker message:', error);
    }
  }

  // Manejar mensajes por canal específico
  handleChannelMessage(channel, data) {
    console.log(`Channel ${channel} message:`, data);

    // Notificar a los listeners registrados
    if (this.eventListeners.has(channel)) {
      const listeners = this.eventListeners.get(channel);
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in channel ${channel} listener:`, error);
        }
      });
    }

    // Manejar eventos específicos por canal
    switch (channel) {
      case 'properties/info':
        this.handlePropertyInfo(data);
        break;
      case 'properties/requests':
        this.handlePropertyRequest(data);
        break;
      case 'properties/validation':
        this.handlePropertyValidation(data);
        break;
    }
  }

  // Manejar información de propiedades
  handlePropertyInfo(data) {
    // Actualizar información de propiedades disponibles
    console.log('Property info updated:', data);
    
    // Disparar evento personalizado para que los componentes React puedan escuchar
    window.dispatchEvent(new CustomEvent('propertyInfoUpdated', { detail: data }));
  }

  // Manejar solicitudes de otros grupos
  handlePropertyRequest(data) {
    // Manejar solicitudes de visitas de otros grupos
    console.log('Property request from other group:', data);
    
    // Reservar visitas temporalmente si es necesario
    window.dispatchEvent(new CustomEvent('propertyRequestReceived', { detail: data }));
  }

  // Manejar validaciones de pago
  handlePropertyValidation(data) {
    console.log('Property validation received:', data);
    
    // Actualizar estado de solicitudes basado en validación
    window.dispatchEvent(new CustomEvent('propertyValidationReceived', { detail: data }));
  }

  // Registrar listener para un canal
  addEventListener(channel, callback) {
    if (!this.eventListeners.has(channel)) {
      this.eventListeners.set(channel, []);
    }
    this.eventListeners.get(channel).push(callback);
  }

  // Remover listener
  removeEventListener(channel, callback) {
    if (this.eventListeners.has(channel)) {
      const listeners = this.eventListeners.get(channel);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Notificar pérdida de conexión
  notifyConnectionLost() {
    window.dispatchEvent(new CustomEvent('brokerConnectionLost'));
  }

  // Desconectar del broker
  disconnect() {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    this.isConnected = false;
    this.messageCallbacks.clear();
    this.eventListeners.clear();
  }

  // Obtener estado de conexión
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Crear instancia singleton
export const brokerService = new BrokerService();

export default brokerService;