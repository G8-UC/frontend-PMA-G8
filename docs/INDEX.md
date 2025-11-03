# 📚 Índice de Documentación

Documentación completa del proyecto PropertyRental Frontend.

## 🚀 Inicio Rápido

- **[README.md](../README.md)** - Configuración local y desarrollo
- **[env.example](../env.example)** - Variables de entorno de ejemplo

## 🔐 Autenticación

- **[AUTH0_SETUP.md](../AUTH0_SETUP.md)** - Configuración completa de Auth0
  - URLs de callback y logout
  - Configuración de variables de entorno
  - Rules y Actions de Auth0
  - Troubleshooting

## 🚀 Despliegue

### Guías Principales

- **[DEPLOYMENT.md](../DEPLOYMENT.md)** - Guía completa de despliegue a AWS CloudFront
  - Configuración de infraestructura AWS
  - Setup de GitHub Actions
  - Configuración de secrets
  - Troubleshooting

- **[ARCHITECTURE.md](../ARCHITECTURE.md)** - Arquitectura y diagramas
  - Diagramas de arquitectura
  - Flujo de deployment
  - Estrategias de caching
  - Disaster recovery

### Scripts Automáticos

- **[setup.sh](../setup.sh)** - Configuración local (Linux/Mac)
  - Instalación de dependencias
  - Configuración de variables de entorno

- **[setup.bat](../setup.bat)** - Configuración local (Windows)
  - Equivalente Windows de setup.sh

- **[scripts/setup-aws-infrastructure.sh](../scripts/setup-aws-infrastructure.sh)** - Configuración AWS
  - Creación de bucket S3
  - Configuración de IAM
  - Creación de CloudFront
  - Generación de Access Keys

### GitHub Actions

- **[.github/workflows/deploy-cloudfront.yml](../.github/workflows/deploy-cloudfront.yml)** - CI/CD Workflow
  - Build automático de React
  - Upload a S3
  - Invalidación de CloudFront

- **[.github/README.md](../.github/README.md)** - Guía rápida de CI/CD

### AWS Policies

- **[aws-policies/README.md](../aws-policies/README.md)** - Documentación de políticas
- **[aws-policies/github-actions-policy.json](../aws-policies/github-actions-policy.json)** - Política IAM para GitHub
- **[aws-policies/bucket-policy.json](../aws-policies/bucket-policy.json)** - Política de bucket S3

## 📖 Guías por Tarea

### Desarrollo Local

```bash
# 1. Configuración inicial
./setup.sh              # Linux/Mac
setup.bat              # Windows

# 2. Configurar Auth0
# Editar .env con credenciales
# Ver: AUTH0_SETUP.md

# 3. Ejecutar aplicación
npm start
```

### Despliegue a Producción

```bash
# 1. Configurar AWS
./scripts/setup-aws-infrastructure.sh

# 2. Configurar GitHub Secrets
# Settings → Secrets → Actions
# Ver: DEPLOYMENT.md

# 3. Deploy automático
git push origin main
```

### Troubleshooting

- **Error de CORS**: Ver [README.md - CORS con UF](../README.md#error-de-cors-con-uf)
- **Error de Auth0**: Ver [AUTH0_SETUP.md](../AUTH0_SETUP.md)
- **Error de Deploy**: Ver [DEPLOYMENT.md - Troubleshooting](../DEPLOYMENT.md#troubleshooting)
- **Error de Build**: Ver [DEPLOYMENT.md - Build Failed](../DEPLOYMENT.md#error-build-failed)

## 🔍 Búsqueda Rápida

### Por Archivo

| Archivo | Propósito | Cuándo usar |
|---------|-----------|-------------|
| `README.md` | Configuración local | Setup inicial |
| `DEPLOYMENT.md` | Deploy a AWS | Primera vez desplegando |
| `ARCHITECTURE.md` | Diagramas | Entender arquitectura |
| `AUTH0_SETUP.md` | Auth0 | Configurar autenticación |
| `env.example` | Variables | Crear .env |

### Por Tarea

| Tarea | Documentación |
|-------|---------------|
| Setup local | README.md |
| Configurar Auth0 | AUTH0_SETUP.md |
| Deploy manual | DEPLOYMENT.md |
| Deploy automático | DEPLOYMENT.md → GitHub Actions |
| Configurar AWS | DEPLOYMENT.md → Scripts |
| Troubleshooting | README.md + DEPLOYMENT.md |
| Entender arquitectura | ARCHITECTURE.md |

## 📝 Convenciones

- **📋** Documentación paso a paso
- **🚀** Quick start / setup rápido
- **🔐** Seguridad y autenticación
- **⚙️** Configuración técnica
- **🚨** Troubleshooting
- **📊** Arquitectura y diagramas

## 🔗 Enlaces Útiles

- [Auth0 Dashboard](https://manage.auth0.com)
- [AWS Console](https://console.aws.amazon.com)
- [GitHub Actions](https://github.com/actions)
- [React Documentation](https://react.dev)

---

**Documentación Mantenida y Actualizada** 📚✨
