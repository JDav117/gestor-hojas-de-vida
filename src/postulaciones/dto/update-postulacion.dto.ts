import { IsOptional, IsString } from 'class-validator';

export class UpdatePostulacionDto {
  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsString()
  disponibilidad_horaria?: string;
}
