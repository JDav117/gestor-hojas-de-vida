# GUÍA RÁPIDA - CÓMO USAR EL PROYECTO

## Gestor de Hojas de Vida - Examen Final de Base de Datos

---

## 📦 OPCIÓN 1: Ejecutar con Docker (RECOMENDADO)

### Requisitos Previos
- Docker Desktop instalado
- Docker Compose v2.0+

### Pasos

```bash
# 1. Navegar al directorio del proyecto
cd gestor-hojas-de-vida

# 2. Crear archivo .env.production con contraseñas seguras
# (Copiar .env.production y cambiar las contraseñas)
cp .env.production .env.production.local

# 3. Editar contraseñas (mínimo 32 caracteres)
# Generar contraseñas seguras:
openssl rand -base64 32

# 4. Construir las imágenes Docker
docker-compose build

# 5. Iniciar los servicios
docker-compose up -d

# 6. Verificar estado de servicios
docker-compose ps

# Ver logs
docker-compose logs -f db

# Acceder a PhpMyAdmin (desarrollo)
docker-compose --profile dev up -d phpmyadmin
# URL: http://localhost:8080
```

### Verificar que Todo Funciona

```bash
# Verificar MySQL está listo
docker-compose exec db mysql -u root -p -e "SHOW DATABASES;"

# Verificar que la aplicación conecta a la BD
docker-compose logs app | grep "connected to database"

# Detener servicios cuando termines
docker-compose down
```

---

## 📋 OPCIÓN 2: Ejecutar Scripts SQL Directamente

### Requisitos Previos
- MySQL 8.0+ instalado
- Cliente de MySQL (MySQL Workbench, DBeaver, etc.)

### Pasos

```bash
# 1. Abrir cliente MySQL
# Opción: MySQL Workbench → File → Open SQL Script

# 2. Importar scripts en este orden:
#    a) FASE2_SCRIPT_IMPLEMENTACION.sql
#       - Crea base de datos
#       - Crea tablas
#       - Inserta datos de prueba
#       - Crea vistas
#       - Crea procedimientos almacenados

#    b) FASE4_OPTIMIZACION_CONSULTAS.sql
#       - Crea índices
#       - Crea triggers
#       - Crea funciones
#       - Crea tabla de auditoría

# 3. Ejecutar los scripts
# En MySQL Workbench: Query → Execute All
# O en terminal:
mysql -u root -p < FASE2_SCRIPT_IMPLEMENTACION.sql
mysql -u root -p < FASE4_OPTIMIZACION_CONSULTAS.sql
```

---

## 🔍 VERIFICAR INSTALACIÓN

Después de ejecutar los scripts, verificar que todo está correcto:

```sql
-- Conectar a la base de datos
USE gestor_hojas_de_vida;

-- 1. Verificar que existen todas las tablas
SHOW TABLES;

-- 2. Contar registros de prueba
SELECT COUNT(*) AS total_usuarios FROM usuarios;
SELECT COUNT(*) AS total_postulaciones FROM postulaciones;
SELECT COUNT(*) AS total_evaluaciones FROM evaluaciones;

-- 3. Verificar vistas
SELECT * FROM vw_postulaciones_por_convocatoria LIMIT 1;
SELECT * FROM vw_desempeno_evaluadores LIMIT 1;

-- 4. Verificar procedimientos
SHOW PROCEDURE STATUS WHERE Db = 'gestor_hojas_de_vida';

-- 5. Verificar triggers
SHOW TRIGGERS;

-- 6. Verificar índices
SHOW INDEX FROM postulaciones;
```

---

## 🧪 PROBAR PROCEDIMIENTOS ALMACENADOS

```sql
-- PROCEDIMIENTO 1: Registrar nuevo usuario
CALL sp_registrar_usuario(
  'Pedro',
  'Pérez',
  'pedro.perez@example.com',
  '$2b$10$hashedpasswordexample1234567890123456789',
  '1087654321',
  '3105551234',
  'POSTULANTE',
  @usuario_id,
  @mensaje
);

-- Ver resultado
SELECT @mensaje AS resultado, @usuario_id AS nuevo_usuario_id;

-- PROCEDIMIENTO 2: Procesar evaluación
CALL sp_procesar_evaluacion_postulacion(
  1,                    -- postulacion_id
  75.0,                 -- puntaje_documental
  82.0,                 -- puntaje_tecnico
  'Evaluación completada',
  60.0,                 -- min_puntaje_doc
  70.0,                 -- min_puntaje_tec
  @estado,
  @mensaje
);

-- Ver resultado
SELECT @estado AS nuevo_estado, @mensaje AS resultado;

-- PROCEDIMIENTO 3: Asignar evaluadores
CALL sp_asignar_evaluadores(
  1,                    -- postulacion_id
  JSON_ARRAY(2, 3),     -- array de evaluadores
  @asignaciones,
  @mensaje
);

-- Ver resultado
SELECT @asignaciones AS asignaciones_creadas, @mensaje AS resultado;

-- PROCEDIMIENTO 4: Generar reporte
CALL sp_generar_reporte_convocatoria(1);
```

---

## 📊 PROBAR VISTAS

```sql
-- Resumen de postulaciones por convocatoria
SELECT * FROM vw_postulaciones_por_convocatoria;

-- Desempeño de evaluadores
SELECT * FROM vw_desempeno_evaluadores;

-- Candidatos detallados
SELECT * FROM vw_candidatos_por_convocatoria
WHERE convocatoria_id = 1;

-- Baremos detallados
SELECT * FROM vw_baremos_detallado
WHERE convocatoria_id = 1;
```

---

## 🔧 PROBAR FUNCIONES UDF

```sql
-- Función: Categorizar candidato
SELECT 
  id,
  puntaje_total,
  fn_categoria_candidato(puntaje_total) AS categoria
FROM postulaciones;

-- Función: Validar email
SELECT 
  id,
  email,
  fn_validar_email(email) AS email_valido
FROM usuarios;

-- Función: Días desde un evento
SELECT 
  id,
  CONCAT(nombre, ' ', apellido) AS usuario,
  created_at,
  fn_dias_desde(created_at) AS dias_en_sistema
FROM usuarios;
```

---

## 📈 EJECUTAR CONSULTAS COMPLEJAS

```sql
-- CONSULTA 1: Candidatos seleccionables (listos para contratar)
SELECT * FROM (
  SELECT 
    po.id AS postulacion_id,
    CONCAT(u.nombre, ' ', u.apellido) AS candidato,
    c.nombre AS convocatoria,
    po.puntaje_total,
    fn_categoria_candidato(po.puntaje_total) AS categoria
  FROM postulaciones po
  INNER JOIN convocatorias c ON po.convocatoria_id = c.id
  INNER JOIN usuarios u ON po.postulante_id = u.id
  WHERE po.estado = 'ACEPTADA'
) resultados
ORDER BY puntaje_total DESC;

-- CONSULTA 2: Análisis de brecha
SELECT 
  po.id,
  CONCAT(u.nombre, ' ', u.apellido) AS candidato,
  c.nombre AS convocatoria,
  po.puntaje_documental,
  c.min_puntaje_aprobacion_documental,
  po.puntaje_tecnico,
  c.min_puntaje_aprobacion_tecnica,
  CASE 
    WHEN po.puntaje_documental < c.min_puntaje_aprobacion_documental 
      THEN CONCAT('Falta: ', c.min_puntaje_aprobacion_documental - po.puntaje_documental)
    WHEN po.puntaje_tecnico < c.min_puntaje_aprobacion_tecnica 
      THEN CONCAT('Falta: ', c.min_puntaje_aprobacion_tecnica - po.puntaje_tecnico)
    ELSE 'ELEGIBLE'
  END AS diagnostico
FROM postulaciones po
INNER JOIN convocatorias c ON po.convocatoria_id = c.id
INNER JOIN usuarios u ON po.postulante_id = u.id
WHERE po.estado != 'RECHAZADA';

-- CONSULTA 3: Desempeño de evaluadores
SELECT 
  u.id,
  CONCAT(u.nombre, ' ', u.apellido) AS evaluador,
  COUNT(DISTINCT a.id) AS asignaciones,
  COUNT(DISTINCT e.id) AS evaluaciones_completadas,
  COUNT(DISTINCT CASE WHEN e.id IS NULL THEN a.id END) AS pendientes
FROM usuarios u
INNER JOIN usuario_roles ur ON u.id = ur.usuario_id
INNER JOIN roles r ON ur.rol_id = r.id AND r.nombre_rol = 'EVALUADOR'
LEFT JOIN asignaciones a ON u.id = a.evaluador_id
LEFT JOIN evaluaciones e ON a.evaluador_id = e.evaluador_id
GROUP BY u.id, u.nombre, u.apellido
ORDER BY pendientes DESC;
```

---

## 🔐 SEGURIDAD Y USUARIOS

Los usuarios de base de datos creados son:

```sql
-- Usuario para aplicación (lectura + escritura en datos)
-- Usuario: ghv_app_user
-- Contraseña: app_secure_password_change_this
-- Privilegios: SELECT, INSERT, UPDATE, DELETE, EXECUTE

-- Usuario para reportes (solo lectura)
-- Usuario: ghv_report_user
-- Contraseña: report_secure_password_change_this
-- Privilegios: SELECT (solo)

-- Usuario para backups
-- Usuario: ghv_backup_user
-- Contraseña: backup_secure_password_change_this
-- Privilegios: SELECT, LOCK TABLES

-- Root: solo desde localhost
```

---

## 💾 BACKUPS Y RECUPERACIÓN

```bash
# Crear respaldo de la base de datos
mysqldump -u root -p gestor_hojas_de_vida > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar desde respaldo
mysql -u root -p gestor_hojas_de_vida < backup_20250109_143000.sql

# Con Docker
docker-compose exec -T db mysqldump -u root -p${DB_ROOT_PASSWORD} \
  gestor_hojas_de_vida > backup_docker_$(date +%Y%m%d).sql
```

---

## 🐛 TROUBLESHOOTING

### Error: "Connection refused"
```bash
# Verificar que MySQL está corriendo
docker-compose ps

# Reiniciar servicios
docker-compose restart db
```

### Error: "Syntax error in SQL"
```bash
# Verificar que estás usando MySQL 8.0+
mysql --version

# Asegúrate de que la base de datos existe
CREATE DATABASE gestor_hojas_de_vida CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Error: "Access denied"
```bash
# Verificar credenciales en .env
cat .env.production

# Intentar con root
mysql -u root -p -h localhost
```

---

## 📚 ESTRUCTURA DE ARCHIVOS

```
gestor-hojas-de-vida/
│
├── FASE1_DISEÑO_NORMALIZACION.md          ← Leer primero
├── FASE2_SCRIPT_IMPLEMENTACION.sql        ← Ejecutar segundo
├── FASE3_DOCKER_SEGURIDAD.md              ← Referencia
├── FASE4_OPTIMIZACION_CONSULTAS.sql       ← Ejecutar tercero
├── RESUMEN_EXAMEN_FINAL.md                ← Resumen ejecutivo
│
├── docker-compose.yml                      ← Configuración Docker
├── Dockerfile.mysql                        ← Imagen MySQL
├── Dockerfile.app                          ← Imagen NestJS
│
├── .env.production                         ← Variables producción
├── .env.development                        ← Variables desarrollo
│
└── docker-config/
    └── mysql.cnf                           ← Configuración MySQL
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] Leer FASE1_DISEÑO_NORMALIZACION.md
- [ ] Ejecutar FASE2_SCRIPT_IMPLEMENTACION.sql
- [ ] Verificar tablas y datos en MySQL
- [ ] Probar vistas (vw_postulaciones_por_convocatoria, etc.)
- [ ] Probar procedimientos (sp_registrar_usuario, etc.)
- [ ] Ejecutar FASE4_OPTIMIZACION_CONSULTAS.sql
- [ ] Probar funciones (fn_categoria_candidato, etc.)
- [ ] Probar triggers (verificar actualización de puntaje_total)
- [ ] Ejecutar consultas complejas
- [ ] Construir imágenes Docker
- [ ] Ejecutar docker-compose up
- [ ] Verificar que la aplicación conecta a BD

---

## 🎓 RESUMEN

Este proyecto implementa una base de datos completa y profesional para un Sistema de Gestión de Hojas de Vida con:

✅ Diseño normalizado (1NF, 2NF, 3NF)  
✅ 11 tablas con integridad referencial  
✅ Vistas para consultas comunes  
✅ Procedimientos almacenados para lógica compleja  
✅ Triggers para validación automática  
✅ Funciones para operaciones repetidas  
✅ Índices estratégicos para rendimiento  
✅ Dockerización completa  
✅ Seguridad a múltiples niveles  
✅ Documentación extensiva  

**Tiempo de implementación:** ~2-3 horas  
**Nivel de dificultad:** Intermedio-Avanzado  

---

¡Listo para usar! 🚀

