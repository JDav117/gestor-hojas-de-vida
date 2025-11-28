# 📊 ANÁLISIS COMPLETO DEL PROYECTO

**Fecha:** 27 de noviembre de 2025  
**Proyecto:** Sistema de Gestión de Hojas de Vida - Uniputumayo  
**Repositorio:** gestor-hojas-de-vida

---

## 🎯 PROPÓSITO DEL PROYECTO

### Objetivo Principal
Sistema web para gestionar **convocatorias docentes** en la Universidad del Putumayo, automatizando:
- Publicación de convocatorias
- Postulación de candidatos
- Evaluación de hojas de vida
- Selección de personal académico

### Usuarios del Sistema
1. **Administradores** - Gestionan convocatorias, usuarios y todo el sistema
2. **Evaluadores** - Califican postulaciones asignadas
3. **Postulantes** - Se postulan a convocatorias y suben documentos

---

## ✅ ESTADO ACTUAL DEL PROYECTO

### Backend (NestJS) - 85% Completo

#### Módulos Implementados ✅
| Módulo | Estado | Funcionalidad |
|--------|--------|---------------|
| **Auth** | ✅ Completo | Login, JWT, Guards |
| **Users** | ✅ Completo | CRUD, perfil, roles |
| **Roles** | ✅ Completo | CRUD, asignación |
| **Convocatorias** | ⚠️ **70%** | CRUD básico (faltan campos) |
| **Programas Académicos** | ✅ Completo | CRUD completo |
| **Postulaciones** | ⚠️ **60%** | Crear/listar (falta evaluación) |
| **Documentos** | ✅ Completo | Upload con Multer |
| **Evaluaciones** | ⚠️ **40%** | Entity creada (falta lógica) |
| **Items Evaluación** | ⚠️ **40%** | CRUD básico (falta integración) |
| **Baremo** | ⚠️ **40%** | CRUD básico (falta integración) |
| **Asignaciones** | ⚠️ **50%** | CRUD básico (falta workflow) |

#### Infraestructura ✅
- ✅ TypeORM configurado
- ✅ MySQL 8.x
- ✅ Winston Logger
- ✅ Multer para archivos
- ✅ Helmet (seguridad)
- ✅ CORS configurado
- ✅ Rate limiting
- ✅ Validación con DTOs
- ✅ Guards de autenticación/autorización

---

### Frontend (React) - 75% Completo

#### Páginas Implementadas
| Página | Estado | Funcionalidad |
|--------|--------|---------------|
| **HomePage** | ✅ Completo | Landing page |
| **LoginPage** | ✅ Completo | Autenticación |
| **RegisterPage** | ✅ Completo | Registro con validaciones |
| **ProfilePage** | ✅ Completo | Ver/editar perfil |
| **AdminPage** | ⚠️ **80%** | CRUD (faltan campos en convocatorias) |
| **ConvocatoriasPage** | ⚠️ **60%** | Listado (falta info completa) |
| **PostulacionEditor** | ⚠️ **50%** | Básico (falta disponibilidad_horaria, upload docs) |
| **MisPostulaciones** | ⚠️ **50%** | Listado (faltan puntajes, estados) |
| **MisEvaluaciones** | ⚠️ **30%** | Solo listado (falta formulario de evaluación) |

#### Componentes ✅
- ✅ Header con navegación por rol
- ✅ Footer
- ✅ Loader
- ✅ LoginForm con validaciones
- ✅ RegisterForm con validaciones
- ✅ Toast notifications
- ✅ AuthContext (gestión de sesión)

---

## 🔴 FALENCIAS CRÍTICAS IDENTIFICADAS

### 1. **CONVOCATORIAS INCOMPLETAS** 🔥🔥🔥
**Impacto:** ALTO - Bloquea el flujo completo

**Campos Faltantes en Frontend:**
- `programa_academico_id` - No se puede asociar programa
- `cupos` - No se muestran cupos disponibles
- `sede` - Info faltante para postulantes
- `dedicacion` - Tiempo completo/medio tiempo
- `tipo_vinculacion` - Laboral/honorarios
- `requisitos_documentales` - Lista de docs requeridos
- `min_puntaje_aprobacion_documental` - Umbral de aprobación
- `min_puntaje_aprobacion_tecnica` - Umbral de aprobación

**Solución:**
- ✅ Backend ya tiene todos los campos en la entity
- ✅ CreateConvocatoriaDto actualizado
- ❌ AdminPage necesita formulario expandido
- ❌ ConvocatoriasPage debe mostrar info completa

---

### 2. **SISTEMA DE EVALUACIÓN INCOMPLETO** 🔥🔥
**Impacto:** ALTO - El evaluador no puede calificar

**Problemas:**
- MisEvaluaciones solo muestra tabla, no permite evaluar
- No hay formulario para ingresar puntajes
- No se usan los campos de postulación:
  - `puntaje_documental`
  - `puntaje_tecnico`
  - `puntaje_total`
  - `observaciones`
- No se actualiza `evaluated_at`

**Solución Requerida:**
```tsx
// MisEvaluaciones.tsx - Agregar formulario:
<form>
  <label>Puntaje Documental (0-100)</label>
  <input type="number" min="0" max="100" />
  
  <label>Puntaje Técnico (0-100)</label>
  <input type="number" min="0" max="100" />
  
  <label>Puntaje Total (automático)</label>
  <input readOnly value={doc + tec} />
  
  <label>Observaciones</label>
  <textarea />
  
  <button>Finalizar Evaluación</button>
</form>
```

**Endpoint Necesario:**
```typescript
// Backend: evaluaciones.controller.ts
@Post('evaluar/:postulacionId')
async evaluar(
  @Param('postulacionId') id: number,
  @Body() dto: EvaluarPostulacionDto,
  @Req() req: any
) {
  // Actualizar postulación con puntajes
  // Crear registro en evaluaciones
  // Actualizar evaluated_at
}
```

---

### 3. **UPLOAD DE DOCUMENTOS NO FUNCIONAL** 🔥🔥
**Impacto:** ALTO - Postulantes no pueden subir CV

**Problemas:**
- PostulacionEditor no tiene inputs de archivo
- No se muestran los requisitos_documentales de la convocatoria
- No hay vista previa de PDFs
- No se valida que se suban todos los documentos requeridos

**Solución Requerida:**
```tsx
// PostulacionEditor.tsx
const [archivos, setArchivos] = useState<Record<string, File>>({});

// Por cada requisito:
requisitos.map(req => (
  <div key={req}>
    <label>{req}</label>
    <input 
      type="file" 
      accept=".pdf"
      onChange={(e) => {
        if (e.target.files?.[0]) {
          setArchivos(prev => ({...prev, [req]: e.target.files![0]}));
        }
      }}
    />
    {archivos[req] && <span>✅ {archivos[req].name}</span>}
  </div>
))

// Al enviar postulación:
async function subirDocumentos() {
  for (const [nombre, file] of Object.entries(archivos)) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('postulacion_id', postulacion.id);
    formData.append('nombre_documento', nombre);
    await api.post('/documentos/upload', formData);
  }
}
```

---

### 4. **BAREMO Y ASIGNACIONES NO INTEGRADOS** 🔥
**Impacto:** MEDIO - Sistema de evaluación incompleto

**Problemas:**
- Baremo existe en BD pero no se usa
- Items de evaluación no se asocian a convocatorias
- Asignación de evaluadores es manual (sin workflow)
- No hay validación de que evaluador tenga asignación

**Solución:**
1. AdminPage - Nueva sección "Baremo por Convocatoria"
   - Seleccionar convocatoria
   - Agregar items de evaluación con puntaje_maximo
   - Guardar configuración

2. AdminPage - Nueva sección "Asignar Evaluadores"
   - Ver postulaciones de una convocatoria
   - Asignar evaluador a cada postulación
   - Ver carga de trabajo por evaluador

3. MisEvaluaciones - Validar asignación
   - Solo mostrar postulaciones asignadas al evaluador actual
   - Endpoint: GET /asignaciones/me

---

### 5. **FLUJO DE ESTADOS INCOMPLETO** 🔥
**Impacto:** MEDIO - No hay trazabilidad

**Problemas:**
- Estados de postulación no se actualizan correctamente
- No se usan campos de timestamp:
  - `submitted_at` (cuando postulante envía)
  - `reviewed_at` (cuando admin revisa)
  - `evaluated_at` (cuando evaluador califica)
- No hay validación de transiciones de estado

**Solución:**
```typescript
// Estados válidos:
enum EstadoPostulacion {
  BORRADOR = 'borrador',          // Creada, editando
  ENVIADA = 'enviada',            // Postulante envió
  EN_REVISION = 'en_revision',    // Admin revisando docs
  APROBADA_DOCS = 'aprobada_docs',// Pasó revisión documental
  EN_EVALUACION = 'en_evaluacion',// Asignada a evaluador
  EVALUADA = 'evaluada',          // Evaluador calificó
  APROBADA = 'aprobada',          // Puntaje >= mínimo
  RECHAZADA = 'rechazada'         // Puntaje < mínimo o docs incompletos
}

// Transiciones válidas:
BORRADOR → ENVIADA (postulante hace submit)
ENVIADA → EN_REVISION (admin toma caso)
EN_REVISION → APROBADA_DOCS | RECHAZADA (admin valida docs)
APROBADA_DOCS → EN_EVALUACION (admin asigna evaluador)
EN_EVALUACION → EVALUADA (evaluador califica)
EVALUADA → APROBADA | RECHAZADA (según puntaje)
```

---

### 6. **VALIDACIONES FALTANTES** ⚠️
**Impacto:** MEDIO - Seguridad y UX

**Problemas:**
- No se valida que convocatoria esté vigente al postularse
- No se valida que usuario no tenga postulación duplicada
- No se valida que todos los documentos requeridos estén subidos
- No se valida rango de puntajes (0-100)

**Solución:**
```typescript
// postulaciones.service.ts
async create(dto: CreatePostulacionDto, userId: number) {
  // 1. Validar convocatoria vigente
  const conv = await this.convocatoriasRepo.findOne(dto.convocatoria_id);
  if (conv.estado !== 'vigente') {
    throw new BadRequestException('Convocatoria no vigente');
  }
  
  // 2. Validar no duplicada
  const existing = await this.repo.findOne({
    where: { postulante_id: userId, convocatoria_id: dto.convocatoria_id }
  });
  if (existing) {
    throw new BadRequestException('Ya tienes una postulación en esta convocatoria');
  }
  
  // 3. Crear con estado borrador
  return this.repo.save({
    ...dto,
    postulante_id: userId,
    estado: 'borrador'
  });
}

async submit(id: number, userId: number) {
  const post = await this.repo.findOne(id, { relations: ['documentos'] });
  
  // Validar propiedad
  if (post.postulante_id !== userId) {
    throw new ForbiddenException();
  }
  
  // Validar estado
  if (post.estado !== 'borrador') {
    throw new BadRequestException('Solo se pueden enviar postulaciones en borrador');
  }
  
  // Validar documentos
  const conv = await this.convocatoriasRepo.findOne(post.convocatoria_id);
  const requeridos = conv.requisitos_documentales || [];
  const subidos = post.documentos.map(d => d.nombre_documento);
  const faltantes = requeridos.filter(r => !subidos.includes(r));
  
  if (faltantes.length > 0) {
    throw new BadRequestException(`Faltan documentos: ${faltantes.join(', ')}`);
  }
  
  // Actualizar estado y timestamp
  post.estado = 'enviada';
  post.submitted_at = new Date();
  return this.repo.save(post);
}
```

---

### 7. **BÚSQUEDA Y FILTROS INEXISTENTES** ⚠️
**Impacto:** BAJO - UX mejorable

**Problemas:**
- ConvocatoriasPage no tiene filtros
- AdminPage no tiene búsqueda de usuarios
- MisPostulaciones no tiene filtro por estado

**Solución:**
```tsx
// ConvocatoriasPage.tsx
<div className="filters">
  <input 
    placeholder="Buscar por nombre"
    onChange={(e) => setBusqueda(e.target.value)}
  />
  <select onChange={(e) => setPrograma(e.target.value)}>
    <option value="">Todos los programas</option>
    {programas.map(p => <option value={p.id}>{p.nombre}</option>)}
  </select>
  <select onChange={(e) => setSede(e.target.value)}>
    <option value="">Todas las sedes</option>
    <option value="Mocoa">Mocoa</option>
    <option value="Valle">Valle del Guamuez</option>
  </select>
  <select onChange={(e) => setEstado(e.target.value)}>
    <option value="">Todos los estados</option>
    <option value="vigente">Vigentes</option>
    <option value="cerrada">Cerradas</option>
  </select>
</div>
```

---

### 8. **NOTIFICACIONES AUSENTES** ⚠️
**Impacto:** BAJO - UX mejorable

**Problemas:**
- Usuario no sabe cuándo hay nuevas convocatorias
- Evaluador no sabe cuándo le asignan evaluaciones
- Postulante no sabe cuándo lo evalúan

**Solución (Fase posterior):**
- Implementar WebSockets o Server-Sent Events
- Crear tabla `notificaciones` en BD
- Badge en Header con contador
- Panel de notificaciones

---

### 9. **EXPORTACIÓN DE DATOS FALTANTE** ⚠️
**Impacto:** BAJO - Feature nice-to-have

**Solución (Fase posterior):**
```typescript
// Endpoints nuevos:
GET /convocatorias/:id/export/excel  // Lista de postulantes
GET /postulaciones/:id/export/pdf    // Reporte individual
GET /evaluaciones/export/csv         // Resultados de evaluación
```

---

## 📋 PLAN DE ACCIÓN PRIORIZADO

### **SPRINT 1: CONVOCATORIAS COMPLETAS** (4-6 horas)
**Objetivo:** Permitir crear y ver convocatorias con toda la información

1. [ ] AdminPage - Expandir formulario crear convocatoria
   - Agregar selector programa académico
   - Agregar campos: cupos, sede, dedicación, tipo_vinculación
   - Agregar editor de requisitos documentales (checkboxes + otros)
   - Agregar puntajes mínimos

2. [ ] AdminPage - Modal edición con mismos campos

3. [ ] ConvocatoriasPage - Mostrar info completa
   - Cupos disponibles
   - Sede y dedicación
   - Requisitos documentales
   - Programa académico

4. [ ] ConvocatoriasPage - Agregar filtros
   - Por programa
   - Por sede
   - Por estado

**Entregable:** Convocatorias funcionales al 100%

---

### **SPRINT 2: POSTULACIÓN Y UPLOAD** (6-8 horas)
**Objetivo:** Postulantes pueden postularse y subir documentos

1. [ ] PostulacionEditor - Agregar campo disponibilidad_horaria

2. [ ] PostulacionEditor - Implementar upload de documentos
   - Mostrar lista de requisitos_documentales
   - Input file por cada requisito
   - Validar PDFs
   - Subir a /documentos/upload
   - Mostrar archivos ya subidos

3. [ ] PostulacionEditor - Botón "Enviar Postulación"
   - Validar todos los docs estén subidos
   - Cambiar estado a 'enviada'
   - Actualizar submitted_at

4. [ ] MisPostulaciones - Mostrar estados con timestamps
   - Badge de estado con color
   - Fechas de submitted_at, evaluated_at
   - Puntajes si ya fue evaluada

5. [ ] Backend - Validaciones
   - No postulación duplicada
   - Convocatoria vigente
   - Todos los docs requeridos

**Entregable:** Flujo de postulación completo

---

### **SPRINT 3: SISTEMA DE EVALUACIÓN** (6-8 horas)
**Objetivo:** Evaluadores pueden calificar postulaciones

1. [ ] AdminPage - Sección "Asignar Evaluadores"
   - Listar postulaciones de convocatoria
   - Asignar evaluador a cada una
   - Ver carga de trabajo

2. [ ] Backend - Endpoint GET /asignaciones/me
   - Retorna postulaciones asignadas al evaluador actual

3. [ ] MisEvaluaciones - Formulario de evaluación
   - Mostrar solo postulaciones asignadas
   - Formulario con puntaje_documental, puntaje_tecnico
   - Calcular puntaje_total automáticamente
   - Campo observaciones
   - Botón "Finalizar Evaluación"

4. [ ] Backend - Endpoint POST /evaluaciones/evaluar/:postulacionId
   - Validar asignación
   - Actualizar puntajes en postulación
   - Crear registro en evaluaciones
   - Actualizar evaluated_at
   - Cambiar estado a 'evaluada'

5. [ ] Backend - Lógica de aprobación/rechazo
   - Comparar puntaje_total con min_puntaje_aprobacion
   - Cambiar estado a 'aprobada' o 'rechazada'

**Entregable:** Sistema de evaluación funcional

---

### **SPRINT 4: BAREMO Y REFINAMIENTOS** (4-6 horas)
**Objetivo:** Sistema completo con baremo configurable

1. [ ] AdminPage - Sección "Baremo por Convocatoria"
   - CRUD de items_evaluacion
   - Asignar items a convocatoria con puntajes
   - Ver resumen de baremo

2. [ ] MisEvaluaciones - Usar baremo en evaluación
   - Mostrar items configurados
   - Input de puntaje por cada item
   - Calcular total según ponderación

3. [ ] Dashboard por rol
   - Admin: resumen de convocatorias y postulaciones
   - Evaluador: evaluaciones pendientes
   - Postulante: estado de postulaciones

4. [ ] Mejoras de UX
   - Loader en todas las peticiones
   - Mensajes de error claros
   - Confirmaciones antes de eliminar

**Entregable:** Sistema completo y refinado

---

### **SPRINT 5 (OPCIONAL): FEATURES AVANZADOS**
**Nice-to-have para versión 2.0:**

1. [ ] Recuperación de contraseña
2. [ ] Verificación de email
3. [ ] Notificaciones en tiempo real
4. [ ] Exportación a Excel/PDF
5. [ ] Estadísticas y gráficos
6. [ ] Chat de soporte

---

## 🎯 MÉTRICAS DE COMPLETITUD

### Backend
- **Actual:** 85% completo
- **Faltante principal:** Lógica de evaluación y validaciones

### Frontend
- **Actual:** 75% completo
- **Faltante principal:** Formularios de evaluación y upload de docs

### **COMPLETITUD GENERAL: 80%**

---

## 🔧 DEUDA TÉCNICA IDENTIFICADA

### Alta Prioridad
1. **Tests E2E incompletos** - Solo auth, faltan tests de flujos completos
2. **Validaciones inconsistentes** - Algunos endpoints sin validación
3. **Error handling** - Algunos try-catch sin mensajes claros
4. **Logging incompleto** - Falta log de operaciones críticas

### Media Prioridad
1. **Paginación no implementada** - Todos los listados retornan todo
2. **Cache ausente** - No hay Redis ni cache de queries
3. **Rate limiting básico** - Solo global, no por usuario/endpoint
4. **Documentación API** - Swagger incompleto

### Baja Prioridad
1. **TypeScript strict mode** - Algunos any sin tipar
2. **Optimización de queries** - Algunos N+1 queries
3. **Internacionalización** - Solo español
4. **Accesibilidad** - ARIA labels faltantes

---

## 📊 RESUMEN EJECUTIVO

### ✅ Lo que FUNCIONA
- Sistema de autenticación robusto
- CRUD básico de todas las entidades
- Upload de archivos configurado
- Interfaz básica funcional
- Roles y permisos correctos

### ❌ Lo que FALTA
1. **Convocatorias:** Campos completos en formularios
2. **Evaluación:** Formulario para calificar postulaciones
3. **Upload:** Interfaz para subir documentos requeridos
4. **Baremo:** Integración con evaluación
5. **Validaciones:** Flujo de estados y restricciones
6. **Búsqueda:** Filtros en listados

### 🎯 Próximos Pasos Inmediatos
1. **HOY:** Campos completos en convocatorias (AdminPage)
2. **MAÑANA:** Upload de documentos (PostulacionEditor)
3. **SIGUIENTE:** Formulario de evaluación (MisEvaluaciones)

---

**Estimación para MVP completo:** 20-25 horas de desarrollo  
**Estado actual:** 80% completitud  
**Prioridad:** Sprints 1, 2 y 3 son CRÍTICOS para producción

---

**Generado:** 27 de noviembre de 2025  
**Autor:** Análisis de código completo del proyecto
