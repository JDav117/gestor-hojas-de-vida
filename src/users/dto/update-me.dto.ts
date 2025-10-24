import { IsString, IsEmail, IsOptional } from 'class-validator';

export class UpdateMeDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  apellido?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  identificacion?: string;
}
