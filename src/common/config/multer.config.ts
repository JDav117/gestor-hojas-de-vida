import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';

// Configuración de tamaños y tipos permitidos
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880', 10); // 5MB por defecto
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

/**
 * Configuración de Multer para carga de archivos
 * - Valida tipo MIME y extensión
 * - Genera nombres únicos con UUID
 * - Organiza archivos por fecha (YYYY/MM/DD)
 * - Limita tamaño de archivo
 */
export const multerConfig: MulterOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      // Organizar archivos por fecha: uploads/2024/01/15/
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      const uploadPath = join(process.cwd(), 'uploads', String(year), month, day);
      
      // Crear directorios si no existen
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath, { recursive: true });
      }
      
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      // Generar nombre único: uuid-timestamp-original.ext
      const uniqueId = uuidv4();
      const timestamp = Date.now();
      const ext = extname(file.originalname);
      const filename = `${uniqueId}-${timestamp}${ext}`;
      cb(null, filename);
    },
  }),
  fileFilter: (req, file, cb) => {
    // Validar tipo MIME
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(
        new BadRequestException(
          `Tipo de archivo no permitido. Solo se aceptan: ${ALLOWED_MIME_TYPES.join(', ')}`
        ),
        false
      );
    }
    
    // Validar extensión
    const ext = extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return cb(
        new BadRequestException(
          `Extensión de archivo no permitida. Solo se aceptan: ${ALLOWED_EXTENSIONS.join(', ')}`
        ),
        false
      );
    }
    
    cb(null, true);
  },
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5, // Máximo 5 archivos por request
  },
};

/**
 * Configuración específica para documentos PDF
 */
export const pdfOnlyConfig: MulterOptions = {
  ...multerConfig,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(
        new BadRequestException('Solo se permiten archivos PDF'),
        false
      );
    }
    cb(null, true);
  },
};

/**
 * Configuración específica para imágenes
 */
export const imageOnlyConfig: MulterOptions = {
  ...multerConfig,
  fileFilter: (req, file, cb) => {
    const imageMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!imageMimeTypes.includes(file.mimetype)) {
      return cb(
        new BadRequestException('Solo se permiten imágenes (JPG, JPEG, PNG)'),
        false
      );
    }
    cb(null, true);
  },
};
