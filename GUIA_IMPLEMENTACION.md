# 📋 GUÍA DE IMPLEMENTACIÓN DE MEJORAS

## 🎯 Objetivo

Esta guía te ayudará a implementar las mejoras propuestas paso a paso, de forma segura y sin afectar el código existente.

---

## 📦 PASO 1: Preparar el Entorno

### 1.1. Crear Rama de Desarrollo

```bash
# Asegúrate de estar en main y actualizado
git checkout main
git pull origin main

# Crear y cambiar a rama de mejoras
git checkout -b feature/mejoras-sistema-v2
```

### 1.2. Instalar Dependencias Nuevas

```bash
# Navegar a la raíz del proyecto
cd gestor-hojas-de-vida

# Instalar dependencias de producción
npm install --save @nestjs/platform-express multer helmet uuid
npm install --save winston winston-daily-rotate-file nest-winston
npm install --save @nestjs-modules/mailer nodemailer handlebars
npm install --save pdfkit

# Instalar dependencias de desarrollo
npm install --save-dev @types/multer @types/nodemailer @types/pdfkit
```

### 1.3. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus valores reales
# Importante: NO commitear el archivo .env
```

### 1.4. Crear Carpetas Necesarias

```bash
# Crear directorios
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

# Agregar .gitkeep para mantener carpetas en git
touch uploads/.gitkeep
touch logs/.gitkeep
```

### 1.5. Actualizar .gitignore

```bash
# Agregar al .gitignore
echo "" >> .gitignore
echo "# Archivos subidos" >> .gitignore
echo "uploads/*" >> .gitignore
echo "!uploads/.gitkeep" >> .gitignore
echo "" >> .gitignore
echo "# Logs" >> .gitignore
echo "logs/*" >> .gitignore
echo "!logs/.gitkeep" >> .gitignore
```

---

## 🔧 PASO 2: Implementar Sistema de Archivos

### 2.1. Copiar Archivos de Configuración

Ya tienes estos archivos creados en `src/common/`:
- `config/multer.config.ts`
- `pipes/file-validation.pipe.ts`

### 2.2. Modificar DocumentosController

Editar `src/documentos/documentos.controller.ts`:

```typescript
import { 
  Controller, 
  Post, 
  UseInterceptors, 
  UploadedFile,
  UseGuards,
  Req
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../common/config/multer.config';
import { FileValidationPipe } from '../common/pipes/file-validation.pipe';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('documentos')
export class DocumentosController {
  
  // Nuevo endpoint para subir archivos
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadFile(
    @UploadedFile(new FileValidationPipe()) file: Express.Multer.File,
    @Req() req: any,
  ) {
    // La ruta del archivo subido está en file.path
    return {
      message: 'Archivo subido exitosamente',
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
    };
  }
  
  // Endpoints existentes...
}
```

### 2.3. Probar Subida de Archivos

```bash
# Iniciar servidor
npm run start:dev

# Usar curl o Postman para probar
curl -X POST http://localhost:3000/documentos/upload \
  -H "Authorization: Bearer TU_TOKEN" \
  -F "file=@/ruta/a/tu/archivo.pdf"
```

---

## 📄 PASO 3: Implementar Paginación

### 3.1. Ya tienes el DTO creado

El archivo `src/common/dto/pagination.dto.ts` ya está listo.

### 3.2. Modificar PostulacionesController

```typescript
import { Controller, Get, Query } from '@nestjs/common';
import { PaginationDto, createPaginatedResponse } from '../common/dto/pagination.dto';

@Controller('postulaciones')
export class PostulacionesController {
  
  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    
    const [data, total] = await this.postulacionesService.findAndCount(
      page,
      limit
    );
    
    return createPaginatedResponse(data, total, page, limit);
  }
}
```

### 3.3. Modificar PostulacionesService

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PostulacionesService {
  
  async findAndCount(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    return await this.postulacionRepository.findAndCount({
      skip,
      take: limit,
      order: { fecha_postulacion: 'DESC' },
    });
  }
}
```

---

## 📊 PASO 4: Implementar Logging

### 4.1. Ya tienes la configuración

Los archivos en `src/common/logger/` están listos.

### 4.2. Modificar app.module.ts

```typescript
import { Module, Logger } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { winstonConfig } from './common/logger/winston.config';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { WinstonModule } from 'nest-winston';

@Module({
  imports: [
    // Agregar Winston
    WinstonModule.forRoot(winstonConfig),
    // Otros módulos...
  ],
  providers: [
    // Agregar interceptor global
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
```

### 4.3. Usar Logger en Servicios

```typescript
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PostulacionesService {
  private readonly logger = new Logger(PostulacionesService.name);
  
  async create(dto: CreatePostulacionDto) {
    this.logger.log(`Creating postulación for user ${dto.postulante_id}`);
    
    try {
      const result = await this.postulacionRepository.save(dto);
      this.logger.log(`Postulación created with ID ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Error creating postulación: ${error.message}`);
      throw error;
    }
  }
}
```

---

## 🔒 PASO 5: Mejorar Seguridad

### 5.1. Modificar main.ts

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Helmet para headers seguros
  app.use(helmet());
  
  // CORS restrictivo
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

### 5.2. Modificar app.module.ts - TypeORM

```typescript
TypeOrmModule.forRoot({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  autoLoadEntities: true,
  synchronize: process.env.DB_SYNC === 'true', // Ahora controlado por variable
  logging: process.env.NODE_ENV === 'development',
}),
```

---

## ✅ PASO 6: Probar Todo

### 6.1. Ejecutar Tests

```bash
# Tests unitarios
npm run test

# Tests e2e
npm run test:e2e

# Cobertura
npm run test:cov
```

### 6.2. Verificar que Funciona

```bash
# Iniciar en desarrollo
npm run start:dev

# Verificar logs en logs/application-YYYY-MM-DD.log
tail -f logs/application-*.log

# Verificar Swagger
# http://localhost:3000/api
```

### 6.3. Probar Endpoints

```bash
# Test de paginación
curl http://localhost:3000/postulaciones?page=1&limit=5

# Test de subida de archivos
curl -X POST http://localhost:3000/documentos/upload \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@test.pdf"
```

---

## 🚀 PASO 7: Commit y PR

### 7.1. Verificar Cambios

```bash
git status
git diff
```

### 7.2. Commit

```bash
# Agregar archivos
git add .

# Commit descriptivo
git commit -m "feat: implementar sistema de archivos, paginación y logging

- Agregar multer para subida real de archivos
- Implementar validación de archivos (tipo, tamaño)
- Agregar paginación en endpoints principales
- Integrar Winston para logging estructurado
- Mejorar seguridad (helmet, CORS restrictivo)
- Actualizar documentación

BREAKING CHANGES: Ninguno
TESTED: ✅ Tests unitarios y e2e pasando
"
```

### 7.3. Push y PR

```bash
# Push a GitHub
git push origin feature/mejoras-sistema-v2

# Crear Pull Request en GitHub
# - Describir cambios
# - Mencionar issues relacionados
# - Solicitar review
```

---

## 📝 PASO 8: Documentar

### 8.1. Actualizar README.md

Agregar sección de nuevas características:

```markdown
## ✨ Nuevas Características

### Sistema de Carga de Archivos
- ✅ Subida real de archivos PDF, JPG, PNG
- ✅ Validación de tipo y tamaño
- ✅ Almacenamiento organizado por fecha
- ✅ Nombres únicos con UUID

### Paginación
- ✅ Todos los listados soportan paginación
- ✅ Parámetros: `?page=1&limit=10`
- ✅ Metadata incluida en respuestas

### Logging
- ✅ Winston con rotación de archivos
- ✅ Logs por niveles (error, warn, info, debug)
- ✅ Logs de auditoría separados

### Seguridad
- ✅ Helmet para headers HTTP seguros
- ✅ CORS configurado por entorno
- ✅ Rate limiting mejorado
```

---

## 🐛 Troubleshooting

### Error: Cannot find module

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error: Port 3000 already in use

```bash
# En .env, cambiar el puerto
PORT=3001
```

### Error: Permission denied (archivos)

```bash
# Dar permisos a carpeta uploads
chmod -R 755 uploads
```

### Error: Database connection

```bash
# Verificar que MySQL esté corriendo
sudo service mysql status

# Verificar credenciales en .env
```

---

## 📚 Recursos Adicionales

- [Documentación NestJS](https://docs.nestjs.com/)
- [Multer Docs](https://github.com/expressjs/multer)
- [Winston Docs](https://github.com/winstonjs/winston)
- [TypeORM Docs](https://typeorm.io/)

---

## 🎉 ¡Listo!

Ahora tienes un sistema mucho más robusto con:
- ✅ Carga real de archivos
- ✅ Paginación eficiente
- ✅ Logging profesional
- ✅ Seguridad mejorada

**¡Excelente trabajo!** 🚀
