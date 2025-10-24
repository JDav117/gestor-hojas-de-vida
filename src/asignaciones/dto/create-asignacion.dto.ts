import { IsInt } from 'class-validator';

export class CreateAsignacionDto {
  @IsInt()
  evaluador_id: number;

  @IsInt()
  postulacion_id: number;
}
