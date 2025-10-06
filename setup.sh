#!/bin/bash

# ========================================
# SCRIPT DE CONFIGURACIÓN INICIAL
# ========================================

echo "🚀 Configurando PropertyRental Frontend..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js 18+ desde https://nodejs.org"
    exit 1
fi

# Verificar versión de Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js versión $NODE_VERSION detectada. Se requiere versión 18 o superior."
    exit 1
fi

echo "✅ Node.js $(node -v) detectado"

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error instalando dependencias"
    exit 1
fi

echo "✅ Dependencias instaladas correctamente"

# Configurar variables de entorno
if [ ! -f .env ]; then
    echo "⚙️  Configurando variables de entorno..."
    cp env.example .env
    echo "✅ Archivo .env creado desde env.example"
    echo "📝 Por favor edita el archivo .env con tus credenciales de Auth0"
else
    echo "✅ Archivo .env ya existe"
fi

echo ""
echo "🎉 ¡Configuración completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Edita el archivo .env con tus credenciales de Auth0"
echo "2. Configura las URLs en Auth0 Dashboard:"
echo "   - Callback: http://localhost:3000/callback"
echo "   - Logout: http://localhost:3000"
echo "   - Web Origins: http://localhost:3000"
echo "3. Ejecuta: npm start"
echo ""
echo "🌐 La aplicación estará disponible en: http://localhost:3000"
