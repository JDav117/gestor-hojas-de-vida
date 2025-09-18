import { IsString, IsDate } from 'class-validator';
export class UpdateConvocatoriaDto {
  @IsString()
  nombre?: string;

  @IsDate()
  fecha_apertura?: Date;

  @IsDate()
  fecha_cierre?: Date;

  @IsString()
  estado?: string;
}
