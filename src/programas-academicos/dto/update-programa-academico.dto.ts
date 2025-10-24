import { IsOptional, IsString } from 'class-validator';

export class UpdateProgramaAcademicoDto {
  @IsOptional()
  @IsString()
  nombre_programa?: string;
}
