import { IsString, IsOptional } from 'class-validator';

export class CreateProgramaAcademicoDto {
  @IsString()
  nombre_programa: string;

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
