import { IsNumber, IsOptional } from 'class-validator';

export class CreatePostulacionDto {
  @IsOptional()
  @IsNumber()
  postulante_id?: number;

  @IsNumber()
  convocatoria_id: number;

  @IsOptional()
  @IsNumber()
  programa_id?: number;

  // disponibilidad_horaria puede enviarse opcionalmente en creación
  // y será validada/normalizada en el servicio si aplica.
}
