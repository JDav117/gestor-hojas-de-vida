USE gestor_hojas_de_vida;

-- PARTE 1: ÍNDICES ESTRATÉGICOS
CREATE INDEX idx_postulaciones_postulante_estado ON postulaciones(postulante_id, estado);
CREATE INDEX idx_postulaciones_convocatoria_estado ON postulaciones(convocatoria_id, estado);
CREATE INDEX idx_documentos_postulacion_nombre ON documentos(postulacion_id, nombre_documento);
CREATE INDEX idx_evaluaciones_evaluador_fecha ON evaluaciones(evaluador_id, fecha);

-- PARTE 2: EXPLAIN (ejemplos; ejecutar manualmente con EXPLAIN FORMAT=JSON ...)
-- (Se incluyen las consultas críticas para que puedas ejecutar EXPLAIN en tu entorno)

-- Consulta A: Postulaciones de un usuario (para EXPLAIN)
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

-- Consulta B: Reportes de convocatoria (para EXPLAIN)
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

-- Consulta C: Desempeño de evaluadores (para EXPLAIN)
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

-- PARTE 3: CONSULTAS COMPLEJAS (listas de uso)

-- 1) Candidatos seleccionables
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

-- 2) Análisis de Brecha
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

-- 3) Carga de trabajo de evaluadores
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

-- 4) Comparación temporal de convocatorias
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

-- 5) Búsqueda avanzada con filtros múltiples
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
  AND (
    u.nombre LIKE '%juan%'
    OR u.apellido LIKE '%postulante%'
    OR u.email LIKE '%@example.com%'
  )
  AND po.puntaje_total BETWEEN 0 AND 200
  AND po.estado IN ('EN_REVISION', 'ACEPTADA')
  AND po.submitted_at >= '2025-01-01'
  AND po.submitted_at <= '2025-12-31'
  AND c.id IN (1, 2, 3)
GROUP BY 
  po.id, u.nombre, u.apellido, u.email, u.identificacion,
  c.nombre, pa.nombre_programa, po.estado, po.puntaje_documental,
  po.puntaje_tecnico, po.puntaje_total, po.submitted_at,
  po.reviewed_at, po.evaluated_at
ORDER BY po.puntaje_total DESC, po.submitted_at DESC;

-- PARTE 4: FUNCIONES Y TRIGGERS
DELIMITER //

DROP FUNCTION IF EXISTS fn_categoria_candidato //
CREATE FUNCTION fn_categoria_candidato(p_puntaje_total FLOAT) RETURNS VARCHAR(50) DETERMINISTIC
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

DROP FUNCTION IF EXISTS fn_validar_email //
CREATE FUNCTION fn_validar_email(p_email VARCHAR(255)) RETURNS BOOLEAN DETERMINISTIC
BEGIN
  DECLARE v_is_valid BOOLEAN;
  IF p_email LIKE '%@%.%' AND p_email NOT LIKE '%@%@%' AND LENGTH(p_email) >= 6 AND p_email NOT LIKE '@%' AND p_email NOT LIKE '%@' THEN
    SET v_is_valid = TRUE;
  ELSE
    SET v_is_valid = FALSE;
  END IF;
  RETURN v_is_valid;
END //

DROP FUNCTION IF EXISTS fn_dias_desde //
CREATE FUNCTION fn_dias_desde(p_fecha DATETIME) RETURNS INT DETERMINISTIC
BEGIN
  DECLARE v_dias INT;
  IF p_fecha IS NULL THEN
    SET v_dias = NULL;
  ELSE
    SET v_dias = DATEDIFF(NOW(), p_fecha);
  END IF;
  RETURN v_dias;
END //

DROP TRIGGER IF EXISTS trg_actualizar_puntaje_postulacion //
CREATE TRIGGER trg_actualizar_puntaje_postulacion
BEFORE UPDATE ON postulaciones
FOR EACH ROW
BEGIN
  IF NEW.puntaje_documental != OLD.puntaje_documental OR NEW.puntaje_tecnico != OLD.puntaje_tecnico THEN
    SET NEW.puntaje_total = NEW.puntaje_documental + NEW.puntaje_tecnico;
  END IF;
  IF NEW.puntaje_documental < 0 THEN SET NEW.puntaje_documental = 0; END IF;
  IF NEW.puntaje_tecnico < 0 THEN SET NEW.puntaje_tecnico = 0; END IF;
END //

DROP TRIGGER IF EXISTS trg_auditoria_postulaciones //
CREATE TRIGGER trg_auditoria_postulaciones
AFTER UPDATE ON postulaciones
FOR EACH ROW
BEGIN
  IF NEW.estado != OLD.estado OR NEW.puntaje_documental != OLD.puntaje_documental OR NEW.puntaje_tecnico != OLD.puntaje_tecnico THEN
    INSERT INTO IFNULL(audit_log, (SELECT NULL)) (tabla_afectada, operacion, usuario_responsable, datos_anteriores, datos_nuevos)
    VALUES (
      'postulaciones',
      'UPDATE',
      IFNULL(USER(), 'SISTEMA'),
      JSON_OBJECT('id', OLD.id, 'estado', OLD.estado, 'puntaje_documental', OLD.puntaje_documental, 'puntaje_tecnico', OLD.puntaje_tecnico, 'puntaje_total', OLD.puntaje_total),
      JSON_OBJECT('id', NEW.id, 'estado', NEW.estado, 'puntaje_documental', NEW.puntaje_documental, 'puntaje_tecnico', NEW.puntaje_tecnico, 'puntaje_total', NEW.puntaje_total)
    );
  END IF;
END //

DROP TRIGGER IF EXISTS trg_validar_transicion_estado //
CREATE TRIGGER trg_validar_transicion_estado
BEFORE UPDATE ON postulaciones
FOR EACH ROW
BEGIN
  DECLARE v_estado_valido BOOLEAN;
  IF NEW.estado != OLD.estado THEN
    SET v_estado_valido = CASE
      WHEN OLD.estado = 'borrador' AND NEW.estado IN ('EN_REVISION') THEN TRUE
      WHEN OLD.estado = 'EN_REVISION' AND NEW.estado IN ('ACEPTADA', 'RECHAZADA') THEN TRUE
      WHEN OLD.estado IN ('ACEPTADA', 'RECHAZADA') THEN FALSE
      ELSE FALSE
    END;
    IF NOT v_estado_valido THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = CONCAT('Transición de estado no válida: ', OLD.estado, ' -> ', NEW.estado);
    END IF;
  END IF;
END //

DROP TRIGGER IF EXISTS trg_prevenir_asignacion_duplicada //
CREATE TRIGGER trg_prevenir_asignacion_duplicada
BEFORE INSERT ON asignaciones
FOR EACH ROW
BEGIN
  IF EXISTS (SELECT 1 FROM asignaciones WHERE evaluador_id = NEW.evaluador_id AND postulacion_id = NEW.postulacion_id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Este evaluador ya está asignado a esta postulación';
  END IF;
END //

DELIMITER ;

-- PARTE 5: ANALYZE TABLE (recolectar estadísticas)
ANALYZE TABLE usuarios;
ANALYZE TABLE postulaciones;
ANALYZE TABLE evaluaciones;
ANALYZE TABLE asignaciones;
ANALYZE TABLE convocatorias;
ANALYZE TABLE documentos;

-- PARTE 6: HEALTH CHECKS
SELECT 'Postulaciones sin usuario' AS problema, COUNT(*) AS cantidad FROM postulaciones WHERE postulante_id NOT IN (SELECT id FROM usuarios);
SELECT 'Postulaciones sin convocatoria' AS problema, COUNT(*) AS cantidad FROM postulaciones WHERE convocatoria_id NOT IN (SELECT id FROM convocatorias);
SELECT 'Evaluaciones sin postulación' AS problema, COUNT(*) AS cantidad FROM evaluaciones WHERE postulacion_id NOT IN (SELECT id FROM postulaciones);
SELECT 'Usuarios sin roles asignados' AS problema, COUNT(*) AS cantidad FROM usuarios u WHERE NOT EXISTS (SELECT 1 FROM usuario_roles ur WHERE ur.usuario_id = u.id);
SELECT 'Documentos sin postulación' AS problema, COUNT(*) AS cantidad FROM documentos d WHERE d.postulacion_id NOT IN (SELECT id FROM postulaciones);
