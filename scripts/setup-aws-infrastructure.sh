#!/bin/bash

# ========================================
# Script de Configuración de Infraestructura AWS
# ========================================

set -e  # Exit on error

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Configurando infraestructura AWS para PropertyRental Frontend${NC}"
echo ""

# Variables configurables
AWS_REGION=${AWS_REGION:-us-east-2}
S3_BUCKET_NAME=${S3_BUCKET_NAME:-propertymarketarquisis}
IAM_USER_NAME=${IAM_USER_NAME:-github-actions-deploy}
CLOUDFRONT_COMMENT="PropertyRental Frontend Distribution"

echo -e "${YELLOW}📋 Configuración:${NC}"
echo "  Region: $AWS_REGION"
echo "  S3 Bucket: $S3_BUCKET_NAME"
echo "  IAM User: $IAM_USER_NAME"
echo ""

# ============================================
# 1. Verificar AWS CLI
# ============================================
echo -e "${YELLOW}1. Verificando AWS CLI...${NC}"
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI no está instalado${NC}"
    echo "Instala desde: https://aws.amazon.com/cli/"
    exit 1
fi

echo -e "${GREEN}✅ AWS CLI detectado$(aws --version)${NC}"
echo ""

# ============================================
# 2. Verificar configuración AWS
# ============================================
echo -e "${YELLOW}2. Verificando configuración AWS...${NC}"
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS no está configurado${NC}"
    echo "Ejecuta: aws configure"
    exit 1
fi

AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✅ AWS configurado correctamente (Account: $AWS_ACCOUNT_ID)${NC}"
echo ""

# ============================================
# 3. Crear bucket S3
# ============================================
echo -e "${YELLOW}3. Creando bucket S3...${NC}"
if aws s3 ls "s3://$S3_BUCKET_NAME" 2>&1 | grep -q 'NoSuchBucket'; then
    if [ "$AWS_REGION" = "us-east-1" ]; then
        aws s3 mb "s3://$S3_BUCKET_NAME" --region "$AWS_REGION" 2>&1 | grep -v "make_bucket"
    else
        aws s3 mb "s3://$S3_BUCKET_NAME" --region "$AWS_REGION"
    fi
    echo -e "${GREEN}✅ Bucket S3 creado: $S3_BUCKET_NAME${NC}"
else
    echo -e "${YELLOW}⚠️  Bucket ya existe: $S3_BUCKET_NAME${NC}"
fi
echo ""

# ============================================
# 4. Configurar bucket S3 para hosting estático
# ============================================
echo -e "${YELLOW}4. Configurando hosting estático...${NC}"
aws s3 website "s3://$S3_BUCKET_NAME" \
    --index-document index.html \
    --error-document index.html \
    &> /dev/null
echo -e "${GREEN}✅ Hosting estático configurado${NC}"
echo ""

# ============================================
# 5. Aplicar política del bucket
# ============================================
echo -e "${YELLOW}5. Configurando bucket privado...${NC}"
aws s3api put-public-access-block \
    --bucket "$S3_BUCKET_NAME" \
    --public-access-block-configuration \
    BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
echo -e "${GREEN}✅ Bucket configurado como privado${NC}"
echo ""

# ============================================
# 6. Crear IAM User
# ============================================
echo -e "${YELLOW}6. Creando IAM User...${NC}"
if aws iam get-user --user-name "$IAM_USER_NAME" &> /dev/null; then
    echo -e "${YELLOW}⚠️  Usuario IAM ya existe: $IAM_USER_NAME${NC}"
else
    aws iam create-user --user-name "$IAM_USER_NAME"
    echo -e "${GREEN}✅ Usuario IAM creado: $IAM_USER_NAME${NC}"
fi
echo ""

# ============================================
# 7. Aplicar política al IAM User
# ============================================
echo -e "${YELLOW}7. Aplicando política al usuario IAM...${NC}"
POLICY_FILE="aws-policies/github-actions-policy.json"
if [ -f "$POLICY_FILE" ]; then
    # Reemplazar nombre del bucket en la política
    sed "s/propertyrental-frontend/$S3_BUCKET_NAME/g" "$POLICY_FILE" > /tmp/github-actions-policy.json
    aws iam put-user-policy \
        --user-name "$IAM_USER_NAME" \
        --policy-name CloudFrontDeployPolicy \
        --policy-document file:///tmp/github-actions-policy.json
    echo -e "${GREEN}✅ Política aplicada al usuario${NC}"
else
    echo -e "${YELLOW}⚠️  Archivo $POLICY_FILE no encontrado${NC}"
fi
echo ""

# ============================================
# 8. Crear Access Keys
# ============================================
echo -e "${YELLOW}8. Creando Access Keys...${NC}"
EXISTING_KEYS=$(aws iam list-access-keys --user-name "$IAM_USER_NAME" --query 'AccessKeyMetadata' --output json)
KEY_COUNT=$(echo "$EXISTING_KEYS" | jq length)

if [ "$KEY_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Ya existen $KEY_COUNT Access Key(s) para este usuario${NC}"
    echo "Las Access Keys existentes son:"
    aws iam list-access-keys --user-name "$IAM_USER_NAME" --output table
    echo ""
    read -p "¿Crear nueva Access Key? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        NEW_KEY=$(aws iam create-access-key --user-name "$IAM_USER_NAME")
        ACCESS_KEY_ID=$(echo "$NEW_KEY" | jq -r '.AccessKey.AccessKeyId')
        SECRET_KEY=$(echo "$NEW_KEY" | jq -r '.AccessKey.SecretAccessKey')
        echo ""
        echo -e "${GREEN}🔑 NUEVA ACCESS KEY CREADA:${NC}"
        echo ""
        echo "Access Key ID: $ACCESS_KEY_ID"
        echo "Secret Access Key: $SECRET_KEY"
        echo ""
        echo -e "${RED}⚠️  IMPORTANTE: Guarda estas credenciales de forma segura${NC}"
        echo "Añade estos valores como secrets en GitHub:"
        echo "  AWS_ACCESS_KEY_ID = $ACCESS_KEY_ID"
        echo "  AWS_SECRET_ACCESS_KEY = $SECRET_KEY"
    fi
else
    NEW_KEY=$(aws iam create-access-key --user-name "$IAM_USER_NAME")
    ACCESS_KEY_ID=$(echo "$NEW_KEY" | jq -r '.AccessKey.AccessKeyId')
    SECRET_KEY=$(echo "$NEW_KEY" | jq -r '.AccessKey.SecretAccessKey')
    echo ""
    echo -e "${GREEN}🔑 ACCESS KEY CREADA:${NC}"
    echo ""
    echo "Access Key ID: $ACCESS_KEY_ID"
    echo "Secret Access Key: $SECRET_KEY"
    echo ""
    echo -e "${RED}⚠️  IMPORTANTE: Guarda estas credenciales de forma segura${NC}"
    echo "Añade estos valores como secrets en GitHub:"
    echo "  AWS_ACCESS_KEY_ID = $ACCESS_KEY_ID"
    echo "  AWS_SECRET_ACCESS_KEY = $SECRET_KEY"
fi
echo ""

# ============================================
# 9. Crear CloudFront Distribution
# ============================================
echo -e "${YELLOW}9. Creando CloudFront Distribution...${NC}"
read -p "¿Crear CloudFront Distribution ahora? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    DISTRIBUTION_CONFIG=$(cat <<EOF
{
  "CallerReference": "$(date +%s)",
  "Comment": "$CLOUDFRONT_COMMENT",
  "Enabled": true,
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-$S3_BUCKET_NAME",
        "DomainName": "$S3_BUCKET_NAME.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        },
        "ConnectionAttempts": 3,
        "ConnectionTimeout": 10
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-$S3_BUCKET_NAME",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"],
      "CachedMethods": {
        "Quantity": 2,
        "Items": ["GET", "HEAD"]
      }
    },
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    },
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000,
    "Compress": true
  },
  "CustomErrorResponses": {
    "Quantity": 1,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      }
    ]
  },
  "PriceClass": "PriceClass_All"
}
EOF
    )
    
    DISTRIBUTION=$(echo "$DISTRIBUTION_CONFIG" | aws cloudfront create-distribution)
    DIST_ID=$(echo "$DISTRIBUTION" | jq -r '.Distribution.Id')
    DOMAIN_NAME=$(echo "$DISTRIBUTION" | jq -r '.Distribution.DomainName')
    
    echo ""
    echo -e "${GREEN}✅ CloudFront Distribution creada${NC}"
    echo ""
    echo "Distribution ID: $DIST_ID"
    echo "Domain Name: $DOMAIN_NAME"
    echo ""
    echo -e "${YELLOW}⚠️  La distribución puede tardar 15-20 minutos en estar lista${NC}"
    echo ""
    echo "Añade este valor como secret en GitHub:"
    echo "  CLOUDFRONT_DISTRIBUTION_ID = $DIST_ID"
    echo ""
else
    echo -e "${YELLOW}⚠️  Saltando creación de CloudFront${NC}"
fi
echo ""

# ============================================
# 10. Resumen final
# ============================================
echo ""
echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}✅ Configuración completada${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""
echo "📋 Resumen:"
echo "  S3 Bucket: $S3_BUCKET_NAME"
echo "  IAM User: $IAM_USER_NAME"
echo ""
echo "🔐 Secrets para GitHub:"
echo "  AWS_ACCESS_KEY_ID = [Ver arriba]"
echo "  AWS_SECRET_ACCESS_KEY = [Ver arriba]"
echo "  S3_BUCKET_NAME = $S3_BUCKET_NAME"
echo "  CLOUDFRONT_DISTRIBUTION_ID = [Ver arriba o crear manualmente]"
echo ""
echo "📚 Siguiente paso:"
echo "  1. Añade los secrets en GitHub: Settings → Secrets → Actions"
echo "  2. Configura las variables de Auth0"
echo "  3. Haz push a la rama main para desplegar"
echo ""
echo -e "${GREEN}¡Listo para desplegar! 🚀${NC}"
