import { IsString, IsDate, IsOptional, IsNumber, IsEnum, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateConvocatoriaDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsDate()
  @Type(() => Date)
  fecha_apertura: Date;

  @IsDate()
  @Type(() => Date)
  fecha_cierre: Date;

  @IsOptional()
  @IsEnum(['borrador', 'publicada', 'cerrada', 'anulada'])
  estado?: string;

  @IsOptional()
  @IsNumber()
  programa_academico_id?: number;

  @IsOptional()
  @IsNumber()
  cupos?: number;

  @IsOptional()
  @IsString()
  sede?: string;

  @IsOptional()
  @IsString()
  dedicacion?: string;

  @IsOptional()
  @IsString()
  tipo_vinculacion?: string;

  @IsOptional()
  @IsArray()
  requisitos_documentales?: string[];

  @IsOptional()
  @IsNumber()
  min_puntaje_aprobacion_documental?: number;

  @IsOptional()
  @IsNumber()
  min_puntaje_aprobacion_tecnica?: number;
}
