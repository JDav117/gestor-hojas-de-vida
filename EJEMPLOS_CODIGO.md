# 📝 EJEMPLOS DE CÓDIGO - Copy & Paste

## 🎯 Objetivo

Este archivo contiene código listo para copiar y pegar en tu proyecto.
Cada sección indica el archivo a modificar y el código exacto a agregar.

---

## 1. 📤 Sistema de Carga de Archivos

### 1.1. Modificar `src/documentos/documentos.controller.ts`

**Agregar imports:**
```typescript
import { 
  Controller, 
  Post, 
  UseInterceptors, 
  UploadedFile,
  UseGuards,
  Req,
  Get,
  Param,
  Res,
  StreamableFile
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { multerConfig } from '../common/config/multer.config';
import { FileValidationPipe } from '../common/pipes/file-validation.pipe';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { createReadStream } from 'fs';
import { join } from 'path';
```

**Agregar endpoints:**
```typescript
@ApiTags('documentos')
@UseGuards(JwtAuthGuard)
@Controller('documentos')
export class DocumentosController {
  constructor(
    private readonly documentosService: DocumentosService,
    // ... otros servicios
  ) {}

  /**
   * Endpoint para subir archivos
   */
  @Post('upload')
  @ApiOperation({ summary: 'Subir archivo (PDF, JPG, PNG)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        postulacion_id: {
          type: 'number',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadFile(
    @UploadedFile(new FileValidationPipe()) file: Express.Multer.File,
    @Body('postulacion_id') postulacionId: number,
    @Req() req: any,
  ) {
    // Validar que el usuario tenga permiso para esta postulación
    const user = req.user;
    const postulacion = await this.postulacionesService.findOne(postulacionId);
    
    if (!postulacion) {
      throw new NotFoundException('Postulación no encontrada');
    }
    
    const isOwner = postulacion.postulante_id === user.userId;
    const isAdmin = user.roles?.includes('admin');
    
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('No tienes permiso para subir archivos a esta postulación');
    }
    
    // Guardar registro en base de datos
    const documento = await this.documentosService.create({
      postulacion_id: postulacionId,
      nombre_documento: file.originalname,
      ruta_archivo: file.path,
    });
    
    return {
      message: 'Archivo subido exitosamente',
      documento: {
        id: documento.id,
        nombre: file.originalname,
        tamaño: file.size,
        tipo: file.mimetype,
        fecha: new Date(),
      },
    };
  }

  /**
   * Endpoint para descargar archivo
   */
  @Get(':id/download')
  @ApiOperation({ summary: 'Descargar archivo' })
  async downloadFile(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const documento = await this.documentosService.findOne(id);
    
    if (!documento) {
      throw new NotFoundException('Documento no encontrado');
    }
    
    // Validar permisos (similar al upload)
    const postulacion = await this.postulacionesService.findOne(documento.postulacion_id);
    const user = req.user;
    const isOwner = postulacion.postulante_id === user.userId;
    const isAdmin = user.roles?.includes('admin');
    const isEvaluador = user.roles?.includes('evaluador');
    
    if (!isOwner && !isAdmin && !isEvaluador) {
      throw new ForbiddenException('No tienes permiso para descargar este archivo');
    }
    
    // Servir archivo
    const file = createReadStream(join(process.cwd(), documento.ruta_archivo));
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${documento.nombre_documento}"`,
    });
    
    return new StreamableFile(file);
  }

  // ... rest of endpoints
}
```

---

## 2. 📄 Paginación

### 2.1. Modificar `src/postulaciones/postulaciones.controller.ts`

**Agregar imports:**
```typescript
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PaginationDto, createPaginatedResponse } from '../common/dto/pagination.dto';
```

**Modificar endpoint findAll:**
```typescript
@Get()
@ApiOperation({ summary: 'Listar postulaciones con paginación' })
@ApiQuery({ name: 'page', required: false, type: Number })
@ApiQuery({ name: 'limit', required: false, type: Number })
async findAll(
  @Query() paginationDto: PaginationDto,
  @Req() req: any,
  @Query('convocatoria') convocatoria?: string,
  @Query('estado') estado?: string,
  @Query('postulante') postulante?: string,
  @Query('programa') programa?: string,
) {
  const { page = 1, limit = 10 } = paginationDto;
  
  // Lógica de autorización existente...
  const user = req.user;
  const roles = user?.roles || [];
  const isAdmin = roles.some((r: any) => r.nombre_rol === 'admin' || r === 'admin');
  const isEvaluador = roles.some((r: any) => r.nombre_rol === 'evaluador' || r === 'evaluador');
  
  // Construir filtros
  const filters: any = {};
  if (convocatoria) filters.convocatoria_id = parseInt(convocatoria);
  if (estado) filters.estado = estado;
  if (programa) filters.programa_id = parseInt(programa);
  
  if (!isAdmin && !isEvaluador) {
    // Postulante solo ve sus propias postulaciones
    filters.postulante_id = user.userId;
  }
  
  // Llamar servicio con paginación
  const [data, total] = await this.postulacionesService.findAndCount(
    filters,
    page,
    limit
  );
  
  return createPaginatedResponse(data, total, page, limit);
}
```

### 2.2. Modificar `src/postulaciones/postulaciones.service.ts`

**Agregar método findAndCount:**
```typescript
async findAndCount(
  filters: any = {},
  page: number = 1,
  limit: number = 10
): Promise<[Postulacion[], number]> {
  const skip = (page - 1) * limit;
  
  return await this.postulacionRepository.findAndCount({
    where: filters,
    skip,
    take: limit,
    order: { fecha_postulacion: 'DESC' },
  });
}
```

---

## 3. 📊 Logging

### 3.1. Modificar `src/app.module.ts`

**Agregar imports:**
```typescript
import { Module, Logger } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './common/logger/winston.config';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
```

**Modificar @Module:**
```typescript
@Module({
  imports: [
    // ... otros imports existentes
    ConfigModule.forRoot({ isGlobal: true }),
    WinstonModule.forRoot(winstonConfig), // Agregar esto
    // ... resto de imports
  ],
  providers: [
    // ... providers existentes
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor, // Agregar logging global
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

### 3.2. Usar Logger en Servicios

**Ejemplo en `src/postulaciones/postulaciones.service.ts`:**

```typescript
import { Injectable, Logger, NotFoundException } from '@nestjs/common';

@Injectable()
export class PostulacionesService {
  private readonly logger = new Logger(PostulacionesService.name);
  
  constructor(
    @InjectRepository(Postulacion)
    private readonly postulacionRepository: Repository<Postulacion>,
  ) {}
  
  async create(createPostulacionDto: CreatePostulacionDto): Promise<Postulacion> {
    this.logger.log(`Creating postulación for user ${createPostulacionDto.postulante_id}`);
    
    try {
      const now = new Date();
      const postulacion = this.postulacionRepository.create({
        ...createPostulacionDto as any,
        estado: (createPostulacionDto as any).estado ?? 'borrador',
        fecha_postulacion: (createPostulacionDto as any).fecha_postulacion ?? now,
      } as Partial<Postulacion>);
      
      const result = await this.postulacionRepository.save(postulacion);
      
      this.logger.log(`Postulación created successfully with ID ${result.id}`);
      
      return result;
    } catch (error) {
      this.logger.error(
        `Error creating postulación: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }
  
  async findOne(id: number): Promise<Postulacion | null> {
    this.logger.debug(`Finding postulación with ID ${id}`);
    
    const postulacion = await this.postulacionRepository.findOneBy({ id });
    
    if (!postulacion) {
      this.logger.warn(`Postulación with ID ${id} not found`);
      return null;
    }
    
    return postulacion;
  }
  
  async remove(id: number): Promise<void> {
    this.logger.warn(`Attempting to delete postulación ID ${id}`);
    
    const result = await this.postulacionRepository.delete(id);
    
    if (result.affected === 0) {
      this.logger.error(`Failed to delete postulación ID ${id} - not found`);
      throw new NotFoundException('Postulación no encontrada');
    }
    
    this.logger.log(`Postulación ID ${id} deleted successfully`);
  }
  
  // ... otros métodos
}
```

### 3.3. Logging de Auditoría

**Crear función helper en servicios críticos:**

```typescript
import { logAudit } from '../common/logger/winston.config';

// Ejemplo en PostulacionesService
async update(id: number, updateDto: any, userId: number): Promise<Postulacion | null> {
  const postulacion = await this.findOne(id);
  
  if (!postulacion) {
    throw new NotFoundException('Postulación no encontrada');
  }
  
  // Log de auditoría ANTES del cambio
  logAudit('UPDATE_POSTULACION', userId, {
    postulacionId: id,
    changes: updateDto,
    previousState: postulacion,
  });
  
  await this.postulacionRepository.update(id, updateDto);
  
  const updated = await this.findOne(id);
  
  this.logger.log(`Postulación ID ${id} updated by user ${userId}`);
  
  return updated;
}
```

---

## 4. 🔒 Seguridad

### 4.1. Modificar `src/main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // ============================================
  // SEGURIDAD
  // ============================================
  
  // Helmet - Headers HTTP seguros
  app.use(helmet());
  logger.log('✅ Helmet enabled');

  // CORS - Restrictivo por entorno
  const corsOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'];
  app.enableCors({
    origin: corsOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  logger.log(`✅ CORS enabled for: ${corsOrigins.join(', ')}`);

  // ============================================
  // VALIDACIÓN
  // ============================================
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remover propiedades no definidas en DTO
      forbidNonWhitelisted: true, // Lanzar error si hay propiedades extra
      transform: true, // Transformar tipos automáticamente
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  logger.log('✅ Global validation pipe enabled');

  // ============================================
  // SWAGGER
  // ============================================
  
  const config = new DocumentBuilder()
    .setTitle('GHV API')
    .setDescription('API para gestión de hojas de vida - Universidad del Putumayo')
    .setVersion('2.0')
    .addBearerAuth()
    .addTag('auth', 'Autenticación y autorización')
    .addTag('users', 'Gestión de usuarios')
    .addTag('roles', 'Gestión de roles')
    .addTag('convocatorias', 'Gestión de convocatorias')
    .addTag('postulaciones', 'Gestión de postulaciones')
    .addTag('documentos', 'Gestión de documentos')
    .addTag('evaluaciones', 'Gestión de evaluaciones')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  logger.log('✅ Swagger documentation available at /api');

  // ============================================
  // START SERVER
  // ============================================
  
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  logger.log(`🚀 Application running on: http://localhost:${port}`);
  logger.log(`📚 Swagger docs: http://localhost:${port}/api`);
  logger.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap();
```

### 4.2. Modificar `src/app.module.ts` - TypeORM

```typescript
TypeOrmModule.forRoot({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  autoLoadEntities: true,
  
  // CRÍTICO: Controlar sincronización con variable de entorno
  synchronize: process.env.DB_SYNC === 'true', // Solo true en desarrollo
  
  // Logging de queries en desarrollo
  logging: process.env.NODE_ENV === 'development',
  
  // Configuración de pool de conexiones
  extra: {
    connectionLimit: 10,
  },
}),
```

---

## 5. 🧪 Tests

### 5.1. Test de Upload de Archivos

**Crear `test/file-upload.e2e-spec.ts`:**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { join } from 'path';

describe('File Upload (e2e)', () => {
  let app: INestApplication;
  let server: any;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer();

    // Login para obtener token
    await request(server).post('/roles/init');
    await request(server)
      .post('/users')
      .send({
        nombre: 'Test',
        apellido: 'Upload',
        email: 'testupload@mail.com',
        password: '123456',
        identificacion: '999999',
        roles: [1],
      });
    
    const res = await request(server)
      .post('/auth/login')
      .send({ email: 'testupload@mail.com', password: '123456' });
    
    token = res.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should upload a PDF file', async () => {
    const testFile = join(__dirname, 'fixtures', 'test.pdf');
    
    const res = await request(server)
      .post('/documentos/upload')
      .set('Authorization', `Bearer ${token}`)
      .field('postulacion_id', '1')
      .attach('file', testFile)
      .expect(201);
    
    expect(res.body).toHaveProperty('documento');
    expect(res.body.documento).toHaveProperty('id');
    expect(res.body.documento.tipo).toBe('application/pdf');
  });

  it('should reject non-PDF file', async () => {
    const testFile = join(__dirname, 'fixtures', 'test.txt');
    
    await request(server)
      .post('/documentos/upload')
      .set('Authorization', `Bearer ${token}`)
      .field('postulacion_id', '1')
      .attach('file', testFile)
      .expect(400);
  });

  it('should reject file too large', async () => {
    // Simular archivo grande (mock)
    const largeFile = Buffer.alloc(10 * 1024 * 1024); // 10MB
    
    await request(server)
      .post('/documentos/upload')
      .set('Authorization', `Bearer ${token}`)
      .field('postulacion_id', '1')
      .attach('file', largeFile, { filename: 'large.pdf' })
      .expect(413); // Payload Too Large
  });
});
```

### 5.2. Test de Paginación

**Crear `test/pagination.e2e-spec.ts`:**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Pagination (e2e)', () => {
  let app: INestApplication;
  let server: any;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer();

    // Setup: crear usuario admin y obtener token
    await request(server).post('/roles/init');
    await request(server)
      .post('/users')
      .send({
        nombre: 'Admin',
        apellido: 'Test',
        email: 'admin@test.com',
        password: '123456',
        identificacion: '111111',
        roles: [1],
      });
    
    const res = await request(server)
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: '123456' });
    
    token = res.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return paginated results with default values', async () => {
    const res = await request(server)
      .get('/postulaciones')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
    expect(res.body.meta).toHaveProperty('page', 1);
    expect(res.body.meta).toHaveProperty('limit', 10);
    expect(res.body.meta).toHaveProperty('total');
    expect(res.body.meta).toHaveProperty('totalPages');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should respect page and limit query parameters', async () => {
    const res = await request(server)
      .get('/postulaciones?page=2&limit=5')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    expect(res.body.meta.page).toBe(2);
    expect(res.body.meta.limit).toBe(5);
    expect(res.body.data.length).toBeLessThanOrEqual(5);
  });

  it('should handle invalid page number', async () => {
    await request(server)
      .get('/postulaciones?page=0')
      .set('Authorization', `Bearer ${token}`)
      .expect(400); // Bad Request
  });

  it('should handle limit exceeding maximum', async () => {
    await request(server)
      .get('/postulaciones?limit=200')
      .set('Authorization', `Bearer ${token}`)
      .expect(400); // Bad Request (max 100)
  });
});
```

---

## 6. 📝 Swagger Decorators

### Ejemplo Completo de Controller con Swagger

```typescript
import { Controller, Get, Post, Body, Param, Patch, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('postulaciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('postulaciones')
export class PostulacionesController {
  constructor(private readonly postulacionesService: PostulacionesService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Listar postulaciones',
    description: 'Obtiene todas las postulaciones con paginación y filtros opcionales'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Registros por página (default: 10)' })
  @ApiQuery({ name: 'convocatoria', required: false, type: Number, description: 'Filtrar por ID de convocatoria' })
  @ApiQuery({ name: 'estado', required: false, type: String, description: 'Filtrar por estado' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de postulaciones con metadata de paginación',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { type: 'object' }
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' },
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query('convocatoria') convocatoria?: string,
    @Query('estado') estado?: string,
  ) {
    // ... implementación
  }

  @Post()
  @Roles('admin', 'postulante')
  @ApiOperation({ summary: 'Crear nueva postulación' })
  @ApiResponse({ status: 201, description: 'Postulación creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  async create(@Body() createDto: CreatePostulacionDto) {
    // ... implementación
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener postulación por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la postulación' })
  @ApiResponse({ status: 200, description: 'Postulación encontrada' })
  @ApiResponse({ status: 404, description: 'Postulación no encontrada' })
  async findOne(@Param('id') id: number) {
    // ... implementación
  }
}
```

---

## 🎉 ¡Listo!

Con estos ejemplos tienes código copy-paste listo para implementar:

1. ✅ **Sistema de archivos** completo
2. ✅ **Paginación** en endpoints
3. ✅ **Logging** estructurado
4. ✅ **Seguridad** mejorada
5. ✅ **Tests** e2e
6. ✅ **Swagger** documentado

**Próximo paso:** Copia el código que necesites y sigue la guía `GUIA_IMPLEMENTACION.md`

---

**¿Dudas?** Revisa `MEJORAS.md` y `docs/ARQUITECTURA.md`
