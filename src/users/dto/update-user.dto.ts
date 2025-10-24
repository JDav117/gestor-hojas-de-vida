import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, MinLength, Matches } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
 
   
  @IsOptional()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  @Matches(/[A-Z]/, { message: 'La contraseña debe incluir al menos una letra mayúscula.' })
  @Matches(/[a-z]/, { message: 'La contraseña debe incluir al menos una letra minúscula.' })
  @Matches(/[0-9]/, { message: 'La contraseña debe incluir al menos un número.' })
  @Matches(/[\W_]/, { message: 'La contraseña debe incluir al menos un carácter especial.' })
  password?: string;
}
