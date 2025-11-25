import { IsString, IsEmail, IsNotEmpty, IsOptional, IsArray, MinLength, Matches } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  apellido: string;

  @IsEmail({}, { message: 'Formato de email inválido' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/,
    { message: 'La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales' }
  )
  password: string;

  @IsString()
  @IsNotEmpty()
  identificacion: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsArray()
  roles?: number[];
}
