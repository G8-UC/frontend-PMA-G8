@echo off
REM ========================================
REM SCRIPT DE CONFIGURACIÓN INICIAL (Windows)
REM ========================================

echo 🚀 Configurando PropertyRental Frontend...

REM Verificar Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado. Por favor instala Node.js 18+ desde https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js detectado

REM Instalar dependencias
echo 📦 Instalando dependencias...
npm install

if %errorlevel% neq 0 (
    echo ❌ Error instalando dependencias
    pause
    exit /b 1
)

echo ✅ Dependencias instaladas correctamente

REM Configurar variables de entorno
if not exist .env (
    echo ⚙️  Configurando variables de entorno...
    copy env.example .env
    echo ✅ Archivo .env creado desde env.example
    echo 📝 Por favor edita el archivo .env con tus credenciales de Auth0
) else (
    echo ✅ Archivo .env ya existe
)

echo.
echo 🎉 ¡Configuración completada!
echo.
echo 📋 Próximos pasos:
echo 1. Edita el archivo .env con tus credenciales de Auth0
echo 2. Configura las URLs en Auth0 Dashboard:
echo    - Callback: http://localhost:3000/callback
echo    - Logout: http://localhost:3000
echo    - Web Origins: http://localhost:3000
echo 3. Ejecuta: npm start
echo.
echo 🌐 La aplicación estará disponible en: http://localhost:3000
pause
