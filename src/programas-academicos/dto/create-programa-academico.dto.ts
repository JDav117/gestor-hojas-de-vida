import { IsString } from 'class-validator';

export class CreateProgramaAcademicoDto {
  @IsString()
  nombre_programa: string;
}
