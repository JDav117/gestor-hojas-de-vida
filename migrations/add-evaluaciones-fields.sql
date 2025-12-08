-- Migración: Agregar campos a la tabla evaluaciones
-- Fecha: 7 de diciembre de 2025
-- Descripción: Agregar observaciones, detalles_puntajes y finalizada

-- Agregar columna observaciones (texto nullable)
ALTER TABLE `evaluaciones` 
ADD COLUMN `observaciones` TEXT NULL AFTER `puntaje_total`;

-- Agregar columna detalles_puntajes (JSON nullable)
ALTER TABLE `evaluaciones` 
ADD COLUMN `detalles_puntajes` JSON NULL AFTER `observaciones`;

-- Agregar columna finalizada (boolean, default false)
ALTER TABLE `evaluaciones` 
ADD COLUMN `finalizada` TINYINT(1) NOT NULL DEFAULT 0 AFTER `detalles_puntajes`;

-- Verificar estructura actualizada
DESCRIBE `evaluaciones`;
