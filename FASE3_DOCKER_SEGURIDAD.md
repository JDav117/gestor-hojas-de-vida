# FASE 3: DOCKERIZACIÓN Y SEGURIDAD

## Gestor de Hojas de Vida - Convocatorias Docentes

---

## 1. DOCKERFILE PARA MySQL

Crear un `Dockerfile` que incluya la base de datos con el esquema inicial:

```dockerfile
# Archivo: Dockerfile.mysql
FROM mysql:8.0-debian

# Variables de entorno para MySQL
ENV MYSQL_ROOT_PASSWORD=root_password_secure_change_this
ENV MYSQL_DATABASE=gestor_hojas_de_vida_production
ENV MYSQL_USER=ghv_app_user
ENV MYSQL_PASSWORD=app_secure_password_change_this

# Copiar script de inicialización
COPY ./docker-entrypoint-initdb.d/ /docker-entrypoint-initdb.d/

# Configuración de MySQL para producción
COPY ./docker-config/mysql.cnf /etc/mysql/conf.d/

# Exponer puerto
EXPOSE 3306

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD mysqladmin ping -h localhost -u root -p${MYSQL_ROOT_PASSWORD} || exit 1

# Comando de inicio (heredado de la imagen base)
CMD ["mysqld"]
```

---

## 2. DOCKER-COMPOSE PARA ORQUESTACIÓN

```yaml
# Archivo: docker-compose.yml
version: '3.8'

services:
  # Servicio MySQL - Base de Datos
  db:
    build:
      context: .
      dockerfile: Dockerfile.mysql
    container_name: ghv_mysql_db
    restart: unless-stopped
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD:-root_secure_password}
      MYSQL_DATABASE: ${DB_DATABASE:-gestor_hojas_de_vida}
      MYSQL_USER: ${DB_USERNAME:-ghv_app_user}
      MYSQL_PASSWORD: ${DB_PASSWORD:-app_secure_password}
      MYSQL_INITDB_SKIP_TZINFO: 1
    volumes:
      # Volumen para persistencia de datos
      - db_data:/var/lib/mysql
      # Scripts de inicialización
      - ./docker-entrypoint-initdb.d:/docker-entrypoint-initdb.d:ro
      # Configuración de MySQL
      - ./docker-config/mysql.cnf:/etc/mysql/conf.d/mysql.cnf:ro
    networks:
      - ghv_network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Servicio de la Aplicación NestJS
  app:
    build:
      context: .
      dockerfile: Dockerfile.app
    container_name: ghv_nestjs_app
    restart: unless-stopped
    ports:
      - "3000:3000"
    depends_on:
      db:
        condition: service_healthy
    environment:
      NODE_ENV: ${NODE_ENV:-production}
      DB_HOST: db
      DB_PORT: 3306
      DB_USERNAME: ${DB_USERNAME:-ghv_app_user}
      DB_PASSWORD: ${DB_PASSWORD:-app_secure_password}
      DB_DATABASE: ${DB_DATABASE:-gestor_hojas_de_vida}
      JWT_SECRET: ${JWT_SECRET:-your-secret-key-change-in-production}
      JWT_EXPIRATION: ${JWT_EXPIRATION:-24h}
      APP_PORT: 3000
      LOG_LEVEL: ${LOG_LEVEL:-info}
    volumes:
      # Volumen para uploads
      - app_uploads:/app/uploads
    networks:
      - ghv_network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Servicio PhpMyAdmin (Opcional - solo desarrollo)
  phpmyadmin:
    image: phpmyadmin:5.2-apache
    container_name: ghv_phpmyadmin
    restart: unless-stopped
    ports:
      - "8080:80"
    environment:
      PMA_HOST: db
      PMA_USER: ${DB_USERNAME:-ghv_app_user}
      PMA_PASSWORD: ${DB_PASSWORD:-app_secure_password}
      PMA_ROOT_PASSWORD: ${DB_ROOT_PASSWORD:-root_secure_password}
    depends_on:
      - db
    networks:
      - ghv_network
    profiles:
      - dev  # Solo incluir en desarrollo: docker-compose --profile dev up

volumes:
  db_data:
    driver: local
  app_uploads:
    driver: local

networks:
  ghv_network:
    driver: bridge
```

---

## 3. ARCHIVO DE VARIABLES DE ENTORNO

```bash
# Archivo: .env.production
NODE_ENV=production
APP_PORT=3000
LOG_LEVEL=info

# Base de Datos - MySQL
DB_HOST=db
DB_PORT=3306
DB_USERNAME=ghv_app_user
DB_PASSWORD=your_very_secure_password_here_min_32_chars
DB_DATABASE=gestor_hojas_de_vida
DB_ROOT_PASSWORD=root_very_secure_password_min_32_chars
DB_SYNC=false
DB_LOGGING=false

# JWT - Autenticación
JWT_SECRET=your_jwt_secret_key_min_32_characters_long
JWT_EXPIRATION=24h
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_min_32_char

# Aplicación
APP_NAME=Gestor Hojas de Vida
APP_VERSION=1.0.0
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# Archivos
MAX_FILE_SIZE_MB=50
UPLOAD_PATH=./uploads

# Seguridad
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Logging
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

```bash
# Archivo: .env.development (para desarrollo local)
NODE_ENV=development
APP_PORT=3000
LOG_LEVEL=debug

DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=root
DB_DATABASE=gestor_hojas_de_vida_dev
DB_ROOT_PASSWORD=root
DB_SYNC=true
DB_LOGGING=true

JWT_SECRET=dev_secret_key_not_for_production
JWT_EXPIRATION=24h
JWT_REFRESH_SECRET=dev_refresh_secret_key

APP_NAME=Gestor Hojas de Vida (Dev)
THROTTLE_TTL=60
THROTTLE_LIMIT=1000

MAX_FILE_SIZE_MB=100
UPLOAD_PATH=./uploads

CORS_ORIGIN=http://localhost:3000,http://localhost:5173

RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=1000
```

---

## 4. CONFIGURACIÓN SEGURA DE MYSQL

```sql
-- Archivo: docker-config/mysql.cnf
[mysqld]
# Modo SQL strict - requiere características estándar
sql_mode='STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION'

# Seguridad
bind-address=0.0.0.0
# El puerto por defecto
port=3306

# Conexiones
max_connections=200
max_allowed_packet=64M
interactive_timeout=28800
wait_timeout=28800

# Logging y auditoría
log_error=/var/log/mysql/error.log
general_log=OFF
slow_query_log=ON
slow_query_log_file=/var/log/mysql/slow.log
long_query_time=2

# Replicación y backup
skip_name_resolve=ON
character_set_server=utf8mb4
collation_server=utf8mb4_unicode_ci

# Rendimiento
innodb_buffer_pool_size=256M
innodb_log_file_size=100M
max_connections=500

# SSL (opcional para conexiones seguras)
# ssl_ca=/etc/mysql/certs/ca.pem
# ssl_cert=/etc/mysql/certs/server-cert.pem
# ssl_key=/etc/mysql/certs/server-key.pem
```

---

## 5. SCRIPT DE CONFIGURACIÓN DE SEGURIDAD EN BASE DE DATOS

```sql
-- Archivo: docker-entrypoint-initdb.d/02-security.sql
-- Este script se ejecuta después de crear la base de datos

-- ========================================================================
-- CONFIGURACIÓN DE USUARIOS CON PRIVILEGIOS MÍNIMOS
-- ========================================================================

-- Usuario para la aplicación (LECTURA Y ESCRITURA limitada)
-- Este usuario solo puede acceder desde la red Docker (db)
CREATE USER IF NOT EXISTS 'ghv_app_user'@'%' IDENTIFIED BY 'app_secure_password_change_this';

-- Privilegios específicos para la aplicación (SIN ADMIN)
-- Solo puede manipular datos en gestor_hojas_de_vida, no crear/eliminar tablas
GRANT SELECT, INSERT, UPDATE, DELETE ON gestor_hojas_de_vida.* TO 'ghv_app_user'@'%';
GRANT EXECUTE ON gestor_hojas_de_vida.* TO 'ghv_app_user'@'%'; -- Para procedimientos almacenados

-- Privilegios READ-ONLY para reportes
CREATE USER IF NOT EXISTS 'ghv_report_user'@'%' IDENTIFIED BY 'report_secure_password_change_this';
GRANT SELECT ON gestor_hojas_de_vida.* TO 'ghv_report_user'@'%';

-- Usuario para backups (DUMP)
CREATE USER IF NOT EXISTS 'ghv_backup_user'@'localhost' IDENTIFIED BY 'backup_secure_password_change_this';
GRANT SELECT, LOCK TABLES ON gestor_hojas_de_vida.* TO 'ghv_backup_user'@'localhost';

-- ========================================================================
-- REVOCAR PRIVILEGIOS PELIGROSOS
-- ========================================================================

-- No permitir que la aplicación cree/elimine bases de datos
REVOKE ALL ON *.* FROM 'ghv_app_user'@'%';
REVOKE GRANT OPTION ON *.* FROM 'ghv_app_user'@'%';

-- No permitir acceso de usuario anónimo
DELETE FROM mysql.user WHERE user = '';

-- No permitir que root acceda desde hosts remotos
UPDATE mysql.user SET Host='localhost' WHERE User='root';

-- Refrescar privilegios
FLUSH PRIVILEGES;

-- ========================================================================
-- AUDITORÍA Y LOGGING
-- ========================================================================

-- Crear tabla de auditoría para cambios críticos
CREATE TABLE IF NOT EXISTS gestor_hojas_de_vida.audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tabla_afectada VARCHAR(100),
    operacion VARCHAR(50), -- INSERT, UPDATE, DELETE
    usuario_responsable VARCHAR(100),
    datos_anteriores JSON,
    datos_nuevos JSON,
    fecha_operacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_origen VARCHAR(45),
    INDEX idx_audit_fecha (fecha_operacion),
    INDEX idx_audit_tabla (tabla_afectada)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================================================
-- RESTRICCIONES ADICIONALES DE SEGURIDAD
-- ========================================================================

-- Configurar validación de contraseñas (si se usa validación de contraseña)
-- SET GLOBAL default_password_lifetime = 90; -- Cambiar contraseña cada 90 días

-- Limitar intentos de conexión fallidos
-- SET GLOBAL max_connect_errors = 5;

-- Conexiones SSL recomendadas (descomentar si se configura SSL)
-- ALTER USER 'ghv_app_user'@'%' REQUIRE SSL;

FLUSH PRIVILEGES;
```

---

## 6. SCRIPT DE INICIALIZACIÓN DE DATOS

```sql
-- Archivo: docker-entrypoint-initdb.d/01-schema-and-data.sql
-- Este script contiene la creación de tablas y datos iniciales
-- (Copiar el contenido de FASE2_SCRIPT_IMPLEMENTACION.sql aquí)
```

---

## 7. DOCKERFILE PARA LA APLICACIÓN NestJS

```dockerfile
# Archivo: Dockerfile.app
# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar TypeScript
RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine

WORKDIR /app

# Instalar curl para healthcheck
RUN apk add --no-cache curl

# Variables de entorno
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=512"

# Copiar solo lo necesario del builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Crear directorio de uploads
RUN mkdir -p uploads

# Usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
USER nestjs

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Iniciar aplicación
CMD ["node", "dist/main.js"]
```

---

## 8. INSTRUCCIONES DE DESPLIEGUE

### A. Construcción y Ejecución Local

```bash
# Clonar o navegar al directorio del proyecto
cd /ruta/al/proyecto

# Crear archivo .env con variables seguras
cp .env.production.example .env.production

# Editar .env.production con contraseñas seguras
# IMPORTANTE: Generar contraseñas fuertes (mínimo 32 caracteres)
nano .env.production

# Construir imágenes
docker-compose build

# Ejecutar servicios en background
docker-compose up -d

# Ver logs
docker-compose logs -f

# Verificar estado de servicios
docker-compose ps

# Detener servicios
docker-compose down

# Eliminar volúmenes (ADVERTENCIA: Borra datos)
docker-compose down -v
```

### B. Despliegue en Producción

```bash
# 1. Generar contraseñas seguras
openssl rand -base64 32

# 2. Configurar variables de entorno en producción
export DB_PASSWORD=$(openssl rand -base64 32)
export JWT_SECRET=$(openssl rand -base64 32)
export MYSQL_ROOT_PASSWORD=$(openssl rand -base64 32)

# 3. Construir imágenes sin cache
docker-compose build --no-cache

# 4. Ejecutar con reinicio automático
docker-compose up -d

# 5. Configurar respaldo automático
docker-compose exec db mysqldump -u root -p${MYSQL_ROOT_PASSWORD} \
  gestor_hojas_de_vida > backup_$(date +%Y%m%d_%H%M%S).sql

# 6. Monitorear logs
docker-compose logs -f --tail=100
```

### C. Respaldo y Recuperación

```bash
# Crear respaldo de base de datos
docker-compose exec -T db mysqldump -u ghv_backup_user -p \
  gestor_hojas_de_vida > backup_$(date +%Y%m%d).sql

# Restaurar desde respaldo
docker-compose exec -T db mysql -u root -p < backup_20250101.sql

# Respaldo de volúmenes
docker run --rm -v ghv_db_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/db_data_backup_$(date +%Y%m%d).tar.gz -C /data .
```

---

## 9. CHECKLIST DE SEGURIDAD PARA PRODUCCIÓN

- [ ] Cambiar todas las contraseñas por defecto
- [ ] Usar mínimo 32 caracteres en contraseñas
- [ ] Configurar firewall para limitar acceso a puerto 3306 (solo localhost o IPs autorizadas)
- [ ] Habilitar SSL/TLS en MySQL
- [ ] Configurar backups automáticos
- [ ] Configurar monitoreo y alertas
- [ ] Implementar logs centralizados (Sentry, ELK)
- [ ] Usar secrets manager (AWS Secrets Manager, HashiCorp Vault)
- [ ] Validar que solo root accede desde localhost
- [ ] Implementar rotación periódica de contraseñas
- [ ] Usar variables de entorno, nunca hardcodear secretos
- [ ] Registrar todos los intentos de acceso (auditoria)
- [ ] Limitar conexiones por IP
- [ ] Aplicar principio de menor privilegio
- [ ] Realizar test de penetración

---

## 10. MONITOREO Y LOGS

### Acceder a logs de MySQL
```bash
docker-compose logs db
docker-compose exec db tail -f /var/log/mysql/error.log
docker-compose exec db tail -f /var/log/mysql/slow.log
```

### Monitoreo de recursos
```bash
docker stats

docker-compose exec db mysql -u root -p -e "SHOW PROCESSLIST;"
docker-compose exec db mysql -u root -p -e "SHOW ENGINE INNODB STATUS;"
```

---

## RESUMEN FASE 3

✅ **Dockerfile** para MySQL 8.0 con configuración segura
✅ **docker-compose.yml** orquestando App + MySQL + PhpMyAdmin (dev)
✅ **Configuración de MySQL** para producción (sql_mode, logging, etc.)
✅ **Usuarios con privilegios mínimos** (app, report, backup)
✅ **Auditoría** de cambios críticos
✅ **Variables de entorno** seguras (.env.production, .env.development)
✅ **Health checks** para monitoreo
✅ **Scripts de backup y recuperación**
✅ **Dockerfile multi-stage** para optimizar imagen NestJS
✅ **Instrucciones de despliegue** en producción

