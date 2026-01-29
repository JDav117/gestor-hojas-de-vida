# FASE 1: DISEÑO Y NORMALIZACIÓN DE BASE DE DATOS

## Gestor de Hojas de Vida - Convocatorias Docentes

---

## 1. REQUISITOS DE DATOS

### 1.1 Entidades Principales Identificadas

#### A. Gestión de Usuarios
- Administradores del sistema
- Evaluadores (docentes evaluadores)
- Postulantes (candidatos a vacantes)

**Atributos necesarios:**
- Identificación personal (ID, nombre, apellido, documento)
- Contacto (email, teléfono)
- Autenticación (password hash)
- Control de perfil (foto, verificación)
- Auditoría (created_at, updated_at)

#### B. Gestión de Roles y Permisos
- Rol ADMIN: Gestión completa del sistema
- Rol EVALUADOR: Evaluación de postulaciones
- Rol POSTULANTE: Envío de postulaciones

**Atributos:**
- ID del rol
- Nombre único del rol

#### C. Gestión de Convocatorias
- Publicación de vacantes docentes
- Especificación de requisitos por convocatoria
- Control de fechas (apertura/cierre)
- Estados de convocatoria (borrador, publicada, cerrada, anulada)

**Atributos:**
- ID convocatoria
- Descripción y requisitos documentales (JSON)
- Fechas apertura/cierre
- Estado de la convocatoria
- Cupos disponibles
- Información de la vacante (sede, dedicación, vinculación)
- Puntajes mínimos (documental y técnica)
- Relación con programa académico

#### D. Gestión de Programas Académicos
- Información del programa académico asociado
- Metadatos del programa (facultad, nivel, modalidad)

**Atributos:**
- ID programa
- Nombre, facultad, nivel, modalidad
- Código SNIES
- Descripción

#### E. Gestión de Postulaciones
- Registro de candidatos por convocatoria
- Estados de postulación (borrador, EN_REVISION, etc.)
- Evaluación de documentos
- Evaluación técnica

**Atributos:**
- ID postulación
- Relación con usuario postulante
- Relación con convocatoria
- Relación con programa (flexible)
- Fechas de transición de estados
- Disponibilidad horaria
- Puntajes (documental, técnico, total)
- Observaciones
- Auditoría

#### F. Gestión de Documentos
- Documentos adjuntos por postulación
- Rastro de archivos almacenados

**Atributos:**
- ID documento
- Nombre descriptivo
- Ruta del archivo almacenado
- Relación con postulación

#### G. Gestión de Evaluaciones
- Evaluación técnica de postulaciones
- Asignación de evaluadores
- Puntajes por criterio de evaluación

**Atributos:**
- ID evaluación
- Relación con postulación y evaluador
- Fecha de evaluación
- Puntaje total

#### H. Gestión de Ítems de Evaluación
- Criterios de evaluación (Formación académica, Experiencia docente, etc.)

**Atributos:**
- ID item
- Nombre descriptivo
- Descripción detallada

#### I. Gestión de Baremo por Convocatoria
- Definición de puntajes máximos por criterio de evaluación
- Relación entre convocatoria e ítems de evaluación

**Atributos:**
- ID baremo
- Relación con convocatoria e item
- Puntaje máximo

#### J. Gestión de Asignaciones
- Asignación de evaluadores a postulaciones
- Control de evaluadores duplicados por postulación

**Atributos:**
- ID asignación
- Evaluador ID
- Postulación ID
- Auditoría

---

## 2. DIAGRAMA ENTIDAD-RELACIÓN (ER)

### 2.1 Descripción del Diagrama

```
┌──────────────────┐
│    USUARIOS      │
├──────────────────┤
│ id (PK)          │
│ nombre           │
│ apellido         │
│ email (UQ)       │
│ password_hash    │
│ identificacion (UQ)
│ telefono         │
│ verificado       │
│ foto_perfil      │
│ created_at       │
│ updated_at       │
└────────┬─────────┘
         │
    ┌────┴─────────────────────┬───────────────────┐
    │                          │                   │
    ▼                          ▼                   ▼
┌──────────────┐      ┌─────────────────┐  ┌─────────────┐
│ USUARIO_ROLES│      │ POSTULACIONES   │  │ EVALUACIONES│
├──────────────┤      ├─────────────────┤  ├─────────────┤
│ usuario_id(FK)      │ id (PK)         │  │ id (PK)     │
│ rol_id (FK)  │      │ postulante_id(FK)  │ postulacion_id(FK)
└──────────────┘      │ convocatoria_id(FK) │ evaluador_id(FK)
    │                 │ programa_id(FK) │  │ fecha       │
    │                 │ estado          │  │ puntaje_total
    │                 │ puntaje_documental │ └────────┬────┘
    │                 │ puntaje_tecnico │  │         │
    │                 │ puntaje_total   │  │         ▼
    │                 │ disponibilidad  │  │    ┌──────────────┐
    │                 │ observaciones   │  │    │ ASIGNACIONES │
    │                 │ created_at      │  │    ├──────────────┤
    │                 │ updated_at      │  │    │ id (PK)      │
    │                 └────────┬────────┘  │    │ evaluador_id │
    │                          │           │    │ postulacion_id
    │                          ▼           │    └──────────────┘
    │                   ┌──────────────┐   │
    │                   │  DOCUMENTOS  │   │
    │                   ├──────────────┤   │
    │                   │ id (PK)      │   │
    │                   │ postulacion_id(FK)
    │                   │ nombre_documento
    │                   │ ruta_archivo │   │
    │                   └──────────────┘   │
    │                                      │
    │                   ┌──────────────────┘
    │                   │
    │                   ▼
    │           ┌────────────────┐
    │           │ CONVOCATORIAS  │
    │           ├────────────────┤
    │           │ id (PK)        │
    │           │ nombre         │
    │           │ descripcion    │
    │           │ fecha_apertura │
    │           │ fecha_cierre   │
    │           │ estado         │
    │           │ programa_id(FK)│
    │           │ cupos          │
    │           │ sede           │
    │           │ dedicacion     │
    │           │ tipo_vinculacion
    │           │ requisitos_doc │
    │           │ min_puntaje_doc│
    │           │ min_puntaje_tec│
    │           │ created_at     │
    │           │ updated_at     │
    │           └────────┬───────┘
    │                    │
    │                    ▼
    │           ┌────────────────────┐
    │           │ PROGRAMAS_ACADEMICOS
    │           ├────────────────────┤
    │           │ id (PK)            │
    │           │ nombre_programa (UQ)
    │           │ facultad           │
    │           │ nivel              │
    │           │ modalidad          │
    │           │ codigo_snies       │
    │           │ descripcion        │
    │           └────────┬───────────┘
    │                    │
    │    ┌───────────────┘
    │    │
    │    ▼
    │  ┌──────────────┐
    │  │ BAREMO_CONVO │
    │  ├──────────────┤
    │  │ id (PK)      │
    │  │ convocator_id(FK)
    │  │ item_evalu_id(FK)
    │  │ puntaje_maximo
    │  └──────────────┘
    │    │
    │    ▼
    │  ┌──────────────────┐
    │  │ ITEMS_EVALUACION │
    │  ├──────────────────┤
    │  │ id (PK)          │
    │  │ nombre_item      │
    │  │ descripcion      │
    │  └──────────────────┘
    │
    ▼
┌──────────────┐
│    ROLES     │
├──────────────┤
│ id (PK)      │
│ nombre_rol(UQ)
└──────────────┘
```

### 2.2 Relaciones Principales

| De | A | Tipo | Cardinalidad | Descripción |
|---|---|------|---|---|
| USUARIOS | USUARIO_ROLES | 1:N | 1 usuario - N roles | Un usuario puede tener múltiples roles |
| ROLES | USUARIO_ROLES | 1:N | 1 rol - N usuarios | Un rol puede asignarse a múltiples usuarios |
| USUARIOS | POSTULACIONES | 1:N | 1 postulante - N postulaciones | Un usuario puede postularse múltiples veces |
| CONVOCATORIAS | POSTULACIONES | 1:N | 1 convocatoria - N postulaciones | Una convocatoria recibe múltiples postulaciones |
| PROGRAMAS_ACADEMICOS | POSTULACIONES | 1:N | Opcional | Postulación puede especificar programa |
| POSTULACIONES | DOCUMENTOS | 1:N | 1 postulación - N documentos | Una postulación puede incluir múltiples documentos |
| USUARIOS (evaluador) | EVALUACIONES | 1:N | 1 evaluador - N evaluaciones | Un evaluador realiza múltiples evaluaciones |
| POSTULACIONES | EVALUACIONES | 1:N | 1 postulación - N evaluaciones | Una postulación puede ser evaluada múltiples veces |
| PROGRAMAS_ACADEMICOS | CONVOCATORIAS | 1:N | Opcional | Un programa puede tener múltiples convocatorias |
| CONVOCATORIAS | BAREMO_CONVOCATORIA | 1:N | 1 convocatoria - N baremos | Una convocatoria define puntajes para múltiples items |
| ITEMS_EVALUACION | BAREMO_CONVOCATORIA | 1:N | 1 item - N baremos | Un item puede estar en múltiples convocatorias |
| USUARIOS (evaluador) | ASIGNACIONES | 1:N | 1 evaluador - N asignaciones | Un evaluador se asigna a múltiples postulaciones |
| POSTULACIONES | ASIGNACIONES | 1:N | 1 postulación - N asignaciones | Una postulación asigna múltiples evaluadores |

---

## 3. NORMALIZACIÓN

### 3.1 Primera Forma Normal (1NF)

**Definición:** Todos los atributos contienen solo valores atómicos (no repetidos o multivaluados).

**Cumplimiento en nuestro diseño:**

✅ **USUARIOS**: Todos los campos contienen valores atómicos
- `email` es único
- `identificacion` es único
- `nombre`, `apellido`, `telefono` son valores simples

✅ **POSTULACIONES**: Campos atómicos
- Estados como `estado` contienen un solo valor (borrador, EN_REVISION, etc.)
- `disponibilidad_horaria` es un texto, no una lista
- Los puntajes son valores numéricos simples

✅ **CONVOCATORIAS**: Requisitos documentales en JSON
- Se almacena como JSON (tipo permitido en MySQL 5.7+)
- Es un campo único, no repetido
- Ejemplo: `["Hoja de vida", "Copia de título", "Certificados de experiencia"]`

✅ **USUARIO_ROLES**: Tabla de unión que normaliza la relación M:N
- En lugar de almacenar múltiples roles en USUARIOS, usamos una tabla intermedia
- Cada fila contiene un único par (usuario_id, rol_id)

**Ejemplo de cumplimiento 1NF:**
```sql
-- Correcto (1NF):
usuarios: (id: 1, nombre: "Juan", email: "juan@mail.com")

-- Incorrecto (viola 1NF):
usuarios: (id: 1, nombre: "Juan", roles: ["ADMIN", "EVALUADOR"])
```

---

### 3.2 Segunda Forma Normal (2NF)

**Definición:** 
- Cumple 1NF
- Todo atributo no clave depende completamente de la clave primaria

**Cumplimiento en nuestro diseño:**

✅ **USUARIOS**: 
- PK: `id`
- Todos los atributos (nombre, email, password_hash) dependen de la identidad del usuario
- No hay dependencias parciales

✅ **POSTULACIONES**:
- PK: `id`
- Atributos como `puntaje_documental`, `puntaje_tecnico` dependen de qué postulación es
- La relación `postulante_id` + `convocatoria_id` hace sentido bajo la PK `id`

✅ **USUARIO_ROLES**:
- PK compuesta: (`usuario_id`, `rol_id`)
- No tiene atributos adicionales que dependan parcialmente
- Cada atributo depende de la combinación completa

✅ **BAREMO_CONVOCATORIA**:
- PK: `id`
- Atributo `puntaje_maximo` depende de la relación específica entre convocatoria e item
- Elimina redundancia: antes sería almacenar en CONVOCATORIAS o ITEMS

**Ejemplo de cumplimiento 2NF:**
```sql
-- Correcto (2NF):
POSTULACIONES (id, postulante_id, convocatoria_id, puntaje_documental, ...)
-- puntaje_documental depende de la postulación completa

-- Incorrecto (viola 2NF):
POSTULACIONES (id, postulante_id, email_postulante, puntaje_documental, ...)
-- email depende solo de postulante_id, no de toda la PK
```

---

### 3.3 Tercera Forma Normal (3NF)

**Definición:**
- Cumple 2NF
- No hay dependencias transitivas (atributos que dependen de atributos no-PK)

**Cumplimiento en nuestro diseño:**

✅ **USUARIOS**:
- PK: `id`
- Todos los atributos dependen directamente de `id`, no de otros atributos no-PK
- No hay: "si nombre es X entonces email debe ser Y"

✅ **POSTULACIONES**:
- PK: `id`
- Atributos dependen directamente del ID de postulación
- No hay datos redundantes como "email del postulante" (existe en USUARIOS)

✅ **CONVOCATORIAS**:
- PK: `id`
- `programa_academico_id` es una FK, no una cadena de dependencia
- Información de programa (facultad, nivel) está en PROGRAMAS_ACADEMICOS

✅ **BAREMO_CONVOCATORIA**:
- Separa el concepto de "qué se evalúa" (ITEMS) de "cuántos puntos vale en esta convocatoria"
- Evita redundancia de puntajes en múltiples tablas

**Ejemplo de cumplimiento 3NF:**

```sql
-- Correcto (3NF): Información separada
USUARIOS (id, nombre, apellido, email)
CONVOCATORIAS (id, nombre, programa_id)
PROGRAMAS_ACADEMICOS (id, nombre_programa, facultad, nivel)

-- Incorrecto (viola 3NF):
CONVOCATORIAS (id, nombre, programa_id, facultad_programa, nivel_programa)
-- facultad_programa depende de programa_id, no de id de convocatoria
-- Es una dependencia transitiva
```

---

## 4. ANÁLISIS: ¿NECESITA 4NF O 5NF?

### 4.1 Cuarta Forma Normal (4NF)

**Definición:** 
- Cumple BCNF (Forma Normal de Boyce-Codd)
- No hay dependencias multivaluadas no funcionales

**Caso donde 4NF sería necesario:**

Si tuviéramos una situación como:
```
Un EVALUADOR puede evaluar múltiples POSTULACIONES
Un EVALUADOR puede usar múltiples MÉTODOS_EVALUACION
Un EVALUADOR puede evaluar en múltiples IDIOMAS

Sin relación entre estos atributos.
```

**¿Por qué NO es necesario en nuestro diseño?**

✅ En nuestro sistema:
- Toda dependencia multivaluada tiene una causa funcional clara
- Las asignaciones (EVALUADOR → POSTULACION) están justificadas por `ASIGNACIONES`
- Los métodos de evaluación no varían independientemente

**Sería necesario 4NF si tuviéramos:**
```sql
-- Malo (viola 4NF):
EVALUACIONES (evaluador_id, postulacion_id, metodo_evaluacion)
-- Si un evaluador puede usar múltiples métodos de forma independiente a qué postulación evalúa

-- Correcto:
EVALUACIONES (id, postulacion_id, evaluador_id, fecha, puntaje_total)
-- La información de método se podría separar si fuera necesaria
```

### 4.2 Quinta Forma Normal (5NF)

**Definición:** No hay pérdida de información al descomponer una relación

**¿Por qué NO es necesario 4NF/5NF en nuestro diseño?**

1. **No tenemos dependencias de unión complejas**
   - Las relaciones se pueden reproducir por join natural sin pérdida
   - Todas las descomposiciones son reversibles

2. **La complejidad se mantiene manejable**
   - Cada entidad tiene un propósito claro
   - No hay redundancia significativa que justifique más descomposición

3. **Performance vs Normalización**
   - 5NF acarrearía más JOINs (hasta 10+ tablas por consulta)
   - Nuestro dominio no lo requiere

**Tabla de Decisión:**

| Forma Normal | ¿Implementado? | ¿Necesario? | Razón |
|---|---|---|---|
| 1NF | ✅ Sí | ✅ Sí | Obligatorio, datos atómicos |
| 2NF | ✅ Sí | ✅ Sí | Obligatorio, sin dependencias parciales |
| 3NF | ✅ Sí | ✅ Sí | Obligatorio, sin dependencias transitivas |
| BCNF | ✅ Sí | ⚠️ Parcial | Cumplido en la mayoría de tablas |
| 4NF | ❌ No | ❌ No | No hay dependencias multivaluadas sin causa |
| 5NF | ❌ No | ❌ No | Acarrearía complejidad sin beneficio |

---

## 5. DICCIONARIO DE DATOS

### 5.1 Tabla: USUARIOS

| Columna | Tipo de Dato | Tamaño | Restricciones | Descripción |
|---------|--------------|--------|---|---|
| id | INT | 11 | PRIMARY KEY, AUTO_INCREMENT | Identificador único del usuario |
| nombre | VARCHAR | 100 | NOT NULL | Nombre del usuario |
| apellido | VARCHAR | 100 | NOT NULL | Apellido del usuario |
| email | VARCHAR | 255 | NOT NULL, UNIQUE | Email único para autenticación |
| password_hash | VARCHAR | 255 | NOT NULL | Hash bcrypt de contraseña (min 60 caracteres) |
| identificacion | VARCHAR | 50 | NOT NULL, UNIQUE | Cédula/documento de identidad único |
| telefono | VARCHAR | 255 | DEFAULT NULL | Número de teléfono de contacto |
| verificado | TINYINT | 1 | DEFAULT 0 | Flag de verificación de email (0=no, 1=sí) |
| foto_perfil | VARCHAR | 255 | DEFAULT NULL | Ruta relativa de foto de perfil (ej: uploads/perfiles/6_uuid.png) |
| created_at | DATETIME | - | DEFAULT CURRENT_TIMESTAMP | Fecha/hora de creación del registro |
| updated_at | DATETIME | - | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Fecha/hora de última actualización |

### 5.2 Tabla: ROLES

| Columna | Tipo de Dato | Tamaño | Restricciones | Descripción |
|---------|--------------|--------|---|---|
| id | INT | 11 | PRIMARY KEY, AUTO_INCREMENT | Identificador único del rol |
| nombre_rol | VARCHAR | 100 | NOT NULL, UNIQUE | Nombre del rol (ADMIN, EVALUADOR, POSTULANTE) |

### 5.3 Tabla: USUARIO_ROLES (Tabla de Unión)

| Columna | Tipo de Dato | Tamaño | Restricciones | Descripción |
|---------|--------------|--------|---|---|
| usuario_id | INT | 11 | PRIMARY KEY (parte 1), FOREIGN KEY → USUARIOS.id | ID del usuario |
| rol_id | INT | 11 | PRIMARY KEY (parte 2), FOREIGN KEY → ROLES.id | ID del rol asignado |

### 5.4 Tabla: PROGRAMAS_ACADEMICOS

| Columna | Tipo de Dato | Tamaño | Restricciones | Descripción |
|---------|--------------|--------|---|---|
| id | INT | 11 | PRIMARY KEY, AUTO_INCREMENT | Identificador único del programa |
| nombre_programa | VARCHAR | 255 | NOT NULL, UNIQUE | Nombre del programa académico |
| facultad | VARCHAR | 255 | DEFAULT NULL | Nombre de la facultad responsable |
| nivel | VARCHAR | 255 | DEFAULT NULL | Nivel del programa (Profesional, Tecnología, Posgrado) |
| modalidad | VARCHAR | 255 | DEFAULT NULL | Modalidad (Presencial, Virtual, Híbrida) |
| codigo_snies | VARCHAR | 64 | DEFAULT NULL | Código SNIES (Sistema Nacional de Información de Educación Superior) |
| descripcion | TEXT | - | DEFAULT NULL | Descripción detallada del programa |

### 5.5 Tabla: CONVOCATORIAS

| Columna | Tipo de Dato | Tamaño | Restricciones | Descripción |
|---------|--------------|--------|---|---|
| id | INT | 11 | PRIMARY KEY, AUTO_INCREMENT | Identificador único de convocatoria |
| nombre | VARCHAR | 255 | NOT NULL | Título de la convocatoria |
| descripcion | TEXT | - | DEFAULT NULL | Descripción detallada de la convocatoria |
| fecha_apertura | DATETIME | - | NOT NULL | Fecha/hora de inicio de recepción de postulaciones |
| fecha_cierre | DATETIME | - | NOT NULL | Fecha/hora de cierre de recepción |
| estado | ENUM | - | NOT NULL, DEFAULT 'borrador' | Estado: borrador, publicada, cerrada, anulada |
| programa_academico_id | INT | 11 | DEFAULT NULL, FOREIGN KEY → PROGRAMAS_ACADEMICOS.id | Programa relacionado (opcional) |
| cupos | INT | 11 | DEFAULT NULL | Número de vacantes disponibles |
| sede | VARCHAR | 255 | DEFAULT NULL | Sede donde se desarrollará el cargo |
| dedicacion | VARCHAR | 255 | DEFAULT NULL | Dedicación (Tiempo Completo, Medio Tiempo, etc.) |
| tipo_vinculacion | VARCHAR | 255 | DEFAULT NULL | Tipo (Laboral, Contrato, Cátedra, etc.) |
| requisitos_documentales | LONGTEXT | - | DEFAULT NULL, CHECK JSON_VALID | Array JSON de documentos requeridos |
| min_puntaje_aprobacion_documental | FLOAT | - | DEFAULT 0 | Puntaje mínimo para pasar revisión documental |
| min_puntaje_aprobacion_tecnica | FLOAT | - | DEFAULT 0 | Puntaje mínimo para pasar evaluación técnica |
| created_at | DATETIME | - | DEFAULT CURRENT_TIMESTAMP | Fecha de creación |
| updated_at | DATETIME | - | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Fecha de última actualización |

### 5.6 Tabla: POSTULACIONES

| Columna | Tipo de Dato | Tamaño | Restricciones | Descripción |
|---------|--------------|--------|---|---|
| id | INT | 11 | PRIMARY KEY, AUTO_INCREMENT | Identificador único de postulación |
| postulante_id | INT | 11 | NOT NULL, FOREIGN KEY → USUARIOS.id | Usuario que se postula |
| convocatoria_id | INT | 11 | NOT NULL, FOREIGN KEY → CONVOCATORIAS.id | Convocatoria a la que se postula |
| programa_id | INT | 11 | DEFAULT NULL, FOREIGN KEY → PROGRAMAS_ACADEMICOS.id | Programa específico (flexible) |
| fecha_postulacion | DATETIME | - | DEFAULT CURRENT_TIMESTAMP | Fecha de creación de postulación |
| estado | VARCHAR | 50 | DEFAULT 'borrador' | Estado: borrador, EN_REVISION, aceptada, rechazada, etc. |
| disponibilidad_horaria | VARCHAR | 255 | DEFAULT NULL | Descripción de disponibilidad (ej: "Disponible jornada diurna") |
| puntaje_documental | FLOAT | - | DEFAULT 0 | Puntaje de revisión documental |
| puntaje_tecnico | FLOAT | - | DEFAULT 0 | Puntaje de evaluación técnica |
| puntaje_total | FLOAT | - | DEFAULT 0 | Suma de puntajes (calculado) |
| observaciones | TEXT | - | DEFAULT NULL | Notas del evaluador/administrador |
| submitted_at | DATETIME | - | DEFAULT NULL | Timestamp de envío oficial |
| reviewed_at | DATETIME | - | DEFAULT NULL | Timestamp de revisión documental |
| evaluated_at | DATETIME | - | DEFAULT NULL | Timestamp de evaluación técnica |
| created_at | DATETIME | - | DEFAULT CURRENT_TIMESTAMP | Creación del registro |
| updated_at | DATETIME | - | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Última actualización |

### 5.7 Tabla: DOCUMENTOS

| Columna | Tipo de Dato | Tamaño | Restricciones | Descripción |
|---------|--------------|--------|---|---|
| id | INT | 11 | PRIMARY KEY, AUTO_INCREMENT | Identificador único del documento |
| postulacion_id | INT | 11 | NOT NULL, FOREIGN KEY → POSTULACIONES.id | Postulación a la que pertenece |
| nombre_documento | VARCHAR | 255 | NOT NULL | Tipo/nombre del documento (ej: "Hoja de vida") |
| ruta_archivo | VARCHAR | 500 | NOT NULL | Ruta del archivo almacenado en el servidor |

### 5.8 Tabla: ITEMS_EVALUACION

| Columna | Tipo de Dato | Tamaño | Restricciones | Descripción |
|---------|--------------|--------|---|---|
| id | INT | 11 | PRIMARY KEY, AUTO_INCREMENT | Identificador único del criterio |
| nombre_item | VARCHAR | 255 | NOT NULL | Nombre del criterio (ej: "Formación académica") |
| descripcion | TEXT | - | NOT NULL | Descripción detallada del criterio |

### 5.9 Tabla: BAREMO_CONVOCATORIA

| Columna | Tipo de Dato | Tamaño | Restricciones | Descripción |
|---------|--------------|--------|---|---|
| id | INT | 11 | PRIMARY KEY, AUTO_INCREMENT | Identificador único |
| convocatoria_id | INT | 11 | NOT NULL, FOREIGN KEY → CONVOCATORIAS.id | Convocatoria a evaluar |
| item_evaluacion_id | INT | 11 | NOT NULL, FOREIGN KEY → ITEMS_EVALUACION.id | Criterio de evaluación |
| puntaje_maximo | FLOAT | - | NOT NULL | Puntuación máxima posible para este criterio |

### 5.10 Tabla: EVALUACIONES

| Columna | Tipo de Dato | Tamaño | Restricciones | Descripción |
|---------|--------------|--------|---|---|
| id | INT | 11 | PRIMARY KEY, AUTO_INCREMENT | Identificador único de evaluación |
| postulacion_id | INT | 11 | NOT NULL, FOREIGN KEY → POSTULACIONES.id | Postulación evaluada |
| evaluador_id | INT | 11 | NOT NULL, FOREIGN KEY → USUARIOS.id | Usuario evaluador |
| fecha | DATETIME | - | NOT NULL | Fecha/hora de la evaluación |
| puntaje_total | FLOAT | - | NOT NULL | Puntaje asignado en esta evaluación |

### 5.11 Tabla: ASIGNACIONES

| Columna | Tipo de Dato | Tamaño | Restricciones | Descripción |
|---------|--------------|--------|---|---|
| id | INT | 11 | PRIMARY KEY, AUTO_INCREMENT | Identificador único de asignación |
| evaluador_id | INT | 11 | NOT NULL, FOREIGN KEY → USUARIOS.id | Evaluador asignado |
| postulacion_id | INT | 11 | NOT NULL, FOREIGN KEY → POSTULACIONES.id | Postulación a evaluar |
| created_at | DATETIME | - | DEFAULT CURRENT_TIMESTAMP | Fecha de asignación |
| **UNIQUE** | - | - | **UQ(evaluador_id, postulacion_id)** | **Evita asignar 2 veces al mismo evaluador** |

---

## 6. CONCLUSIONES DEL DISEÑO

✅ **Fortalezas:**
1. Cumple 1NF, 2NF y 3NF completamente
2. Separa conceptos claramente (usuarios, roles, postulaciones, evaluaciones)
3. Permite flexibilidad (programa_id opcional en postulaciones)
4. Auditoría completa con timestamps
5. Integridad referencial con cascadas apropiadas

⚠️ **Consideraciones:**
1. Puntajes se recalculan (redundancia intencional para denormalización)
2. JSON para requisitos documentales es flexible pero requiere validación en aplicación
3. Estados de postulación como VARCHAR permite flexibilidad de estados

🔐 **Seguridad:**
1. No almacenamos contraseñas en texto plano (solo hash)
2. Campos de auditoría para rastreo
3. Restricciones de integridad referencial (ON DELETE CASCADE/SET NULL)

---

