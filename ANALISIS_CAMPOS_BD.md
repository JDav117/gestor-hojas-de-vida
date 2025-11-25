# 📊 ANÁLISIS COMPLETO: Campos de BD vs Frontend

## 🔴 CAMPOS CRÍTICOS FALTANTES

### 1. **USUARIO (tabla `usuarios`)**

| Campo | Tipo | Estado | Dónde Implementar |
|-------|------|--------|-------------------|
| `telefono` | string | ✅ **IMPLEMENTADO** | ProfilePage + RegisterForm |
| `verificado` | boolean | ✅ **IMPLEMENTADO** | ProfilePage - Badge de estado |
| `created_at` | datetime | ⚠️ **OPCIONAL** | ProfilePage - Info adicional (no crítico) |
| `updated_at` | datetime | ⚠️ **OPCIONAL** | ProfilePage - Info adicional (no crítico) |

**Acciones tomadas:**
- ✅ Campo `telefono` en formulario de registro (opcional)
- ✅ Campo `telefono` en formulario de edición de perfil
- ✅ Badge de verificación en el perfil
- ✅ DTO `CreateUserDto` actualizado con telefono
- ✅ DTO `UpdateMeDto` actualizado con telefono
- ✅ Controlador `/users/me` actualizado
- ✅ Validación de contraseña segura (8+ caracteres, mayúsculas, minúsculas, números, especiales)
- ✅ Confirmación de contraseña en registro
- ✅ Términos y condiciones requeridos

---

### 2. **CONVOCATORIA (tabla `convocatorias`)**

| Campo | Tipo | Estado | Dónde Implementar |
|-------|------|--------|-------------------|
| `programa_academico_id` | int | ❌ **FALTA** | AdminPage - Formulario de convocatorias |
| `cupos` | int | ❌ **FALTA** | AdminPage + ConvocatoriasPage - Mostrar cupos disponibles |
| `sede` | string | ❌ **FALTA** | AdminPage + ConvocatoriasPage - Info de sede |
| `dedicacion` | string | ❌ **FALTA** | AdminPage + ConvocatoriasPage - Tiempo completo/medio tiempo |
| `tipo_vinculacion` | string | ❌ **FALTA** | AdminPage + ConvocatoriasPage - Laboral/honorarios/etc |
| `requisitos_documentales` | json | ❌ **FALTA** | AdminPage - Lista de documentos requeridos |
| `min_puntaje_aprobacion_documental` | float | ❌ **FALTA** | AdminPage - Configuración de baremo |
| `min_puntaje_aprobacion_tecnica` | float | ❌ **FALTA** | AdminPage - Configuración de baremo |

**Prioridad:** 🔥 **ALTA** - Estos campos son esenciales para el flujo completo

**Páginas a modificar:**
1. **AdminPage.tsx** - Formulario de crear/editar convocatoria
   - Agregar selector de programa académico
   - Campos: cupos, sede, dedicación, tipo_vinculacion
   - Editor de requisitos documentales (array)
   - Puntajes mínimos de aprobación

2. **ConvocatoriasPage.tsx** - Vista pública de convocatorias
   - Mostrar cupos disponibles
   - Mostrar sede y dedicación
   - Mostrar requisitos documentales
   - Filtros por programa académico

---

### 3. **POSTULACIÓN (tabla `postulaciones`)**

| Campo | Tipo | Estado | Dónde Implementar |
|-------|------|--------|-------------------|
| `disponibilidad_horaria` | string | ❌ **FALTA** | PostulacionEditor - Formulario de postulación |
| `puntaje_documental` | float | ❌ **FALTA** | MisEvaluaciones - Evaluación documental |
| `puntaje_tecnico` | float | ❌ **FALTA** | MisEvaluaciones - Evaluación técnica |
| `puntaje_total` | float | ❌ **FALTA** | MisPostulaciones + AdminPage - Resultado |
| `observaciones` | text | ❌ **FALTA** | MisEvaluaciones - Comentarios del evaluador |
| `submitted_at` | datetime | ❌ **FALTA** | MisPostulaciones - Fecha de envío |
| `reviewed_at` | datetime | ❌ **FALTA** | AdminPage - Tracking de revisión |
| `evaluated_at` | datetime | ❌ **FALTA** | MisEvaluaciones - Fecha de evaluación |

**Prioridad:** 🔥 **ALTA** - Esenciales para el proceso de evaluación

**Páginas a modificar:**
1. **PostulacionEditor.tsx** - Editor de postulación
   - Campo `disponibilidad_horaria` (textarea)
   - Botón "Enviar postulación" que actualiza `submitted_at`

2. **MisPostulaciones.tsx** - Lista de postulaciones del usuario
   - Columna con `puntaje_total`
   - Badges de estado con fechas (`submitted_at`)
   - Filtro por estado

3. **MisEvaluaciones.tsx** - Panel de evaluación
   - Formulario para `puntaje_documental`
   - Formulario para `puntaje_tecnico`
   - Campo `observaciones`
   - Calcular `puntaje_total` automáticamente
   - Botón "Finalizar evaluación" que actualiza `evaluated_at`

4. **AdminPage.tsx** - Vista admin de postulaciones
   - Columnas: puntajes, fechas, observaciones
   - Indicador de `reviewed_at` (quién revisó y cuándo)

---

### 4. **ITEMS DE EVALUACIÓN Y BAREMO** (nuevas tablas)

| Tabla | Implementado | Dónde |
|-------|--------------|-------|
| `items_evaluacion` | ❌ **FALTA** | AdminPage - CRUD de ítems |
| `baremo_convocatoria` | ❌ **FALTA** | AdminPage - Asignar baremo a convocatoria |
| `asignaciones` | ❌ **FALTA** | AdminPage - Asignar evaluadores |
| `evaluaciones` | ❌ **FALTA** | MisEvaluaciones - Registrar evaluación |

**Prioridad:** 🟡 **MEDIA** - Necesarias para el sistema completo de evaluación

**Nuevas secciones a crear en AdminPage:**
1. **Ítems de Evaluación**
   - CRUD completo
   - Tabla con nombre_item y descripción

2. **Baremo por Convocatoria**
   - Asignar ítems a convocatoria
   - Definir puntaje_maximo por ítem
   - Vista de resumen de baremo

3. **Asignaciones de Evaluadores**
   - Asignar evaluadores a postulaciones
   - Vista de carga de trabajo por evaluador

---

## 📋 PLAN DE IMPLEMENTACIÓN SUGERIDO

### **FASE 1: Campos Básicos (COMPLETADO ✅)**
- [x] Teléfono en usuario
- [x] Estado de verificación

### **FASE 2: Convocatorias Completas (ALTA PRIORIDAD)**
1. Actualizar AdminPage - Formulario de convocatorias
   - Agregar todos los campos faltantes
   - Selector de programa académico
   - Editor de requisitos documentales

2. Actualizar ConvocatoriasPage
   - Mostrar información completa
   - Filtros avanzados

**Tiempo estimado:** 4-6 horas

### **FASE 3: Sistema de Postulaciones y Evaluación (ALTA PRIORIDAD)**
1. PostulacionEditor
   - Campo disponibilidad_horaria
   - Botón enviar con submitted_at

2. MisEvaluaciones
   - Formulario de evaluación completo
   - Puntajes y observaciones
   - Actualización de evaluated_at

3. MisPostulaciones
   - Mostrar puntajes y estados con fechas

**Tiempo estimado:** 6-8 horas

### **FASE 4: Baremo y Asignaciones (MEDIA PRIORIDAD)**
1. CRUD de ítems de evaluación
2. Asignar baremo a convocatorias
3. Sistema de asignación de evaluadores

**Tiempo estimado:** 8-10 horas

---

## 🎯 PRÓXIMOS PASOS INMEDIATOS

1. **AdminPage - Expandir formulario de convocatorias**
   ```tsx
   - programa_academico_id (select)
   - cupos (number)
   - sede (text)
   - dedicacion (select: Tiempo completo, Medio tiempo, Cátedra)
   - tipo_vinculacion (select: Laboral, Honorarios, Prestación de servicios)
   - requisitos_documentales (array de strings)
   - min_puntaje_aprobacion_documental (number)
   - min_puntaje_aprobacion_tecnica (number)
   ```

2. **PostulacionEditor - Agregar disponibilidad**
   ```tsx
   <textarea 
     placeholder="Describe tu disponibilidad horaria"
     value={form.disponibilidad_horaria}
   />
   ```

3. **MisEvaluaciones - Crear formulario de evaluación**
   ```tsx
   - puntaje_documental (input number)
   - puntaje_tecnico (input number)
   - puntaje_total (calculado)
   - observaciones (textarea)
   ```

---

## 📌 NOTAS IMPORTANTES

- **Estado del backend**: Los DTOs están parcialmente actualizados (Convocatoria ✅, Postulación ❌)
- **Entities**: Todas las entities están completas con los campos de BD
- **Validación**: Se requiere agregar validaciones en DTOs de postulación
- **Permisos**: Verificar que los endpoints de evaluación estén protegidos correctamente

---

**Generado:** 25 de noviembre de 2025  
**Proyecto:** Sistema de Gestión Uniputumayo  
**Desarrolladores:** Equipo GHV_UIP
