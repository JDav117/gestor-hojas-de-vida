-- ========================================================================
-- FASE 2: IMPLEMENTACIÓN FÍSICA - VERSIÓN SIMPLIFICADA
-- Gestor de Hojas de Vida - Convocatorias Docentes
-- ========================================================================

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;

USE `gestor_hojas_de_vida`;

-- ========================================================================
-- PARTE 1: INSERCIÓN DE DATOS DE PRUEBA
-- ========================================================================

-- Insertar Roles
INSERT IGNORE INTO `roles` (`nombre_rol`) VALUES ('ADMIN'), ('EVALUADOR'), ('POSTULANTE');

-- Insertar Usuarios (12 usuarios)
-- IMPORTANTE: Las contraseñas reales se generan desde la aplicación NestJS
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

-- Asignar roles
INSERT IGNORE INTO `usuario_roles` VALUES (1, 1), (2, 2), (3, 2), (4, 3), (5, 3), (6, 3), (7, 3), (8, 3), (9, 3), (10, 3), (11, 3), (12, 3);

-- Insertar Programas Académicos
INSERT IGNORE INTO `programas_academicos` (`nombre_programa`, `facultad`, `nivel`, `modalidad`, `codigo_snies`, `descripcion`) VALUES
('Ingeniería de Sistemas', 'Facultad de Ingeniería', 'Profesional', 'Presencial', '12345', 'Programa de desarrollo de software'),
('Ingeniería Industrial', 'Facultad de Ingeniería', 'Profesional', 'Presencial', '12346', 'Optimización de procesos'),
('Tecnología en Desarrollo de Software', 'Facultad de Ingeniería', 'Tecnología', 'Presencial', '67890', 'Enfasis en programación web'),
('Administración Empresarial', 'Facultad de Administración', 'Profesional', 'Híbrida', '54321', 'Gestión empresarial'),
('Contabilidad', 'Facultad de Administración', 'Profesional', 'Presencial', '98765', 'Normas internacionales');

-- Insertar Ítems de Evaluación
INSERT IGNORE INTO `items_evaluacion` (`nombre_item`, `descripcion`) VALUES
('Formación Académica', 'Nivel de estudios formales'),
('Experiencia Docente', 'Años en educación superior'),
('Experiencia en Investigación', 'Proyectos e investigación'),
('Idiomas', 'Dominio de idiomas extranjeros'),
('Capacitación Continua', 'Certificados y actualizaciones'),
('Producción Académica', 'Artículos y publicaciones');

-- Insertar Convocatorias
INSERT IGNORE INTO `convocatorias` (`nombre`, `descripcion`, `fecha_apertura`, `fecha_cierre`, `estado`, `programa_academico_id`, `cupos`, `sede`, `dedicacion`, `tipo_vinculacion`, `requisitos_documentales`, `min_puntaje_aprobacion_documental`, `min_puntaje_aprobacion_tecnica`) VALUES
('Convocatoria Docentes Ingeniería 2025-I', 'Tiempo Completo en Ingeniería', '2025-01-15 08:00:00', '2025-02-28 23:59:59', 'publicada', 1, 3, 'Campus Principal', 'Tiempo Completo', 'Laboral', '["Hoja de vida"]', 60, 70),
('Convocatoria Docentes Administración 2025-I', 'Medio Tiempo en Administración', '2025-01-20 08:00:00', '2025-03-15 23:59:59', 'publicada', 4, 2, 'Campus Sede 2', 'Medio Tiempo', 'Contrato', '["Hoja de vida"]', 55, 65),
('Convocatoria Investigadores 2025-I', 'Búsqueda de investigadores', '2025-02-01 08:00:00', '2025-03-01 23:59:59', 'publicada', 1, 5, 'Campus Principal', 'Tiempo Completo', 'Laboral', '["Hoja de vida"]', 65, 75),
('Convocatoria Cátedra 2025', 'Programas virtuales', '2025-01-10 08:00:00', '2025-01-31 23:59:59', 'cerrada', 3, 10, 'Virtual', 'Cátedra', 'Cátedra', '["Hoja de vida"]', 50, 60),
('Convocatoria Docentes Especializados 2025-II', 'Tecnologías emergentes', '2025-06-01 08:00:00', '2025-07-15 23:59:59', 'borrador', 1, 4, 'Campus Principal', 'Tiempo Completo', 'Laboral', '["Hoja de vida"]', 60, 70);

-- Insertar Baremos
INSERT IGNORE INTO `baremo_convocatoria` (`convocatoria_id`, `item_evaluacion_id`, `puntaje_maximo`) VALUES
(1, 1, 30), (1, 2, 40), (1, 3, 30), (2, 1, 25), (2, 2, 35), (2, 4, 40), (3, 2, 35), (3, 3, 40), (3, 6, 25), (4, 1, 50);

-- Insertar Postulaciones
INSERT IGNORE INTO `postulaciones` (`postulante_id`, `convocatoria_id`, `programa_id`, `estado`, `disponibilidad_horaria`, `puntaje_documental`, `puntaje_tecnico`, `puntaje_total`, `observaciones`, `submitted_at`, `reviewed_at`) VALUES
(4, 1, 1, 'EN_REVISION', 'Disponibilidad completa', 65, 0, 65, 'Documentación completa', '2025-01-20 09:30:00', '2025-01-22 14:00:00'),
(5, 1, 1, 'EN_REVISION', 'Lunes a viernes', 72, 0, 72, NULL, '2025-01-21 10:15:00', '2025-01-23 16:30:00'),
(6, 1, 1, 'EN_REVISION', 'Flexible', 58, 0, 58, 'Falta certificado', '2025-01-19 08:45:00', NULL),
(7, 2, 4, 'ACEPTADA', 'Disponibilidad parcial', 68, 82, 150, 'Candidato seleccionado', '2025-02-01 11:00:00', '2025-02-03 15:00:00'),
(8, 2, 4, 'EN_REVISION', 'Jornada mañana', 61, 0, 61, NULL, '2025-02-02 09:20:00', '2025-02-04 10:30:00'),
(9, 3, 1, 'EN_REVISION', 'Disponible completa', 75, 0, 75, 'Excelente perfil', '2025-02-05 13:45:00', '2025-02-07 11:00:00'),
(10, 3, 1, 'RECHAZADA', 'Tiempo parcial', 48, 45, 93, 'No cumple puntaje', '2025-02-06 14:30:00', '2025-02-08 09:15:00'),
(11, 1, 1, 'ACEPTADA', 'Disponible completa', 80, 88, 168, 'Excelente candidato', '2025-01-22 10:00:00', '2025-01-24 14:30:00'),
(12, 1, 1, 'EN_REVISION', 'Flexible', 64, 0, 64, NULL, '2025-01-23 15:20:00', NULL),
(4, 2, 4, 'borrador', NULL, 0, 0, 0, NULL, NULL, NULL),
(5, 3, 1, 'EN_REVISION', 'Disponible', 77, 0, 77, 'Alto potencial', '2025-02-10 08:30:00', '2025-02-12 13:00:00'),
(6, 2, 4, 'EN_REVISION', 'Tarde', 62, 0, 62, NULL, '2025-02-03 16:45:00', '2025-02-05 11:20:00'),
(7, 1, 1, 'RECHAZADA', 'No disponible', 54, 0, 54, 'No cumple requisitos', '2025-01-25 12:00:00', '2025-01-27 10:00:00'),
(8, 3, 1, 'EN_REVISION', 'Disponible', 73, 0, 73, NULL, '2025-02-08 09:00:00', '2025-02-10 14:15:00'),
(9, 2, 4, 'ACEPTADA', 'Flexible', 70, 85, 155, 'Candidato seleccionado', '2025-02-04 10:30:00', '2025-02-06 15:45:00');

-- Insertar Documentos
INSERT IGNORE INTO `documentos` (`postulacion_id`, `nombre_documento`, `ruta_archivo`) VALUES
(1, 'Hoja de vida', '/uploads/postulaciones/1/juan_hoja_de_vida.pdf'),
(1, 'Copia de título', '/uploads/postulaciones/1/juan_titulo.pdf'),
(1, 'Certificados', '/uploads/postulaciones/1/juan_experiencia.pdf'),
(2, 'Hoja de vida', '/uploads/postulaciones/2/maria_hoja_de_vida.pdf'),
(2, 'Copia de título', '/uploads/postulaciones/2/maria_titulo.pdf'),
(3, 'Hoja de vida', '/uploads/postulaciones/3/alejandro_hoja_de_vida.pdf'),
(4, 'Hoja de vida', '/uploads/postulaciones/4/carolina_hoja_de_vida.pdf'),
(4, 'Copia de título', '/uploads/postulaciones/4/carolina_titulo.pdf'),
(5, 'Hoja de vida', '/uploads/postulaciones/5/david_hoja_de_vida.pdf'),
(6, 'Hoja de vida', '/uploads/postulaciones/6/estela_hoja_de_vida.pdf'),
(6, 'Copia de título', '/uploads/postulaciones/6/estela_titulo.pdf'),
(6, 'Propuesta', '/uploads/postulaciones/6/estela_propuesta.pdf'),
(7, 'Hoja de vida', '/uploads/postulaciones/7/fernando_hoja_de_vida.pdf'),
(8, 'Hoja de vida', '/uploads/postulaciones/8/gabriela_hoja_de_vida.pdf'),
(8, 'Copia de título', '/uploads/postulaciones/8/gabriela_titulo.pdf'),
(9, 'Hoja de vida', '/uploads/postulaciones/9/hector_hoja_de_vida.pdf'),
(10, 'Hoja de vida', '/uploads/postulaciones/10/juan_hoja_vida_2.pdf'),
(11, 'Hoja de vida', '/uploads/postulaciones/11/maria_hoja_vida_2.pdf'),
(12, 'Hoja de vida', '/uploads/postulaciones/12/alejandro_hoja_vida_2.pdf'),
(13, 'Hoja de vida', '/uploads/postulaciones/13/carolina_hoja_vida_2.pdf');

-- Insertar Evaluaciones
INSERT IGNORE INTO `evaluaciones` (`postulacion_id`, `evaluador_id`, `fecha`, `puntaje_total`) VALUES
(1, 2, '2025-01-25 10:00:00', 78),
(1, 3, '2025-01-26 14:30:00', 75),
(2, 2, '2025-01-28 09:15:00', 85),
(4, 3, '2025-02-05 13:45:00', 82),
(7, 2, '2025-02-03 11:20:00', 88),
(11, 3, '2025-02-15 10:30:00', 90),
(14, 2, '2025-02-18 14:00:00', 84),
(15, 3, '2025-02-20 09:45:00', 85);

-- Insertar Asignaciones
INSERT IGNORE INTO `asignaciones` (`evaluador_id`, `postulacion_id`, `created_at`) VALUES
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
-- PARTE 2: VISTAS
-- ========================================================================

DROP VIEW IF EXISTS `vw_postulaciones_por_convocatoria`;
CREATE VIEW `vw_postulaciones_por_convocatoria` AS
SELECT 
  c.id AS convocatoria_id,
  c.nombre AS convocatoria_nombre,
  c.estado,
  c.cupos,
  COUNT(po.id) AS total_postulaciones,
  SUM(CASE WHEN po.estado = 'ACEPTADA' THEN 1 ELSE 0 END) AS aceptadas,
  SUM(CASE WHEN po.estado = 'RECHAZADA' THEN 1 ELSE 0 END) AS rechazadas,
  SUM(CASE WHEN po.estado = 'EN_REVISION' THEN 1 ELSE 0 END) AS en_revision,
  ROUND(AVG(po.puntaje_total), 2) AS promedio_puntaje
FROM `convocatorias` c
LEFT JOIN `postulaciones` po ON c.id = po.convocatoria_id
GROUP BY c.id, c.nombre, c.estado, c.cupos
ORDER BY c.id DESC;

DROP VIEW IF EXISTS `vw_desempeno_evaluadores`;
CREATE VIEW `vw_desempeno_evaluadores` AS
SELECT 
  u.id,
  CONCAT(u.nombre, ' ', u.apellido) AS evaluador_nombre,
  u.email,
  COUNT(DISTINCT a.postulacion_id) AS postulaciones_asignadas,
  COUNT(DISTINCT e.id) AS evaluaciones_completadas,
  ROUND(AVG(e.puntaje_total), 2) AS promedio_evaluacion
FROM `usuarios` u
INNER JOIN `usuario_roles` ur ON u.id = ur.usuario_id
INNER JOIN `roles` r ON ur.rol_id = r.id AND r.nombre_rol = 'EVALUADOR'
LEFT JOIN `asignaciones` a ON u.id = a.evaluador_id
LEFT JOIN `evaluaciones` e ON u.id = e.evaluador_id
GROUP BY u.id, u.nombre, u.apellido, u.email
ORDER BY evaluaciones_completadas DESC;

DROP VIEW IF EXISTS `vw_candidatos_por_convocatoria`;
CREATE VIEW `vw_candidatos_por_convocatoria` AS
SELECT 
  c.id AS convocatoria_id,
  c.nombre AS convocatoria,
  po.id AS postulacion_id,
  CONCAT(u.nombre, ' ', u.apellido) AS candidato,
  u.email,
  po.estado,
  po.puntaje_total,
  COUNT(DISTINCT d.id) AS documentos_adjuntos,
  COUNT(DISTINCT e.id) AS evaluaciones
FROM `convocatorias` c
INNER JOIN `postulaciones` po ON c.id = po.convocatoria_id
INNER JOIN `usuarios` u ON po.postulante_id = u.id
LEFT JOIN `documentos` d ON po.id = d.postulacion_id
LEFT JOIN `evaluaciones` e ON po.id = e.postulacion_id
GROUP BY c.id, c.nombre, po.id, u.id, u.nombre, u.apellido, u.email, po.estado, po.puntaje_total
ORDER BY c.id, po.puntaje_total DESC;

-- ========================================================================
-- PARTE 3: PROCEDIMIENTOS ALMACENADOS
-- ========================================================================

DELIMITER //

DROP PROCEDURE IF EXISTS sp_generar_reporte_convocatoria //
CREATE PROCEDURE sp_generar_reporte_convocatoria(
  IN p_convocatoria_id INT
)
BEGIN
  SELECT 
    c.nombre AS 'Convocatoria',
    c.estado AS 'Estado',
    COUNT(po.id) AS 'Total Postulantes',
    SUM(CASE WHEN po.estado = 'ACEPTADA' THEN 1 ELSE 0 END) AS 'Aceptados',
    SUM(CASE WHEN po.estado = 'RECHAZADA' THEN 1 ELSE 0 END) AS 'Rechazados',
    ROUND(AVG(po.puntaje_total), 2) AS 'Promedio Puntaje'
  FROM convocatorias c
  LEFT JOIN postulaciones po ON c.id = po.convocatoria_id
  WHERE c.id = p_convocatoria_id
  GROUP BY c.id;
END //

DROP PROCEDURE IF EXISTS sp_actualizar_estado_postulacion //
CREATE PROCEDURE sp_actualizar_estado_postulacion(
  IN p_postulacion_id INT,
  IN p_nuevo_estado VARCHAR(50),
  OUT p_mensaje VARCHAR(255)
)
BEGIN
  IF NOT EXISTS (SELECT 1 FROM postulaciones WHERE id = p_postulacion_id) THEN
    SET p_mensaje = 'Postulación no encontrada';
  ELSE
    UPDATE postulaciones
    SET estado = p_nuevo_estado, updated_at = NOW()
    WHERE id = p_postulacion_id;
    SET p_mensaje = CONCAT('Estado actualizado a: ', p_nuevo_estado);
  END IF;
END //

DELIMITER ;

-- ========================================================================
-- ÍNDICES
-- ========================================================================

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_identificacion ON usuarios(identificacion);
CREATE INDEX IF NOT EXISTS idx_convocatorias_estado ON convocatorias(estado);
CREATE INDEX IF NOT EXISTS idx_documentos_postulacion_id ON documentos(postulacion_id);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
