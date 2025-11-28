import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class StorageService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads', 'perfiles');
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  private readonly allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  constructor() {
    this.ensureUploadDirExists();
  }

  private ensureUploadDirExists(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveProfilePhoto(file: Express.Multer.File, userId: number): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validar tipo de archivo
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(`Tipo de archivo no permitido. Permitidos: ${this.allowedMimeTypes.join(', ')}`);
    }

    // Validar tamaño
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(`El archivo es muy grande. Máximo ${this.maxFileSize / 1024 / 1024}MB`);
    }

    // Generar nombre único
    const ext = this.getFileExtension(file.mimetype);
    const fileName = `${userId}_${crypto.randomBytes(8).toString('hex')}.${ext}`;
    const filePath = path.join(this.uploadDir, fileName);

    // Guardar archivo
    fs.writeFileSync(filePath, file.buffer);

    // Retornar ruta relativa
    return `uploads/perfiles/${fileName}`;
  }

  getFileExtension(mimeType: string): string {
    const extensions: { [key: string]: string } = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
    };
    return extensions[mimeType] || 'jpg';
  }

  deleteProfilePhoto(filePath: string): void {
    if (!filePath) return;

    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  getProfilePhotoPath(filePath: string): string | null {
    if (!filePath) return null;
    return path.join(process.cwd(), filePath);
  }
}
