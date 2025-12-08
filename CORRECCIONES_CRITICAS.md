# 🚨 CORRECCIONES CRÍTICAS REQUERIDAS

**Fecha:** 7 de diciembre de 2025  
**Prioridad:** 🔴 URGENTE  
**Tiempo estimado total:** ~30 minutos

---

## ⚡ ACCIONES INMEDIATAS (Antes de producción)

### 1. Crear archivo .env.example ✅ CRÍTICO
**Tiempo:** 5 minutos  
**Problema:** Nuevos desarrolladores no saben qué variables configurar

```bash
# Crear en raíz del proyecto: .env.example
JWT_SECRET=cambiar-en-produccion-usar-string-largo-y-aleatorio
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=ghv_uip
DB_SYNC=false
PORT=3000
NODE_ENV=development

# Frontend: Crear frontend/.env.example
VITE_API_URL=http://localhost:3000
```

**Comando:**
```bash
# Backend
cat > .env.example << 'EOF'
JWT_SECRET=cambiar-en-produccion-usar-string-largo-y-aleatorio
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=ghv_uip
DB_SYNC=false
PORT=3000
NODE_ENV=development
EOF

# Frontend
cat > frontend/.env.example << 'EOF'
VITE_API_URL=http://localhost:3000
EOF
```

---

### 2. Corregir CORS permisivo ✅ CRÍTICO
**Tiempo:** 2 minutos  
**Archivo:** `src/main.ts:24-27`  
**Problema:** Acepta peticiones de cualquier origen (vulnerabilidad de seguridad)

**ANTES (ACTUAL):**
```typescript
app.enableCors({
  origin: '*', // ❌ PELIGROSO
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
});
```

**DESPUÉS (CORREGIDO):**
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
});
```

**Agregar a .env:**
```env
FRONTEND_URL=http://localhost:5173
```

---

### 3. Activar ThrottlerGuard globalmente ✅ CRÍTICO
**Tiempo:** 2 minutos  
**Archivo:** `src/app.module.ts:48-52`  
**Problema:** Rate limiting configurado pero no activo

**ANTES (ACTUAL):**
```typescript
providers: [AppService],
```

**DESPUÉS (CORREGIDO):**
```typescript
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

providers: [
  AppService,
  {
    provide: APP_GUARD,
    useClass: ThrottlerGuard,
  },
],
```

---

### 4. Agregar ENUM a postulacion.entity.ts ✅ IMPORTANTE
**Tiempo:** 5 minutos  
**Archivo:** `src/postulaciones/postulacion.entity.ts:49`  
**Problema:** Campo estado sin validación de ENUM

**ANTES (ACTUAL):**
```typescript
@Column({ default: 'borrador' })
estado: string;
```

**DESPUÉS (CORREGIDO):**
```typescript
@Column({
  type: 'enum',
  enum: ['borrador', 'presentada', 'enviada', 'en_evaluacion', 'evaluada', 'aceptada', 'rechazada'],
  default: 'borrador'
})
estado: string;
```

**⚠️ NOTA:** Esto requiere migración de BD si la tabla ya existe:
```sql
ALTER TABLE `postulaciones` 
MODIFY COLUMN `estado` ENUM(
  'borrador', 
  'presentada', 
  'enviada', 
  'en_evaluacion', 
  'evaluada', 
  'aceptada', 
  'rechazada'
) DEFAULT 'borrador';
```

---

### 5. Eliminar console.log de producción ✅ IMPORTANTE
**Tiempo:** 10 minutos  
**Archivos afectados:**
- `src/common/roles.guard.ts:31-35` (3 console.log)
- `src/main.ts:39` (1 console.log - MANTENER este)

**ANTES (ACTUAL) en roles.guard.ts:**
```typescript
console.log('🔍 RolesGuard - Required roles:', requiredRoles);
console.log('👤 RolesGuard - User from request:', user);
console.error('❌ RolesGuard - Usuario no encontrado en request');
```

**DESPUÉS (CORREGIDO):**
```typescript
import { Logger } from '@nestjs/common';

@Injectable()
export class JwtRolesGuard extends AuthGuard('jwt') implements CanActivate {
  private readonly logger = new Logger(JwtRolesGuard.name);
  
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // ... código existente ...
    
    this.logger.debug(`Required roles: ${requiredRoles?.join(', ')}`);
    this.logger.debug(`User from request: ${user?.email}`);
    
    if (!user) {
      this.logger.error('Usuario no encontrado en request');
      throw new UnauthorizedException('Usuario no autenticado');
    }
    
    // ... resto del código ...
  }
}
```

**⚠️ NOTA:** El console.log en `main.ts:39` es aceptable porque muestra info de startup:
```typescript
console.log(`Aplicación corriendo en: http://localhost:${port}`);
// ✅ MANTENER este - útil para debugging local
```

---

### 6. Configurar Helmet para headers HTTP ✅ RECOMENDADO
**Tiempo:** 5 minutos  
**Archivo:** `src/main.ts`  
**Problema:** Headers HTTP inseguros

**Instalar:**
```bash
npm install --save helmet
```

**Agregar en main.ts:**
```typescript
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Agregar ANTES de enableCors
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));
  
  // ... resto del código
}
```

---

## 📋 CHECKLIST DE VERIFICACIÓN

Antes de hacer commit, verificar:

- [ ] Archivo `.env.example` creado en raíz
- [ ] Archivo `frontend/.env.example` creado
- [ ] CORS cambiado a específico en `src/main.ts`
- [ ] Variable `FRONTEND_URL` agregada a `.env`
- [ ] ThrottlerGuard activado en `app.module.ts`
- [ ] ENUM agregado a `postulacion.entity.ts`
- [ ] Migración SQL ejecutada (si BD ya existe)
- [ ] console.log reemplazados por Logger en `roles.guard.ts`
- [ ] Helmet instalado y configurado
- [ ] `.gitignore` incluye `.env` (ya debería estar)
- [ ] Compilación exitosa: `npm run build`
- [ ] Tests pasan: `npm run test`

---

## 🚀 COMANDOS PARA APLICAR CAMBIOS

```bash
# 1. Crear archivos de ejemplo
echo "JWT_SECRET=cambiar-en-produccion
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=ghv_uip
DB_SYNC=false
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173" > .env.example

echo "VITE_API_URL=http://localhost:3000" > frontend/.env.example

# 2. Instalar Helmet
npm install --save helmet

# 3. Compilar para verificar errores
npm run build

# 4. Si hay BD existente, ejecutar migración
# mysql -u root -p ghv_uip < migrations/fix-postulacion-enum.sql
```

---

## 💾 CREAR MIGRACIÓN SQL

Crear archivo: `migrations/fix-postulacion-enum.sql`

```sql
-- Migración: Agregar ENUM a estado de postulaciones
-- Fecha: 7 de diciembre de 2025
-- Descripción: Cambiar columna estado de VARCHAR a ENUM

-- Verificar valores actuales (para asegurar compatibilidad)
SELECT DISTINCT estado FROM postulaciones;

-- Modificar columna a ENUM
ALTER TABLE `postulaciones` 
MODIFY COLUMN `estado` ENUM(
  'borrador',
  'presentada', 
  'enviada', 
  'en_evaluacion', 
  'evaluada', 
  'aceptada', 
  'rechazada'
) NOT NULL DEFAULT 'borrador';

-- Verificar cambio
DESCRIBE postulaciones;

-- Output esperado:
-- estado | enum('borrador','presentada','enviada','en_evaluacion','evaluada','aceptada','rechazada') | NO | | borrador |
```

---

## ⚠️ ADVERTENCIAS IMPORTANTES

### Si la BD ya tiene datos:

1. **Backup primero:**
   ```bash
   mysqldump -u root -p ghv_uip > backup_$(date +%Y%m%d).sql
   ```

2. **Verificar valores actuales:**
   ```sql
   SELECT DISTINCT estado FROM postulaciones;
   ```

3. **Si hay valores no válidos:**
   ```sql
   -- Corregir valores antes de aplicar ENUM
   UPDATE postulaciones SET estado = 'borrador' WHERE estado NOT IN (
     'borrador', 'presentada', 'enviada', 'en_evaluacion', 
     'evaluada', 'aceptada', 'rechazada'
   );
   ```

### Después de los cambios:

1. **Probar localmente:**
   ```bash
   npm run start:dev
   cd frontend && npm run dev
   ```

2. **Verificar en consola:**
   - ✅ No debe haber console.log de roles.guard
   - ✅ Debe verse mensaje de throttler activo
   - ✅ CORS debe rechazar orígenes no autorizados

3. **Probar flujos críticos:**
   - Login/Registro
   - Crear postulación
   - Upload de documentos
   - Evaluación

---

## 🎯 IMPACTO ESTIMADO

| Corrección | Impacto en Seguridad | Impacto en Estabilidad | Impacto en UX |
|------------|---------------------|------------------------|---------------|
| .env.example | 🟢 Bajo | 🟢 Mejora setup | 🟢 Mejora DX |
| CORS específico | 🔴 Alto ✅ | 🟢 Ninguno | 🟢 Ninguno |
| ThrottlerGuard | 🟡 Medio ✅ | 🟢 Mejora | 🟢 Ninguno |
| ENUM estado | 🟢 Bajo | 🟡 Mejora validación | 🟢 Ninguno |
| Logger en vez de console | 🟢 Bajo | 🟢 Mejora debugging | 🟢 Ninguno |
| Helmet | 🟡 Medio ✅ | 🟢 Ninguno | 🟢 Ninguno |

**Leyenda:**
- 🔴 Alto - Crítico para producción
- 🟡 Medio - Importante pero no bloqueante
- 🟢 Bajo/Mejora - Buena práctica

---

## 📞 SOPORTE

Si tienes dudas al aplicar estas correcciones:
1. Revisa el archivo `PENDIENTES_Y_MEJORAS.md` sección "HALLAZGOS CRÍTICOS"
2. Consulta la documentación de NestJS: https://docs.nestjs.com
3. Contacto: jdav117@gmail.com

---

**Última actualización:** 7 de diciembre de 2025  
**Estado:** 🔴 PENDIENTE DE APLICAR
