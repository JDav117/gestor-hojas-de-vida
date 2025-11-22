#!/bin/bash

# 🚀 Script de Instalación de Mejoras
# Sistema de Gestión de Hojas de Vida - Universidad del Putumayo

echo "=================================================="
echo "🎯 Instalación de Mejoras del Sistema GHV"
echo "=================================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # Sin color

# Función para imprimir con color
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "ℹ️  $1"
}

# Verificar que estamos en la raíz del proyecto
if [ ! -f "package.json" ]; then
    print_error "Este script debe ejecutarse desde la raíz del proyecto"
    exit 1
fi

print_info "Verificando prerequisitos..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado"
    exit 1
else
    NODE_VERSION=$(node -v)
    print_success "Node.js detectado: $NODE_VERSION"
fi

# Verificar npm
if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado"
    exit 1
else
    NPM_VERSION=$(npm -v)
    print_success "npm detectado: $NPM_VERSION"
fi

echo ""
print_info "Instalando dependencias de producción..."

# Instalar dependencias de producción
npm install --save \
    @nestjs/platform-express \
    multer \
    helmet \
    uuid \
    winston \
    winston-daily-rotate-file \
    nest-winston \
    @nestjs-modules/mailer \
    nodemailer \
    handlebars \
    pdfkit

if [ $? -eq 0 ]; then
    print_success "Dependencias de producción instaladas"
else
    print_error "Error instalando dependencias de producción"
    exit 1
fi

echo ""
print_info "Instalando dependencias de desarrollo..."

# Instalar dependencias de desarrollo
npm install --save-dev \
    @types/multer \
    @types/nodemailer \
    @types/pdfkit

if [ $? -eq 0 ]; then
    print_success "Dependencias de desarrollo instaladas"
else
    print_error "Error instalando dependencias de desarrollo"
    exit 1
fi

echo ""
print_info "Creando estructura de directorios..."

# Crear directorios necesarios
mkdir -p uploads
mkdir -p logs
mkdir -p src/common/config
mkdir -p src/common/pipes
mkdir -p src/common/logger
mkdir -p src/common/interceptors
mkdir -p src/common/dto
mkdir -p src/mail/templates
mkdir -p src/reports/templates
mkdir -p docs/diagrams

# Crear archivos .gitkeep
touch uploads/.gitkeep
touch logs/.gitkeep

print_success "Estructura de directorios creada"

echo ""
print_info "Configurando archivos de entorno..."

# Copiar .env.example si no existe .env
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_success "Archivo .env creado desde .env.example"
        print_warning "Por favor, edita .env con tus configuraciones reales"
    else
        print_warning ".env.example no encontrado"
    fi
else
    print_info ".env ya existe, no se sobreescribirá"
fi

echo ""
print_info "Actualizando .gitignore..."

# Agregar entradas a .gitignore si no existen
if [ -f ".gitignore" ]; then
    if ! grep -q "uploads/\*" .gitignore; then
        echo "" >> .gitignore
        echo "# Archivos subidos" >> .gitignore
        echo "uploads/*" >> .gitignore
        echo "!uploads/.gitkeep" >> .gitignore
    fi
    
    if ! grep -q "logs/\*" .gitignore; then
        echo "" >> .gitignore
        echo "# Logs" >> .gitignore
        echo "logs/*" >> .gitignore
        echo "!logs/.gitkeep" >> .gitignore
    fi
    
    print_success ".gitignore actualizado"
else
    print_warning ".gitignore no encontrado"
fi

echo ""
print_info "Verificando instalación..."

# Verificar que las dependencias principales se instalaron
DEPS_OK=true

if ! npm list @nestjs/platform-express > /dev/null 2>&1; then
    print_error "@nestjs/platform-express no instalado"
    DEPS_OK=false
fi

if ! npm list multer > /dev/null 2>&1; then
    print_error "multer no instalado"
    DEPS_OK=false
fi

if ! npm list helmet > /dev/null 2>&1; then
    print_error "helmet no instalado"
    DEPS_OK=false
fi

if ! npm list winston > /dev/null 2>&1; then
    print_error "winston no instalado"
    DEPS_OK=false
fi

if [ "$DEPS_OK" = true ]; then
    print_success "Todas las dependencias verificadas correctamente"
else
    print_error "Algunas dependencias no se instalaron correctamente"
    print_info "Intenta ejecutar: npm install"
    exit 1
fi

echo ""
echo "=================================================="
echo "✅ Instalación completada exitosamente"
echo "=================================================="
echo ""
print_info "Próximos pasos:"
echo "  1. Edita el archivo .env con tus configuraciones"
echo "  2. Revisa la guía GUIA_IMPLEMENTACION.md"
echo "  3. Ejecuta: npm run start:dev"
echo "  4. Verifica los logs en logs/application-*.log"
echo ""
print_warning "IMPORTANTE: Configura las siguientes variables en .env:"
echo "  - DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE"
echo "  - JWT_SECRET (debe ser una clave segura)"
echo "  - MAIL_HOST, MAIL_USER, MAIL_PASSWORD (para notificaciones)"
echo ""
