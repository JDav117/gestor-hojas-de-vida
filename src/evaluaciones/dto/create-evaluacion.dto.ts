import { IsNumber, IsDate, IsOptional, IsString, IsBoolean, IsObject } from 'class-validator';

export class CreateEvaluacionDto {
  @IsNumber()
  postulacion_id: number;

  @IsNumber()
  evaluador_id: number;

  @IsOptional()
  @IsDate()
  fecha?: Date;

  @IsNumber()
  puntaje_total: number;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsObject()
  detalles_puntajes?: any;

  @IsOptional()
  @IsBoolean()
  finalizada?: boolean;
}
