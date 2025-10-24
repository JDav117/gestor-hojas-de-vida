import { IsString } from 'class-validator';

export class CreateItemEvaluacionDto {
  @IsString()
  nombre_item: string;

  @IsString()
  descripcion: string;
}
