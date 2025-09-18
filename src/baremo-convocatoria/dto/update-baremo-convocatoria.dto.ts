import { IsOptional, IsNumber } from 'class-validator';

export class UpdateBaremoConvocatoriaDto {
  @IsOptional()
  @IsNumber()
  puntaje_maximo?: number;
}
