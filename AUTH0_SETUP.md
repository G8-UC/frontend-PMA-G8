# Configuración de Auth0 para PropertyRental

## 📋 Pasos para configurar Auth0

### 1. Crear cuenta en Auth0
1. Ve a [auth0.com](https://auth0.com)
2. Crea una cuenta gratuita
3. Accede al Dashboard

### 2. Crear una nueva aplicación
1. En el Dashboard de Auth0, ve a "Applications"
2. Haz clic en "Create Application"
3. Nombre: `PropertyRental Frontend`
4. Tipo: `Single Page Web Applications`
5. Tecnología: `React`

### 3. Configurar la aplicación
En la pestaña "Settings" de tu aplicación:

#### Allowed Callback URLs:
```
http://localhost:3000/callback, https://tu-dominio-frontend.com/callback
```

#### Allowed Logout URLs:
```
http://localhost:3000, https://tu-dominio-frontend.com
```

#### Allowed Web Origins:
```
http://localhost:3000, https://tu-dominio-frontend.com
```

#### Allowed Origins (CORS):
```
http://localhost:3000, https://tu-dominio-frontend.com
```

### 4. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto:

```env
# Auth0 Configuration
REACT_APP_AUTH0_DOMAIN=tu-tenant.auth0.com
REACT_APP_AUTH0_CLIENT_ID=tu-client-id
REACT_APP_AUTH0_REDIRECT_URI=http://localhost:3000/callback
REACT_APP_AUTH0_AUDIENCE=tu-api-audience

# Backend API
REACT_APP_API_URL=https://nicoriquelmecti.space/api/v1
```

### 5. Obtener los valores necesarios
- **Domain**: En Auth0 Dashboard > Applications > Tu App > Settings
- **Client ID**: En Auth0 Dashboard > Applications > Tu App > Settings
- **Audience**: Solo si tienes una API configurada en Auth0

### 6. Configuración opcional - Metadata del usuario
Para agregar el `group_id` al usuario:

1. Ve a Auth0 Dashboard > User Management > Users
2. Selecciona un usuario
3. En la pestaña "Details", scroll hasta "Metadata"
4. En "app_metadata" o "user_metadata", agrega:
```json
{
  "group_id": "G8"
}
```

### 7. Configurar Reglas/Actions (Opcional)
Para incluir el `group_id` en el token automáticamente:

1. Ve a Auth0 Dashboard > Auth Pipeline > Rules
2. Crea una nueva regla:
```javascript
function (user, context, callback) {
  const namespace = 'custom:';
  context.idToken[namespace + 'group_id'] = user.app_metadata && user.app_metadata.group_id || 'G8';
  callback(null, user, context);
}
```

### 8. Providers sociales (Opcional)
Para habilitar login con Google, GitHub, etc.:

1. Ve a Authentication > Social
2. Activa los providers que desees
3. Configura las credenciales de cada provider

## 🚀 Ejecutar la aplicación

Una vez configurado Auth0:

```bash
# Instalar dependencias
npm install

# Instalar Auth0 SDK
npm install @auth0/auth0-react

# Ejecutar la aplicación
npm start
```

## 🔧 Funcionalidades implementadas

✅ **Login/Logout** con Auth0
✅ **Protección de rutas** (My Rentals requiere autenticación)
✅ **Token automático** en requests al backend
✅ **Información del usuario** (nombre, email, avatar)
✅ **Soporte para múltiples providers** (Google, GitHub, etc.)
✅ **Manejo de estados** de carga y error
✅ **Responsive design** para mobile

## 🛠️ Integración con Backend

El servicio de propiedades está configurado para enviar automáticamente el token de Auth0 en las requests:

```javascript
// Headers automáticos en todas las requests
Authorization: Bearer <auth0-access-token>
```

## 📱 Experiencia de Usuario

1. **Login**: Redirige a Auth0 Universal Login
2. **Callback**: Procesa el token en `/callback` y redirige a `/properties`
3. **Estado persistente**: Mantiene la sesión entre recargas
4. **Logout**: Limpia la sesión y redirige al home

## 🔒 Seguridad

- Tokens JWT seguros
- HTTPS obligatorio en producción
- Validación del dominio
- CORS configurado
- Sesión encriptada

¡Tu aplicación está lista para usar Auth0! 🎉