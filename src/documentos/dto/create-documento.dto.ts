import { IsNumber, IsString } from 'class-validator';

export class CreateDocumentoDto {
  @IsNumber()
  postulacion_id: number;

  @IsString()
  nombre_documento: string;

  @IsString()
  ruta_archivo: string;
}
