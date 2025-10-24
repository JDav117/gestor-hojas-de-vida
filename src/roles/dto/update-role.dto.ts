import { IsString, IsOptional } from 'class-validator';

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  nombre_rol?: string;
}
