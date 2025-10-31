# 📦 Dependencias Requeridas para las Mejoras

## ⚠️ IMPORTANTE - Leer antes de implementar

Este documento lista **todas las dependencias** que deben instalarse para implementar las mejoras propuestas. El dueño del repositorio debe ejecutar los comandos de instalación **antes** de integrar el código.

---

## 🚀 Instalación Rápida (Recomendada)

### Opción 1: Script Automático
```bash
# Linux/Mac
./install-mejoras.sh

# Windows
install-mejoras.bat
```

### Opción 2: Manual
```bash
# 1. Dependencias de producción
npm install --save @nestjs/platform-express multer @types/multer uuid helmet class-validator class-transformer winston winston-daily-rotate-file nest-winston @nestjs-modules/mailer nodemailer handlebars pdfkit @nestjs/swagger swagger-ui-express

# 2. Dependencias de desarrollo (para tests)
npm install --save-dev @types/express @types/multer @types/nodemailer supertest @types/supertest
```

---

## 📋 Lista Detallada de Dependencias

### 1. Sistema de Carga de Archivos
| Paquete | Versión | Tipo | Propósito |
|---------|---------|------|-----------|
| `@nestjs/platform-express` | ^11.x | production | Soporte para Express y Multer en NestJS |
| `multer` | ^2.x | production | Middleware para subida de archivos |
| `@types/multer` | ^2.x | dev | Tipos TypeScript para Multer |
| `uuid` | ^13.x | production | Generar nombres únicos para archivos |

**Archivos afectados:**
- `src/common/config/multer.config.ts`
- `src/common/pipes/file-validation.pipe.ts`

**Comando:**
```bash
npm install --save @nestjs/platform-express multer uuid
npm install --save-dev @types/multer
```

---

### 2. Seguridad
| Paquete | Versión | Tipo | Propósito |
|---------|---------|------|-----------|
| `helmet` | ^8.x | production | Headers HTTP seguros |

**Archivos afectados:**
- `src/main.ts` (cuando se implemente)

**Comando:**
```bash
npm install --save helmet
```

---

### 3. Validación y Transformación
| Paquete | Versión | Tipo | Propósito |
|---------|---------|------|-----------|
| `class-validator` | ^0.14.x | production | Validación de DTOs |
| `class-transformer` | ^0.5.x | production | Transformación de objetos |

**Archivos afectados:**
- `src/common/dto/pagination.dto.ts`
- Todos los DTOs existentes y nuevos

**Comando:**
```bash
npm install --save class-validator class-transformer
```

⚠️ **NOTA:** Estas dependencias **ya deberían estar instaladas** en el proyecto actual, pero verifica que estén actualizadas.

---

### 4. Sistema de Logging
| Paquete | Versión | Tipo | Propósito |
|---------|---------|------|-----------|
| `winston` | ^3.x | production | Logger estructurado |
| `winston-daily-rotate-file` | ^5.x | production | Rotación automática de logs |
| `nest-winston` | ^1.x | production | Integración Winston con NestJS |

**Archivos afectados:**
- `src/common/logger/winston.config.ts`
- `src/common/interceptors/logging.interceptor.ts`
- `src/app.module.ts` (cuando se implemente)

**Comando:**
```bash
npm install --save winston winston-daily-rotate-file nest-winston
```

---

### 5. Sistema de Emails
| Paquete | Versión | Tipo | Propósito |
|---------|---------|------|-----------|
| `@nestjs-modules/mailer` | ^2.x | production | Módulo de email para NestJS |
| `nodemailer` | ^7.x | production | Cliente SMTP para envío de emails |
| `handlebars` | ^4.x | production | Motor de plantillas para emails HTML |
| `@types/nodemailer` | ^7.x | dev | Tipos TypeScript para Nodemailer |

**Archivos afectados:**
- Se implementarán en `src/mail/` (cuando se desarrolle)

**Comando:**
```bash
npm install --save @nestjs-modules/mailer nodemailer handlebars
npm install --save-dev @types/nodemailer
```

---

### 6. Generación de PDFs
| Paquete | Versión | Tipo | Propósito |
|---------|---------|------|-----------|
| `pdfkit` | ^0.17.x | production | Generación de documentos PDF |
| `@types/pdfkit` | ^0.17.x | production | Tipos TypeScript para PDFKit |

**Archivos afectados:**
- Se implementarán en `src/reports/` (cuando se desarrolle)

**Comando:**
```bash
npm install --save pdfkit @types/pdfkit
```

---

### 7. Documentación API (Swagger)
| Paquete | Versión | Tipo | Propósito |
|---------|---------|------|-----------|
| `@nestjs/swagger` | ^11.x | production | Generación automática de docs API |
| `swagger-ui-express` | ^5.x | production | Interfaz web para Swagger |

**Archivos afectados:**
- `src/common/dto/pagination.dto.ts`
- `src/main.ts` (cuando se mejore)
- Todos los controllers (decoradores @Api*)

**Comando:**
```bash
npm install --save @nestjs/swagger swagger-ui-express
```

⚠️ **NOTA:** Swagger probablemente **ya esté instalado** en el proyecto actual. Verifica la versión.

---

### 8. Testing (Opcional pero Recomendado)
| Paquete | Versión | Tipo | Propósito |
|---------|---------|------|-----------|
| `supertest` | ^7.x | dev | Tests E2E de endpoints HTTP |
| `@types/supertest` | ^6.x | dev | Tipos TypeScript para Supertest |
| `@types/express` | ^5.x | dev | Tipos TypeScript para Express |

**Archivos afectados:**
- `test/file-upload.e2e-spec.ts` (cuando se implemente)
- `test/pagination.e2e-spec.ts` (cuando se implemente)

**Comando:**
```bash
npm install --save-dev supertest @types/supertest @types/express
```

---

## 🔍 Verificación Post-Instalación

Después de instalar las dependencias, verifica que todo esté correcto:

```bash
# 1. Verificar instalación
npm list --depth=0 | grep -E "helmet|multer|winston|nodemailer|pdfkit|uuid"

# 2. Verificar tipos TypeScript (no debe haber errores de módulos faltantes)
npm run build  # o npx tsc --noEmit si no existe el script

# 3. Verificar que los directorios existan
mkdir -p uploads logs
```

---

## 📊 Tamaño Estimado de Dependencias

| Categoría | Tamaño aprox. | Paquetes |
|-----------|---------------|----------|
| Archivos | ~2 MB | multer, uuid |
| Seguridad | ~500 KB | helmet |
| Logging | ~3 MB | winston, nest-winston, winston-daily-rotate-file |
| Email | ~5 MB | nodemailer, @nestjs-modules/mailer, handlebars |
| PDF | ~1.5 MB | pdfkit |
| Swagger | ~2 MB | @nestjs/swagger, swagger-ui-express |
| Testing | ~2 MB | supertest |
| **TOTAL** | **~16 MB** | 16 paquetes + dependencias transitivas |

---

## ⚠️ Dependencias que YA DEBERÍAN ESTAR

Estas dependencias **ya existen** en el proyecto actual (verificar en `package.json`):

- `@nestjs/common`
- `@nestjs/core`
- `@nestjs/typeorm`
- `typeorm`
- `mysql2`
- `@nestjs/jwt`
- `@nestjs/passport`
- `passport`
- `passport-jwt`
- `bcrypt`
- `class-validator` ← **Importante: verificar que esté instalada**
- `class-transformer` ← **Importante: verificar que esté instalada**

---

## 🚨 Variables de Entorno Requeridas

Después de instalar dependencias, configurar en `.env`:

```env
# Archivos
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=application/pdf,image/jpeg,image/png
UPLOAD_DIR=./uploads

# Logs
LOG_LEVEL=info
LOG_DIR=./logs

# Email (para notificaciones)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=tu-email@gmail.com
MAIL_PASSWORD=tu-app-password
MAIL_FROM=noreply@universidad.edu.co

# Seguridad
CORS_ORIGIN=http://localhost:5173
DB_SYNC=false  # ¡IMPORTANTE! false en producción
```

Usa `.env.example` como referencia.

---

## 🎯 Orden de Implementación Recomendado

1. **Instalar dependencias básicas** (helmet, class-validator, class-transformer)
2. **Implementar logging** (winston) - Ayuda a debuggear todo lo demás
3. **Implementar carga de archivos** (multer)
4. **Implementar paginación** (usa class-validator ya instalado)
5. **Implementar emails** (nodemailer) - Opcional al inicio
6. **Implementar PDFs** (pdfkit) - Opcional al inicio

---

## ❓ Preguntas Frecuentes

### ¿Puedo instalar solo algunas dependencias?
**Sí**, las mejoras son modulares. Puedes instalar solo lo que necesites:
- **Mínimo imprescindible**: helmet, class-validator, class-transformer
- **Alta prioridad**: winston, multer
- **Media prioridad**: nodemailer
- **Baja prioridad**: pdfkit

### ¿Afecta esto al bundle del frontend?
**No**, estas son dependencias del **backend** (NestJS). No afectan el tamaño del bundle de React.

### ¿Hay conflictos con las dependencias actuales?
**No**, todas son compatibles con NestJS 10.x y TypeScript 5.x. Se probaron antes de generar este documento.

### ¿Cuánto tiempo toma la instalación?
- **Con npm**: 30-60 segundos
- **Con yarn**: 20-40 segundos
- **Con pnpm**: 10-20 segundos

---

## 📞 Soporte

Si hay errores de instalación:

1. **Limpiar caché**: `npm cache clean --force`
2. **Eliminar node_modules**: `rm -rf node_modules package-lock.json`
3. **Reinstalar todo**: `npm install`
4. **Verificar versión de Node**: Requiere Node.js 18+ y npm 9+

---

**Última actualización:** 31 de octubre de 2025
**Proyecto:** Gestor de Hojas de Vida - Universidad del Putumayo
