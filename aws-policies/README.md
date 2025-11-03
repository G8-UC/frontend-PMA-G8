# 🔐 AWS IAM Policies

Este directorio contiene las políticas IAM necesarias para configurar el despliegue automático desde GitHub Actions.

## 📋 Archivos

### `github-actions-policy.json`
Política IAM para el usuario de GitHub Actions que permite:
- Subir archivos al bucket S3
- Eliminar archivos del bucket S3
- Listar contenido del bucket S3
- Crear invalidaciones en CloudFront
- Ver estado de invalidaciones

### `bucket-policy.json`
Política del bucket S3 para permitir:
- Lectura pública de archivos (necesario si CloudFront accede directamente al bucket)
- Esta política es opcional si CloudFront usa Origin Access Identity (OAI)

## 🚀 Uso

### 1. Crear IAM User para GitHub Actions

```bash
# Crear usuario
aws iam create-user --user-name github-actions-deploy

# Crear access keys
aws iam create-access-key --user-name github-actions-deploy
```

### 2. Aplicar Política IAM

```bash
# Adjuntar política al usuario
aws iam put-user-policy \
  --user-name github-actions-deploy \
  --policy-name CloudFrontDeployPolicy \
  --policy-document file://github-actions-policy.json
```

## ⚙️ Configuración

### Verificar políticas

```bash
# Ver política del usuario
aws iam get-user-policy \
  --user-name github-actions-deploy \
  --policy-name CloudFrontDeployPolicy

# Ver política del bucket
aws s3api get-bucket-policy --bucket propertyrental-frontend
```

## 🔒 Seguridad

### Best Practices

1. **Principio de menor privilegio:** Solo permisos necesarios
2. **Rotar credenciales:** Cambiar Access Keys regularmente
3. **CloudFront OAI:** Usar Origin Access Identity en lugar de bucket público
4. **Monitoreo:** Activar CloudTrail para auditoría

### CloudFront con Origin Access Identity

Si usas OAI, **NO** necesitas la política `bucket-policy.json`:

```bash
# Crear OAI
aws cloudfront create-cloud-front-origin-access-identity \
  --cloud-front-origin-access-identity-config \
  CallerReference="propertyrental-oai",Comment="OAI for propertyrental"

# Actualizar distribución CloudFront para usar OAI
aws cloudfront update-distribution \
  --id YOUR_DIST_ID \
  --origins /dev/stdin <<EOF
{
  "Quantity": 1,
  "Items": [
    {
      "Id": "S3-propertyrental-frontend",
      "DomainName": "propertyrental-frontend.s3.amazonaws.com",
      "S3OriginConfig": {
        "OriginAccessIdentity": "origin-access-identity/cloudfront/E123EXAMPLE456"
      }
    }
  ]
}
EOF
```

## 📝 Notas

- Las políticas usan ARNs completos para mejor seguridad
- CloudFront invalidation usa `Resource: "*"` ya que ARNs específicos no son soportados
- La política del bucket es opcional si usas OAI
- Todos los comandos asumen AWS CLI configurado

## 🔗 Referencias

- [AWS IAM Policies](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html)
- [S3 Bucket Policies](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucket-policies.html)
- [CloudFront Origins](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/distribution-web-values-specify.html)
