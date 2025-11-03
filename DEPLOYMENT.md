# 🚀 Guía de Despliegue a AWS CloudFront

Esta guía explica cómo configurar el despliegue automático del frontend a AWS CloudFront usando GitHub Actions.

## 🎯 Inicio Rápido

### Configuración Automática (Recomendado)

```bash
# Ejecutar script de configuración de infraestructura
./scripts/setup-aws-infrastructure.sh
```

Este script configura automáticamente:
- ✅ Bucket S3 para hosting estático
- ✅ IAM User con permisos necesarios
- ✅ Access Keys para GitHub Actions
- ✅ CloudFront Distribution (opcional)
- ✅ Políticas IAM aplicadas

### Configuración Manual

Si prefieres configurar manualmente o ya tienes infraestructura AWS, continúa con la sección de requisitos.

## 📋 Requisitos Previos

### 1. Infraestructura AWS

Necesitas tener configurado en AWS:
- **S3 Bucket** para almacenar los archivos estáticos
- **CloudFront Distribution** apuntando al bucket S3
- **IAM User** con permisos para S3 y CloudFront

### 2. Configuración del Bucket S3

```bash
# Crear bucket S3
aws s3 mb s3://tu-bucket-name --region us-east-1

# Configurar bucket para hosting estático
aws s3 website s3://tu-bucket-name \
  --index-document index.html \
  --error-document index.html

# Configurar política pública (opcional, si CloudFront no accede directamente)
aws s3api put-bucket-policy \
  --bucket tu-bucket-name \
  --policy file://bucket-policy.json
```

### 3. Configuración de CloudFront

```bash
# Crear distribución CloudFront apuntando al bucket S3
# Usar AWS Console o CLI:
aws cloudfront create-distribution \
  --origin-domain-name tu-bucket-name.s3.amazonaws.com \
  --default-root-object index.html
```

### 4. IAM Policy Necesaria

Crea un IAM User con la siguiente política:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::tu-bucket-name",
        "arn:aws:s3:::tu-bucket-name/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation",
        "cloudfront:ListInvalidations"
      ],
      "Resource": "*"
    }
  ]
}
```

## 🔐 Configuración de GitHub Secrets

Ve a tu repositorio en GitHub:
**Settings → Secrets and variables → Actions → New repository secret**

Configura los siguientes secrets:

### Secrets Requeridos

| Secret Name | Descripción | Ejemplo |
|-------------|-------------|---------|
| `AWS_ACCESS_KEY_ID` | Access Key del IAM User | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | Secret Key del IAM User | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `S3_BUCKET_NAME` | Nombre del bucket S3 | `propertyrental-frontend` |
| `CLOUDFRONT_DISTRIBUTION_ID` | ID de la distribución CloudFront | `E1ABCD1234EFGH` |

### Secrets de Configuración de la App

| Secret Name | Descripción | Ejemplo |
|-------------|-------------|---------|
| `AUTH0_DOMAIN` | Dominio de Auth0 | `dev-abc123.us.auth0.com` |
| `AUTH0_CLIENT_ID` | Client ID de Auth0 | `abc123xyz789` |
| `AUTH0_REDIRECT_URI` | URI de redirección de Auth0 | `https://www.ics2173-2025-2-paurovira.me/callback` |
| `AUTH0_AUDIENCE` | Audience de Auth0 | `https://nicoriquelmecti.space/api/v1` |
| `API_URL` | URL del backend API | `https://nicoriquelmecti.space/api/v1` |
| `GROUP_ID` | Group ID para purchase requests | `8` |

## 📝 Pasos de Configuración

### 1. Preparar IAM User en AWS

```bash
# Crear IAM User
aws iam create-user --user-name github-actions-deploy

# Crear Access Keys
aws iam create-access-key --user-name github-actions-deploy

# Adjuntar política personalizada
aws iam put-user-policy \
  --user-name github-actions-deploy \
  --policy-name CloudFrontDeployPolicy \
  --policy-document file://github-actions-policy.json
```

### 2. Configurar Secrets en GitHub

1. Ve a tu repositorio en GitHub
2. Navega a **Settings → Secrets and variables → Actions**
3. Haz clic en **New repository secret**
4. Añade cada secret uno por uno:

```bash
# Secret 1: AWS Credentials
AWS_ACCESS_KEY_ID = [Tu Access Key ID]
AWS_SECRET_ACCESS_KEY = [Tu Secret Access Key]

# Secret 2: S3 y CloudFront
S3_BUCKET_NAME = [Nombre de tu bucket]
CLOUDFRONT_DISTRIBUTION_ID = [ID de distribución]

# Secret 3: Auth0
AUTH0_DOMAIN = [Tu dominio Auth0]
AUTH0_CLIENT_ID = [Client ID]
AUTH0_REDIRECT_URI = [URI de callback]
AUTH0_AUDIENCE = [Audience]

# Secret 4: Backend
API_URL = [URL del backend]
GROUP_ID = [Group ID]
```

### 3. Configurar CloudFront en Auth0

En tu **Auth0 Dashboard**:
1. Ve a **Applications → Tu App → Settings**
2. Actualiza las URLs:

**Allowed Callback URLs:**
```
https://www.ics2173-2025-2-paurovira.me/callback
```

**Allowed Logout URLs:**
```
https://www.ics2173-2025-2-paurovira.me
```

**Allowed Web Origins:**
```
https://www.ics2173-2025-2-paurovira.me
```

**Allowed Origins (CORS):**
```
https://www.ics2173-2025-2-paurovira.me
```

## 🎯 Uso del Workflow

### Despliegue Automático

El workflow se ejecuta automáticamente al:
- **Push a `main`** → Despliegue automático
- **Push a `master`** → Despliegue automático
- **Push a `auth0`** → Despliegue automático
- **Pull Request** → Solo build (sin deploy)

### Ejecutar Deployment Manual

Para ejecutar el deployment manualmente:

1. Ve a **Actions** en tu repositorio GitHub
2. Selecciona **Deploy Frontend to AWS CloudFront**
3. Haz clic en **Run workflow**
4. Selecciona la rama
5. Haz clic en **Run workflow**

## 📊 Flujo del Deployment

```
┌─────────────────┐
│   GitHub Push   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│   GitHub Actions CI     │
│  ├─ Checkout code       │
│  ├─ Setup Node.js       │
│  ├─ Install deps        │
│  └─ Build app           │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  AWS Configuration      │
│  ├─ Configure AWS       │
│  └─ Get credentials     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  S3 Upload              │
│  ├─ Upload static files │
│  └─ Upload HTML         │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  CloudFront Invalidation │
│  └─ Clear cache         │
└─────────────────────────┘
         │
         ▼
      ✅ Deployed!
```

## 🔍 Verificación del Deployment

### 1. Verificar en S3

```bash
# Listar archivos en el bucket
aws s3 ls s3://tu-bucket-name --recursive

# Ver archivos específicos
aws s3 ls s3://tu-bucket-name/static/
```

### 2. Verificar en CloudFront

```bash
# Ver status de invalidación
aws cloudfront get-invalidation \
  --distribution-id YOUR_DIST_ID \
  --id INVALIDATION_ID

# Ver detalles de distribución
aws cloudfront get-distribution \
  --id YOUR_DIST_ID
```

### 3. Verificar en el Navegador

1. Abre `https://www.ics2173-2025-2-paurovira.me`
2. Verifica que la aplicación carga correctamente
3. Prueba login con Auth0
4. Verifica que las APIs responden correctamente

## 🛠️ Troubleshooting

### Error: "Access Denied" en S3

**Problema:** El IAM User no tiene permisos en el bucket.

**Solución:**
```bash
# Verificar permisos del bucket
aws s3api get-bucket-policy --bucket tu-bucket-name

# Añadir permisos al usuario
aws s3api put-bucket-policy \
  --bucket tu-bucket-name \
  --policy file://bucket-policy.json
```

### Error: "Invalidation Failed"

**Problema:** El CloudFront Distribution ID es incorrecto.

**Solución:**
```bash
# Listar distribuciones
aws cloudfront list-distributions

# Verificar el ID correcto
aws cloudfront get-distribution --id DIST_ID
```

### Error: "Build Failed"

**Problema:** Variables de entorno faltantes o incorrectas.

**Solución:**
1. Verifica que todos los secrets estén configurados
2. Revisa los logs de GitHub Actions
3. Verifica el formato de las variables

### Build funciona pero no veo cambios

**Problema:** Cache de CloudFront no se invalidó.

**Solución:**
```bash
# Invalidar manualmente
aws cloudfront create-invalidation \
  --distribution-id DIST_ID \
  --paths "/*"
```

## 📝 Archivos de Política IAM

### `github-actions-policy.json`

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::propertyrental-frontend",
        "arn:aws:s3:::propertyrental-frontend/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation",
        "cloudfront:ListInvalidations"
      ],
      "Resource": "*"
    }
  ]
}
```

### `bucket-policy.json`

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::propertyrental-frontend/*"
    }
  ]
}
```

## ⚙️ Optimizaciones del Workflow

### Cache de Build

El workflow usa:
- **Node modules cache** (npm ci)
- **Build artifacts** entre jobs

### Cache de CloudFront

Configurado para:
- **Static assets**: `max-age=31536000, immutable`
- **HTML files**: `max-age=0, must-revalidate`

### Invalidation Estratégica

- Solo invalidar cuando hay cambios reales
- Invalidar paths específicos si es necesario
- Evitar `/*` en cada deploy si es posible

## 🤖 Script de Configuración Automática

### Descripción

El script `scripts/setup-aws-infrastructure.sh` automatiza la configuración completa de infraestructura AWS:

### ¿Qué hace el script?

1. **Verifica requisitos**: AWS CLI instalado y configurado
2. **Crea bucket S3**: Con configuración para hosting estático
3. **Aplica políticas**: Políticas necesarias al bucket
4. **Crea IAM User**: Usuario dedicado para GitHub Actions
5. **Aplica permisos**: Políticas IAM al usuario
6. **Genera Access Keys**: Credenciales para GitHub
7. **Crea CloudFront**: Distribución CloudFront (opcional)
8. **Muestra resumen**: Secrets y próximos pasos

### Uso

```bash
# Configuración básica (valores por defecto)
./scripts/setup-aws-infrastructure.sh

# Personalizar configuración
export S3_BUCKET_NAME=mi-bucket-personalizado
export AWS_REGION=us-west-2
export IAM_USER_NAME=mi-usuario-github
./scripts/setup-aws-infrastructure.sh
```

### Variables de Entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `AWS_REGION` | Región de AWS | `us-east-1` |
| `S3_BUCKET_NAME` | Nombre del bucket | `propertyrental-frontend` |
| `IAM_USER_NAME` | Nombre del usuario IAM | `github-actions-deploy` |

### Requisitos

- AWS CLI instalado y configurado
- Permisos para crear recursos en AWS
- `jq` instalado para procesamiento JSON

```bash
# Instalar jq (si no está instalado)
# macOS:
brew install jq

# Ubuntu/Debian:
sudo apt-get install jq
```

### Salida del Script

El script genera:

1. **Access Keys** para GitHub Secrets
2. **Distribution ID** de CloudFront (si se crea)
3. **Resumen completo** de configuración

Ejemplo de salida:

```
🔑 ACCESS KEY CREADA:

Access Key ID: AKIAIOSFODNN7EXAMPLE
Secret Access Key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

⚠️  IMPORTANTE: Guarda estas credenciales de forma segura
Añade estos valores como secrets en GitHub:
  AWS_ACCESS_KEY_ID = AKIAIOSFODNN7EXAMPLE
  AWS_SECRET_ACCESS_KEY = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

## 📞 Soporte

Para problemas:

1. **Revisar logs** en GitHub Actions
2. **Verificar secrets** en Settings
3. **Comprobar permisos** IAM
4. **Validar configuración** S3/CloudFront
5. **Revisar** esta documentación
6. **Ejecutar script** de configuración automática

---

**¡Deployment configurado y listo!** 🚀
