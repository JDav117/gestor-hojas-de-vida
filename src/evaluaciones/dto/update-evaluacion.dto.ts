import { IsOptional, IsDate, IsNumber } from 'class-validator';

export class UpdateEvaluacionDto {
  @IsOptional()
  @IsDate()
  fecha?: Date;

  @IsOptional()
  @IsNumber()
  puntaje_total?: number;
}
