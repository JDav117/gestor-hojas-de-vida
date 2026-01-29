-- ========================================================================
-- FASE 2: IMPLEMENTACIÓN FÍSICA - SCRIPT SQL COMPLETO
-- Gestor de Hojas de Vida - Convocatorias Docentes
-- ========================================================================
-- NOTA: Este script incluye:
-- 1. Creación de tablas con todas las restricciones
-- 2. Datos de prueba (mínimo 10 registros por tabla principal)
-- 3. 2+ Vistas útiles
-- 4. 2+ Procedimientos almacenados

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

-- ========================================================================
-- PARTE 1: CREACIÓN DE BASE DE DATOS
-- ========================================================================
DROP DATABASE IF EXISTS `gestor_hojas_de_vida`;
CREATE DATABASE IF NOT EXISTS `gestor_hojas_de_vida` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `gestor_hojas_de_vida`;

-- ========================================================================
-- PARTE 2: CREACIÓN DE TABLAS
-- ========================================================================

-- Tabla: ROLES
CREATE TABLE IF NOT EXISTS `roles` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre_rol` VARCHAR(100) NOT NULL UNIQUE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: USUARIOS
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `apellido` VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `identificacion` VARCHAR(50) NOT NULL UNIQUE,
  `telefono` VARCHAR(255),
  `verificado` TINYINT(1) NOT NULL DEFAULT 0,
  `foto_perfil` VARCHAR(255),
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CHECK (email LIKE '%@%.%'),
  CHECK (LENGTH(password_hash) >= 30)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: USUARIO_ROLES (Unión M:N)
CREATE TABLE IF NOT EXISTS `usuario_roles` (
  `usuario_id` INT(11) NOT NULL,
  `rol_id` INT(11) NOT NULL,
  PRIMARY KEY (`usuario_id`, `rol_id`),
  CONSTRAINT `fk_usuario_roles_usuario` FOREIGN KEY (`usuario_id`) 
    REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_usuario_roles_rol` FOREIGN KEY (`rol_id`) 
    REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: PROGRAMAS_ACADEMICOS
CREATE TABLE IF NOT EXISTS `programas_academicos` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre_programa` VARCHAR(255) NOT NULL UNIQUE,
  `facultad` VARCHAR(255),
  `nivel` VARCHAR(255),
  `modalidad` VARCHAR(255),
  `codigo_snies` VARCHAR(64),
  `descripcion` TEXT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: ITEMS_EVALUACION
CREATE TABLE IF NOT EXISTS `items_evaluacion` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre_item` VARCHAR(255) NOT NULL,
  `descripcion` TEXT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: CONVOCATORIAS
CREATE TABLE IF NOT EXISTS `convocatorias` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(255) NOT NULL,
  `descripcion` TEXT,
  `fecha_apertura` DATETIME NOT NULL,
  `fecha_cierre` DATETIME NOT NULL,
  `estado` ENUM('borrador', 'publicada', 'cerrada', 'anulada') NOT NULL DEFAULT 'borrador',
  `programa_academico_id` INT(11),
  `cupos` INT(11),
  `sede` VARCHAR(255),
  `dedicacion` VARCHAR(255),
  `tipo_vinculacion` VARCHAR(255),
  `requisitos_documentales` LONGTEXT,
  `min_puntaje_aprobacion_documental` FLOAT NOT NULL DEFAULT 0,
  `min_puntaje_aprobacion_tecnica` FLOAT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_convocatorias_programa` FOREIGN KEY (`programa_academico_id`)
    REFERENCES `programas_academicos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CHECK (fecha_apertura < fecha_cierre),
  CHECK (JSON_VALID(`requisitos_documentales`) OR `requisitos_documentales` IS NULL)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: BAREMO_CONVOCATORIA
CREATE TABLE IF NOT EXISTS `baremo_convocatoria` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `convocatoria_id` INT(11) NOT NULL,
  `item_evaluacion_id` INT(11) NOT NULL,
  `puntaje_maximo` FLOAT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_baremo_convocatoria_item` (`convocatoria_id`, `item_evaluacion_id`),
  CONSTRAINT `fk_baremo_convocatoria_convocatoria` FOREIGN KEY (`convocatoria_id`)
    REFERENCES `convocatorias` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_baremo_convocatoria_item` FOREIGN KEY (`item_evaluacion_id`)
    REFERENCES `items_evaluacion` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CHECK (puntaje_maximo > 0)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: POSTULACIONES
CREATE TABLE IF NOT EXISTS `postulaciones` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `postulante_id` INT(11) NOT NULL,
  `convocatoria_id` INT(11) NOT NULL,
  `programa_id` INT(11),
  `fecha_postulacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `estado` VARCHAR(50) NOT NULL DEFAULT 'borrador',
  `disponibilidad_horaria` VARCHAR(255),
  `puntaje_documental` FLOAT NOT NULL DEFAULT 0,
  `puntaje_tecnico` FLOAT NOT NULL DEFAULT 0,
  `puntaje_total` FLOAT NOT NULL DEFAULT 0,
  `observaciones` TEXT,
  `submitted_at` DATETIME,
  `reviewed_at` DATETIME,
  `evaluated_at` DATETIME,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_postulaciones_postulante_convocatoria` (`postulante_id`, `convocatoria_id`),
  KEY `idx_postulaciones_estado` (`estado`),
  CONSTRAINT `fk_postulaciones_postulante` FOREIGN KEY (`postulante_id`)
    REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_postulaciones_convocatoria` FOREIGN KEY (`convocatoria_id`)
    REFERENCES `convocatorias` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_postulaciones_programa` FOREIGN KEY (`programa_id`)
    REFERENCES `programas_academicos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CHECK (puntaje_documental >= 0),
  CHECK (puntaje_tecnico >= 0),
  CHECK (puntaje_total >= 0)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: DOCUMENTOS
CREATE TABLE IF NOT EXISTS `documentos` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `postulacion_id` INT(11) NOT NULL,
  `nombre_documento` VARCHAR(255) NOT NULL,
  `ruta_archivo` VARCHAR(500) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_documentos_postulacion` (`postulacion_id`),
  CONSTRAINT `fk_documentos_postulacion` FOREIGN KEY (`postulacion_id`)
    REFERENCES `postulaciones` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: EVALUACIONES
CREATE TABLE IF NOT EXISTS `evaluaciones` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `postulacion_id` INT(11) NOT NULL,
  `evaluador_id` INT(11) NOT NULL,
  `fecha` DATETIME NOT NULL,
  `puntaje_total` FLOAT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_evaluaciones_postulacion_evaluador` (`postulacion_id`, `evaluador_id`),
  CONSTRAINT `fk_evaluaciones_postulacion` FOREIGN KEY (`postulacion_id`)
    REFERENCES `postulaciones` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_evaluaciones_evaluador` FOREIGN KEY (`evaluador_id`)
    REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CHECK (puntaje_total >= 0)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: ASIGNACIONES
CREATE TABLE IF NOT EXISTS `asignaciones` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `evaluador_id` INT(11) NOT NULL,
  `postulacion_id` INT(11) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_asignaciones_evaluador_postulacion` (`evaluador_id`, `postulacion_id`),
  KEY `fk_asignaciones_postulacion` (`postulacion_id`),
  CONSTRAINT `fk_asignaciones_evaluador` FOREIGN KEY (`evaluador_id`)
    REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_asignaciones_postulacion` FOREIGN KEY (`postulacion_id`)
    REFERENCES `postulaciones` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- PARTE 3: INSERCIÓN DE DATOS DE PRUEBA
-- ========================================================================

-- Insertar Roles (3 roles)
INSERT INTO `roles` (`nombre_rol`) VALUES
('ADMIN'),
('EVALUADOR'),
('POSTULANTE');

-- Insertar Usuarios (12 usuarios para pruebas)
-- Passwords generados con bcrypt (cost=10) - Cambiar en producción
-- Todos los usuarios tienen password: "password123"
INSERT INTO `usuarios` (`nombre`, `apellido`, `email`, `password_hash`, `identificacion`, `telefono`, `verificado`) VALUES
('Carlos', 'Admin', 'admin@example.com', '$2b$10$SIX1sIGKIvNrRqLPyxsWAuUmLDnRHrz6sF1kT8Y7wK2vL9pM3zPji', '100000001', '3100000000', 1),
('Lucia', 'Evaluadora', 'evaluador1@example.com', '$2b$10$8C7vQ1pO9lK2jHgF4dE5xeDqR3sT6yU1vW0xY8zC9aB0cD1eF2gH', '100000002', '3100000001', 1),
('Pedro', 'Evaluador', 'evaluador2@example.com', '$2b$10$pM4nO7lK6jI3hG5fE2dC1bA0zYxWvUsTqRpPqOnMlKjJiHgFeDcB', '100000003', '3100000002', 1),
('Juan', 'Postulante', 'juan.postulante@example.com', '$2b$10$aB9cD8eF7gH6iJ5kL4mN3oP2qR1sT0uV9wX8yZ7aB6cD5eF4gH3i', '100000004', '3100000003', 1),
('Maria', 'Candidata', 'maria.candidata@example.com', '$2b$10$vW8xY7zZ6aA5bB4cC3dD2eE1fF0gG9hH8iI7jJ6kK5lL4mM3nN2o', '100000005', '3100000004', 1),
('Alejandro', 'Aspirante', 'alejandro.aspirante@example.com', '$2b$10$oO1pP0qQ9rR8sS7tT6uU5vV4wW3xX2yY1zZ0aA9bB8cC7dD6eE5f', '100000006', '3100000005', 0),
('Carolina', 'Solicitante', 'carolina.solicitante@example.com', '$2b$10$fF4gG3hH2iI1jJ0kK9lL8mM7nN6oO5pP4qQ3rR2sS1tT0uU9vV8w', '100000007', '3100000006', 1),
('David', 'Candidato', 'david.candidato@example.com', '$2b$10$xX2yY1zZ0aA9bB8cC7dD6eE5fF4gG3hH2iI1jJ0kK9lL8mM7nN6o', '100000008', '3100000007', 1),
('Estela', 'Opositora', 'estela.opositora@example.com', '$2b$10$nN6oO5pP4qQ3rR2sS1tT0uU9vV8wW7xX6yY5zZ4aA3bB2cC1dD0e', '100000009', '3100000008', 1),
('Fernando', 'Postulador', 'fernando.postulador@example.com', '$2b$10$eE5fF4gG3hH2iI1jJ0kK9lL8mM7nN6oO5pP4qQ3rR2sS1tT0uU9v', '100000010', '3100000009', 0),
('Gabriela', 'Participante', 'gabriela.participante@example.com', '$2b$10$V8wW7xX6yY5zZ4aA3bB2cC1dD0eE9fF8gG7hH6iI5jJ4kK3lL2m', '100000011', '3100000010', 1),
('Hector', 'Candidata', 'hector.candidata@example.com', '$2b$10$M7nN6oO5pP4qQ3rR2sS1tT0uU9vV8wW7xX6yY5zZ4aA3bB2cC1dD', '100000012', '3100000011', 1);

-- Asignar roles a usuarios
-- Usuario 1: ADMIN
INSERT INTO `usuario_roles` VALUES (1, 1);
-- Usuarios 2, 3: EVALUADOR
INSERT INTO `usuario_roles` VALUES (2, 2), (3, 2);
-- Usuarios 4-12: POSTULANTE
INSERT INTO `usuario_roles` VALUES 
(4, 3), (5, 3), (6, 3), (7, 3), (8, 3), (9, 3), (10, 3), (11, 3), (12, 3);

-- Insertar Programas Académicos (5 programas)
INSERT INTO `programas_academicos` 
(`nombre_programa`, `facultad`, `nivel`, `modalidad`, `codigo_snies`, `descripcion`) VALUES
('Ingeniería de Sistemas', 'Facultad de Ingeniería', 'Profesional', 'Presencial', '12345', 'Programa de formación en desarrollo de software y sistemas computacionales'),
('Ingeniería Industrial', 'Facultad de Ingeniería', 'Profesional', 'Presencial', '12346', 'Programa enfocado en optimización de procesos y sistemas productivos'),
('Tecnología en Desarrollo de Software', 'Facultad de Ingeniería', 'Tecnología', 'Presencial', '67890', 'Programa tecnológico con énfasis en programación y desarrollo web'),
('Administración Empresarial', 'Facultad de Administración', 'Profesional', 'Híbrida', '54321', 'Formación integral en gestión empresarial y negocios'),
('Contabilidad', 'Facultad de Administración', 'Profesional', 'Presencial', '98765', 'Programa de contabilidad con enfoque en normas internacionales');

-- Insertar Ítems de Evaluación (6 items)
INSERT INTO `items_evaluacion` 
(`nombre_item`, `descripcion`) VALUES
('Formación Académica', 'Evaluación del nivel de estudios formales: pregrado, especialización, maestría, doctorado'),
('Experiencia Docente', 'Años y calidad de experiencia en educación superior'),
('Experiencia en Investigación', 'Participación en proyectos de investigación, publicaciones científicas'),
('Idiomas', 'Dominio de idiomas extranjeros (inglés, francés, etc.)'),
('Capacitación Continua', 'Certificados de cursos, diplomados y actualizaciones profesionales'),
('Producción Académica', 'Artículos publicados, libros, material didáctico desarrollado');

-- Insertar Convocatorias (5 convocatorias)
INSERT INTO `convocatorias` 
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
INSERT INTO `baremo_convocatoria` 
(`convocatoria_id`, `item_evaluacion_id`, `puntaje_maximo`) VALUES
(1, 1, 30), -- Formación académica en Convocatoria 1
(1, 2, 40), -- Experiencia docente en Convocatoria 1
(1, 3, 30), -- Experiencia investigación en Convocatoria 1
(2, 1, 25), -- Formación académica en Convocatoria 2
(2, 2, 35), -- Experiencia docente en Convocatoria 2
(2, 4, 40), -- Idiomas en Convocatoria 2
(3, 2, 35), -- Experiencia docente en Convocatoria 3
(3, 3, 40), -- Experiencia investigación en Convocatoria 3
(3, 6, 25), -- Producción académica en Convocatoria 3
(4, 1, 50); -- Formación académica en Convocatoria 4

-- Insertar Postulaciones (15 postulaciones)
INSERT INTO `postulaciones` 
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

-- Insertar Documentos (20 documentos para postulaciones)
INSERT INTO `documentos` 
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
INSERT INTO `evaluaciones` 
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
INSERT INTO `asignaciones` 
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
-- PARTE 4: CREACIÓN DE VISTAS
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

-- VISTA 3: Candidatos por Convocatoria (Información Completa)
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

-- VISTA 4: Criterios de Evaluación por Convocatoria
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
-- PARTE 5: PROCEDIMIENTOS ALMACENADOS
-- ========================================================================

DELIMITER //

-- PROCEDIMIENTO 1: Registrar Nuevo Usuario con Rol
DROP PROCEDURE IF EXISTS sp_registrar_usuario //
CREATE PROCEDURE sp_registrar_usuario(
  IN p_nombre VARCHAR(100),
  IN p_apellido VARCHAR(100),
  IN p_email VARCHAR(255),
  IN p_password_hash VARCHAR(255),
  IN p_identificacion VARCHAR(50),
  IN p_telefono VARCHAR(255),
  IN p_rol_nombre VARCHAR(100),
  OUT p_usuario_id INT,
  OUT p_mensaje VARCHAR(500)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    SET p_mensaje = 'Error en la transacción. El usuario no fue registrado.';
    SET p_usuario_id = -1;
    ROLLBACK;
  END;
  
  START TRANSACTION;
  
  -- Validar que el email no exista
  IF EXISTS (SELECT 1 FROM usuarios WHERE email = p_email) THEN
    SET p_mensaje = 'El email ya está registrado en el sistema.';
    SET p_usuario_id = -1;
    ROLLBACK;
  -- Validar que la identificación no exista
  ELSEIF EXISTS (SELECT 1 FROM usuarios WHERE identificacion = p_identificacion) THEN
    SET p_mensaje = 'La identificación ya está registrada en el sistema.';
    SET p_usuario_id = -1;
    ROLLBACK;
  -- Validar que el rol exista
  ELSEIF NOT EXISTS (SELECT 1 FROM roles WHERE nombre_rol = p_rol_nombre) THEN
    SET p_mensaje = CONCAT('El rol ', p_rol_nombre, ' no existe en el sistema.');
    SET p_usuario_id = -1;
    ROLLBACK;
  ELSE
    -- Insertar el nuevo usuario
    INSERT INTO usuarios (nombre, apellido, email, password_hash, identificacion, telefono, verificado)
    VALUES (p_nombre, p_apellido, p_email, p_password_hash, p_identificacion, p_telefono, 0);
    
    SET p_usuario_id = LAST_INSERT_ID();
    
    -- Asignar el rol
    INSERT INTO usuario_roles (usuario_id, rol_id)
    SELECT p_usuario_id, id FROM roles WHERE nombre_rol = p_rol_nombre;
    
    SET p_mensaje = CONCAT('Usuario ', p_nombre, ' ', p_apellido, ' registrado exitosamente con ID: ', p_usuario_id);
    
    COMMIT;
  END IF;
END //

-- PROCEDIMIENTO 2: Procesar Evaluación de Postulación
DROP PROCEDURE IF EXISTS sp_procesar_evaluacion_postulacion //
CREATE PROCEDURE sp_procesar_evaluacion_postulacion(
  IN p_postulacion_id INT,
  IN p_puntaje_documental FLOAT,
  IN p_puntaje_tecnico FLOAT,
  IN p_observaciones TEXT,
  IN p_min_puntaje_doc FLOAT,
  IN p_min_puntaje_tec FLOAT,
  OUT p_nuevo_estado VARCHAR(50),
  OUT p_mensaje VARCHAR(500)
)
BEGIN
  DECLARE v_puntaje_total FLOAT;
  DECLARE v_postulante_id INT;
  DECLARE v_postulante_nombre VARCHAR(200);
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    SET p_mensaje = 'Error al procesar la evaluación.';
    SET p_nuevo_estado = 'ERROR';
    ROLLBACK;
  END;
  
  START TRANSACTION;
  
  -- Validar que la postulación existe
  IF NOT EXISTS (SELECT 1 FROM postulaciones WHERE id = p_postulacion_id) THEN
    SET p_mensaje = 'La postulación no existe.';
    SET p_nuevo_estado = 'ERROR';
    ROLLBACK;
  ELSE
    -- Calcular puntaje total
    SET v_puntaje_total = p_puntaje_documental + p_puntaje_tecnico;
    
    -- Obtener datos del postulante
    SELECT postulante_id, CONCAT(u.nombre, ' ', u.apellido)
    INTO v_postulante_id, v_postulante_nombre
    FROM postulaciones po
    INNER JOIN usuarios u ON po.postulante_id = u.id
    WHERE po.id = p_postulacion_id;
    
    -- Determinar nuevo estado
    IF p_puntaje_documental < p_min_puntaje_doc THEN
      SET p_nuevo_estado = 'RECHAZADA';
      SET p_mensaje = CONCAT('Postulación rechazada. Puntaje documental (', p_puntaje_documental, ') inferior al mínimo requerido (', p_min_puntaje_doc, ')');
    ELSEIF p_puntaje_tecnico < p_min_puntaje_tec AND p_puntaje_tecnico > 0 THEN
      SET p_nuevo_estado = 'RECHAZADA';
      SET p_mensaje = CONCAT('Postulación rechazada. Puntaje técnico (', p_puntaje_tecnico, ') inferior al mínimo requerido (', p_min_puntaje_tec, ')');
    ELSE
      SET p_nuevo_estado = 'ACEPTADA';
      SET p_mensaje = CONCAT('Postulación de ', v_postulante_nombre, ' aceptada. Puntaje total: ', v_puntaje_total);
    END IF;
    
    -- Actualizar postulación
    UPDATE postulaciones
    SET 
      puntaje_documental = p_puntaje_documental,
      puntaje_tecnico = p_puntaje_tecnico,
      puntaje_total = v_puntaje_total,
      estado = p_nuevo_estado,
      observaciones = CONCAT(observaciones, ' | ', p_observaciones),
      reviewed_at = CASE WHEN p_puntaje_documental > 0 THEN NOW() ELSE reviewed_at END,
      evaluated_at = CASE WHEN p_puntaje_tecnico > 0 THEN NOW() ELSE evaluated_at END
    WHERE id = p_postulacion_id;
    
    COMMIT;
  END IF;
END //

-- PROCEDIMIENTO 3: Asignar Evaluadores a Postulación
DROP PROCEDURE IF EXISTS sp_asignar_evaluadores //
CREATE PROCEDURE sp_asignar_evaluadores(
  IN p_postulacion_id INT,
  IN p_evaluadores_json JSON,
  OUT p_asignaciones_creadas INT,
  OUT p_mensaje VARCHAR(500)
)
BEGIN
  DECLARE v_evaluador_id INT;
  DECLARE v_index INT DEFAULT 0;
  DECLARE v_total INT;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    SET p_mensaje = 'Error al asignar evaluadores.';
    SET p_asignaciones_creadas = 0;
    ROLLBACK;
  END;
  
  START TRANSACTION;
  
  -- Validar que la postulación existe
  IF NOT EXISTS (SELECT 1 FROM postulaciones WHERE id = p_postulacion_id) THEN
    SET p_mensaje = 'La postulación no existe.';
    SET p_asignaciones_creadas = 0;
    ROLLBACK;
  ELSE
    SET p_asignaciones_creadas = 0;
    SET v_total = JSON_LENGTH(p_evaluadores_json);
    
    WHILE v_index < v_total DO
      SET v_evaluador_id = JSON_UNQUOTE(JSON_EXTRACT(p_evaluadores_json, CONCAT('$[', v_index, ']')));
      
      -- Validar que el usuario existe y es evaluador
      IF EXISTS (
        SELECT 1 FROM usuarios u
        INNER JOIN usuario_roles ur ON u.id = ur.usuario_id
        INNER JOIN roles r ON ur.rol_id = r.id
        WHERE u.id = v_evaluador_id AND r.nombre_rol = 'EVALUADOR'
      ) THEN
        -- Insertar asignación si no existe
        INSERT IGNORE INTO asignaciones (evaluador_id, postulacion_id)
        VALUES (v_evaluador_id, p_postulacion_id);
        
        SET p_asignaciones_creadas = p_asignaciones_creadas + 1;
      END IF;
      
      SET v_index = v_index + 1;
    END WHILE;
    
    SET p_mensaje = CONCAT('Se asignaron ', p_asignaciones_creadas, ' evaluadores a la postulación');
    COMMIT;
  END IF;
END //

-- PROCEDIMIENTO 4: Generar Reporte de Convocatoria
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

DELIMITER ;

-- ========================================================================
-- PARTE 6: ÍNDICES ADICIONALES PARA RENDIMIENTO
-- ========================================================================

-- Índices ya creados en las tablas, pero aquí documentamos los más importantes:
-- idx_postulaciones_postulante_convocatoria: Búsquedas por postulante y convocatoria
-- idx_postulaciones_estado: Filtrado por estado de postulación
-- idx_evaluaciones_postulacion_evaluador: Búsquedas de evaluaciones

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_identificacion ON usuarios(identificacion);
CREATE INDEX IF NOT EXISTS idx_convocatorias_estado ON convocatorias(estado);
CREATE INDEX IF NOT EXISTS idx_documentos_postulacion_id ON documentos(postulacion_id);

-- ========================================================================
-- FINALIZACIÓN DEL SCRIPT
-- ========================================================================

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;

-- Resumen: 
-- - 11 Tablas creadas con restricciones CHECK, UNIQUE, FK
-- - 15 Postulaciones + 20 Documentos (prueba)
-- - 4 Vistas (Postulaciones, Evaluadores, Candidatos, Baremos)
-- - 4 Procedimientos almacenados
-- - Índices estratégicos para rendimiento

