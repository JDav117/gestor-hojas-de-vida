-- ========================================================================
-- FASE 2: IMPLEMENTACIÓN FÍSICA - VERSIÓN SIMPLIFICADA
-- Gestor de Hojas de Vida - Convocatorias Docentes
-- ========================================================================
-- NOTA: Script sin problemas de validación de contraseñas
-- Las contraseñas reales se generan desde la aplicación NestJS

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8mb4 */;
/*!50503 SET NAMES utf8mb4_unicode_ci */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;

USE `gestor_hojas_de_vida`;

-- ========================================================================
-- PARTE 1: INSERCIÓN DE DATOS DE PRUEBA
-- ========================================================================

-- Insertar Roles (3 roles)
INSERT IGNORE INTO `roles` (`nombre_rol`) VALUES
('ADMIN'),
('EVALUADOR'),
('POSTULANTE');

-- Insertar Usuarios (12 usuarios para pruebas)
-- IMPORTANTE: En producción, usar bcrypt desde la aplicación
-- Aquí usamos un placeholder que la app debe actualizar al registrarse
INSERT IGNORE INTO `usuarios` (`nombre`, `apellido`, `email`, `password_hash`, `identificacion`, `telefono`, `verificado`) VALUES
('Carlos', 'Admin', 'admin@example.com', 'PLACEHOLDER_PASSWORD_DEBE_ACTUALIZARSE_EN_APP', '100000001', '3100000000', 1),
('Lucia', 'Evaluadora', 'evaluador1@example.com', 'PLACEHOLDER_PASSWORD_DEBE_ACTUALIZARSE_EN_APP', '100000002', '3100000001', 1),
('Pedro', 'Evaluador', 'evaluador2@example.com', 'PLACEHOLDER_PASSWORD_DEBE_ACTUALIZARSE_EN_APP', '100000003', '3100000002', 1),
('Juan', 'Postulante', 'juan.postulante@example.com', 'PLACEHOLDER_PASSWORD_DEBE_ACTUALIZARSE_EN_APP', '100000004', '3100000003', 1),
('Maria', 'Candidata', 'maria.candidata@example.com', 'PLACEHOLDER_PASSWORD_DEBE_ACTUALIZARSE_EN_APP', '100000005', '3100000004', 1),
('Alejandro', 'Aspirante', 'alejandro.aspirante@example.com', 'PLACEHOLDER_PASSWORD_DEBE_ACTUALIZARSE_EN_APP', '100000006', '3100000005', 0),
('Carolina', 'Solicitante', 'carolina.solicitante@example.com', 'PLACEHOLDER_PASSWORD_DEBE_ACTUALIZARSE_EN_APP', '100000007', '3100000006', 1),
('David', 'Candidato', 'david.candidato@example.com', 'PLACEHOLDER_PASSWORD_DEBE_ACTUALIZARSE_EN_APP', '100000008', '3100000007', 1),
('Estela', 'Opositora', 'estela.opositora@example.com', 'PLACEHOLDER_PASSWORD_DEBE_ACTUALIZARSE_EN_APP', '100000009', '3100000008', 1),
('Fernando', 'Postulador', 'fernando.postulador@example.com', 'PLACEHOLDER_PASSWORD_DEBE_ACTUALIZARSE_EN_APP', '100000010', '3100000009', 0),
('Gabriela', 'Participante', 'gabriela.participante@example.com', 'PLACEHOLDER_PASSWORD_DEBE_ACTUALIZARSE_EN_APP', '100000011', '3100000010', 1),
('Hector', 'Candidata', 'hector.candidata@example.com', 'PLACEHOLDER_PASSWORD_DEBE_ACTUALIZARSE_EN_APP', '100000012', '3100000011', 1);

-- Asignar roles a usuarios
-- Usuario 1: ADMIN
INSERT IGNORE INTO `usuario_roles` VALUES (1, 1);
-- Usuarios 2, 3: EVALUADOR
INSERT IGNORE INTO `usuario_roles` VALUES (2, 2), (3, 2);
-- Usuarios 4-12: POSTULANTE
INSERT IGNORE INTO `usuario_roles` VALUES 
(4, 3), (5, 3), (6, 3), (7, 3), (8, 3), (9, 3), (10, 3), (11, 3), (12, 3);

-- Insertar Programas Académicos (5 programas)
INSERT IGNORE INTO `programas_academicos` 
(`nombre_programa`, `facultad`, `nivel`, `modalidad`, `codigo_snies`, `descripcion`) VALUES
('Ingeniería de Sistemas', 'Facultad de Ingeniería', 'Profesional', 'Presencial', '12345', 'Programa de formación en desarrollo de software y sistemas computacionales'),
('Ingeniería Industrial', 'Facultad de Ingeniería', 'Profesional', 'Presencial', '12346', 'Programa enfocado en optimización de procesos y sistemas productivos'),
('Tecnología en Desarrollo de Software', 'Facultad de Ingeniería', 'Tecnología', 'Presencial', '67890', 'Programa tecnológico con énfasis en programación y desarrollo web'),
('Administración Empresarial', 'Facultad de Administración', 'Profesional', 'Híbrida', '54321', 'Formación integral en gestión empresarial y negocios'),
('Contabilidad', 'Facultad de Administración', 'Profesional', 'Presencial', '98765', 'Programa de contabilidad con enfoque en normas internacionales');

-- Insertar Ítems de Evaluación (6 items)
INSERT IGNORE INTO `items_evaluacion` 
(`nombre_item`, `descripcion`) VALUES
('Formación Académica', 'Evaluación del nivel de estudios formales: pregrado, especialización, maestría, doctorado'),
('Experiencia Docente', 'Años y calidad de experiencia en educación superior'),
('Experiencia en Investigación', 'Participación en proyectos de investigación, publicaciones científicas'),
('Idiomas', 'Dominio de idiomas extranjeros (inglés, francés, etc.)'),
('Capacitación Continua', 'Certificados de cursos, diplomados y actualizaciones profesionales'),
('Producción Académica', 'Artículos publicados, libros, material didáctico desarrollado');

-- Insertar Convocatorias (5 convocatorias)
INSERT IGNORE INTO `convocatorias` 
(`nombre`, `descripcion`, `fecha_apertura`, `fecha_cierre`, `estado`, `programa_academico_id`, 
 `cupos`, `sede`, `dedicacion`, `tipo_vinculacion`, `requisitos_documentales`, 
 `min_puntaje_aprobacion_documental`, `min_puntaje_aprobacion_tecnica`) VALUES
('Convocatoria Docentes Ingeniería 2025-I', 'Convocatoria para docentes Tiempo Completo en Ingeniería', 
 '2025-01-15 08:00:00', '2025-02-28 23:59:59', 'publicada', 1, 3, 'Campus Principal', 
 'Tiempo Completo', 'Laboral', '["Hoja de vida", "Copia de título", "Certificados de experiencia"]', 60, 70),

('Convocatoria Docentes Administración 2025-I', 'Convocatoria para docentes Medio Tiempo en Administración',
 '2025-01-20 08:00:00', '2025-03-15 23:59:59', 'publicada', 4, 2, 'Campus Sede 2',
 'Medio Tiempo', 'Contrato', '["Hoja de vida", "Copia de título"]', 55, 65),

('Convocatoria Investigadores 2025-I', 'Búsqueda de investigadores para proyecto COLCIENCIAS',
 '2025-02-01 08:00:00', '2025-03-01 23:59:59', 'publicada', 1, 5, 'Campus Principal',
 'Tiempo Completo', 'Laboral', '["Hoja de vida", "Propuesta de investigación", "CVLac"]', 65, 75),

('Convocatoria Cátedra 2025', 'Contratación de docentes cátedra para programas virtuales',
 '2025-01-10 08:00:00', '2025-01-31 23:59:59', 'cerrada', 3, 10, 'Virtual',
 'Cátedra', 'Cátedra', '["Hoja de vida", "Portafolio"]', 50, 60),

('Convocatoria Docentes Especializados 2025-II', 'Búsqueda de docentes con especialización en tecnologías emergentes',
 '2025-06-01 08:00:00', '2025-07-15 23:59:59', 'borrador', 1, 4, 'Campus Principal',
 'Tiempo Completo', 'Laboral', '["Hoja de vida", "Certificados técnicos"]', 60, 70);

-- Insertar Baremos (10 registros)
INSERT IGNORE INTO `baremo_convocatoria` 
(`convocatoria_id`, `item_evaluacion_id`, `puntaje_maximo`) VALUES
(1, 1, 30),
(1, 2, 40),
(1, 3, 30),
(2, 1, 25),
(2, 2, 35),
(2, 4, 40),
(3, 2, 35),
(3, 3, 40),
(3, 6, 25),
(4, 1, 50);

-- Insertar Postulaciones (15 postulaciones)
INSERT IGNORE INTO `postulaciones` 
(`postulante_id`, `convocatoria_id`, `programa_id`, `estado`, `disponibilidad_horaria`,
 `puntaje_documental`, `puntaje_tecnico`, `puntaje_total`, `observaciones`, `submitted_at`, `reviewed_at`) VALUES
(4, 1, 1, 'EN_REVISION', 'Disponibilidad completa jornada diurna', 65, 0, 65, 'Documentación completa', '2025-01-20 09:30:00', '2025-01-22 14:00:00'),
(5, 1, 1, 'EN_REVISION', 'Disponible lunes a viernes', 72, 0, 72, NULL, '2025-01-21 10:15:00', '2025-01-23 16:30:00'),
(6, 1, 1, 'EN_REVISION', 'Flexibilidad horaria', 58, 0, 58, 'Falta certificado de experiencia', '2025-01-19 08:45:00', NULL),
(7, 2, 4, 'ACEPTADA', 'Disponibilidad parcial', 68, 82, 150, 'Candidato seleccionado', '2025-02-01 11:00:00', '2025-02-03 15:00:00'),
(8, 2, 4, 'EN_REVISION', 'Jornada mañana', 61, 0, 61, NULL, '2025-02-02 09:20:00', '2025-02-04 10:30:00'),
(9, 3, 1, 'EN_REVISION', 'Disponibilidad completa', 75, 0, 75, 'Excelente perfil investigativo', '2025-02-05 13:45:00', '2025-02-07 11:00:00'),
(10, 3, 1, 'RECHAZADA', 'Tiempo parcial', 48, 45, 93, 'No cumple puntaje mínimo documental', '2025-02-06 14:30:00', '2025-02-08 09:15:00'),
(11, 1, 1, 'ACEPTADA', 'Disponibilidad completa', 80, 88, 168, 'Excelente candidato', '2025-01-22 10:00:00', '2025-01-24 14:30:00'),
(12, 1, 1, 'EN_REVISION', 'Flexible', 64, 0, 64, NULL, '2025-01-23 15:20:00', NULL),
(4, 2, 4, 'borrador', NULL, 0, 0, 0, NULL, NULL, NULL),
(5, 3, 1, 'EN_REVISION', 'Disponibilidad completa', 77, 0, 77, 'Candidato de alto potencial', '2025-02-10 08:30:00', '2025-02-12 13:00:00'),
(6, 2, 4, 'EN_REVISION', 'Jornada tarde', 62, 0, 62, NULL, '2025-02-03 16:45:00', '2025-02-05 11:20:00'),
(7, 1, 1, 'RECHAZADA', 'No disponible inicialmente', 54, 0, 54, 'No cumple requisitos documentales', '2025-01-25 12:00:00', '2025-01-27 10:00:00'),
(8, 3, 1, 'EN_REVISION', 'Disponibilidad completa', 73, 0, 73, NULL, '2025-02-08 09:00:00', '2025-02-10 14:15:00'),
(9, 2, 4, 'ACEPTADA', 'Disponibilidad flexible', 70, 85, 155, 'Candidato seleccionado', '2025-02-04 10:30:00', '2025-02-06 15:45:00');

-- Insertar Documentos (20 documentos)
INSERT IGNORE INTO `documentos` 
(`postulacion_id`, `nombre_documento`, `ruta_archivo`) VALUES
(1, 'Hoja de vida', '/uploads/postulaciones/1/juan_hoja_de_vida.pdf'),
(1, 'Copia de título', '/uploads/postulaciones/1/juan_titulo.pdf'),
(1, 'Certificados de experiencia', '/uploads/postulaciones/1/juan_experiencia.pdf'),
(2, 'Hoja de vida', '/uploads/postulaciones/2/maria_hoja_de_vida.pdf'),
(2, 'Copia de título', '/uploads/postulaciones/2/maria_titulo.pdf'),
(3, 'Hoja de vida', '/uploads/postulaciones/3/alejandro_hoja_de_vida.pdf'),
(4, 'Hoja de vida', '/uploads/postulaciones/4/carolina_hoja_de_vida.pdf'),
(4, 'Copia de título', '/uploads/postulaciones/4/carolina_titulo.pdf'),
(5, 'Hoja de vida', '/uploads/postulaciones/5/david_hoja_de_vida.pdf'),
(6, 'Hoja de vida', '/uploads/postulaciones/6/estela_hoja_de_vida.pdf'),
(6, 'Copia de título', '/uploads/postulaciones/6/estela_titulo.pdf'),
(6, 'Propuesta de investigación', '/uploads/postulaciones/6/estela_propuesta.pdf'),
(7, 'Hoja de vida', '/uploads/postulaciones/7/fernando_hoja_de_vida.pdf'),
(8, 'Hoja de vida', '/uploads/postulaciones/8/gabriela_hoja_de_vida.pdf'),
(8, 'Copia de título', '/uploads/postulaciones/8/gabriela_titulo.pdf'),
(9, 'Hoja de vida', '/uploads/postulaciones/9/hector_hoja_de_vida.pdf'),
(10, 'Hoja de vida', '/uploads/postulaciones/10/juan_hoja_vida_2.pdf'),
(11, 'Hoja de vida', '/uploads/postulaciones/11/maria_hoja_vida_2.pdf'),
(12, 'Hoja de vida', '/uploads/postulaciones/12/alejandro_hoja_vida_2.pdf'),
(13, 'Hoja de vida', '/uploads/postulaciones/13/carolina_hoja_vida_2.pdf');

-- Insertar Evaluaciones (8 evaluaciones)
INSERT IGNORE INTO `evaluaciones` 
(`postulacion_id`, `evaluador_id`, `fecha`, `puntaje_total`) VALUES
(1, 2, '2025-01-25 10:00:00', 78),
(1, 3, '2025-01-26 14:30:00', 75),
(2, 2, '2025-01-28 09:15:00', 85),
(4, 3, '2025-02-05 13:45:00', 82),
(7, 2, '2025-02-03 11:20:00', 88),
(11, 3, '2025-02-15 10:30:00', 90),
(14, 2, '2025-02-18 14:00:00', 84),
(15, 3, '2025-02-20 09:45:00', 85);

-- Insertar Asignaciones (10 asignaciones)
INSERT IGNORE INTO `asignaciones` 
(`evaluador_id`, `postulacion_id`, `created_at`) VALUES
(2, 1, '2025-01-24 08:00:00'),
(3, 1, '2025-01-24 08:05:00'),
(2, 2, '2025-01-25 09:00:00'),
(3, 4, '2025-02-04 10:00:00'),
(2, 7, '2025-02-01 14:00:00'),
(3, 11, '2025-02-14 08:30:00'),
(2, 14, '2025-02-17 09:00:00'),
(3, 15, '2025-02-19 10:15:00'),
(2, 6, '2025-02-12 11:00:00'),
(3, 9, '2025-02-16 13:45:00');

-- ========================================================================
-- PARTE 2: CREACIÓN DE VISTAS
-- ========================================================================

-- VISTA 1: Resumen de Postulaciones por Convocatoria
DROP VIEW IF EXISTS `vw_postulaciones_por_convocatoria`;
CREATE VIEW `vw_postulaciones_por_convocatoria` AS
SELECT 
  c.id AS convocatoria_id,
  c.nombre AS convocatoria_nombre,
  c.estado AS convocatoria_estado,
  c.cupos,
  p.nombre_programa,
  COUNT(po.id) AS total_postulaciones,
  SUM(CASE WHEN po.estado = 'ACEPTADA' THEN 1 ELSE 0 END) AS aceptadas,
  SUM(CASE WHEN po.estado = 'RECHAZADA' THEN 1 ELSE 0 END) AS rechazadas,
  SUM(CASE WHEN po.estado = 'EN_REVISION' THEN 1 ELSE 0 END) AS en_revision,
  SUM(CASE WHEN po.estado = 'borrador' THEN 1 ELSE 0 END) AS borradores,
  ROUND(AVG(po.puntaje_total), 2) AS promedio_puntaje
FROM `convocatorias` c
LEFT JOIN `programas_academicos` p ON c.programa_academico_id = p.id
LEFT JOIN `postulaciones` po ON c.id = po.convocatoria_id
GROUP BY c.id, c.nombre, c.estado, c.cupos, p.nombre_programa
ORDER BY c.created_at DESC;

-- VISTA 2: Desempeño de Evaluadores
DROP VIEW IF EXISTS `vw_desempeno_evaluadores`;
CREATE VIEW `vw_desempeno_evaluadores` AS
SELECT 
  u.id,
  CONCAT(u.nombre, ' ', u.apellido) AS evaluador_nombre,
  u.email,
  COUNT(DISTINCT a.postulacion_id) AS postulaciones_asignadas,
  COUNT(DISTINCT e.id) AS evaluaciones_completadas,
  ROUND(AVG(e.puntaje_total), 2) AS promedio_evaluacion,
  MAX(e.fecha) AS ultima_evaluacion,
  ROUND(COUNT(DISTINCT e.id) * 100.0 / NULLIF(COUNT(DISTINCT a.postulacion_id), 0), 1) AS porcentaje_completado
FROM `usuarios` u
INNER JOIN `usuario_roles` ur ON u.id = ur.usuario_id
INNER JOIN `roles` r ON ur.rol_id = r.id AND r.nombre_rol = 'EVALUADOR'
LEFT JOIN `asignaciones` a ON u.id = a.evaluador_id
LEFT JOIN `evaluaciones` e ON u.id = e.evaluador_id
GROUP BY u.id, u.nombre, u.apellido, u.email
ORDER BY evaluaciones_completadas DESC, porcentaje_completado DESC;

-- VISTA 3: Candidatos por Convocatoria
DROP VIEW IF EXISTS `vw_candidatos_por_convocatoria`;
CREATE VIEW `vw_candidatos_por_convocatoria` AS
SELECT 
  c.id AS convocatoria_id,
  c.nombre AS convocatoria,
  po.id AS postulacion_id,
  CONCAT(u.nombre, ' ', u.apellido) AS candidato,
  u.email,
  u.identificacion,
  po.estado,
  po.puntaje_documental,
  po.puntaje_tecnico,
  po.puntaje_total,
  po.submitted_at,
  po.reviewed_at,
  po.evaluated_at,
  COUNT(DISTINCT d.id) AS documentos_adjuntos,
  COUNT(DISTINCT e.id) AS evaluaciones_recibidas
FROM `convocatorias` c
INNER JOIN `postulaciones` po ON c.id = po.convocatoria_id
INNER JOIN `usuarios` u ON po.postulante_id = u.id
LEFT JOIN `documentos` d ON po.id = d.postulacion_id
LEFT JOIN `evaluaciones` e ON po.id = e.postulacion_id
GROUP BY c.id, c.nombre, po.id, u.id, u.nombre, u.apellido, u.email, u.identificacion, 
         po.estado, po.puntaje_documental, po.puntaje_tecnico, po.puntaje_total, 
         po.submitted_at, po.reviewed_at, po.evaluated_at
ORDER BY c.id, po.puntaje_total DESC;

-- VISTA 4: Baremos Detallado
DROP VIEW IF EXISTS `vw_baremos_detallado`;
CREATE VIEW `vw_baremos_detallado` AS
SELECT 
  c.id AS convocatoria_id,
  c.nombre AS convocatoria,
  ie.id AS item_id,
  ie.nombre_item,
  ie.descripcion,
  bc.puntaje_maximo,
  (SELECT SUM(puntaje_maximo) FROM baremo_convocatoria WHERE convocatoria_id = c.id) AS puntaje_total_convocatoria
FROM `convocatorias` c
INNER JOIN `baremo_convocatoria` bc ON c.id = bc.convocatoria_id
INNER JOIN `items_evaluacion` ie ON bc.item_evaluacion_id = ie.id
ORDER BY c.id, bc.puntaje_maximo DESC;

-- ========================================================================
-- PARTE 3: PROCEDIMIENTOS ALMACENADOS SIMPLIFICADOS
-- ========================================================================

DELIMITER //

-- PROCEDIMIENTO 1: Generar Reporte de Convocatoria
DROP PROCEDURE IF EXISTS sp_generar_reporte_convocatoria //
CREATE PROCEDURE sp_generar_reporte_convocatoria(
  IN p_convocatoria_id INT
)
BEGIN
  SELECT 
    c.nombre AS 'Convocatoria',
    c.estado AS 'Estado',
    c.cupos AS 'Cupos',
    c.fecha_apertura AS 'Apertura',
    c.fecha_cierre AS 'Cierre',
    COUNT(po.id) AS 'Total Postulantes',
    SUM(CASE WHEN po.estado = 'ACEPTADA' THEN 1 ELSE 0 END) AS 'Aceptados',
    SUM(CASE WHEN po.estado = 'RECHAZADA' THEN 1 ELSE 0 END) AS 'Rechazados',
    SUM(CASE WHEN po.estado = 'EN_REVISION' THEN 1 ELSE 0 END) AS 'En Revisión',
    ROUND(AVG(po.puntaje_total), 2) AS 'Promedio Puntaje',
    MAX(po.puntaje_total) AS 'Máximo Puntaje',
    MIN(po.puntaje_total) AS 'Mínimo Puntaje'
  FROM convocatorias c
  LEFT JOIN postulaciones po ON c.id = po.convocatoria_id
  WHERE c.id = p_convocatoria_id
  GROUP BY c.id;
END //

-- PROCEDIMIENTO 2: Actualizar Estado de Postulación
DROP PROCEDURE IF EXISTS sp_actualizar_estado_postulacion //
CREATE PROCEDURE sp_actualizar_estado_postulacion(
  IN p_postulacion_id INT,
  IN p_nuevo_estado VARCHAR(50),
  OUT p_mensaje VARCHAR(255)
)
BEGIN
  DECLARE v_postulante VARCHAR(200);
  
  IF NOT EXISTS (SELECT 1 FROM postulaciones WHERE id = p_postulacion_id) THEN
    SET p_mensaje = 'Postulación no encontrada';
  ELSEIF p_nuevo_estado NOT IN ('borrador', 'EN_REVISION', 'ACEPTADA', 'RECHAZADA') THEN
    SET p_mensaje = 'Estado inválido';
  ELSE
    SELECT CONCAT(u.nombre, ' ', u.apellido) INTO v_postulante
    FROM postulaciones po
    INNER JOIN usuarios u ON po.postulante_id = u.id
    WHERE po.id = p_postulacion_id;
    
    UPDATE postulaciones
    SET estado = p_nuevo_estado,
        updated_at = NOW()
    WHERE id = p_postulacion_id;
    
    SET p_mensaje = CONCAT('Estado actualizado a: ', p_nuevo_estado, ' para ', v_postulante);
  END IF;
END //

DELIMITER ;

-- ========================================================================
-- PARTE 4: ÍNDICES ADICIONALES
-- ========================================================================

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_identificacion ON usuarios(identificacion);
CREATE INDEX IF NOT EXISTS idx_convocatorias_estado ON convocatorias(estado);
CREATE INDEX IF NOT EXISTS idx_documentos_postulacion_id ON documentos(postulacion_id);

-- ========================================================================
-- FINALIZACIÓN
-- ========================================================================

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;

-- RESUMEN:
-- ✅ 12 Usuarios creados (requieren contraseña real desde aplicación)
-- ✅ 5 Programas académicos
-- ✅ 6 Ítems de evaluación
-- ✅ 5 Convocatorias
-- ✅ 15 Postulaciones
-- ✅ 20 Documentos
-- ✅ 8 Evaluaciones
-- ✅ 10 Asignaciones
-- ✅ 4 Vistas útiles
-- ✅ 2 Procedimientos almacenados
-- ✅ Índices estratégicos
