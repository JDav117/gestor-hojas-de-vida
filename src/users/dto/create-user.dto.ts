import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @IsString({ message: 'El nombre debe ser texto.' })
  nombre: string;

  @IsNotEmpty({ message: 'El apellido es obligatorio.' })
  @IsString({ message: 'El apellido debe ser texto.' })
  apellido: string;

  @IsEmail({}, { message: 'El correo electrónico no es válido.' })
  @IsNotEmpty({ message: 'El correo es obligatorio.' })
  email: string;

  @IsNotEmpty({ message: 'La identificación es obligatoria.' })
  @IsString({ message: 'La identificación debe ser texto.' })
  identificacion: string;

  @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  @Matches(/[A-Z]/, { message: 'La contraseña debe incluir al menos una letra mayúscula.' })
  @Matches(/[a-z]/, { message: 'La contraseña debe incluir al menos una letra minúscula.' })
  @Matches(/[0-9]/, { message: 'La contraseña debe incluir al menos un número.' })
  @Matches(/[\W_]/, { message: 'La contraseña debe incluir al menos un carácter especial.' })
  password: string;
}

