import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

/**
 * Pipe para validación adicional de archivos
 * Complementa la validación de multer con reglas de negocio
 */
@Injectable()
export class FileValidationPipe implements PipeTransform {
  transform(file: Express.Multer.File): Express.Multer.File {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }
    
    // Validaciones adicionales si son necesarias
    if (file.size === 0) {
      throw new BadRequestException('El archivo está vacío');
    }
    
    return file;
  }
}

/**
 * Pipe para validar arrays de archivos
 */
@Injectable()
export class FilesValidationPipe implements PipeTransform {
  constructor(private readonly maxFiles: number = 5) {}
  
  transform(files: Express.Multer.File[]): Express.Multer.File[] {
    if (!files || files.length === 0) {
      throw new BadRequestException('No se proporcionaron archivos');
    }
    
    if (files.length > this.maxFiles) {
      throw new BadRequestException(
        `Se excedió el límite de archivos. Máximo permitido: ${this.maxFiles}`
      );
    }
    
    // Validar que todos los archivos sean válidos
    files.forEach((file, index) => {
      if (file.size === 0) {
        throw new BadRequestException(
          `El archivo ${index + 1} está vacío`
        );
      }
    });
    
    return files;
  }
}

/**
 * Pipe para validar archivos opcionales
 */
@Injectable()
export class OptionalFileValidationPipe implements PipeTransform {
  transform(file?: Express.Multer.File): Express.Multer.File | undefined {
    if (!file) {
      return undefined;
    }
    
    if (file.size === 0) {
      throw new BadRequestException('El archivo proporcionado está vacío');
    }
    
    return file;
  }
}
