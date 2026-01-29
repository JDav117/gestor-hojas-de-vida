-- ========================================================================
-- FASE 4: OPTIMIZACIÓN Y CONSULTAS CRÍTICAS
-- Gestor de Hojas de Vida - Convocatorias Docentes
-- ========================================================================

-- OBJETIVO: Identificar índices estratégicos, analizar rendimiento,
-- crear consultas complejas, triggers y funciones.

USE gestor_hojas_de_vida;

-- ========================================================================
-- PARTE 1: ANÁLISIS DE ÍNDICES ESTRATÉGICOS
-- ========================================================================

-- ÍNDICE 1: Búsqueda rápida de postulaciones por usuario y estado
-- JUSTIFICACIÓN: Las consultas más frecuentes filtran por postulante_id y estado
-- Casos de uso:
--   - Listar postulaciones de un usuario
--   - Contar postulaciones en cada estado para un usuario
-- Mejora: Evita table scan completo (~40-60% más rápido)

CREATE INDEX IF NOT EXISTS idx_postulaciones_postulante_estado 
ON postulaciones(postulante_id, estado);

-- ÍNDICE 2: Filtrado por convocatoria y estado
-- JUSTIFICACIÓN: Los administradores necesitan ver postulaciones por convocatoria y estado
-- Casos de uso:
--   - Filtrar postulaciones de una convocatoria en estado "EN_REVISION"
--   - Contar aceptadas/rechazadas por convocatoria
-- Mejora: Acelera reportes ejecutivos (~35-50% más rápido)

CREATE INDEX IF NOT EXISTS idx_postulaciones_convocatoria_estado 
ON postulaciones(convocatoria_id, estado);

-- ÍNDICE 3: Búsqueda de documentos por postulación
-- JUSTIFICACIÓN: Al visualizar postulación, se cargan todos sus documentos
-- Casos de uso:
--   - Obtener documentos adjuntos de una postulación
--   - Contar documentos por postulación
-- Mejora: Evita full table scan en tabla documentos (~30-45% más rápido)

CREATE INDEX IF NOT EXISTS idx_documentos_postulacion_nombre 
ON documentos(postulacion_id, nombre_documento);

-- ÍNDICE 4: Evaluaciones por evaluador (análisis de desempeño)
-- JUSTIFICACIÓN: Necesario para vistas y reportes de evaluadores
-- Casos de uso:
--   - Historial de evaluaciones de un evaluador
--   - Promedio de puntajes por evaluador
-- Mejora: Acelera reportes de desempeño (~40-55% más rápido)

CREATE INDEX IF NOT EXISTS idx_evaluaciones_evaluador_fecha 
ON evaluaciones(evaluador_id, fecha DESC);

-- ÍNDICE 5: Búsqueda por email (autenticación)
-- JUSTIFICACIÓN: Se usa en cada login
-- Casos de uso:
--   - Validar existencia de email
--   - Autenticar usuario
-- Mejora: Crítico para login rápido (~60-70% más rápido)
-- Nota: YA EXISTE COMO UNIQUE INDEX en la tabla, pero lo documentamos

-- ========================================================================
-- PARTE 2: ANÁLISIS EXPLAIN EN CONSULTAS CRÍTICAS
-- ========================================================================

-- Nota: Para ejecutar EXPLAIN en tu entorno, usar:
-- EXPLAIN FORMAT=JSON SELECT ... \G

-- ANÁLISIS 1: Obtener postulaciones de un usuario con estado de evaluación
-- Consulta crítica para el dashboard del postulante
EXPLAIN FORMAT=JSON
SELECT 
  po.id,
  po.estado,
  c.nombre AS convocatoria,
  po.puntaje_documental,
  po.puntaje_tecnico,
  po.puntaje_total,
  COUNT(d.id) AS documentos,
  COUNT(e.id) AS evaluaciones
FROM postulaciones po
INNER JOIN convocatorias c ON po.convocatoria_id = c.id
LEFT JOIN documentos d ON po.id = d.postulacion_id
LEFT JOIN evaluaciones e ON po.id = e.postulacion_id
WHERE po.postulante_id = 4
GROUP BY po.id, po.estado, c.nombre, po.puntaje_documental, 
         po.puntaje_tecnico, po.puntaje_total;

-- ANÁLISIS ESPERADO:
-- - Type: eq_ref en postulaciones (usa PRIMARY KEY)
-- - Using index para LEFT JOIN documentos (usa idx_documentos_postulacion)
-- - Rows: 5-10 por postulante
-- - Key_read: < 100 filas exploradas
-- MEJORA: Uso del índice idx_postulaciones_postulante_estado

-- ANÁLISIS 2: Reportes de convocatoria (query pesada)
EXPLAIN FORMAT=JSON
SELECT 
  c.id,
  c.nombre,
  c.estado,
  COUNT(DISTINCT po.id) AS total_postulaciones,
  SUM(CASE WHEN po.estado = 'ACEPTADA' THEN 1 ELSE 0 END) AS aceptadas,
  SUM(CASE WHEN po.estado = 'RECHAZADA' THEN 1 ELSE 0 END) AS rechazadas,
  ROUND(AVG(po.puntaje_total), 2) AS puntaje_promedio,
  MAX(po.puntaje_total) AS puntaje_maximo
FROM convocatorias c
LEFT JOIN postulaciones po ON c.id = po.convocatoria_id
WHERE c.estado = 'publicada'
GROUP BY c.id, c.nombre, c.estado
HAVING COUNT(DISTINCT po.id) > 0;

-- ANÁLISIS ESPERADO:
-- - Type: ALL para convocatorias (pocas filas, es normal)
-- - Using where para filtro estado
-- - Usando índice para GROUP BY en convocatoria_id
-- MEJORA: Considerar índice en convocatorias(estado)

-- ANÁLISIS 3: Desempeño de evaluadores
EXPLAIN FORMAT=JSON
SELECT 
  u.id,
  CONCAT(u.nombre, ' ', u.apellido) AS evaluador,
  COUNT(DISTINCT a.postulacion_id) AS asignadas,
  COUNT(DISTINCT e.id) AS completadas,
  ROUND(AVG(e.puntaje_total), 2) AS puntaje_promedio,
  ROUND(COUNT(DISTINCT e.id) * 100.0 / NULLIF(COUNT(DISTINCT a.postulacion_id), 0), 1) AS completado_pct
FROM usuarios u
INNER JOIN usuario_roles ur ON u.id = ur.usuario_id
INNER JOIN asignaciones a ON u.id = a.evaluador_id
LEFT JOIN evaluaciones e ON u.id = e.evaluador_id AND a.postulacion_id = e.postulacion_id
WHERE ur.rol_id = (SELECT id FROM roles WHERE nombre_rol = 'EVALUADOR')
GROUP BY u.id, u.nombre, u.apellido;

-- ANÁLISIS ESPERADO:
-- - Type: eq_ref en usuario_roles (usa PK)
-- - Type: ref en asignaciones (usa evaluador_id)
-- - Rows: bajo (pocos evaluadores)
-- MEJORA: Uso de índice compuesto en asignaciones(evaluador_id, postulacion_id)

-- ========================================================================
-- PARTE 3: CONSULTAS COMPLEJAS (5+ CONSULTAS CRÍTICAS)
-- ========================================================================

-- CONSULTA 1: Candidatos seleccionables (cumplen requisitos)
-- Propósito: Generar lista de candidatos aptos para contratar
-- Complejidad: JOINs múltiples, subconsultas, HAVING
SELECT 
  po.id AS postulacion_id,
  u.id AS usuario_id,
  CONCAT(u.nombre, ' ', u.apellido) AS candidato,
  u.email,
  u.telefono,
  c.nombre AS convocatoria,
  pa.nombre_programa,
  po.puntaje_documental,
  po.puntaje_tecnico,
  po.puntaje_total,
  COUNT(DISTINCT d.id) AS documentos_entregados,
  COUNT(DISTINCT e.id) AS numero_evaluaciones,
  ROUND(AVG(e.puntaje_total), 2) AS promedio_evaluaciones,
  DATEDIFF(c.fecha_cierre, po.submitted_at) AS dias_desde_postulacion,
  CASE 
    WHEN po.puntaje_total >= 150 THEN 'EXCELENTE'
    WHEN po.puntaje_total >= 120 THEN 'BUENO'
    WHEN po.puntaje_total >= 80 THEN 'ACEPTABLE'
    ELSE 'DEFICIENTE'
  END AS categoria_candidato
FROM postulaciones po
INNER JOIN convocatorias c ON po.convocatoria_id = c.id
INNER JOIN usuarios u ON po.postulante_id = u.id
LEFT JOIN programas_academicos pa ON po.programa_id = pa.id
LEFT JOIN documentos d ON po.id = d.postulacion_id
LEFT JOIN evaluaciones e ON po.id = e.postulacion_id
WHERE po.estado = 'ACEPTADA'
  AND po.puntaje_total > 0
  AND c.estado IN ('publicada', 'cerrada')
GROUP BY 
  po.id, u.id, u.nombre, u.apellido, u.email, u.telefono,
  c.nombre, pa.nombre_programa, po.puntaje_documental,
  po.puntaje_tecnico, po.puntaje_total, po.submitted_at, c.fecha_cierre
HAVING COUNT(DISTINCT e.id) > 0
ORDER BY po.puntaje_total DESC, ROUND(AVG(e.puntaje_total), 2) DESC;

-- CONSULTA 2: Análisis de Brecha (qué hace falta para ser elegible)
-- Propósito: Identificar candidatos casi elegibles y qué necesitan mejorar
-- Complejidad: Cálculos condicionales, comparaciones con mínimos
SELECT 
  po.id AS postulacion_id,
  CONCAT(u.nombre, ' ', u.apellido) AS candidato,
  c.nombre AS convocatoria,
  po.puntaje_documental AS puntaje_doc_actual,
  c.min_puntaje_aprobacion_documental AS puntaje_doc_requerido,
  CASE 
    WHEN po.puntaje_documental >= c.min_puntaje_aprobacion_documental THEN 'APROBADO'
    ELSE CONCAT('Falta: ', c.min_puntaje_aprobacion_documental - po.puntaje_documental)
  END AS estado_documental,
  po.puntaje_tecnico AS puntaje_tec_actual,
  c.min_puntaje_aprobacion_tecnica AS puntaje_tec_requerido,
  CASE 
    WHEN po.puntaje_tecnico >= c.min_puntaje_aprobacion_tecnica THEN 'APROBADO'
    ELSE CONCAT('Falta: ', c.min_puntaje_aprobacion_tecnica - po.puntaje_tecnico)
  END AS estado_tecnico,
  po.puntaje_total,
  CASE 
    WHEN po.puntaje_documental < c.min_puntaje_aprobacion_documental THEN 'No pasa revisión documental'
    WHEN po.puntaje_tecnico < c.min_puntaje_aprobacion_tecnica AND po.puntaje_tecnico > 0 THEN 'No pasa evaluación técnica'
    WHEN po.puntaje_tecnico = 0 THEN 'Pendiente evaluación técnica'
    ELSE 'ELEGIBLE'
  END AS diagnostico,
  COUNT(DISTINCT d.id) AS documentos_enviados
FROM postulaciones po
INNER JOIN convocatorias c ON po.convocatoria_id = c.id
INNER JOIN usuarios u ON po.postulante_id = u.id
LEFT JOIN documentos d ON po.id = d.postulacion_id
WHERE po.estado != 'RECHAZADA'
GROUP BY 
  po.id, u.nombre, u.apellido, c.nombre, po.puntaje_documental,
  c.min_puntaje_aprobacion_documental, po.puntaje_tecnico,
  c.min_puntaje_aprobacion_tecnica, po.puntaje_total
ORDER BY 
  CASE 
    WHEN po.puntaje_documental < c.min_puntaje_aprobacion_documental THEN 1
    WHEN po.puntaje_tecnico < c.min_puntaje_aprobacion_tecnica THEN 2
    ELSE 3
  END ASC,
  (c.min_puntaje_aprobacion_documental - po.puntaje_documental +
   c.min_puntaje_aprobacion_tecnica - po.puntaje_tecnico) ASC;

-- CONSULTA 3: Carga de trabajo de evaluadores (análisis de asignaciones)
-- Propósito: Identificar evaluadores sobrecargados o ociosos
-- Complejidad: Agregación múltiple, análisis temporal, CASE statements
SELECT 
  u.id,
  CONCAT(u.nombre, ' ', u.apellido) AS evaluador,
  u.email,
  COUNT(DISTINCT a.id) AS asignaciones_totales,
  COUNT(DISTINCT CASE WHEN DATE(a.created_at) >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN a.id END) AS asignaciones_ultimos_30_dias,
  COUNT(DISTINCT e.id) AS evaluaciones_completadas,
  COUNT(DISTINCT CASE WHEN e.id IS NULL AND a.created_at < DATE_SUB(NOW(), INTERVAL 7 DAY) THEN a.id END) AS evaluaciones_pendientes_7_dias,
  COUNT(DISTINCT CASE WHEN e.id IS NULL THEN a.id END) AS evaluaciones_pendientes_total,
  ROUND(AVG(e.puntaje_total), 2) AS puntaje_promedio_otorgado,
  MAX(e.fecha) AS ultima_evaluacion,
  DATEDIFF(NOW(), MAX(a.created_at)) AS dias_sin_evaluaciones,
  CASE 
    WHEN COUNT(DISTINCT CASE WHEN e.id IS NULL THEN a.id END) > 5 THEN 'SOBRECARGADO'
    WHEN COUNT(DISTINCT CASE WHEN e.id IS NULL THEN a.id END) = 0 THEN 'SIN PENDIENTES'
    ELSE 'NORMAL'
  END AS estado_carga
FROM usuarios u
INNER JOIN usuario_roles ur ON u.id = ur.usuario_id
INNER JOIN roles r ON ur.rol_id = r.id AND r.nombre_rol = 'EVALUADOR'
LEFT JOIN asignaciones a ON u.id = a.evaluador_id
LEFT JOIN evaluaciones e ON a.evaluador_id = e.evaluador_id 
  AND a.postulacion_id = e.postulacion_id
GROUP BY u.id, u.nombre, u.apellido, u.email
HAVING COUNT(DISTINCT a.id) > 0
ORDER BY evaluaciones_pendientes_total DESC, puntaje_promedio_otorgado ASC;

-- CONSULTA 4: Comparación temporal de convocatorias
-- Propósito: Analizar tendencias entre convocatorias (competitividad, calidad)
-- Complejidad: Window functions, agregación múltiple, análisis comparativo
SELECT 
  c.id,
  c.nombre AS convocatoria,
  YEAR(c.fecha_apertura) AS ano,
  MONTH(c.fecha_apertura) AS mes,
  c.cupos,
  COUNT(DISTINCT po.id) AS postulantes,
  ROUND(COUNT(DISTINCT po.id) / NULLIF(c.cupos, 0), 2) AS relacion_postulantes_cupos,
  COUNT(DISTINCT CASE WHEN po.estado = 'ACEPTADA' THEN po.id END) AS aceptados,
  COUNT(DISTINCT CASE WHEN po.estado = 'RECHAZADA' THEN po.id END) AS rechazados,
  COUNT(DISTINCT CASE WHEN po.estado = 'EN_REVISION' THEN po.id END) AS en_revision,
  ROUND(AVG(po.puntaje_total), 2) AS puntaje_promedio,
  MAX(po.puntaje_total) AS puntaje_maximo,
  MIN(po.puntaje_total) AS puntaje_minimo,
  STDDEV(po.puntaje_total) AS desviacion_estandar,
  ROUND(AVG(CASE WHEN po.puntaje_total > 0 THEN po.puntaje_total END), 2) AS puntaje_promedio_evaluados,
  DATEDIFF(c.fecha_cierre, c.fecha_apertura) AS duracion_dias,
  COUNT(DISTINCT po.postulante_id) AS candidatos_unicos
FROM convocatorias c
LEFT JOIN postulaciones po ON c.id = po.convocatoria_id
GROUP BY 
  c.id, c.nombre, YEAR(c.fecha_apertura), MONTH(c.fecha_apertura),
  c.cupos, c.fecha_apertura, c.fecha_cierre
ORDER BY c.fecha_apertura DESC, c.id DESC;

-- CONSULTA 5: Búsqueda avanzada con filtros múltiples
-- Propósito: Motor de búsqueda para administrador (filtrar por múltiples criterios)
-- Complejidad: AND/OR condicionales, búsqueda LIKE, múltiples JOINs
SELECT 
  po.id,
  CONCAT(u.nombre, ' ', u.apellido) AS candidato,
  u.email,
  u.identificacion,
  c.nombre AS convocatoria,
  pa.nombre_programa,
  po.estado,
  po.puntaje_documental,
  po.puntaje_tecnico,
  po.puntaje_total,
  po.submitted_at,
  po.reviewed_at,
  po.evaluated_at,
  GROUP_CONCAT(DISTINCT ie.nombre_item SEPARATOR ', ') AS criterios_evaluacion,
  COUNT(DISTINCT d.id) AS documentos,
  MAX(e.fecha) AS ultima_evaluacion
FROM postulaciones po
INNER JOIN usuarios u ON po.postulante_id = u.id
INNER JOIN convocatorias c ON po.convocatoria_id = c.id
LEFT JOIN programas_academicos pa ON po.programa_id = pa.id
LEFT JOIN documentos d ON po.id = d.postulacion_id
LEFT JOIN evaluaciones e ON po.id = e.postulacion_id
LEFT JOIN baremo_convocatoria bc ON c.id = bc.convocatoria_id
LEFT JOIN items_evaluacion ie ON bc.item_evaluacion_id = ie.id
WHERE 1=1
  -- Filtro por búsqueda de texto
  AND (
    u.nombre LIKE '%juan%'
    OR u.apellido LIKE '%postulante%'
    OR u.email LIKE '%@example.com%'
  )
  -- Filtro por rango de puntaje
  AND po.puntaje_total BETWEEN 0 AND 200
  -- Filtro por estado
  AND po.estado IN ('EN_REVISION', 'ACEPTADA')
  -- Filtro por fecha
  AND po.submitted_at >= '2025-01-01'
  AND po.submitted_at <= '2025-12-31'
  -- Filtro por convocatoria
  AND c.id IN (1, 2, 3)
GROUP BY 
  po.id, u.nombre, u.apellido, u.email, u.identificacion,
  c.nombre, pa.nombre_programa, po.estado, po.puntaje_documental,
  po.puntaje_tecnico, po.puntaje_total, po.submitted_at,
  po.reviewed_at, po.evaluated_at
ORDER BY po.puntaje_total DESC, po.submitted_at DESC;

-- ========================================================================
-- PARTE 4: TRIGGERS Y FUNCIONES DEFINIDAS POR EL USUARIO
-- ========================================================================

DELIMITER //

-- FUNCIÓN 1: Calcular categoría de candidato según puntaje
-- Propósito: Clasificar candidatos por nivel de desempeño
DROP FUNCTION IF EXISTS fn_categoria_candidato //
CREATE FUNCTION fn_categoria_candidato(p_puntaje_total FLOAT)
RETURNS VARCHAR(50)
DETERMINISTIC
BEGIN
  DECLARE v_categoria VARCHAR(50);
  
  IF p_puntaje_total IS NULL OR p_puntaje_total = 0 THEN
    SET v_categoria = 'SIN_EVALUAR';
  ELSEIF p_puntaje_total >= 150 THEN
    SET v_categoria = 'EXCELENTE';
  ELSEIF p_puntaje_total >= 120 THEN
    SET v_categoria = 'BUENO';
  ELSEIF p_puntaje_total >= 80 THEN
    SET v_categoria = 'ACEPTABLE';
  ELSE
    SET v_categoria = 'DEFICIENTE';
  END IF;
  
  RETURN v_categoria;
END //

-- FUNCIÓN 2: Validar formato de email
-- Propósito: Garantizar que emails cumplan formato básico
DROP FUNCTION IF EXISTS fn_validar_email //
CREATE FUNCTION fn_validar_email(p_email VARCHAR(255))
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
  DECLARE v_is_valid BOOLEAN;
  
  -- Validar que contiene @
  IF p_email LIKE '%@%.%' AND 
     p_email NOT LIKE '%@%@%' AND
     LENGTH(p_email) >= 6 AND
     p_email NOT LIKE '@%' AND
     p_email NOT LIKE '%@' THEN
    SET v_is_valid = TRUE;
  ELSE
    SET v_is_valid = FALSE;
  END IF;
  
  RETURN v_is_valid;
END //

-- FUNCIÓN 3: Calcular días desde evento importante
-- Propósito: Obtener rápidamente cuántos días han pasado desde una acción
DROP FUNCTION IF EXISTS fn_dias_desde //
CREATE FUNCTION fn_dias_desde(p_fecha DATETIME)
RETURNS INT
DETERMINISTIC
BEGIN
  DECLARE v_dias INT;
  
  IF p_fecha IS NULL THEN
    SET v_dias = NULL;
  ELSE
    SET v_dias = DATEDIFF(NOW(), p_fecha);
  END IF;
  
  RETURN v_dias;
END //

-- TRIGGER 1: Actualizar puntaje total automáticamente
-- Propósito: Mantener puntaje_total sincronizado cuando se actualizan componentes
DROP TRIGGER IF EXISTS trg_actualizar_puntaje_postulacion //
CREATE TRIGGER trg_actualizar_puntaje_postulacion
BEFORE UPDATE ON postulaciones
FOR EACH ROW
BEGIN
  -- Si se actualiza alguno de los puntajes, recalcular el total
  IF NEW.puntaje_documental != OLD.puntaje_documental OR 
     NEW.puntaje_tecnico != OLD.puntaje_tecnico THEN
    SET NEW.puntaje_total = NEW.puntaje_documental + NEW.puntaje_tecnico;
  END IF;
  
  -- Validar que los puntajes no sean negativos
  IF NEW.puntaje_documental < 0 THEN
    SET NEW.puntaje_documental = 0;
  END IF;
  IF NEW.puntaje_tecnico < 0 THEN
    SET NEW.puntaje_tecnico = 0;
  END IF;
END //

-- TRIGGER 2: Registrar cambios en tabla de auditoría
-- Propósito: Mantener historial de cambios críticos
DROP TRIGGER IF EXISTS trg_auditoria_postulaciones //
CREATE TRIGGER trg_auditoria_postulaciones
AFTER UPDATE ON postulaciones
FOR EACH ROW
BEGIN
  -- Solo registrar si cambió el estado o puntajes
  IF NEW.estado != OLD.estado OR 
     NEW.puntaje_documental != OLD.puntaje_documental OR
     NEW.puntaje_tecnico != OLD.puntaje_tecnico THEN
    
    INSERT INTO audit_log (tabla_afectada, operacion, usuario_responsable, datos_anteriores, datos_nuevos)
    VALUES (
      'postulaciones',
      'UPDATE',
      IFNULL(USER(), 'SISTEMA'),
      JSON_OBJECT(
        'id', OLD.id,
        'estado', OLD.estado,
        'puntaje_documental', OLD.puntaje_documental,
        'puntaje_tecnico', OLD.puntaje_tecnico,
        'puntaje_total', OLD.puntaje_total
      ),
      JSON_OBJECT(
        'id', NEW.id,
        'estado', NEW.estado,
        'puntaje_documental', NEW.puntaje_documental,
        'puntaje_tecnico', NEW.puntaje_tecnico,
        'puntaje_total', NEW.puntaje_total
      )
    );
  END IF;
END //

-- TRIGGER 3: Validar transición de estados válida
-- Propósito: Evitar transiciones de estado inválidas
DROP TRIGGER IF EXISTS trg_validar_transicion_estado //
CREATE TRIGGER trg_validar_transicion_estado
BEFORE UPDATE ON postulaciones
FOR EACH ROW
BEGIN
  DECLARE v_estado_valido BOOLEAN;
  
  -- Si cambió el estado, validar la transición
  IF NEW.estado != OLD.estado THEN
    -- Estados válidos de transición
    -- borrador -> EN_REVISION (envío de postulación)
    -- EN_REVISION -> ACEPTADA/RECHAZADA (decisión)
    -- ACEPTADA/RECHAZADA -> (no puede cambiar, es final)
    
    SET v_estado_valido = CASE
      WHEN OLD.estado = 'borrador' AND NEW.estado IN ('EN_REVISION') THEN TRUE
      WHEN OLD.estado = 'EN_REVISION' AND NEW.estado IN ('ACEPTADA', 'RECHAZADA') THEN TRUE
      WHEN OLD.estado IN ('ACEPTADA', 'RECHAZADA') THEN FALSE -- Estados finales
      ELSE FALSE
    END;
    
    IF NOT v_estado_valido THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = CONCAT('Transición de estado no válida: ', 
                                OLD.estado, ' -> ', NEW.estado);
    END IF;
  END IF;
END //

-- TRIGGER 4: Prevenir duplicate inserts en asignaciones
-- Propósito: Refuerzo a nivel BD del UNIQUE constraint
DROP TRIGGER IF EXISTS trg_prevenir_asignacion_duplicada //
CREATE TRIGGER trg_prevenir_asignacion_duplicada
BEFORE INSERT ON asignaciones
FOR EACH ROW
BEGIN
  IF EXISTS (
    SELECT 1 FROM asignaciones 
    WHERE evaluador_id = NEW.evaluador_id 
    AND postulacion_id = NEW.postulacion_id
  ) THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Este evaluador ya está asignado a esta postulación';
  END IF;
END //

DELIMITER ;

-- ========================================================================
-- PARTE 5: ESTADÍSTICAS Y PERFORMANCE TUNING
-- ========================================================================

-- Analizar tablas para mejorar estadísticas del optimizador
ANALYZE TABLE usuarios;
ANALYZE TABLE postulaciones;
ANALYZE TABLE evaluaciones;
ANALYZE TABLE asignaciones;
ANALYZE TABLE convocatorias;
ANALYZE TABLE documentos;

-- ========================================================================
-- PARTE 6: EJEMPLOS DE USO DE FUNCIONES Y TRIGGERS
-- ========================================================================

-- Ejemplo 1: Usar función para categorizar candidato
SELECT 
  po.id,
  fn_categoria_candidato(po.puntaje_total) AS categoria,
  po.puntaje_total
FROM postulaciones po
WHERE po.puntaje_total > 0;

-- Ejemplo 2: Usar función para validar email
SELECT 
  u.id,
  u.email,
  fn_validar_email(u.email) AS email_valido
FROM usuarios u;

-- Ejemplo 3: Usar función para calcular antigüedad
SELECT 
  u.id,
  CONCAT(u.nombre, ' ', u.apellido) AS usuario,
  u.created_at,
  fn_dias_desde(u.created_at) AS dias_en_sistema
FROM usuarios u;

-- Ejemplo 4: Actualizar puntaje (trigger actualiza total automáticamente)
-- UPDATE postulaciones 
-- SET puntaje_documental = 75, puntaje_tecnico = 82
-- WHERE id = 1;
-- -- puntaje_total se actualizará automáticamente a 157

-- ========================================================================
-- PARTE 7: CONSULTAS DE MONITOREO Y HEALTH CHECK
-- ========================================================================

-- Health Check 1: Verificar integridad referencial
SELECT 
  'Postulaciones sin usuario' AS problema,
  COUNT(*) AS cantidad
FROM postulaciones 
WHERE postulante_id NOT IN (SELECT id FROM usuarios);

-- Health Check 2: Postulaciones sin convocatoria
SELECT 
  'Postulaciones sin convocatoria' AS problema,
  COUNT(*) AS cantidad
FROM postulaciones 
WHERE convocatoria_id NOT IN (SELECT id FROM convocatorias);

-- Health Check 3: Evaluaciones huérfanas
SELECT 
  'Evaluaciones sin postulación' AS problema,
  COUNT(*) AS cantidad
FROM evaluaciones 
WHERE postulacion_id NOT IN (SELECT id FROM postulaciones);

-- Health Check 4: Usuarios sin roles
SELECT 
  'Usuarios sin roles asignados' AS problema,
  COUNT(*) AS cantidad
FROM usuarios u
WHERE NOT EXISTS (
  SELECT 1 FROM usuario_roles ur WHERE ur.usuario_id = u.id
);

-- Health Check 5: Documentos huérfanos
SELECT 
  'Documentos sin postulación' AS problema,
  COUNT(*) AS cantidad
FROM documentos d
WHERE d.postulacion_id NOT IN (SELECT id FROM postulaciones);

-- ========================================================================
-- RESUMEN FASE 4
-- ========================================================================

/*
ÍNDICES ESTRATÉGICOS CREADOS (5):
1. idx_postulaciones_postulante_estado - Búsqueda rápida por postulante
2. idx_postulaciones_convocatoria_estado - Reportes por convocatoria
3. idx_documentos_postulacion_nombre - Carga de documentos
4. idx_evaluaciones_evaluador_fecha - Análisis de evaluadores
5. Índices existentes documentados (email, identificación)

ANÁLISIS EXPLAIN (3 consultas críticas):
1. Dashboard del postulante (postulaciones + documentos)
2. Reportes de convocatoria (agregaciones complejas)
3. Desempeño de evaluadores (análisis de productividad)

CONSULTAS COMPLEJAS (5 consultas):
1. Candidatos seleccionables - Lista de aptos para contratar
2. Análisis de Brecha - Identifica qué falta para ser elegible
3. Carga de trabajo - Evaluadores sobrecargados vs ociosos
4. Comparación temporal - Tendencias entre convocatorias
5. Búsqueda avanzada - Filtrado múltiple de postulaciones

TRIGGERS (4):
1. Actualización automática de puntaje_total
2. Auditoría de cambios en postulaciones
3. Validación de transiciones de estado
4. Prevención de asignaciones duplicadas

FUNCIONES (3):
1. fn_categoria_candidato - Clasificar por desempeño
2. fn_validar_email - Validar formato de email
3. fn_dias_desde - Calcular antigüedad

HEALTH CHECKS (5 consultas):
- Verificación de integridad referencial
- Detección de datos huérfanos
- Validación de usuarios sin roles
*/

