# GitHub Actions - CI/CD Configuration

Este directorio contiene la configuración de GitHub Actions para el despliegue automático del frontend a AWS CloudFront.

## 📁 Archivos

### `workflows/deploy-cloudfront.yml`

Workflow de GitHub Actions que:
- ✅ Construye la aplicación React
- ✅ Sube archivos a S3
- ✅ Invalida cache de CloudFront
- ✅ Soporte para múltiples ramas

## 🚀 Quick Start

### 1. Configurar Infraestructura AWS

```bash
# Desde la raíz del proyecto
./scripts/setup-aws-infrastructure.sh
```

### 2. Configurar Secrets en GitHub

Ve a **Settings → Secrets and variables → Actions** y añade:

#### AWS Secrets
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_BUCKET_NAME`
- `CLOUDFRONT_DISTRIBUTION_ID`

#### App Secrets
- `AUTH0_DOMAIN`
- `AUTH0_CLIENT_ID`
- `AUTH0_REDIRECT_URI`
- `AUTH0_AUDIENCE`
- `API_URL`
- `GROUP_ID`

### 3. Hacer Push

```bash
git push origin main
```

El despliegue se ejecutará automáticamente.

## 📊 Monitoreo

Para ver el estado del despliegue:
1. Ve a **Actions** en GitHub
2. Selecciona el workflow más reciente
3. Revisa los logs de cada step

## 🔍 Troubleshooting

### El build falla

1. Verifica que los secrets estén configurados
2. Revisa los logs del step "Build application"
3. Valida las variables de entorno

### El deploy falla en S3

1. Verifica `AWS_ACCESS_KEY_ID` y `AWS_SECRET_ACCESS_KEY`
2. Revisa permisos del IAM User
3. Confirma que el bucket existe

### CloudFront no se invalida

1. Verifica `CLOUDFRONT_DISTRIBUTION_ID`
2. Confirma permisos de invalidation
3. Revisa logs del step "Invalidate CloudFront"

## 📚 Documentación Completa

Ver [`DEPLOYMENT.md`](../DEPLOYMENT.md) para detalles completos.

---

**¡Happy Deploying!** 🚀
