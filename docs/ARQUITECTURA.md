# 🏗️ Arquitectura del Sistema de Gestión de Hojas de Vida

## 📋 Índice

1. [Visión General](#visión-general)
2. [Arquitectura de Alto Nivel](#arquitectura-de-alto-nivel)
3. [Capas de la Aplicación](#capas-de-la-aplicación)
4. [Diagrama de Componentes](#diagrama-de-componentes)
5. [Flujos de Datos](#flujos-de-datos)
6. [Seguridad](#seguridad)
7. [Base de Datos](#base-de-datos)
8. [Decisiones Arquitectónicas](#decisiones-arquitectónicas)

---

## 🎯 Visión General

El Sistema de Gestión de Hojas de Vida (GHV) es una aplicación web fullstack diseñada para gestionar convocatorias, postulaciones y evaluaciones en entornos académicos.

### Tecnologías Principales

**Backend:**
- NestJS 10.x (Node.js)
- TypeScript 5.x
- TypeORM (ORM)
- MySQL 8.x
- JWT para autenticación

**Frontend:**
- React 18.x
- TypeScript
- Vite (bundler)
- React Router

**Infraestructura:**
- Winston (logging)
- Multer (archivos)
- Nodemailer (emails)
- Helmet (seguridad)

---

## 🏛️ Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  Pages   │  │Components│  │ Context  │  │   API    │      │
│  │          │  │          │  │          │  │  Client  │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│                                                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/REST (JSON)
                         │ JWT Authentication
┌────────────────────────┴────────────────────────────────────────┐
│                       BACKEND (NestJS)                          │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Controllers                            │  │
│  │  Auth │ Users │ Roles │ Convocatorias │ Postulaciones   │  │
│  └──────────────────────┬───────────────────────────────────┘  │
│                         │                                        │
│  ┌──────────────────────┴───────────────────────────────────┐  │
│  │                     Services                              │  │
│  │  Business Logic │ Validation │ Data Processing           │  │
│  └──────────────────────┬───────────────────────────────────┘  │
│                         │                                        │
│  ┌──────────────────────┴───────────────────────────────────┐  │
│  │                  Repositories (TypeORM)                   │  │
│  │  Data Access │ Queries │ Transactions                    │  │
│  └──────────────────────┬───────────────────────────────────┘  │
│                         │                                        │
└─────────────────────────┼────────────────────────────────────────┘
                         │
             ┌───────────┴───────────┐
             │                       │
┌────────────▼──────────┐ ┌─────────▼──────────┐
│   MySQL Database      │ │  File System       │
│                       │ │  (uploads/)        │
│  - Users              │ │  - PDF             │
│  - Roles              │ │  - Images          │
│  - Convocatorias      │ │                    │
│  - Postulaciones      │ └────────────────────┘
│  - Evaluaciones       │
│  - Documentos         │
└───────────────────────┘
```

---

## 📦 Capas de la Aplicación

### 1. Capa de Presentación (Frontend)

**Responsabilidad:** Interfaz de usuario y experiencia

**Componentes:**
- `pages/` - Páginas principales (HomePage, ProfilePage, AdminPage)
- `components/` - Componentes reutilizables (Header, Footer, Loader)
- `context/` - Estado global (AuthContext, ToastContext)
- `api/` - Cliente HTTP (axios configurado)

**Flujo:**
```
User → Pages → Components → Context → API Client → Backend
```

### 2. Capa de Controladores (Backend)

**Responsabilidad:** Manejo de requests HTTP y validación de entrada

**Archivos:** `*.controller.ts`

**Responsabilidades:**
- Recibir y validar requests HTTP
- Aplicar guards (autenticación, autorización)
- Delegar lógica de negocio a servicios
- Formatear respuestas

**Ejemplo:**
```typescript
@Controller('postulaciones')
@UseGuards(JwtAuthGuard)
export class PostulacionesController {
  constructor(private readonly service: PostulacionesService) {}
  
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.service.findAll(paginationDto);
  }
}
```

### 3. Capa de Servicios

**Responsabilidad:** Lógica de negocio

**Archivos:** `*.service.ts`

**Responsabilidades:**
- Implementar reglas de negocio
- Coordinar entre múltiples repositorios
- Manejo de transacciones
- Logging y auditoría

**Ejemplo:**
```typescript
@Injectable()
export class PostulacionesService {
  constructor(
    @InjectRepository(Postulacion)
    private readonly repo: Repository<Postulacion>
  ) {}
  
  async create(dto: CreateDto, userId: number) {
    // Validar reglas de negocio
    // Crear registro
    // Enviar notificación
    // Log de auditoría
  }
}
```

### 4. Capa de Datos

**Responsabilidad:** Acceso y persistencia de datos

**Herramienta:** TypeORM

**Componentes:**
- Entities (modelos de datos)
- Repositories (acceso a datos)
- Migrations (cambios de esquema)

---

## 🔄 Diagrama de Componentes

### Módulos Principales

```
app.module.ts
├── ConfigModule (variables de entorno)
├── TypeOrmModule (base de datos)
├── ThrottlerModule (rate limiting)
├── WinstonModule (logging)
│
├── AuthModule
│   ├── AuthService (login, JWT)
│   ├── AuthController
│   ├── JwtStrategy
│   └── JwtAuthGuard
│
├── UsersModule
│   ├── UsersService
│   ├── UsersController
│   └── User Entity
│
├── RolesModule
│   ├── RolesService
│   ├── RolesController
│   ├── RolesGuard
│   └── Role Entity
│
├── ConvocatoriasModule
│   ├── ConvocatoriasService
│   ├── ConvocatoriasController
│   └── Convocatoria Entity
│
├── PostulacionesModule
│   ├── PostulacionesService
│   ├── PostulacionesController
│   └── Postulacion Entity
│
├── DocumentosModule
│   ├── DocumentosService
│   ├── DocumentosController
│   ├── FileUploadInterceptor
│   └── Documento Entity
│
├── EvaluacionesModule
│   ├── EvaluacionesService
│   ├── EvaluacionesController
│   └── Evaluacion Entity
│
└── CommonModule
    ├── Pipes (validación)
    ├── Guards (autorización)
    ├── Interceptors (logging)
    └── Filters (manejo de errores)
```

---

## 🔀 Flujos de Datos

### Flujo 1: Autenticación

```
┌─────────┐    1. POST /auth/login       ┌──────────────┐
│ Cliente │ ─────────────────────────────▶│ AuthController│
└─────────┘    {email, password}          └──────────────┘
     ▲                                           │
     │                                           │ 2. Validar
     │                                           ▼
     │                                    ┌──────────────┐
     │                                    │ AuthService  │
     │                                    └──────────────┘
     │                                           │
     │                                           │ 3. Buscar usuario
     │                                           ▼
     │                                    ┌──────────────┐
     │                                    │ UsersService │
     │                                    └──────────────┘
     │                                           │
     │                                           │ 4. Query DB
     │                                           ▼
     │                                    ┌──────────────┐
     │                                    │   MySQL DB   │
     │                                    └──────────────┘
     │                                           │
     │  5. Return JWT                            │
     └───────────────────────────────────────────┘
        {access_token: "...", user: {...}}
```

### Flujo 2: Crear Postulación

```
┌─────────┐  1. POST /postulaciones     ┌────────────────────┐
│ Cliente │ ────────────────────────────▶│PostulacionesController│
└─────────┘  {conv_id, programa_id}     └────────────────────┘
     ▲       Authorization: Bearer JWT          │
     │                                           │ 2. JwtAuthGuard
     │                                           ▼
     │                                    ┌─────────────┐
     │                                    │  JWT Verify │
     │                                    └─────────────┘
     │                                           │
     │                                           │ 3. Validar DTO
     │                                           ▼
     │                                    ┌────────────────────┐
     │                                    │PostulacionesService│
     │                                    └────────────────────┘
     │                                           │
     │                                           ├─4. Validar reglas
     │                                           │   (convocatoria vigente)
     │                                           │
     │                                           ├─5. Crear registro
     │                                           ▼
     │                                    ┌─────────────┐
     │                                    │   MySQL DB  │
     │                                    └─────────────┘
     │                                           │
     │                                           ├─6. Enviar email
     │                                           ▼
     │                                    ┌─────────────┐
     │                                    │ MailService │
     │                                    └─────────────┘
     │                                           │
     │  7. Return postulación                    │
     └───────────────────────────────────────────┘
```

### Flujo 3: Subir Archivo

```
┌─────────┐  1. POST /documentos/upload  ┌──────────────────┐
│ Cliente │ ────────────────────────────▶│DocumentosController│
└─────────┘  multipart/form-data         └──────────────────┘
     ▲       file: [archivo.pdf]                │
     │                                           │ 2. FileInterceptor
     │                                           ▼
     │                                    ┌─────────────┐
     │                                    │   Multer    │
     │                                    └─────────────┘
     │                                           │
     │                                           ├─3. Validar tipo
     │                                           ├─4. Validar tamaño
     │                                           ├─5. Generar UUID
     │                                           │
     │                                           │ 6. Guardar archivo
     │                                           ▼
     │                                    ┌─────────────┐
     │                                    │File System  │
     │                                    │(uploads/)   │
     │                                    └─────────────┘
     │                                           │
     │                                           │ 7. Guardar metadata
     │                                           ▼
     │                                    ┌─────────────┐
     │                                    │DocumentosService│
     │                                    └─────────────┘
     │                                           │
     │                                           │ 8. Insert DB
     │                                           ▼
     │                                    ┌─────────────┐
     │                                    │   MySQL DB  │
     │                                    └─────────────┘
     │                                           │
     │  9. Return metadata                       │
     └───────────────────────────────────────────┘
        {filename, path, size, mimetype}
```

---

## 🔒 Seguridad

### Capas de Seguridad

1. **Headers HTTP** (Helmet)
   - XSS Protection
   - Content Security Policy
   - HSTS
   - Frame Options

2. **CORS**
   - Orígenes permitidos configurables
   - Credenciales controladas
   - Métodos permitidos

3. **Autenticación** (JWT)
   - Tokens con expiración
   - Secret seguro
   - Refresh tokens (opcional)

4. **Autorización** (Guards)
   - JwtAuthGuard (usuario autenticado)
   - RolesGuard (roles específicos)
   - Validación a nivel de recurso

5. **Validación de Datos**
   - DTOs con class-validator
   - Pipes de transformación
   - Sanitización de entrada

6. **Rate Limiting**
   - Throttler module
   - Límites por IP/usuario
   - Protección contra DDoS

7. **Archivos**
   - Validación de tipo MIME
   - Límite de tamaño
   - Nombres únicos (UUID)
   - Almacenamiento seguro

### Flujo de Autenticación

```
1. Usuario envía credenciales → AuthController
2. AuthService valida con UsersService
3. Si válido, genera JWT con payload: {userId, email, roles}
4. Cliente guarda token en localStorage
5. Cada request incluye: Authorization: Bearer <token>
6. JwtAuthGuard verifica y decodifica token
7. Request.user = {userId, email, roles}
```

---

## 🗄️ Base de Datos

### Modelo de Datos

```
┌─────────────┐     1:N     ┌────────────────┐
│    roles    │─────────────│  user_roles    │
└─────────────┘             └────────────────┘
                                   │ N:1
┌──────────────┐                   │
│    users     │◄──────────────────┘
└──────────────┘
      │ 1:N
      │
      ├─────────────┐
      │             │
      ▼ 1:N         ▼ 1:N
┌────────────┐  ┌──────────────┐
│postulaciones│  │ evaluaciones │
└────────────┘  └──────────────┘
      │ 1:N           │ 1:N
      │               │
      ▼               ▼
┌────────────┐  ┌─────────────────┐
│documentos  │  │detalles_eval    │
└────────────┘  └─────────────────┘

┌────────────────┐
│ convocatorias  │
└────────────────┘
      │ 1:N
      ├───────────────┐
      ▼               ▼
┌────────────┐  ┌──────────────────┐
│postulaciones│  │baremo_convocatoria│
└────────────┘  └──────────────────┘

┌──────────────────┐
│programas_academicos│
└──────────────────┘
      │ 1:N
      ▼
┌────────────┐
│postulaciones│
└────────────┘
```

### Tablas Principales

**users**
- id, nombre, apellido, email, password_hash
- identificacion, fecha_creacion

**roles**
- id, nombre_rol, descripcion

**convocatorias**
- id, nombre, descripcion
- fecha_apertura, fecha_cierre, estado

**postulaciones**
- id, postulante_id, convocatoria_id, programa_id
- fecha_postulacion, estado, disponibilidad_horaria

**documentos**
- id, postulacion_id, nombre_documento, ruta_archivo

**evaluaciones**
- id, postulacion_id, evaluador_id
- fecha, puntaje_total

---

## 💡 Decisiones Arquitectónicas

### 1. NestJS como Framework

**Razón:** 
- Arquitectura escalable y modular
- TypeScript nativo
- Excelente para aplicaciones empresariales
- Ecosistema rico

### 2. TypeORM como ORM

**Razón:**
- Integración perfecta con NestJS
- Soporte para múltiples bases de datos
- Migrations automáticas
- Active Record y Data Mapper

### 3. JWT para Autenticación

**Razón:**
- Stateless (sin sesiones en servidor)
- Escalable horizontalmente
- Compatible con SPA
- Estándar de la industria

### 4. Multer para Archivos

**Razón:**
- Estándar de facto en Node.js
- Flexible y configurable
- Soporte para múltiples estrategias de almacenamiento

### 5. Winston para Logging

**Razón:**
- Logging estructurado
- Múltiples transports
- Rotación automática de archivos
- Niveles de log configurables

### 6. Separación Frontend/Backend

**Razón:**
- Desacoplamiento
- Escalabilidad independiente
- Equipos especializados
- Deploy independiente

---

## 📊 Métricas y Monitoreo

### Métricas Clave

- **Tiempo de respuesta**: < 200ms (p95)
- **Throughput**: > 100 req/s
- **Error rate**: < 1%
- **Uptime**: > 99.9%

### Logging

- **Niveles**: error, warn, info, debug
- **Ubicación**: `logs/` con rotación diaria
- **Formato**: JSON estructurado
- **Retención**: 30 días (aplicación), 90 días (auditoría)

### Auditoría

Se registran eventos importantes:
- Login/Logout
- Creación de postulaciones
- Cambios de estado
- Subida de archivos
- Evaluaciones

---

## 🚀 Escalabilidad

### Horizontal

- Backend stateless (JWT)
- Load balancer (nginx)
- Múltiples instancias de NestJS

### Vertical

- Optimización de queries
- Índices en base de datos
- Paginación eficiente
- Cache (Redis opcional)

---

## 📚 Referencias

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [REST API Design Guide](https://restfulapi.net/)

---

**Última actualización:** 2024
**Versión:** 2.0
