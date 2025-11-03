# PropertyRental Frontend

Aplicación React para gestión de propiedades con autenticación Auth0.

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Instalación

#### Opción 1: Script Automático (Recomendado)

```bash
# Clonar el repositorio
git clone <repository-url>
cd frontend-PMA-G8

# Ejecutar script de configuración
# Linux/Mac:
./setup.sh

# Windows:
setup.bat
```

#### Opción 2: Configuración Manual

```bash
# Clonar el repositorio
git clone <repository-url>
cd frontend-PMA-G8

# Instalar dependencias
npm install

# Configurar variables de entorno
cp env.example .env
```

### Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
# Auth0 Configuration
REACT_APP_AUTH0_DOMAIN=tu-tenant.auth0.com
REACT_APP_AUTH0_CLIENT_ID=tu-client-id
REACT_APP_AUTH0_REDIRECT_URI=http://localhost:3000/callback
REACT_APP_AUTH0_AUDIENCE=https://nicoriquelmecti.space/api/v1

# Backend API
REACT_APP_API_URL=https://nicoriquelmecti.space/api/v1
```

### Ejecutar en Desarrollo

```bash
# Iniciar servidor de desarrollo
npm start

# La aplicación estará disponible en:
# http://localhost:3000
```

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── common/         # Componentes comunes (Loading, Modal)
│   ├── layout/         # Componentes de layout (Navbar)
│   └── properties/     # Componentes de propiedades
├── context/            # Context API (AppContext, Auth0Context)
├── hooks/              # Custom hooks
├── pages/              # Páginas principales
├── services/           # Servicios API
└── config/             # Configuración
```

## 🔧 Scripts Disponibles

```bash
npm start          # Servidor de desarrollo
npm run build      # Build para producción
npm test           # Ejecutar tests
npm run eject      # Eject (no recomendado)
```

## 🔐 Configuración Auth0

1. Crear aplicación en [Auth0 Dashboard](https://manage.auth0.com)
2. Configurar URLs permitidas:
   - **Callback**: `http://localhost:3000/callback`
   - **Logout**: `http://localhost:3000`
   - **Web Origins**: `http://localhost:3000`
3. Actualizar variables de entorno con tus credenciales

## 🌐 Rutas Disponibles

- `/` - Página de inicio
- `/properties` - Lista de propiedades
- `/properties/:id` - Detalle de propiedad
- `/login` - Página de login
- `/my-rentals` - Mis solicitudes (requiere autenticación)
- `/callback` - Callback de Auth0

## 🛠️ Tecnologías

- **React 18** - Framework principal
- **React Router 6** - Enrutamiento
- **Auth0 React SDK** - Autenticación
- **Axios** - Cliente HTTP
- **React Icons** - Iconografía
- **Styled Components** - Estilos

## 📱 Funcionalidades

- ✅ **Autenticación** con Auth0
- ✅ **Lista de propiedades** con filtros
- ✅ **Detalle de propiedades** con conversión UF
- ✅ **Solicitudes de arriendo** con paginación
- ✅ **Responsive design** para móviles
- ✅ **Cache inteligente** para valores UF

## 🚀 Despliegue a Producción

### CI/CD con GitHub Actions y AWS CloudFront

El proyecto incluye configuración completa para despliegue automático:

- ✅ **GitHub Actions** workflow para CI/CD
- ✅ **AWS S3** para hosting estático
- ✅ **CloudFront** para distribución global
- ✅ **Scripts automáticos** de configuración
- ✅ **Políticas IAM** pre-configuradas

📚 **Ver documentación completa:**
- [`DEPLOYMENT.md`](./DEPLOYMENT.md) - Guía de despliegue paso a paso
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) - Arquitectura y diagramas

### Configuración Rápida

```bash
# 1. Configurar infraestructura AWS
./scripts/setup-aws-infrastructure.sh

# 2. Configurar secrets en GitHub
# Settings → Secrets → Actions

# 3. Hacer push a main/master
git push origin main

# ¡Deployment automático! 🎉
```

## 🚨 Solución de Problemas

### Error de CORS con UF
Si aparece error de CORS al cargar valores UF:
1. Verificar que el backend tenga endpoint `/api/v1/uf`
2. El sistema usa fallback automático a valor hardcoded (37,000 CLP)

### Error de Auth0
1. **Verificar variables de entorno:**
   ```bash
   # Verificar que el archivo .env existe y tiene los valores correctos
   cat .env
   ```

2. **Comprobar URLs en Auth0 Dashboard:**
   - Callback: `http://localhost:3000/callback`
   - Logout: `http://localhost:3000`
   - Web Origins: `http://localhost:3000`

3. **Verificar que el dominio sea correcto:**
   - Formato: `dev-abc123.us.auth0.com`
   - No incluir `https://` en REACT_APP_AUTH0_DOMAIN

### Puerto ocupado
```bash
# Cambiar puerto
PORT=3001 npm start
```

### Error de dependencias
```bash
# Limpiar cache y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error de build
```bash
# Limpiar build anterior
rm -rf build
npm run build
```

### Problemas de autenticación
1. Verificar que el usuario esté registrado en Auth0
2. Comprobar que las reglas de Auth0 estén configuradas
3. Verificar que el audience coincida con el backend

## 📦 Build para Producción

```bash
# Crear build optimizado
npm run build

# Los archivos se generan en la carpeta 'build/'
```

## 🔄 Actualización de Dependencias

```bash
# Verificar dependencias desactualizadas
npm outdated

# Actualizar dependencias
npm update
```

## ⚡ Comandos Rápidos

```bash
# Desarrollo
npm start                    # Iniciar servidor de desarrollo
npm run build              # Build para producción
npm test                   # Ejecutar tests

# Configuración
./setup.sh                 # Configuración automática (Linux/Mac)
setup.bat                  # Configuración automática (Windows)
cp env.example .env        # Crear archivo de variables de entorno

# Limpieza
rm -rf node_modules        # Eliminar dependencias
rm -rf build              # Eliminar build anterior
npm install               # Reinstalar dependencias
```

## 📚 Documentación Completa

Para más información detallada, consulta:

- **📋 [Índice de Documentación](docs/INDEX.md)** - Guía completa de toda la documentación
- **🔐 [Configuración Auth0](AUTH0_SETUP.md)** - Setup de autenticación
- **🚀 [Guía de Despliegue](DEPLOYMENT.md)** - Deploy a AWS CloudFront
- **🏗️ [Arquitectura](ARCHITECTURE.md)** - Diagramas y arquitectura del sistema

## 📞 Soporte

Para problemas o dudas:
1. Revisar logs en consola del navegador
2. Verificar configuración de Auth0
3. Comprobar conectividad con backend
4. Ejecutar script de configuración: `./setup.sh`
5. Consultar documentación completa en [docs/INDEX.md](docs/INDEX.md)

---

**¡Listo para desarrollar!** 🚀