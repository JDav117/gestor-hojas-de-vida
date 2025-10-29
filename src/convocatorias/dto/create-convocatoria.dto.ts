import { IsString, IsDate, IsOptional } from 'class-validator';

export class CreateConvocatoriaDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsDate()
  fecha_apertura: Date;

  @IsDate()
  fecha_cierre: Date;
  // estado se calculará automáticamente en el servicio según fechas
}
