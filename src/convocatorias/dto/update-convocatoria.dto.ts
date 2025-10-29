import { IsString, IsDate, IsOptional } from 'class-validator';
export class UpdateConvocatoriaDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsDate()
  fecha_apertura?: Date;

  @IsOptional()
  @IsDate()
  fecha_cierre?: Date;

  @IsOptional()
  @IsString()
  descripcion?: string;
  // estado ahora se calcula automáticamente en el servicio
}
