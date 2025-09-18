import { IsNumber, IsDate } from 'class-validator';

export class CreateEvaluacionDto {
  @IsNumber()
  postulacion_id: number;

  @IsNumber()
  evaluador_id: number;

  @IsDate()
  fecha: Date;

  @IsNumber()
  puntaje_total: number;
}
