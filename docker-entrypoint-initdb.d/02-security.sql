-- ========================================================================
-- CONFIGURACIÓN DE SEGURIDAD PARA DOCKER
-- Este archivo se ejecuta después de crear la base de datos
-- Ubicación en contenedor: /docker-entrypoint-initdb.d/02-security.sql
-- ========================================================================

-- Usar la base de datos
USE gestor_hojas_de_vida;

-- ========================================================================
-- CREAR TABLA DE AUDITORÍA
-- ========================================================================

CREATE TABLE IF NOT EXISTS `audit_log` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `tabla_afectada` VARCHAR(100),
    `operacion` VARCHAR(50),
    `usuario_responsable` VARCHAR(100),
    `datos_anteriores` JSON,
    `datos_nuevos` JSON,
    `fecha_operacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `ip_origen` VARCHAR(45),
    INDEX `idx_audit_fecha` (`fecha_operacion`),
    INDEX `idx_audit_tabla` (`tabla_afectada`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================================================
-- CREAR USUARIOS CON PRIVILEGIOS MÍNIMOS
-- ========================================================================

-- Crear usuario para aplicación (LECTURA Y ESCRITURA limitada)
CREATE USER IF NOT EXISTS 'ghv_app_user'@'%' IDENTIFIED BY 'app_secure_password_change_this';

-- Crear usuario para reportes (SOLO LECTURA)
CREATE USER IF NOT EXISTS 'ghv_report_user'@'%' IDENTIFIED BY 'report_secure_password_change_this';

-- Crear usuario para backups (RESPALDOS)
CREATE USER IF NOT EXISTS 'ghv_backup_user'@'localhost' IDENTIFIED BY 'backup_secure_password_change_this';

-- ========================================================================
-- ASIGNAR PRIVILEGIOS A USUARIOS
-- ========================================================================

-- Revocar todos los privilegios primero
REVOKE ALL PRIVILEGES ON *.* FROM 'ghv_app_user'@'%';
REVOKE ALL PRIVILEGES ON *.* FROM 'ghv_report_user'@'%';
REVOKE ALL PRIVILEGES ON *.* FROM 'ghv_backup_user'@'localhost';

-- Privilegios para ghv_app_user (Aplicación)
-- Solo puede manipular datos en la base de datos especificada
GRANT SELECT, INSERT, UPDATE, DELETE ON `gestor_hojas_de_vida`.* TO 'ghv_app_user'@'%';
GRANT EXECUTE ON `gestor_hojas_de_vida`.* TO 'ghv_app_user'@'%';

-- Privilegios para ghv_report_user (Reportes)
-- Solo lectura de datos
GRANT SELECT ON `gestor_hojas_de_vida`.* TO 'ghv_report_user'@'%';

-- Privilegios para ghv_backup_user (Respaldos)
-- Permisos necesarios para mysqldump
GRANT SELECT, LOCK TABLES ON `gestor_hojas_de_vida`.* TO 'ghv_backup_user'@'localhost';

-- ========================================================================
-- REVOCAR PRIVILEGIOS PELIGROSOS
-- ========================================================================

-- No permitir que ningún usuario no-root cree/elimine bases de datos
REVOKE ALL ON *.* FROM 'ghv_app_user'@'%';
REVOKE ALL ON *.* FROM 'ghv_report_user'@'%';
REVOKE ALL ON *.* FROM 'ghv_backup_user'@'localhost';

-- Re-asignar solo los privilegios necesarios
GRANT SELECT, INSERT, UPDATE, DELETE ON `gestor_hojas_de_vida`.* TO 'ghv_app_user'@'%';
GRANT EXECUTE ON `gestor_hojas_de_vida`.* TO 'ghv_app_user'@'%';
GRANT SELECT ON `gestor_hojas_de_vida`.* TO 'ghv_report_user'@'%';
GRANT SELECT, LOCK TABLES ON `gestor_hojas_de_vida`.* TO 'ghv_backup_user'@'localhost';

-- No permitir que ningún usuario tenga privilegios GRANT
REVOKE GRANT OPTION ON *.* FROM 'ghv_app_user'@'%';
REVOKE GRANT OPTION ON *.* FROM 'ghv_report_user'@'%';
REVOKE GRANT OPTION ON *.* FROM 'ghv_backup_user'@'localhost';

-- ========================================================================
-- SECURIZAR USUARIO ROOT
-- ========================================================================

-- Cambiar host de root a solo localhost
UPDATE `mysql`.`user` SET `Host`='localhost' WHERE `User`='root';

-- Eliminar usuario anónimo
DELETE FROM `mysql`.`user` WHERE `User`='' AND `Host` = '%';
DELETE FROM `mysql`.`user` WHERE `User`='' AND `Host` = 'localhost';

-- ========================================================================
-- APLICAR CAMBIOS
-- ========================================================================

-- Refrescar tabla de privilegios
FLUSH PRIVILEGES;

-- ========================================================================
-- INSERTAR DATOS DE PRUEBA
-- ========================================================================

-- Insertar usuarios adicionales para pruebas
INSERT INTO `usuarios` (`nombre`, `apellido`, `email`, `password_hash`, `identificacion`, `telefono`, `verificado`) VALUES
('Lucia', 'García', 'lucia.garcia@localhost', '$2b$10$evaluador2hashde123456789012345678901234567890', '100000004', '3100000004', 1),
('Juan', 'Martínez', 'juan.martinez@localhost', '$2b$10$postulantehashdemoejemplo1234567890123456', '100000005', '3100000005', 1),
('María', 'López', 'maria.lopez@localhost', '$2b$10$postulante2hashde123456789012345678901234567', '100000006', '3100000006', 1);

-- Asignar roles adicionales
INSERT INTO `usuario_roles` VALUES 
(4, 2),  -- Lucia es evaluadora
(5, 3),  -- Juan es postulante
(6, 3);  -- María es postulante

-- Crear postulaciones de prueba
INSERT INTO `postulaciones` (`postulante_id`, `convocatoria_id`, `programa_id`, `estado`, `disponibilidad_horaria`, `puntaje_documental`, `puntaje_tecnico`, `puntaje_total`, `submitted_at`, `reviewed_at`) VALUES
(5, 1, 1, 'EN_REVISION', 'Disponibilidad completa', 65, 0, 65, '2025-01-20 09:30:00', '2025-01-22 14:00:00'),
(6, 1, 1, 'EN_REVISION', 'Flexible', 72, 0, 72, '2025-01-21 10:15:00', '2025-01-23 16:30:00');

-- Crear documentos de prueba
INSERT INTO `documentos` (`postulacion_id`, `nombre_documento`, `ruta_archivo`) VALUES
(1, 'Hoja de vida', '/uploads/postulaciones/1/hoja_de_vida.pdf'),
(1, 'Copia de título', '/uploads/postulaciones/1/titulo.pdf'),
(2, 'Hoja de vida', '/uploads/postulaciones/2/hoja_de_vida.pdf');

-- Crear evaluaciones de prueba
INSERT INTO `evaluaciones` (`postulacion_id`, `evaluador_id`, `fecha`, `puntaje_total`) VALUES
(1, 2, '2025-01-25 10:00:00', 78),
(1, 4, '2025-01-26 14:30:00', 75),
(2, 2, '2025-01-28 09:15:00', 85);

-- Crear asignaciones de prueba
INSERT INTO `asignaciones` (`evaluador_id`, `postulacion_id`) VALUES
(2, 1), (4, 1), (2, 2);

-- ========================================================================
-- FINAL
-- ========================================================================

-- Refrescar privilegios nuevamente
FLUSH PRIVILEGES;
