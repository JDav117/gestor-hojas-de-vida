import { WinstonModule, utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { join } from 'path';

const LOG_DIR = process.env.LOG_DIR || 'logs';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Formato personalizado para logs
 * Incluye timestamp, nivel, contexto y mensaje
 */
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

/**
 * Formato para consola (desarrollo)
 */
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.ms(),
  nestWinstonModuleUtilities.format.nestLike('GHV', {
    colors: true,
    prettyPrint: true,
  })
);

/**
 * Transport para logs de aplicación general
 */
const applicationTransport: DailyRotateFile = new DailyRotateFile({
  filename: join(LOG_DIR, 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  level: LOG_LEVEL,
  format: customFormat,
});

/**
 * Transport para logs de errores
 */
const errorTransport: DailyRotateFile = new DailyRotateFile({
  filename: join(LOG_DIR, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  level: 'error',
  format: customFormat,
});

/**
 * Transport para logs de auditoría (cambios importantes)
 */
const auditTransport: DailyRotateFile = new DailyRotateFile({
  filename: join(LOG_DIR, 'audit-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '90d', // Guardar auditoría por 90 días
  level: 'info',
  format: customFormat,
});

/**
 * Transport para consola (solo desarrollo)
 */
const consoleTransport = new winston.transports.Console({
  format: consoleFormat,
});

/**
 * Configuración de Winston para NestJS
 */
export const winstonConfig = WinstonModule.createLogger({
  level: LOG_LEVEL,
  format: customFormat,
  transports: [
    applicationTransport,
    errorTransport,
    auditTransport,
    // Solo mostrar en consola en desarrollo
    ...(NODE_ENV === 'development' ? [consoleTransport] : []),
  ],
  exceptionHandlers: [
    new DailyRotateFile({
      filename: join(LOG_DIR, 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format: customFormat,
    }),
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: join(LOG_DIR, 'rejections-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format: customFormat,
    }),
  ],
});

/**
 * Logger personalizado para auditoría
 * Usar para registrar acciones importantes del sistema
 */
export const auditLogger = winston.createLogger({
  level: 'info',
  format: customFormat,
  transports: [auditTransport],
});

/**
 * Función helper para log de auditoría
 * @param action Acción realizada
 * @param userId ID del usuario que realiza la acción
 * @param details Detalles adicionales
 */
export function logAudit(action: string, userId: number, details?: any) {
  auditLogger.info({
    action,
    userId,
    timestamp: new Date().toISOString(),
    ...details,
  });
}
