-- Script de inicialización limpio para MySQL en Docker
-- Sin problemas de validación de contraseñas

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS `gestor_hojas_de_vida` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `gestor_hojas_de_vida`;

-- Tabla: ROLES
CREATE TABLE IF NOT EXISTS `roles` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre_rol` VARCHAR(100) NOT NULL UNIQUE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: USUARIOS (SIN CHECK CONSTRAINT POR AHORA)
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
  CHECK (email LIKE '%@%.%')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: USUARIO_ROLES
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: ITEMS_EVALUACION
CREATE TABLE IF NOT EXISTS `items_evaluacion` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre_item` VARCHAR(255) NOT NULL,
  `descripcion` TEXT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  CHECK (fecha_apertura < fecha_cierre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar Roles
INSERT INTO `roles` (`nombre_rol`) VALUES ('ADMIN'), ('EVALUADOR'), ('POSTULANTE');

-- Insertar Usuario Admin con contraseña segura
INSERT INTO `usuarios` (`nombre`, `apellido`, `email`, `password_hash`, `identificacion`, `telefono`, `verificado`) 
VALUES ('Admin', 'Sistema', 'admin@localhost.local', '$2b$10$SIX1sIGKIvNrRqLPyxsWAuUmLDnRHrz6sF1kT8Y7wK2vL9pM3zPji', '100000001', '3100000000', 1);

-- Asignar rol ADMIN al usuario
INSERT INTO `usuario_roles` VALUES (1, 1);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
