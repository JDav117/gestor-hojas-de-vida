import { IsNumber, IsString, IsDate, IsOptional } from 'class-validator';

export class CreatePostulacionDto {
  @IsNumber()
  postulante_id: number;

  @IsNumber()
  convocatoria_id: number;

  @IsNumber()
  programa_id: number;

  @IsDate()
  fecha_postulacion: Date;

  @IsString()
  estado: string;

  @IsOptional()
  @IsString()
  disponibilidad_horaria?: string;
}
