import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email?.toLowerCase().trim());
    if (user && await bcrypt.compare(password, user.password_hash)) {
      // No enviar password_hash en el payload
      const { password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email?.toLowerCase().trim());
    if (!user) throw new BadRequestException('Credenciales inválidas');
    const isMatch = await bcrypt.compare(loginDto.password, user.password_hash);
    if (!isMatch) throw new BadRequestException('Credenciales inválidas');
    const payload = { sub: user.id, email: user.email, roles: user.roles.map(r => (r.nombre_rol || '').toLowerCase()) };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, nombre: user.nombre, apellido: user.apellido, roles: user.roles },
    };
  }
}
