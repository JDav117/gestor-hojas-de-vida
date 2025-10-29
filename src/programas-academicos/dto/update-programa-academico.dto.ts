import { IsOptional, IsString } from 'class-validator';

export class UpdateProgramaAcademicoDto {
  @IsOptional()
  @IsString()
  nombre_programa?: string;

  @IsOptional()
  @IsString()
  facultad?: string;

  @IsOptional()
  @IsString()
  nivel?: string;

  @IsOptional()
  @IsString()
  modalidad?: string;

  @IsOptional()
  @IsString()
  codigo_snies?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}
