import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.ics2173-2025-2-paurovira.me/api/v1';
const AUTH_API_URL = `${API_BASE_URL}/auth`;

class AuthService {
  constructor() {
    this.setupAxiosInterceptors();
  }

  setupAxiosInterceptors() {
    // Interceptor para agregar el token de autorización
    axios.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor para manejar respuestas y refresh automático
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await this.refreshToken();
            const newToken = this.getAccessToken();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return axios(originalRequest);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            this.logout();
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Registrar nuevo usuario
  async register(userData) {
    try {
      const response = await axios.post(`${AUTH_API_URL}/register`, userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Login con email y password
  async login(email, password) {
    try {
      const formData = new FormData();
      formData.append('username', email); // FastAPI OAuth2PasswordRequestForm usa 'username'
      formData.append('password', password);

      const response = await axios.post(`${AUTH_API_URL}/login`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        withCredentials: true, // Para manejar cookies HttpOnly
      });

      const { access_token } = response.data;
      
      // Guardar el access token en localStorage
      this.setAccessToken(access_token);
      
      // Obtener información del usuario
      const userInfo = await this.getCurrentUser();
      
      return {
        access_token,
        user: userInfo
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Obtener información del usuario actual
  async getCurrentUser() {
    try {
      const response = await axios.get(`${AUTH_API_URL}/me`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  // Refresh del access token
  async refreshToken() {
    try {
      const response = await axios.post(`${AUTH_API_URL}/refresh`, {}, {
        withCredentials: true, // Para enviar la cookie de refresh
      });

      const { access_token } = response.data;
      this.setAccessToken(access_token);
      
      return access_token;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  // Logout
  async logout() {
    try {
      await axios.post(`${AUTH_API_URL}/logout`, {}, {
        withCredentials: true,
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Limpiar tokens locales independientemente del resultado
      this.removeAccessToken();
    }
  }

  // Verificar si el usuario está autenticado
  isAuthenticated() {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      // Decodificar el JWT para verificar expiración
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      
      return payload.exp > now;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  // Obtener el access token del localStorage
  getAccessToken() {
    return localStorage.getItem('access_token');
  }

  // Guardar el access token en localStorage
  setAccessToken(token) {
    localStorage.setItem('access_token', token);
  }

  // Remover el access token del localStorage
  removeAccessToken() {
    localStorage.removeItem('access_token');
  }

  // Verificar salud del servicio de auth
  async checkHealth() {
    try {
      const response = await axios.get(`${AUTH_API_URL}/health`);
      return response.data;
    } catch (error) {
      console.error('Auth health check error:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
export default authService;