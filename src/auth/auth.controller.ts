import { Controller, Post, Body, Get, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Throttle } from '@nestjs/throttler';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
  ) {}

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60 } }) // 5 intentos por minuto
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: any) {
    const userId = req.user?.userId;
    if (!userId) return { statusCode: 401, message: 'Unauthorized' };
    const user = await this.usersService.findOne(Number(userId));
    if (!user) return { statusCode: 404, message: 'User not found' };
    const { password_hash, ...safe } = user as any;
    return safe;
  }

  @Post('register')
  async register(@Body() body: CreateUserDto) {
    // Ignorar roles entrantes: siempre asignar rol por defecto si existe
    const { roles, ...rest } = body as any;
    // Intentar buscar rol por defecto 'postulante'
    let defaultRoleId: number | undefined = undefined;
    try {
      const rolesList = await this.rolesService.findAll();
      const def = rolesList.find(r => r.nombre_rol?.toLowerCase() === 'postulante');
      if (def) defaultRoleId = def.id;
    } catch {}
    const payload = defaultRoleId ? { ...rest, roles: [defaultRoleId] } : { ...rest };
    const user = await this.usersService.create(payload as any);
    const { password_hash, ...safe } = user as any;
    return safe;
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    if (!dto?.currentPassword || !dto?.newPassword) {
      throw new BadRequestException('Datos de contraseña incompletos');
    }
    await this.usersService.changePassword(Number(req.user?.userId), dto.currentPassword, dto.newPassword);
    return { message: 'Contraseña actualizada. Vuelve a iniciar sesión.' };
  }

  
}
