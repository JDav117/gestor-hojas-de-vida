import { IsString } from 'class-validator';
export class UpdateDocumentoDto {

  @IsString()
  nombre_documento?: string;

  @IsString()
  ruta_archivo?: string;
}
