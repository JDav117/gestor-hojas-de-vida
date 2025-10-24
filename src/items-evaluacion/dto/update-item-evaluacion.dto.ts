import { IsOptional, IsString } from 'class-validator';

export class UpdateItemEvaluacionDto {
  @IsOptional()
  @IsString()
  nombre_item?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}
