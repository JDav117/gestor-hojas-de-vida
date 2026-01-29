# REFERENCIA RÁPIDA - COMANDOS Y CONSULTAS

## Gestor de Hojas de Vida - Cheat Sheet

---

## 🐳 COMANDOS DOCKER

```bash
# Construir imágenes
docker-compose build

# Iniciar servicios
docker-compose up -d

# Ver estado
docker-compose ps

# Ver logs
docker-compose logs -f db
docker-compose logs -f app

# Detener servicios
docker-compose down

# Eliminar todo (CUIDADO: borra datos)
docker-compose down -v

# Reiniciar un servicio
docker-compose restart db

# Ejecutar comando en contenedor
docker-compose exec db mysql -u root -p

# Development con PhpMyAdmin
docker-compose --profile dev up -d phpmyadmin
# URL: http://localhost:8080
```

---

## 💾 COMANDOS MySQL

### Conexión Directa
```bash
# Conectar como root
mysql -h localhost -u root -p

# Conectar como usuario de aplicación
mysql -h localhost -u ghv_app_user -p gestor_hojas_de_vida

# Ejecutar script
mysql -u root -p < FASE2_SCRIPT_IMPLEMENTACION.sql
```

### Dentro de MySQL
```sql
-- Ver base de datos actual
SELECT DATABASE();

-- Seleccionar BD
USE gestor_hojas_de_vida;

-- Ver todas las tablas
SHOW TABLES;

-- Contar registros en tabla
SELECT COUNT(*) FROM usuarios;

-- Ver estructura de tabla
DESCRIBE postulaciones;
DESC postulaciones;

-- Ver todas las vistas
SHOW FULL TABLES WHERE TABLE_TYPE LIKE 'VIEW';

-- Ver procedimientos
SHOW PROCEDURE STATUS WHERE Db = 'gestor_hojas_de_vida';

-- Ver triggers
SHOW TRIGGERS;

-- Ver índices
SHOW INDEX FROM postulaciones;

-- Salir
EXIT; o quit;
```

---

## 📊 CONSULTAS ÚTILES

### Verificar Instalación

```sql
USE gestor_hojas_de_vida;

-- 1. Contar registros por tabla
SELECT 'usuarios' as tabla, COUNT(*) as registros FROM usuarios
UNION ALL
SELECT 'postulaciones', COUNT(*) FROM postulaciones
UNION ALL
SELECT 'evaluaciones', COUNT(*) FROM evaluaciones
UNION ALL
SELECT 'documentos', COUNT(*) FROM documentos
UNION ALL
SELECT 'convocatorias', COUNT(*) FROM convocatorias;

-- 2. Verificar vistas
SELECT * FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'gestor_hojas_de_vida' 
AND TABLE_TYPE = 'VIEW';

-- 3. Verificar procedimientos
SELECT ROUTINE_NAME FROM information_schema.ROUTINES 
WHERE ROUTINE_SCHEMA = 'gestor_hojas_de_vida' 
AND ROUTINE_TYPE = 'PROCEDURE';

-- 4. Verificar triggers
SELECT TRIGGER_NAME, TRIGGER_TABLE, ACTION_STATEMENT 
FROM information_schema.TRIGGERS 
WHERE TRIGGER_SCHEMA = 'gestor_hojas_de_vida';
```

### Consultas de Negocio

```sql
-- Postulaciones por estado
SELECT estado, COUNT(*) as cantidad
FROM postulaciones
GROUP BY estado
ORDER BY cantidad DESC;

-- Convocatorias y cuántos candidatos
SELECT c.nombre, COUNT(po.id) as postulantes, c.cupos
FROM convocatorias c
LEFT JOIN postulaciones po ON c.id = po.convocatoria_id
GROUP BY c.id, c.nombre, c.cupos;

-- Candidatos aceptados
SELECT CONCAT(u.nombre, ' ', u.apellido) as candidato, 
       c.nombre as convocatoria,
       po.puntaje_total
FROM postulaciones po
INNER JOIN usuarios u ON po.postulante_id = u.id
INNER JOIN convocatorias c ON po.convocatoria_id = c.id
WHERE po.estado = 'ACEPTADA'
ORDER BY po.puntaje_total DESC;

-- Evaluadores y carga de trabajo
SELECT CONCAT(u.nombre, ' ', u.apellido) as evaluador,
       COUNT(DISTINCT a.id) as asignaciones,
       COUNT(DISTINCT e.id) as evaluaciones_hechas
FROM usuarios u
LEFT JOIN asignaciones a ON u.id = a.evaluador_id
LEFT JOIN evaluaciones e ON u.id = e.evaluador_id
WHERE u.id IN (SELECT usuario_id FROM usuario_roles WHERE rol_id = 2)
GROUP BY u.id, u.nombre, u.apellido;
```

### Usar Vistas

```sql
-- Ver postulaciones por convocatoria
SELECT * FROM vw_postulaciones_por_convocatoria;

-- Ver desempeño de evaluadores
SELECT * FROM vw_desempeno_evaluadores;

-- Ver candidatos por convocatoria
SELECT * FROM vw_candidatos_por_convocatoria WHERE convocatoria_id = 1;

-- Ver baremos
SELECT * FROM vw_baremos_detallado WHERE convocatoria_id = 1;
```

---

## 🔧 EJECUTAR PROCEDIMIENTOS

```sql
-- Registrar nuevo usuario
CALL sp_registrar_usuario(
  'Nombre',
  'Apellido',
  'email@example.com',
  '$2b$10$hashedpassword123456789012345678901234567890',
  '1234567890',
  '3105551234',
  'POSTULANTE',
  @usuario_id,
  @mensaje
);
SELECT @usuario_id, @mensaje;

-- Procesar evaluación
CALL sp_procesar_evaluacion_postulacion(
  1,     -- postulacion_id
  75.0,  -- puntaje_documental
  82.0,  -- puntaje_tecnico
  'Notas de evaluación',
  60.0,  -- min_puntaje_doc
  70.0,  -- min_puntaje_tec
  @estado,
  @mensaje
);
SELECT @estado, @mensaje;

-- Asignar evaluadores
CALL sp_asignar_evaluadores(
  1,                 -- postulacion_id
  JSON_ARRAY(2, 3),  -- array de evaluadores
  @asignaciones,
  @mensaje
);
SELECT @asignaciones, @mensaje;

-- Generar reporte
CALL sp_generar_reporte_convocatoria(1);
```

---

## 🎯 USAR FUNCIONES

```sql
-- Categorizar candidatos
SELECT 
  id,
  puntaje_total,
  fn_categoria_candidato(puntaje_total) as categoria
FROM postulaciones
WHERE puntaje_total > 0;

-- Validar emails
SELECT 
  id,
  email,
  fn_validar_email(email) as email_valido
FROM usuarios;

-- Días en sistema
SELECT 
  CONCAT(nombre, ' ', apellido) as usuario,
  created_at,
  fn_dias_desde(created_at) as dias_en_sistema
FROM usuarios;
```

---

## 🔍 ANÁLISIS DE RENDIMIENTO

```sql
-- Ver cómo ejecuta una query
EXPLAIN SELECT 
  po.id, 
  u.nombre, 
  c.nombre 
FROM postulaciones po
INNER JOIN usuarios u ON po.postulante_id = u.id
INNER JOIN convocatorias c ON po.convocatoria_id = c.id
WHERE po.postulante_id = 1
AND po.estado = 'EN_REVISION';

-- Ver con más detalle (JSON)
EXPLAIN FORMAT=JSON SELECT ...;

-- Ver qué índices existen
SHOW INDEX FROM postulaciones;

-- Ver estadísticas de tabla
ANALYZE TABLE postulaciones;
SELECT * FROM information_schema.STATISTICS 
WHERE TABLE_NAME = 'postulaciones';
```

---

## 💾 BACKUPS Y RESTAURACIÓN

```bash
# Crear respaldo
mysqldump -u root -p gestor_hojas_de_vida > backup.sql

# Crear respaldo de estructura solo
mysqldump -u root -p --no-data gestor_hojas_de_vida > schema.sql

# Crear respaldo de datos solo
mysqldump -u root -p --no-create-info gestor_hojas_de_vida > datos.sql

# Restaurar
mysql -u root -p gestor_hojas_de_vida < backup.sql

# Con Docker
docker-compose exec -T db mysqldump -u root -p${DB_ROOT_PASSWORD} \
  gestor_hojas_de_vida > backup_docker.sql
```

---

## 🔒 GESTIÓN DE USUARIOS

```sql
-- Ver usuarios creados
SELECT User, Host FROM mysql.user;

-- Ver privilegios de usuario
SHOW GRANTS FOR 'ghv_app_user'@'%';

-- Crear nuevo usuario
CREATE USER 'nuevo_usuario'@'localhost' IDENTIFIED BY 'contraseña_segura';

-- Asignar privilegios
GRANT SELECT ON gestor_hojas_de_vida.* TO 'nuevo_usuario'@'localhost';

-- Cambiar contraseña
ALTER USER 'usuario'@'localhost' IDENTIFIED BY 'nueva_contraseña';

-- Eliminar usuario
DROP USER 'usuario'@'localhost';

-- Refrescar privilegios
FLUSH PRIVILEGES;
```

---

## 📋 ÍNDICES

```sql
-- Crear índice
CREATE INDEX idx_ejemplo ON usuarios(email);

-- Crear índice único
CREATE UNIQUE INDEX uq_email ON usuarios(email);

-- Crear índice compuesto
CREATE INDEX idx_combo ON postulaciones(postulante_id, estado);

-- Ver índices de tabla
SHOW INDEX FROM postulaciones;

-- Eliminar índice
DROP INDEX idx_ejemplo ON usuarios;

-- Forzar uso de índice en query
SELECT * FROM postulaciones USE INDEX (idx_postulaciones_postulante_estado)
WHERE postulante_id = 1;

-- Ver si se usa el índice
EXPLAIN SELECT ... \G
```

---

## 🐛 DEBUGGING

```sql
-- Ver últimos errores
SHOW ENGINE INNODB STATUS\G

-- Ver conexiones activas
SHOW PROCESSLIST;

-- Ver variables de sesión
SHOW VARIABLES;

-- Ver tablas bloqueadas
SHOW OPEN TABLES WHERE In_use > 0;

-- Ver InnoDB status
SHOW ENGINE INNODB STATUS\G

-- Ver replicación status (si aplica)
SHOW SLAVE STATUS\G

-- Verificar integridad de tabla
CHECK TABLE postulaciones;

-- Reparar tabla (si está dañada)
REPAIR TABLE postulaciones;
```

---

## 🔄 TRANSACCIONES

```sql
-- Iniciar transacción
START TRANSACTION;

-- O también
BEGIN;

-- Hacer cambios
UPDATE postulaciones SET estado = 'ACEPTADA' WHERE id = 1;

-- Confirmar
COMMIT;

-- O deshacer
ROLLBACK;

-- Ver tabla de logs
SELECT * FROM audit_log ORDER BY fecha_operacion DESC LIMIT 10;
```

---

## 📊 ESTADÍSTICAS RÁPIDAS

```sql
-- Tamaño de base de datos
SELECT 
  table_schema,
  ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) as size_mb
FROM information_schema.tables
WHERE table_schema = 'gestor_hojas_de_vida'
GROUP BY table_schema;

-- Tamaño por tabla
SELECT 
  table_name,
  ROUND(data_length / 1024 / 1024, 2) as data_mb,
  ROUND(index_length / 1024 / 1024, 2) as index_mb
FROM information_schema.tables
WHERE table_schema = 'gestor_hojas_de_vida'
ORDER BY data_length DESC;

-- Registros por tabla
SELECT 
  table_name,
  table_rows
FROM information_schema.tables
WHERE table_schema = 'gestor_hojas_de_vida'
ORDER BY table_rows DESC;
```

---

## 🚀 PERFORMANCE TUNING

```sql
-- Analizar tabla para mejor índice usage
ANALYZE TABLE postulaciones;
ANALYZE TABLE usuarios;
ANALYZE TABLE evaluaciones;

-- Optimizar tabla (reorganiza y libera espacio)
OPTIMIZE TABLE postulaciones;

-- Ver fragmentación
SELECT 
  object_schema,
  object_name,
  count_read,
  count_write,
  count_delete
FROM performance_schema.table_io_waits_summary_by_table
WHERE object_schema = 'gestor_hojas_de_vida'
ORDER BY count_read + count_write DESC;
```

---

## ⚠️ MANTENIMIENTO

```bash
# Hacer respaldo periódico
# Linux/Mac: Agregar a crontab
0 2 * * * mysqldump -u root -p${DB_PASSWORD} gestor_hojas_de_vida > /backups/db_$(date +\%Y\%m\%d).sql

# Windows: Agregar a Task Scheduler
# Script: mysqldump -u root -p... > C:\backups\db_%date:~-4,4%%date:~-10,2%%date:~-7,2%.sql

# Verificar integridad diaria
CHECK TABLE usuarios, postulaciones, evaluaciones;

# Ver logs lentamente
SHOW VARIABLES LIKE 'slow_query%';
SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 10;
```

---

## ✅ CHECKLIST DIARIO

- [ ] Verificar que BD está accesible
- [ ] Revisar tabla audit_log para cambios importantes
- [ ] Verificar PROCESSLIST para queries largas
- [ ] Revisar logs de error
- [ ] Hacer respaldo si es necesario

---

**Imprime esta página como referencia rápida** 📄

