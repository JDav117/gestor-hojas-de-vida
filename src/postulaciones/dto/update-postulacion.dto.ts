import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdatePostulacionDto {
  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsString()
  disponibilidad_horaria?: string;

  @IsOptional()
  @IsNumber()
  programa_id?: number | null;
}
