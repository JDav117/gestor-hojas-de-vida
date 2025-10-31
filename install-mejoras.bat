@echo off
REM 🚀 Script de Instalación de Mejoras para Windows
REM Sistema de Gestión de Hojas de Vida - Universidad del Putumayo

echo ==================================================
echo 🎯 Instalación de Mejoras del Sistema GHV
echo ==================================================
echo.

REM Verificar que estamos en la raíz del proyecto
if not exist "package.json" (
    echo ❌ Este script debe ejecutarse desde la raíz del proyecto
    exit /b 1
)

echo ℹ️  Verificando prerequisitos...

REM Verificar Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js no está instalado
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js detectado: %NODE_VERSION%

REM Verificar npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm no está instalado
    exit /b 1
)

for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo ✅ npm detectado: %NPM_VERSION%

echo.
echo ℹ️  Instalando dependencias de producción...

REM Instalar dependencias de producción
call npm install --save @nestjs/platform-express multer helmet uuid winston winston-daily-rotate-file nest-winston @nestjs-modules/mailer nodemailer handlebars pdfkit

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error instalando dependencias de producción
    exit /b 1
)

echo ✅ Dependencias de producción instaladas

echo.
echo ℹ️  Instalando dependencias de desarrollo...

REM Instalar dependencias de desarrollo
call npm install --save-dev @types/multer @types/nodemailer @types/pdfkit

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error instalando dependencias de desarrollo
    exit /b 1
)

echo ✅ Dependencias de desarrollo instaladas

echo.
echo ℹ️  Creando estructura de directorios...

REM Crear directorios necesarios
if not exist "uploads" mkdir uploads
if not exist "logs" mkdir logs
if not exist "src\common\config" mkdir src\common\config
if not exist "src\common\pipes" mkdir src\common\pipes
if not exist "src\common\logger" mkdir src\common\logger
if not exist "src\common\interceptors" mkdir src\common\interceptors
if not exist "src\common\dto" mkdir src\common\dto
if not exist "src\mail\templates" mkdir src\mail\templates
if not exist "src\reports\templates" mkdir src\reports\templates
if not exist "docs\diagrams" mkdir docs\diagrams

REM Crear archivos .gitkeep
type nul > uploads\.gitkeep
type nul > logs\.gitkeep

echo ✅ Estructura de directorios creada

echo.
echo ℹ️  Configurando archivos de entorno...

REM Copiar .env.example si no existe .env
if not exist ".env" (
    if exist ".env.example" (
        copy .env.example .env
        echo ✅ Archivo .env creado desde .env.example
        echo ⚠️  Por favor, edita .env con tus configuraciones reales
    ) else (
        echo ⚠️  .env.example no encontrado
    )
) else (
    echo ℹ️  .env ya existe, no se sobreescribirá
)

echo.
echo ℹ️  Actualizando .gitignore...

REM Agregar entradas a .gitignore si no existen
if exist ".gitignore" (
    findstr /C:"uploads/*" .gitignore >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo. >> .gitignore
        echo # Archivos subidos >> .gitignore
        echo uploads/* >> .gitignore
        echo !uploads/.gitkeep >> .gitignore
    )
    
    findstr /C:"logs/*" .gitignore >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo. >> .gitignore
        echo # Logs >> .gitignore
        echo logs/* >> .gitignore
        echo !logs/.gitkeep >> .gitignore
    )
    
    echo ✅ .gitignore actualizado
) else (
    echo ⚠️  .gitignore no encontrado
)

echo.
echo ==================================================
echo ✅ Instalación completada exitosamente
echo ==================================================
echo.
echo ℹ️  Próximos pasos:
echo   1. Edita el archivo .env con tus configuraciones
echo   2. Revisa la guía GUIA_IMPLEMENTACION.md
echo   3. Ejecuta: npm run start:dev
echo   4. Verifica los logs en logs\application-*.log
echo.
echo ⚠️  IMPORTANTE: Configura las siguientes variables en .env:
echo   - DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE
echo   - JWT_SECRET (debe ser una clave segura)
echo   - MAIL_HOST, MAIL_USER, MAIL_PASSWORD (para notificaciones)
echo.

pause
