import { IsNumber } from 'class-validator';

export class CreateBaremoConvocatoriaDto {
  @IsNumber()
  convocatoria_id: number;

  @IsNumber()
  item_evaluacion_id: number;

  @IsNumber()
  puntaje_maximo: number;
}
